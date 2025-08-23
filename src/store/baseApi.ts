import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { tokenStore } from '@/services/api';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    prepareHeaders: (headers) => {
      const token = tokenStore.access;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: ['Products'],
  endpoints: () => ({}),
});
