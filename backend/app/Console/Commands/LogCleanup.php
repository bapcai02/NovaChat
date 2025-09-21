<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class LogCleanup extends Command
{
    protected $signature = 'log:cleanup 
                            {--days=30 : Number of days to keep logs}
                            {--dry-run : Show what would be deleted without actually deleting}';

    protected $description = 'Clean up old log files';

    public function handle()
    {
        $days = $this->option('days');
        $dryRun = $this->option('dry-run');
        
        $cutoffDate = now()->subDays($days);
        $logPath = storage_path('logs');
        
        $this->info("Cleaning up log files older than {$days} days...");
        
        if ($dryRun) {
            $this->warn('DRY RUN MODE - No files will be deleted');
        }
        
        $deletedCount = 0;
        $deletedSize = 0;
        
        $files = File::allFiles($logPath);
        
        foreach ($files as $file) {
            if ($file->getMTime() < $cutoffDate->timestamp) {
                $fileSize = $file->getSize();
                $fileName = $file->getFilename();
                
                $this->line("Would delete: {$fileName} (" . $this->formatBytes($fileSize) . ")");
                
                if (!$dryRun) {
                    File::delete($file->getPathname());
                    $this->info("Deleted: {$fileName}");
                }
                
                $deletedCount++;
                $deletedSize += $fileSize;
            }
        }
        
        if ($deletedCount === 0) {
            $this->info('No old log files found to clean up');
        } else {
            $this->info("Cleanup complete:");
            $this->line("- Files processed: {$deletedCount}");
            $this->line("- Space freed: " . $this->formatBytes($deletedSize));
        }
        
        return 0;
    }
    
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
