<?php

namespace App\Domain\Analytics\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Team;


class TeamAnalytics extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'date',
        'active_users',
        'messages_sent',
        'files_uploaded',
        'storage_used',
        'voice_calls',
        'video_calls',
        'total_call_duration',
        'new_users',
        'channels_created',
        'metrics',
        'breakdown',
    ];

    protected $casts = [
        'date' => 'date',
        'active_users' => 'integer',
        'messages_sent' => 'integer',
        'files_uploaded' => 'integer',
        'storage_used' => 'integer',
        'voice_calls' => 'integer',
        'video_calls' => 'integer',
        'total_call_duration' => 'integer',
        'new_users' => 'integer',
        'channels_created' => 'integer',
        'metrics' => 'array',
        'breakdown' => 'array',
    ];

    // Relationships
    public function team()
    {
        return $this->belongsTo(App\Domain\Team\Entities\Team::class);
    }

    // Scopes
    public function scopeByTeam($query, $teamId)
    {
        return $query->where('team_id', $teamId);
    }

    public function scopeByDate($query, $date)
    {
        return $query->where('date', $date);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('date', '>=', now()->subDays($days));
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('date', [now()->startOfWeek(), now()->endOfWeek()]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereBetween('date', [now()->startOfMonth(), now()->endOfMonth()]);
    }

    // Helper methods
    public function getStorageUsedInMbAttribute()
    {
        return round($this->storage_used / (1024 * 1024), 2);
    }

    public function getStorageUsedInGbAttribute()
    {
        return round($this->storage_used / (1024 * 1024 * 1024), 2);
    }

    public function getTotalCallDurationInMinutesAttribute()
    {
        return round($this->total_call_duration / 60, 2);
    }

    public function getTotalCallDurationInHoursAttribute()
    {
        return round($this->total_call_duration / 3600, 2);
    }

    public function getTotalCallsAttribute()
    {
        return $this->voice_calls + $this->video_calls;
    }

    public function getAverageCallDurationAttribute()
    {
        $totalCalls = $this->getTotalCallsAttribute();
        return $totalCalls > 0 ? round($this->total_call_duration / $totalCalls, 2) : 0;
    }

    public function getMetric($key, $default = null)
    {
        return $this->metrics[$key] ?? $default;
    }

    public function getBreakdown($key, $default = null)
    {
        return $this->breakdown[$key] ?? $default;
    }

    // Static methods for analytics
    public static function getOrCreate($teamId, $date)
    {
        return static::firstOrCreate(
            ['team_id' => $teamId, 'date' => $date],
            [
                'active_users' => 0,
                'messages_sent' => 0,
                'files_uploaded' => 0,
                'storage_used' => 0,
                'voice_calls' => 0,
                'video_calls' => 0,
                'total_call_duration' => 0,
                'new_users' => 0,
                'channels_created' => 0,
                'metrics' => [],
                'breakdown' => [],
            ]
        );
    }

    public static function getTeamStats($teamId, $days = 30)
    {
        return static::where('team_id', $teamId)
            ->where('date', '>=', now()->subDays($days))
            ->get()
            ->groupBy('date')
            ->map(function ($analytics) {
                return $analytics->first();
            });
    }

    public static function getTopTeams($metric = 'active_users', $limit = 10)
    {
        return static::select('team_id')
            ->selectRaw("SUM($metric) as total_$metric")
            ->where('date', '>=', now()->subDays(30))
            ->groupBy('team_id')
            ->orderBy("total_$metric", 'desc')
            ->limit($limit)
            ->get();
    }
}
