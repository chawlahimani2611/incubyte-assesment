import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

/**
 * Analytics Data Hooks: useInsights
 *
 * Exposes specialized TanStack Query endpoints mapping to core MongoDB Aggregation pipeline analytics.
 * Employs extended staleTime policies to optimize high-volume statistical vector rendering.
 */

export const useSalaryByCountry = () => {
  return useQuery({
    queryKey: ['insights', 'salaryByCountry'],
    queryFn: () => apiClient.get('/insights/salary-by-country'),
    staleTime: 5 * 60 * 1000, // 5 minutes cache sharing
  });
};

export const useSalaryByJobTitle = (country) => {
  const params = country ? { country } : {};
  return useQuery({
    queryKey: ['insights', 'salaryByJobTitle', country],
    queryFn: () => apiClient.get('/insights/salary-by-job-title', { params }),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDepartmentsSummary = () => {
  return useQuery({
    queryKey: ['insights', 'departmentsSummary'],
    queryFn: () => apiClient.get('/insights/departments'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSalaryDistribution = () => {
  return useQuery({
    queryKey: ['insights', 'salaryDistribution'],
    queryFn: () => apiClient.get('/insights/salary-distribution'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useHeadcountByCountry = () => {
  return useQuery({
    queryKey: ['insights', 'headcountByCountry'],
    queryFn: () => apiClient.get('/insights/headcount-by-country'),
    staleTime: 5 * 60 * 1000,
  });
};
