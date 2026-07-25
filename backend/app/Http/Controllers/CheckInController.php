<?php

namespace App\Http\Controllers;

use App\Services\CheckInService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckInController extends Controller
{
    public function __construct(private readonly CheckInService $checkInService) {}

    public function dashboard(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->checkInService->dashboard($request->user()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'activity' => ['required', 'string', 'max:100'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:1440'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $checkIn = $this->checkInService->create($request->user(), $payload);

        if ($checkIn === null) {
            return response()->json([
                'message' => '今日はすでにチェックイン済みです。',
            ], 409);
        }

        $user = $request->user()->refresh();

        return response()->json([
            'data' => [
                'checkIn' => $this->checkInService->summarize($checkIn),
                'dashboard' => $this->checkInService->dashboard($user),
            ],
        ], 201);
    }
}
