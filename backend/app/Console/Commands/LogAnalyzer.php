<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class LogAnalyzer extends Command
{
    protected $signature = 'log:analyze 
                            {channel=laravel : Log channel to analyze}
                            {--date=today : Date to analyze (today, yesterday, or YYYY-MM-DD)}
                            {--top=10 : Number of top results to show}';

    protected $description = 'Analyze log files and show statistics';

    public function handle()
    {
        $channel = $this->argument('channel');
        $date = $this->option('date');
        $top = $this->option('top');

        $logPath = $this->getLogPath($channel, $date);
        
        if (!File::exists($logPath)) {
            $this->error("Log file not found: {$logPath}");
            return 1;
        }

        $this->info("Analyzing {$channel} log for {$date}...");
        $this->line('');

        // Get log statistics
        $this->showBasicStats($logPath);
        $this->line('');
        
        $this->showErrorStats($logPath, $top);
        $this->line('');
        
        $this->showTopIPs($logPath, $top);
        $this->line('');
        
        $this->showTopEndpoints($logPath, $top);
        $this->line('');
        
        $this->showResponseTimeStats($logPath);

        return 0;
    }

    private function getLogPath($channel, $date)
    {
        if ($date === 'today') {
            $date = now()->format('Y-m-d');
        } elseif ($date === 'yesterday') {
            $date = now()->subDay()->format('Y-m-d');
        }

        return storage_path("logs/{$channel}-{$date}.log");
    }

    private function showBasicStats($logPath)
    {
        $this->info('📊 Basic Statistics:');
        
        $totalLines = (int) shell_exec("wc -l < {$logPath}");
        $this->line("Total log entries: {$totalLines}");
        
        $fileSize = File::size($logPath);
        $this->line("File size: " . $this->formatBytes($fileSize));
        
        $errorCount = (int) shell_exec("grep -c 'ERROR' {$logPath}");
        $warningCount = (int) shell_exec("grep -c 'WARNING' {$logPath}");
        $infoCount = (int) shell_exec("grep -c 'INFO' {$logPath}");
        
        $this->line("Errors: {$errorCount}");
        $this->line("Warnings: {$warningCount}");
        $this->line("Info: {$infoCount}");
    }

    private function showErrorStats($logPath, $top)
    {
        $this->info('🚨 Top Errors:');
        
        $errors = shell_exec("grep 'ERROR' {$logPath} | cut -d']' -f2 | sort | uniq -c | sort -nr | head -{$top}");
        $this->line($errors ?: 'No errors found');
    }

    private function showTopIPs($logPath, $top)
    {
        $this->info('🌐 Top IP Addresses:');
        
        $ips = shell_exec("grep -oE 'ip\":\"[^\"]*\"' {$logPath} | cut -d'\"' -f2 | sort | uniq -c | sort -nr | head -{$top}");
        $this->line($ips ?: 'No IP data found');
    }

    private function showTopEndpoints($logPath, $top)
    {
        $this->info('🔗 Top Endpoints:');
        
        $endpoints = shell_exec("grep -oE 'endpoint\":\"[^\"]*\"' {$logPath} | cut -d'\"' -f2 | sort | uniq -c | sort -nr | head -{$top}");
        $this->line($endpoints ?: 'No endpoint data found');
    }

    private function showResponseTimeStats($logPath)
    {
        $this->info('⏱️ Response Time Statistics:');
        
        $responseTimes = shell_exec("grep -oE 'response_time\":[0-9.]+' {$logPath} | cut -d':' -f2 | sort -n");
        
        if ($responseTimes) {
            $times = array_map('floatval', explode("\n", trim($responseTimes)));
            $times = array_filter($times);
            
            if (!empty($times)) {
                $avg = array_sum($times) / count($times);
                $min = min($times);
                $max = max($times);
                
                $this->line("Average: " . number_format($avg, 3) . "s");
                $this->line("Min: " . number_format($min, 3) . "s");
                $this->line("Max: " . number_format($max, 3) . "s");
            }
        } else {
            $this->line('No response time data found');
        }
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
