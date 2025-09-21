<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class LogScorer extends Command
{
    protected $signature = 'log:score 
                            {channel=laravel : Log channel to analyze}
                            {--date=today : Date to analyze}
                            {--output=console : Output format (console, json, html)}';

    protected $description = 'Analyze and score log health';

    public function handle()
    {
        $channel = $this->argument('channel');
        $date = $this->option('date');
        $output = $this->option('output');

        $logPath = $this->getLogPath($channel, $date);
        
        if (!File::exists($logPath)) {
            $this->error("Log file not found: {$logPath}");
            return 1;
        }

        $this->info("Analyzing {$channel} log for {$date}...");
        
        $analysis = $this->analyzeLog($logPath);
        $score = $this->calculateScore($analysis);
        
        if ($output === 'json') {
            $this->outputJson($analysis, $score);
        } elseif ($output === 'html') {
            $this->outputHtml($analysis, $score);
        } else {
            $this->outputConsole($analysis, $score);
        }

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

    private function analyzeLog($logPath)
    {
        $totalLines = (int) shell_exec("wc -l < {$logPath}");
        $errorCount = (int) shell_exec("grep -c 'ERROR' {$logPath}");
        $warningCount = (int) shell_exec("grep -c 'WARNING' {$logPath}");
        $infoCount = (int) shell_exec("grep -c 'INFO' {$logPath}");
        $debugCount = (int) shell_exec("grep -c 'DEBUG' {$logPath}");

        // Analyze error patterns
        $errorPatterns = $this->analyzeErrorPatterns($logPath);
        
        // Analyze response times
        $responseTimes = $this->analyzeResponseTimes($logPath);
        
        // Analyze security events
        $securityEvents = $this->analyzeSecurityEvents($logPath);
        
        // Analyze performance issues
        $performanceIssues = $this->analyzePerformanceIssues($logPath);

        return [
            'total_lines' => $totalLines,
            'error_count' => $errorCount,
            'warning_count' => $warningCount,
            'info_count' => $infoCount,
            'debug_count' => $debugCount,
            'error_patterns' => $errorPatterns,
            'response_times' => $responseTimes,
            'security_events' => $securityEvents,
            'performance_issues' => $performanceIssues,
            'file_size' => File::size($logPath),
        ];
    }

    private function analyzeErrorPatterns($logPath)
    {
        $errors = shell_exec("grep 'ERROR' {$logPath} | cut -d']' -f2 | sort | uniq -c | sort -nr | head -10");
        $errorLines = $errors ? explode("\n", trim($errors)) : [];
        
        $patterns = [];
        foreach ($errorLines as $line) {
            if (trim($line)) {
                $parts = preg_split('/\s+/', trim($line), 2);
                if (count($parts) === 2) {
                    $patterns[] = [
                        'count' => (int) $parts[0],
                        'message' => $parts[1]
                    ];
                }
            }
        }
        
        return $patterns;
    }

    private function analyzeResponseTimes($logPath)
    {
        $responseTimes = shell_exec("grep -oE 'response_time\":[0-9.]+' {$logPath} | cut -d':' -f2");
        
        if (!$responseTimes) {
            return ['avg' => 0, 'min' => 0, 'max' => 0, 'slow_requests' => 0];
        }
        
        $times = array_map('floatval', array_filter(explode("\n", trim($responseTimes))));
        
        if (empty($times)) {
            return ['avg' => 0, 'min' => 0, 'max' => 0, 'slow_requests' => 0];
        }
        
        $avg = array_sum($times) / count($times);
        $min = min($times);
        $max = max($times);
        $slowRequests = count(array_filter($times, fn($time) => $time > 2.0));
        
        return [
            'avg' => round($avg, 3),
            'min' => round($min, 3),
            'max' => round($max, 3),
            'slow_requests' => $slowRequests,
            'total_requests' => count($times)
        ];
    }

    private function analyzeSecurityEvents($logPath)
    {
        $securityKeywords = ['failed_login', 'unauthorized', 'suspicious', 'attack', 'brute_force'];
        $events = [];
        
        foreach ($securityKeywords as $keyword) {
            $count = (int) shell_exec("grep -c '{$keyword}' {$logPath}");
            if ($count > 0) {
                $events[$keyword] = $count;
            }
        }
        
        return $events;
    }

    private function analyzePerformanceIssues($logPath)
    {
        $issues = [];
        
        // Memory usage issues
        $memoryIssues = (int) shell_exec("grep -c 'memory' {$logPath}");
        if ($memoryIssues > 0) {
            $issues['memory_issues'] = $memoryIssues;
        }
        
        // Database slow queries
        $slowQueries = (int) shell_exec("grep -c 'slow query' {$logPath}");
        if ($slowQueries > 0) {
            $issues['slow_queries'] = $slowQueries;
        }
        
        // Timeout issues
        $timeouts = (int) shell_exec("grep -c 'timeout' {$logPath}");
        if ($timeouts > 0) {
            $issues['timeouts'] = $timeouts;
        }
        
        return $issues;
    }

    private function calculateScore($analysis)
    {
        $score = 100;
        
        // Error penalty
        $errorRate = $analysis['error_count'] / max($analysis['total_lines'], 1);
        $score -= min($errorRate * 100, 50); // Max 50 points penalty for errors
        
        // Warning penalty
        $warningRate = $analysis['warning_count'] / max($analysis['total_lines'], 1);
        $score -= min($warningRate * 50, 20); // Max 20 points penalty for warnings
        
        // Response time penalty
        if ($analysis['response_times']['avg'] > 1.0) {
            $score -= min(($analysis['response_times']['avg'] - 1.0) * 10, 20);
        }
        
        // Security events penalty
        $securityPenalty = array_sum($analysis['security_events']) * 5;
        $score -= min($securityPenalty, 30);
        
        // Performance issues penalty
        $performancePenalty = array_sum($analysis['performance_issues']) * 2;
        $score -= min($performancePenalty, 20);
        
        return max(round($score), 0);
    }

    private function outputConsole($analysis, $score)
    {
        $this->line('');
        $this->info('📊 Log Health Analysis');
        $this->line('====================');
        
        $this->line("Overall Score: {$score}/100");
        $this->line('');
        
        $this->info('📈 Basic Statistics:');
        $this->line("Total Lines: {$analysis['total_lines']}");
        $this->line("Errors: {$analysis['error_count']}");
        $this->line("Warnings: {$analysis['warning_count']}");
        $this->line("Info: {$analysis['info_count']}");
        $this->line("Debug: {$analysis['debug_count']}");
        $this->line('');
        
        if (!empty($analysis['error_patterns'])) {
            $this->info('🚨 Top Error Patterns:');
            foreach (array_slice($analysis['error_patterns'], 0, 5) as $pattern) {
                $this->line("  {$pattern['count']}x: {$pattern['message']}");
            }
            $this->line('');
        }
        
        $this->info('⏱️ Response Time Analysis:');
        $this->line("Average: {$analysis['response_times']['avg']}s");
        $this->line("Min: {$analysis['response_times']['min']}s");
        $this->line("Max: {$analysis['response_times']['max']}s");
        $this->line("Slow Requests (>2s): {$analysis['response_times']['slow_requests']}");
        $this->line('');
        
        if (!empty($analysis['security_events'])) {
            $this->info('🔒 Security Events:');
            foreach ($analysis['security_events'] as $event => $count) {
                $this->line("  {$event}: {$count}");
            }
            $this->line('');
        }
        
        if (!empty($analysis['performance_issues'])) {
            $this->info('⚡ Performance Issues:');
            foreach ($analysis['performance_issues'] as $issue => $count) {
                $this->line("  {$issue}: {$count}");
            }
            $this->line('');
        }
        
        $this->line('💡 Recommendations:');
        if ($score < 50) {
            $this->error('  - Critical issues detected! Immediate attention required.');
        } elseif ($score < 70) {
            $this->warn('  - Several issues found. Review and fix soon.');
        } elseif ($score < 90) {
            $this->info('  - Minor issues detected. Consider optimization.');
        } else {
            $this->info('  - Logs look healthy! Keep up the good work.');
        }
    }

    private function outputJson($analysis, $score)
    {
        $result = [
            'score' => $score,
            'analysis' => $analysis,
            'timestamp' => now()->toISOString(),
            'recommendations' => $this->getRecommendations($score, $analysis)
        ];
        
        $this->line(json_encode($result, JSON_PRETTY_PRINT));
    }

    private function outputHtml($analysis, $score)
    {
        $html = $this->generateHtmlReport($analysis, $score);
        $filename = storage_path("logs/health-report-{$score}.html");
        file_put_contents($filename, $html);
        $this->info("HTML report saved to: {$filename}");
    }

    private function generateHtmlReport($analysis, $score)
    {
        $scoreColor = $score >= 80 ? 'green' : ($score >= 60 ? 'orange' : 'red');
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <title>Log Health Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .score { font-size: 48px; font-weight: bold; color: {$scoreColor}; }
                .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                .error { color: red; }
                .warning { color: orange; }
                .info { color: blue; }
            </style>
        </head>
        <body>
            <h1>Log Health Report</h1>
            <div class='score'>{$score}/100</div>
            
            <div class='section'>
                <h2>Basic Statistics</h2>
                <p>Total Lines: {$analysis['total_lines']}</p>
                <p>Errors: <span class='error'>{$analysis['error_count']}</span></p>
                <p>Warnings: <span class='warning'>{$analysis['warning_count']}</span></p>
                <p>Info: <span class='info'>{$analysis['info_count']}</span></p>
            </div>
            
            <div class='section'>
                <h2>Response Times</h2>
                <p>Average: {$analysis['response_times']['avg']}s</p>
                <p>Slow Requests: {$analysis['response_times']['slow_requests']}</p>
            </div>
            
            <div class='section'>
                <h2>Recommendations</h2>
                " . implode('<br>', $this->getRecommendations($score, $analysis)) . "
            </div>
        </body>
        </html>";
    }

    private function getRecommendations($score, $analysis)
    {
        $recommendations = [];
        
        if ($score < 50) {
            $recommendations[] = "🚨 Critical: Immediate attention required";
        }
        
        if ($analysis['error_count'] > 100) {
            $recommendations[] = "🔧 Fix error patterns: " . implode(', ', array_column(array_slice($analysis['error_patterns'], 0, 3), 'message'));
        }
        
        if ($analysis['response_times']['avg'] > 2.0) {
            $recommendations[] = "⚡ Optimize response times (avg: {$analysis['response_times']['avg']}s)";
        }
        
        if (!empty($analysis['security_events'])) {
            $recommendations[] = "🔒 Review security events: " . implode(', ', array_keys($analysis['security_events']));
        }
        
        if (!empty($analysis['performance_issues'])) {
            $recommendations[] = "📊 Address performance issues: " . implode(', ', array_keys($analysis['performance_issues']));
        }
        
        if (empty($recommendations)) {
            $recommendations[] = "✅ Logs look healthy!";
        }
        
        return $recommendations;
    }
}
