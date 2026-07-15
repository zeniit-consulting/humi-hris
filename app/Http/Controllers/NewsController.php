<?php

namespace App\Http\Controllers;

use App\Support\HumiNews;
use Inertia\Inertia;
use Inertia\Response;

class NewsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('news/index', [
            'articles' => HumiNews::all()->map(fn (array $article): array => $this->summary($article))->all(),
        ]);
    }

    public function show(string $slug): Response
    {
        $article = HumiNews::find($slug);

        abort_if(! $article, 404);

        $related = HumiNews::all()
            ->reject(fn (array $item): bool => $item['slug'] === $slug)
            ->take(3)
            ->map(fn (array $item): array => $this->summary($item))
            ->all();

        return Inertia::render('news/show', [
            'article' => $article,
            'relatedArticles' => $related,
        ]);
    }

    /**
     * @param  array<string, mixed>  $article
     * @return array<string, mixed>
     */
    private function summary(array $article): array
    {
        return [
            'title' => $article['title'],
            'slug' => $article['slug'],
            'category' => $article['category'],
            'published_at' => $article['published_at'],
            'updated_at' => $article['updated_at'],
            'reading_time' => $article['reading_time'],
            'description' => $article['description'],
            'hero_summary' => $article['hero_summary'],
            'takeaways' => $article['takeaways'],
        ];
    }
}
