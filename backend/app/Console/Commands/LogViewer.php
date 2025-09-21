<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class LogViewer extends Command
{
    protected $signature = 'log:view 
                            {channel=laravel : Log channel to view}
                            {--lines=50 : Number of lines to show}
                            {--follow : Follow log in real-time}
                            {--level= : Filter by log level}
                            {--search= : Search for specific text}';

    protected $description = 'View and monitor application logs';

    public function handle()
    {
        $channel = $this->argument('channel');
        $lines = $this->option('lines');
        $follow = $this->option('follow');
        $level = $this->option('level');
        $search = $this->option('search');

        $logPath = storage_path("logs/{$channel}.log");
        
        if (!File::exists($logPath)) {
            $this->error("Log file not found: {$logPath}");
            return 1;
        }

        if ($follow) {
            $this->info("Following {$channel} log (Press Ctrl+C to stop)...");
            $this->followLog($logPath, $level, $search);
        } else {
            $this->viewLog($logPath, $lines, $level, $search);
        }

        return 0;
    }

    private function viewLog($logPath, $lines, $level, $search)
    {
        $command = "tail -n {$lines} {$logPath}";
        
        if ($level) {
            $command .= " | grep -i '{$level}'";
        }
        
        if ($search) {
            $command .= " | grep -i '{$search}'";
        }

        $this->info("Showing last {$lines} lines from {$logPath}:");
        $this->line('');
        
        $output = shell_exec($command);
        $this->line($output);
    }

    private function followLog($logPath, $level, $search)
    {
        $command = "tail -f {$logPath}";
        
        if ($level) {
            $command .= " | grep -i '{$level}'";
        }
        
        if ($search) {
            $command .= " | grep -i '{$search}'";
        }

        passthru($command);
    }
}
