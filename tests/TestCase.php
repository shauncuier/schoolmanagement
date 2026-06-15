<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Render Inertia pages without a built Vite manifest so feature tests
        // don't require `npm run build` (keeps the PHP CI job Node-free).
        $this->withoutVite();
    }
}
