import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

/**
 * Custom React Query Hook: useEmployees
 *
 * Orchestrates fetching, caching, and background synchronization of paginated
 * employee datasets matching client filter states.
 *
 * @param {Object} filters
 * @param {number} [filters.page=1]
 * @param {number} [filters.limit=10]
 * @param {string} [filters.search]
 * @param {string} [filters.country]
 * @param {string} [filters.department]
 * @param {string} [filters.sortBy]
 * @param {string} [filters.sortOrder]
 */
const useEmployees = (filters = {}) => {
  // Extract and clean valid filter properties to avoid passing empty string parameters
  const cleanParams = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
  );

  return useQuery({
    queryKey: ['employees', cleanParams],
    queryFn: () => apiClient.get('/employees', { params: cleanParams }),
    placeholderData: (previousData) => previousData, // keep visible previous page data while fetching next page
    staleTime: 60 * 1000, // 1 minute
  });
};

export default useEmployees;
