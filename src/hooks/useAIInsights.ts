import { useState, useEffect } from 'react';
import { AIInsightData } from '../types';
import { mockApi } from '../services/mockApi';

export const useAIInsights = () => {
  const [insight, setInsight] = useState<AIInsightData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchInsight = async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.fetchAIInsights();
      setInsight(data);
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  return {
    insight,
    isLoading,
    refreshAI: fetchInsight,
  };
};
