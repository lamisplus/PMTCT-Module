import { QueryClient } from "react-query";

const queryClientSettings = {
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      cacheTime: 60000,
      refetchInterval: 10000, 
      refetchIntervalInBackground: true,
      suspense: false,
      staleTime: 30000,
    },
    mutations: {
      retry: 2,
    },
  },
};

export const queryClient = new QueryClient(queryClientSettings);