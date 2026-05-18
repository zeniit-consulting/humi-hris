<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Str;

class DocsManualController extends Controller
{
    public function __invoke(): View
    {
        $path = config('docs.manual_path');

        abort_unless(is_string($path) && is_file($path), 404);

        $markdown = file_get_contents($path);

        abort_unless($markdown !== false, 404);

        [$preparedMarkdown, $tableOfContents] = $this->prepareMarkdown($markdown);

        return view('docs.manual', [
            'title' => config('docs.title', 'Dokumentasi Admin HRIS'),
            'tableOfContents' => $tableOfContents,
            'content' => new HtmlString(
                Str::markdown($preparedMarkdown, [
                    'html_input' => 'allow',
                    'allow_unsafe_links' => false,
                ]),
            ),
        ]);
    }

    /**
     * @return array{0: string, 1: array<int, array{id: string, level: int, title: string}>}
     */
    private function prepareMarkdown(string $markdown): array
    {
        $tableOfContents = [];
        $prepared = preg_replace_callback(
            '/^(#{1,3})\s+(.+)$/m',
            function (array $matches) use (&$tableOfContents): string {
                $level = strlen($matches[1]);
                $title = trim($matches[2]);
                $plainTitle = trim(strip_tags($title));
                $anchor = Str::slug(preg_replace('/^\d+(\.\d+)*\s+/', '', $plainTitle) ?? $plainTitle);

                if ($level >= 2) {
                    $tableOfContents[] = [
                        'id' => $anchor,
                        'level' => $level,
                        'title' => $plainTitle,
                    ];
                }

                return sprintf('<h%d id="%s">%s</h%d>', $level, e($anchor), e($plainTitle), $level);
            },
            $markdown,
        );

        return [$prepared ?? $markdown, $tableOfContents];
    }
}
