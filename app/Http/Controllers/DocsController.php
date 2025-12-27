<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;

class DocsController extends Controller
{
    public function index($slug = 'USER_GUIDE')
    {
        // Try uppercase first (as I created them)
        $filePath = base_path("docs/" . strtoupper($slug) . ".md");

        if (!File::exists($filePath)) {
            // Try lowercase
            $filePath = base_path("docs/" . strtolower($slug) . ".md");
            
            if (!File::exists($filePath)) {
                // Try original slug
                $filePath = base_path("docs/{$slug}.md");
                
                if (!File::exists($filePath)) {
                    // Try root for some docs like DEVELOPER_GUIDE
                    $filePath = base_path(strtoupper($slug) . ".md");
                    
                    if (!File::exists($filePath)) {
                         // Try root lowercase
                         $filePath = base_path(strtolower($slug) . ".md");
                         
                         if (!File::exists($filePath)) {
                            abort(404);
                         }
                    }
                }
            }
        }

        $content = File::get($filePath);
        
        return Inertia::render('docs/index', [
            'content' => $content,
            'currentSlug' => $slug,
            'menu' => [
                ['title' => 'Main User Guide', 'slug' => 'USER_GUIDE'],
                ['title' => 'Super Admin Guide', 'slug' => 'SUPER_ADMIN_GUIDE'],
                ['title' => 'School Admin Guide', 'slug' => 'SCHOOL_ADMIN_GUIDE'],
                ['title' => 'Developer Guide', 'slug' => 'DEVELOPER_GUIDE'],
                ['title' => 'System Architecture', 'slug' => 'SYSTEM_ARCHITECTURE'],
                ['title' => 'Implementation Checklist', 'slug' => 'IMPLEMENTATION_CHECKLIST'],
            ]
        ]);
    }
}
