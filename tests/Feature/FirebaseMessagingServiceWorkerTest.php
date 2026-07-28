<?php

namespace Tests\Feature;

use Tests\TestCase;

class FirebaseMessagingServiceWorkerTest extends TestCase
{
    public function test_extensionless_service_worker_endpoint_returns_executable_javascript(): void
    {
        config()->set('services.firebase.web', [
            'apiKey' => 'test-api-key',
            'authDomain' => 'test.firebaseapp.com',
            'projectId' => 'test-project',
            'storageBucket' => 'test.firebasestorage.app',
            'messagingSenderId' => '123456789',
            'appId' => '1:123456789:web:test',
        ]);

        $this->get('/firebase-messaging-worker')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/javascript; charset=UTF-8')
            ->assertSee('firebase.initializeApp({"apiKey":"test-api-key"', false);
    }
}
