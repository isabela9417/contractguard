import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, FileText, AlertTriangle, Shield, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  totalContracts: number;
  avgRiskScore: number;
  totalClauses: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  contractsByType: Record<string, number>;
  riskTrend: 'up' | 'down' | 'stable';
  recentAnalyses: Array<{
    id: string;
    fileName: string;
    riskScore: number;
    date: Date;
  }>;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('contract_analyses')
          .select('*')
          .eq('user_id', user.id)
          .order('analyzed_at', { ascending: false });

        // Apply time filter
        if (timeRange !== 'all') {
          const date = new Date();
          if (timeRange === 'week') {
            date.setDate(date.getDate() - 7);
          } else {
            date.setMonth(date.getMonth() - 1);
          }
          query = query.gte('analyzed_at', date.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;

        if (!data || data.length === 0) {
          setAnalytics({
            totalContracts: 0,
            avgRiskScore: 0,
            totalClauses: 0,
            highRiskCount: 0,
            mediumRiskCount: 0,
            lowRiskCount: 0,
            contractsByType: {},
            riskTrend: 'stable',
            recentAnalyses: [],
          });
          return;
        }

        // Calculate analytics
        let totalClauses = 0;
        let highRiskCount = 0;
        let mediumRiskCount = 0;
        let lowRiskCount = 0;
        const contractsByType: Record<string, number> = {};

        data.forEach((analysis) => {
          const clauses = Array.isArray(analysis.flagged_clauses) ? analysis.flagged_clauses : [];
          totalClauses += clauses.length;

          clauses.forEach((clause: any) => {
            if (clause.riskLevel === 'high') highRiskCount++;
            else if (clause.riskLevel === 'medium') mediumRiskCount++;
            else lowRiskCount++;
          });

          const type = analysis.contract_type || 'other';
          contractsByType[type] = (contractsByType[type] || 0) + 1;
        });

        const avgRiskScore = data.reduce((acc, a) => acc + Number(a.overall_risk_score), 0) / data.length;

        // Calculate trend (compare first half to second half)
        const midpoint = Math.floor(data.length / 2);
        const recentAvg = data.slice(0, midpoint).reduce((acc, a) => acc + Number(a.overall_risk_score), 0) / (midpoint || 1);
        const olderAvg = data.slice(midpoint).reduce((acc, a) => acc + Number(a.overall_risk_score), 0) / ((data.length - midpoint) || 1);
        
        let riskTrend: 'up' | 'down' | 'stable' = 'stable';
        if (recentAvg > olderAvg + 0.5) riskTrend = 'up';
        else if (recentAvg < olderAvg - 0.5) riskTrend = 'down';

        setAnalytics({
          totalContracts: data.length,
          avgRiskScore: Math.round(avgRiskScore * 10) / 10,
          totalClauses,
          highRiskCount,
          mediumRiskCount,
          lowRiskCount,
          contractsByType,
          riskTrend,
          recentAnalyses: data.slice(0, 5).map((a) => ({
            id: a.id,
            fileName: a.file_name,
            riskScore: Number(a.overall_risk_score),
            date: new Date(a.analyzed_at),
          })),
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, timeRange]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-muted rounded-lg"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalContracts === 0) {
    return (
      <Card className="p-8 text-center">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No Analytics Yet</h3>
        <p className="text-muted-foreground">
          Analyze some contracts to see your insights and trends here.
        </p>
      </Card>
    );
  }

  const formatContractType = (type: string) => 
    type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Contract Analytics</h2>
          <p className="text-muted-foreground">Track your contract analysis trends</p>
        </div>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <SelectTrigger className="w-40">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalContracts}</p>
                <p className="text-xs text-muted-foreground">Contracts Analyzed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                analytics.avgRiskScore > 6 ? "bg-risk-high-bg" :
                analytics.avgRiskScore > 3 ? "bg-risk-medium-bg" : "bg-risk-low-bg"
              )}>
                <Shield className={cn(
                  "h-5 w-5",
                  analytics.avgRiskScore > 6 ? "text-risk-high" :
                  analytics.avgRiskScore > 3 ? "text-risk-medium" : "text-risk-low"
                )} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{analytics.avgRiskScore}</p>
                  {analytics.riskTrend === 'up' && (
                    <TrendingUp className="h-4 w-4 text-risk-high" />
                  )}
                  {analytics.riskTrend === 'down' && (
                    <TrendingDown className="h-4 w-4 text-risk-low" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Avg Risk Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalClauses}</p>
                <p className="text-xs text-muted-foreground">Clauses Flagged</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-risk-high-bg">
                <AlertTriangle className="h-5 w-5 text-risk-high" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.highRiskCount}</p>
                <p className="text-xs text-muted-foreground">High Risk Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">High Risk</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-risk-high rounded-full transition-all"
                      style={{ width: `${(analytics.highRiskCount / analytics.totalClauses) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {analytics.highRiskCount}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Medium Risk</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-risk-medium rounded-full transition-all"
                      style={{ width: `${(analytics.mediumRiskCount / analytics.totalClauses) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {analytics.mediumRiskCount}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Low Risk</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-risk-low rounded-full transition-all"
                      style={{ width: `${(analytics.lowRiskCount / analytics.totalClauses) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {analytics.lowRiskCount}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              By Contract Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.contractsByType)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {formatContractType(type)}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(count / analytics.totalContracts) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Analyses */}
      {analytics.recentAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Recent Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentAnalyses.map((analysis) => (
                <div key={analysis.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium truncate max-w-[200px]">{analysis.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {analysis.date.toLocaleDateString()}
                    </p>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    analysis.riskScore > 6 ? "bg-risk-high-bg text-risk-high" :
                    analysis.riskScore > 3 ? "bg-risk-medium-bg text-risk-medium" : 
                    "bg-risk-low-bg text-risk-low"
                  )}>
                    {analysis.riskScore}/10
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
