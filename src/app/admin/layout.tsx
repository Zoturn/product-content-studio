'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Created inside useState, never at module scope — a module-level client would be shared across
// requests on the server and could leak one visitor's cached data into another's response.
// See .claude/rules/data-fetching.md.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
