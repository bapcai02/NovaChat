import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  RefreshCw, 
  Download, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  Database,
  Shield,
  MessageSquare
} from 'lucide-react';

interface LogStats {
  total_logs: number;
  error_count: number;
  warning_count: number;
  info_count: number;
  channels: { [key: string]: number };
  top_errors: Array<{ message: string; count: number }>;
  recent_activity: Array<{ channel: string; level: string; message: string; timestamp: string }>;
}

interface LogScore {
  score: number;
  health_status: string;
  recommendations: string[];
  issues: string[];
}

const AdminLogDashboard: React.FC = () => {
  const [stats, setStats] = useState<LogStats | null>(null);
  const [score, setScore] = useState<LogScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/logs/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScore = async () => {
    try {
      const response = await fetch('/api/logs/score', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setScore(data);
      }
    } catch (error) {
      console.error('Error fetching score:', error);
    }
  };

  const cleanupLogs = async () => {
    try {
      const response = await fetch('/api/logs/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        alert('Log cleanup completed successfully');
        fetchStats();
      }
    } catch (error) {
      console.error('Error cleaning up logs:', error);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'good':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  useEffect(() => {
    fetchStats();
    fetchScore();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Log Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={fetchStats} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={cleanupLogs} variant="outline" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Cleanup
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Health Score */}
          {score && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getHealthIcon(score.health_status)}
                  System Health Score: {score.score}/100
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <Badge className={getHealthColor(score.health_status)}>
                      {score.health_status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {score.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {score.recommendations.map((rec, index) => (
                          <li key={index} className="text-green-700">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {score.issues.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Issues:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {score.issues.map((issue, index) => (
                          <li key={index} className="text-red-700">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Logs</p>
                      <p className="text-2xl font-bold">{stats.total_logs.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <XCircle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Errors</p>
                      <p className="text-2xl font-bold text-red-600">{stats.error_count.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Warnings</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.warning_count.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Info</p>
                      <p className="text-2xl font-bold text-green-600">{stats.info_count.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Log Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.channels).map(([channel, count]) => (
                    <div key={channel} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {channel === 'api' && <Activity className="h-5 w-5 text-blue-600" />}
                        {channel === 'auth' && <Shield className="h-5 w-5 text-green-600" />}
                        {channel === 'chat' && <MessageSquare className="h-5 w-5 text-purple-600" />}
                        {channel === 'database' && <Database className="h-5 w-5 text-orange-600" />}
                        {channel === 'security' && <Shield className="h-5 w-5 text-red-600" />}
                        {channel === 'performance' && <BarChart3 className="h-5 w-5 text-indigo-600" />}
                        {channel === 'websocket' && <Activity className="h-5 w-5 text-cyan-600" />}
                        <span className="font-medium">{channel.toUpperCase()}</span>
                      </div>
                      <Badge variant="outline">{count.toLocaleString()}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          {stats && stats.top_errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.top_errors.map((error, index) => (
                    <div key={index} className="flex items-start justify-between p-3 border rounded-lg bg-red-50">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">{error.message}</p>
                      </div>
                      <Badge variant="destructive">{error.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {stats.recent_activity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Badge className={
                          activity.level === 'error' ? 'bg-red-100 text-red-800' :
                          activity.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {activity.level.toUpperCase()}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {activity.channel}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLogDashboard;
