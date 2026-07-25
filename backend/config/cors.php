<?php

$allowedOrigins = array_values(array_filter(array_map(
    static fn (string $origin): string => trim($origin),
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')),
)));

$allowedOriginPatterns = array_values(array_filter(array_map(
    static fn (string $pattern): string => trim($pattern),
    explode(',', (string) env(
        'CORS_ALLOWED_ORIGIN_PATTERNS',
        '#^https?://localhost(:\\d+)?$#,#^https?://127\\.0\\.0\\.1(:\\d+)?$#,#^https?://host\\.docker\\.internal(:\\d+)?$#,#^https?://192\\.168\\.\\d+\\.\\d+(:\\d+)?$#',
    )),
)));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $allowedOrigins,

    'allowed_origins_patterns' => $allowedOriginPatterns,

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
