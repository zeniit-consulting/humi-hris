<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationChartController extends Controller
{
    /**
     * Display organizational chart page.
     */
    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();

        $allPositions = Position::query()
            ->where('user_id', $ownerId)
            ->with([
                'division:id,name',
                'employees' => fn ($query) => $query
                    ->where('user_id', $ownerId)
                    ->active()
                    ->orderBy('first_name')
                    ->orderBy('last_name'),
            ])
            ->orderByRaw('CAST(COALESCE(level, 5) AS UNSIGNED)')
            ->orderBy('name')
            ->get([
                'id',
                'division_id',
                'parent_position_id',
                'code',
                'name',
                'level',
                'is_active',
                'exclude_from_org_chart',
            ]);

        $positionMap = $allPositions->keyBy('id');
        $excludedIds = $allPositions->where('exclude_from_org_chart', true)->pluck('id')->all();

        // Non-excluded positions participate in the org chart tree
        $chartPositions = $allPositions->reject(fn (Position $p) => in_array($p->id, $excludedIds, true));

        // Group children by effective parent (re-parenting through excluded ancestors)
        $effectiveChildrenByParent = [];
        $rootPositions = [];

        foreach ($chartPositions as $position) {
            $effectiveParentId = $this->resolveEffectiveParentId($position, $positionMap, $excludedIds);

            if ($effectiveParentId === null) {
                $rootPositions[] = $position;
            } else {
                $effectiveChildrenByParent[$effectiveParentId][] = $position;
            }
        }

        $rootPositions = collect($rootPositions)
            ->sortBy(fn (Position $position) => $this->buildSortKey($position))
            ->values();

        $tree = $rootPositions->map(
            fn (Position $position) => $this->buildNode($position, $effectiveChildrenByParent, [])
        )->values();

        $maxDepth = $this->calculateMaxDepth($tree->all());

        $managePositions = $allPositions->map(fn (Position $p) => [
            'id' => $p->id,
            'code' => $p->code,
            'name' => $p->name,
            'division_name' => $p->division?->name,
            'level' => $this->normalizePositionLevel($p->level),
            'level_label' => $this->positionLevelLabel($p->level),
            'is_active' => (bool) $p->is_active,
            'is_vacant' => $p->employees->isEmpty(),
            'exclude_from_org_chart' => (bool) $p->exclude_from_org_chart,
            'employees_count' => $p->employees->count(),
            'parent_position_id' => $p->parent_position_id,
        ])->values();

        $divisions = Division::query()
            ->where('user_id', $ownerId)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('hris/organization-chart/index', [
            'chart' => $tree,
            'all_positions' => $managePositions,
            'divisions' => $divisions,
            'stats' => [
                'total_positions' => $allPositions->count(),
                'total_nodes' => $chartPositions->count(),
                'root_count' => $rootPositions->count(),
                'max_depth' => $maxDepth,
                'filled_positions' => $allPositions->filter(fn (Position $p) => $p->employees->isNotEmpty())->count(),
                'vacant_positions' => $allPositions->filter(fn (Position $p) => $p->employees->isEmpty())->count(),
                'inactive_positions' => $allPositions->filter(fn (Position $p) => ! $p->is_active)->count(),
                'excluded_positions' => count($excludedIds),
                'total_employees' => $allPositions->sum(fn (Position $p) => $p->employees->count()),
            ],
        ]);
    }

    /**
     * Update position exclusions from org chart.
     */
    public function updateExclusions(Request $request): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        if ($request->has('position_id')) {
            $validated = $request->validate([
                'position_id' => ['required', 'integer', Rule::exists('positions', 'id')->where('user_id', $ownerId)],
                'exclude' => ['required', 'boolean'],
            ]);

            Position::query()
                ->where('user_id', $ownerId)
                ->where('id', $validated['position_id'])
                ->update(['exclude_from_org_chart' => $validated['exclude']]);

            return back()->with('success', 'Status jabatan di struktur organisasi berhasil diperbarui.');
        }

        $validated = $request->validate([
            'excluded_position_ids' => ['nullable', 'array'],
            'excluded_position_ids.*' => ['integer', Rule::exists('positions', 'id')->where('user_id', $ownerId)],
        ]);

        $excludedIds = $validated['excluded_position_ids'] ?? [];

        Position::query()
            ->where('user_id', $ownerId)
            ->whereIn('id', $excludedIds)
            ->update(['exclude_from_org_chart' => true]);

        Position::query()
            ->where('user_id', $ownerId)
            ->whereNotIn('id', $excludedIds)
            ->update(['exclude_from_org_chart' => false]);

        return back()->with('success', 'Pengaturan struktur organisasi berhasil diperbarui.');
    }

    /**
     * Resolve effective parent ID by walking up ancestry past excluded positions.
     *
     * @param  \Illuminate\Support\Collection<int, Position>  $positionMap
     * @param  array<int, int>  $excludedIds
     */
    private function resolveEffectiveParentId(Position $position, $positionMap, array $excludedIds): ?int
    {
        $currentParentId = $position->parent_position_id;
        $seen = [$position->id];

        while ($currentParentId !== null && isset($positionMap[$currentParentId])) {
            if (in_array($currentParentId, $seen, true)) {
                return null; // prevent cycle loops
            }
            $seen[] = $currentParentId;

            if (! in_array($currentParentId, $excludedIds, true)) {
                return $currentParentId;
            }

            $parent = $positionMap[$currentParentId];
            $currentParentId = $parent->parent_position_id;
        }

        return null;
    }

    /**
     * Build recursive organization node.
     *
     * @param  array<int, list<Position>>  $childrenByParent
     * @param  array<int, int>  $visited
     * @return array<string, mixed>
     */
    private function buildNode(Position $position, array $childrenByParent, array $visited): array
    {
        if (in_array($position->id, $visited, true)) {
            return [
                'id' => $position->id,
                'position_code' => $position->code,
                'employees' => [],
                'employees_count' => 0,
                'employee_code' => 'VACANT',
                'full_name' => 'Vacant',
                'is_vacant' => true,
                'is_position_active' => (bool) $position->is_active,
                'exclude_from_org_chart' => (bool) $position->exclude_from_org_chart,
                'division_id' => $position->division_id,
                'division_name' => $position->division?->name,
                'position_name' => $position->name,
                'position_level' => $this->normalizePositionLevel($position->level),
                'position_level_label' => $this->positionLevelLabel($position->level),
                'employment_status' => 'vacant',
                'is_active' => false,
                'children' => [],
                'cycle_detected' => true,
            ];
        }

        $nextVisited = [...$visited, $position->id];

        $rawChildren = $childrenByParent[$position->id] ?? [];
        $children = collect($rawChildren)
            ->sortBy(fn (Position $child) => $this->buildSortKey($child))
            ->values()
            ->map(fn (Position $child) => $this->buildNode($child, $childrenByParent, $nextVisited))
            ->all();

        $employees = $position->employees
            ->filter(fn ($entry) => $entry->is_active && ($entry->offboarded_at === null || $entry->isOffboardScheduled()) && in_array($entry->employment_status, ['active', 'probation', 'on_leave'], true))
            ->sortBy(fn ($entry) => strtolower($entry->full_name))
            ->values();

        $isVacant = $employees->isEmpty();

        $employeesData = $employees->map(fn ($emp) => [
            'id' => $emp->id,
            'employee_code' => $emp->employee_code,
            'full_name' => $emp->full_name,
            'employment_status' => $emp->employment_status,
            'is_active' => (bool) $emp->is_active,
            'face_photo_url' => $emp->face_photo_url,
        ])->all();

        return [
            'id' => $position->id,
            'position_code' => $position->code,
            'employees' => $isVacant ? [] : $employeesData,
            'employees_count' => $employees->count(),
            'employee_code' => $employees->first()?->employee_code ?? 'VACANT',
            'full_name' => $employees->first()?->full_name ?? 'Vacant',
            'is_vacant' => $isVacant,
            'is_position_active' => (bool) $position->is_active,
            'exclude_from_org_chart' => (bool) $position->exclude_from_org_chart,
            'division_id' => $position->division_id,
            'division_name' => $position->division?->name,
            'position_name' => $position->name,
            'position_level' => $this->normalizePositionLevel($position->level),
            'position_level_label' => $this->positionLevelLabel($position->level),
            'employment_status' => $employees->first()?->employment_status ?? 'vacant',
            'is_active' => (bool) ($position->is_active && ($employees->first()?->is_active ?? false)),
            'children' => $children,
            'cycle_detected' => false,
        ];
    }

    /**
     * Calculate maximum depth from recursive nodes.
     *
     * @param  array<int, array<string, mixed>>  $nodes
     */
    private function calculateMaxDepth(array $nodes): int
    {
        if ($nodes === []) {
            return 0;
        }

        $depths = array_map(function (array $node): int {
            /** @var array<int, array<string, mixed>> $children */
            $children = $node['children'] ?? [];

            if ($children === []) {
                return 1;
            }

            return 1 + $this->calculateMaxDepth($children);
        }, $nodes);

        return max($depths);
    }

    /**
     * Build consistent sort key using org level + division + name.
     */
    private function buildSortKey(Position $position): string
    {
        $level = str_pad((string) $this->normalizePositionLevel($position->level), 2, '0', STR_PAD_LEFT);
        $division = strtolower($position->division?->name ?? 'zzz');
        $positionName = strtolower($position->name);
        $code = strtolower($position->code);

        return $level.'|'.$division.'|'.$positionName.'|'.$code;
    }

    /**
     * Normalize position level into numeric hierarchy.
     */
    private function normalizePositionLevel(mixed $level): int
    {
        if (is_numeric((string) $level)) {
            $value = (int) $level;

            if ($value >= 0 && $value <= 5) {
                return $value;
            }
        }

        return 5;
    }

    /**
     * Human-readable label for position level.
     */
    private function positionLevelLabel(mixed $level): string
    {
        return match ($this->normalizePositionLevel($level)) {
            0 => 'Level 0 - Direktur Utama',
            1 => 'Level 1 - Direktur Divisi',
            2 => 'Level 2 - Manager',
            3 => 'Level 3 - Senior Staff / Supervisor',
            4 => 'Level 4 - Staff',
            default => 'Level 5 - Operator / Pelaksana',
        };
    }
}
