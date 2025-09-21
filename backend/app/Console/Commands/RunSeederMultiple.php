<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class RunSeederMultiple extends Command
{
    protected $signature = 'seed:multiple {--times=100} {--class=SimpleDataSeeder} {--no-clear}';
    protected $description = 'Run a seeder multiple times without clearing data';

    public function handle()
    {
        $times = (int) $this->option('times');
        $seederClass = $this->option('class');
        $noClear = $this->option('no-clear');

        $this->info("Running {$seederClass} {$times} times...");
        if ($noClear) {
            $this->info("Data will NOT be cleared between runs");
        }

        $startTime = microtime(true);
        $totalRecords = 0;

        // Disable foreign key checks for better performance
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        try {
            $progressBar = $this->output->createProgressBar($times);
            $progressBar->start();

            for ($i = 1; $i <= $times; $i++) {
                $this->info("\n--- Run {$i}/{$times} ---");
                
                // Run the seeder
                $exitCode = Artisan::call('db:seed', [
                    '--class' => $seederClass,
                    '--force' => true
                ]);

                if ($exitCode === 0) {
                    $this->info("Run {$i} completed successfully");
                    
                    // Count current records
                    $userCount = DB::table('users')->count();
                    $messageCount = DB::table('messages')->count();
                    $teamCount = DB::table('teams')->count();
                    $conversationCount = DB::table('conversations')->count();
                    
                    $this->info("Current totals: {$userCount} users, {$messageCount} messages, {$teamCount} teams, {$conversationCount} conversations");
                } else {
                    $this->error("Run {$i} failed with exit code: {$exitCode}");
                }

                $progressBar->advance();
            }

            $progressBar->finish();
            $this->newLine();

        } finally {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        $endTime = microtime(true);
        $totalTime = round($endTime - $startTime, 2);

        // Final statistics
        $finalUserCount = DB::table('users')->count();
        $finalMessageCount = DB::table('messages')->count();
        $finalTeamCount = DB::table('teams')->count();
        $finalConversationCount = DB::table('conversations')->count();

        $this->info("\n=== FINAL RESULTS ===");
        $this->info("Completed {$times} runs in {$totalTime} seconds");
        $this->info("Average time per run: " . round($totalTime / $times, 2) . " seconds");
        $this->info("Final record counts:");
        $this->info("- Users: {$finalUserCount}");
        $this->info("- Messages: {$finalMessageCount}");
        $this->info("- Teams: {$finalTeamCount}");
        $this->info("- Conversations: {$finalConversationCount}");
    }
}
