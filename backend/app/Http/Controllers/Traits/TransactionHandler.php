<?php

namespace App\Http\Controllers\Traits;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Http\JsonResponse;

trait TransactionHandler
{
    /**
     * Execute a callback within a database transaction
     */
    protected function executeInTransaction(callable $callback, string $errorMessage = 'Operation failed')
    {
        try {
            return DB::transaction($callback);
        } catch (Exception $e) {
            Log::error('Transaction failed: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->serverErrorResponse($errorMessage . ': ' . $e->getMessage());
        }
    }

    /**
     * Execute a callback within a transaction and return JSON response
     */
    protected function executeInTransactionWithResponse(callable $callback, string $successMessage = 'Operation completed', string $errorMessage = 'Operation failed'): JsonResponse
    {
        try {
            $result = DB::transaction($callback);
            
            if ($result instanceof JsonResponse) {
                return $result;
            }
            
            return $this->successResponse($result, $successMessage);
        } catch (Exception $e) {
            Log::error('Transaction failed: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->serverErrorResponse($errorMessage . ': ' . $e->getMessage());
        }
    }
}
