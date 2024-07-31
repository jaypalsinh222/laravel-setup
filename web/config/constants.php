<?php

return [
    'app_name' => env('APP_NAME'),
    'app_url' => env('APP_URL'),

    'debug_ip_ipv4' => env('DEBUG_IP_IPV4'),
    'debug_ip_ipv6' => env('DEBUG_IP_IPV6'),

    'validation_codes' => [
        'unauthorized' => 401,
        'forbidden' => 403,
        'not_found' => 404,
        'unprocessable_entity' => 422,
        'internal_server' => 500,
        'success' => 200,
        'success_with_create' => 201,
    ],
    "train_type" => [
        "local" => 0,
        "express" => 1,
        "super_fast" => 2
    ],
    'train_running_type' => [
        'daily' => 0,
        'weekly' => 1,
        "monthly" => 2
    ],
];
