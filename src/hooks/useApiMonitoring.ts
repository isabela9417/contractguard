import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ApiLogData {
  endpoint: string;
  statusCode?: number;
  responseTimeMs: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export function useApiMonitoring() {
  const { user } = useAuth();

  const logApiCall = useCallback(async (data: ApiLogData) => {
    if (!user) return;

    try {
      await supabase.from('api_logs').insert({
        user_id: user.id,
        endpoint: data.endpoint,
        status_code: data.statusCode,
        response_time_ms: data.responseTimeMs,
        error_message: data.errorMessage,
        metadata: data.metadata || {},
      });
    } catch (error) {
      // Silently fail - don't break the app for logging failures
      console.error('Failed to log API call:', error);
    }
  }, [user]);

  const monitoredFetch = useCallback(async (
    endpoint: string,
    options?: RequestInit
  ): Promise<Response> => {
    const startTime = Date.now();
    let response: Response;
    
    try {
      response = await fetch(endpoint, options);
      const responseTime = Date.now() - startTime;

      await logApiCall({
        endpoint,
        statusCode: response.status,
        responseTimeMs: responseTime,
        metadata: {
          method: options?.method || 'GET',
          ok: response.ok,
        },
      });

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      await logApiCall({
        endpoint,
        responseTimeMs: responseTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          method: options?.method || 'GET',
          failed: true,
        },
      });

      throw error;
    }
  }, [logApiCall]);

  const getRecentLogs = useCallback(async (limit = 10) => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('api_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching API logs:', error);
      return [];
    }

    return data;
  }, [user]);

  const getPerformanceStats = useCallback(async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('api_logs')
      .select('endpoint, status_code, response_time_ms')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error || !data) return null;

    const stats = {
      totalCalls: data.length,
      avgResponseTime: data.length 
        ? Math.round(data.reduce((acc, d) => acc + (d.response_time_ms || 0), 0) / data.length) 
        : 0,
      successRate: data.length 
        ? Math.round((data.filter(d => d.status_code && d.status_code < 400).length / data.length) * 100) 
        : 100,
      byEndpoint: {} as Record<string, { count: number; avgTime: number }>,
    };

    data.forEach(log => {
      if (!stats.byEndpoint[log.endpoint]) {
        stats.byEndpoint[log.endpoint] = { count: 0, avgTime: 0 };
      }
      const entry = stats.byEndpoint[log.endpoint];
      entry.avgTime = ((entry.avgTime * entry.count) + (log.response_time_ms || 0)) / (entry.count + 1);
      entry.count++;
    });

    return stats;
  }, [user]);

  return {
    logApiCall,
    monitoredFetch,
    getRecentLogs,
    getPerformanceStats,
  };
}
