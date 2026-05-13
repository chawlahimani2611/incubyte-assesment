import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

/**
 * Custom React Query Hook: useEmployees
 *
 * Orchestrates fetching, caching, and background synchronization of paginated
 * employee datasets matching client filter states.
 * NOTE: The server returns { success, data, meta: { total, page, limit, totalPages } }
 */
const useEmployees = (filters = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
  );

  return useQuery({
    queryKey: ['employees', cleanParams],
    queryFn: () => apiClient.get('/employees', { params: cleanParams }),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });
};

/**
 * Mutation hook: Create a new employee
 */
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.post('/employees', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

/**
 * Mutation hook: Update an existing employee by ID
 */
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.put(`/employees/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

/**
 * Mutation hook: Delete an employee by ID
 */
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export default useEmployees;
