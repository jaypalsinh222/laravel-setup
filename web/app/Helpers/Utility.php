<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

class Utility
{
    public static function commonResponse($statusCode, $message, $data = []): JsonResponse
    {
        return response()->json([
            'error' => $statusCode !== 200 && $statusCode !== 201,
            'status' => $statusCode,
            'message' => $message,
            'data' => $data === [] ? null : $data,
        ]);
    }
}
