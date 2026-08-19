<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::create('/test', 'GET');
$kernel->handle($request);

$user = App\Models\User::first();
echo "User email: " . $user->email . "\n";
echo "Password hash: " . $user->password . "\n";

$validator = app('validator')->make(
    ['current_password' => 'password'],
    ['current_password' => 'current_password']
);
$validator->addCustomAttributes(['current_password' => 'Kata Sandi']);
$validator->setCustomMessages(['current_password' => 'Salah sandi']);
Auth::login($user);
if ($validator->fails()) {
    echo "Fails: " . $validator->errors()->first() . "\n";
} else {
    echo "Passes\n";
}
