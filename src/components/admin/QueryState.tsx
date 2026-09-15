'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

// Shared pending/error rendering for the two admin screens that fetch with useQuery — see the
// "reuse" finding from the full-project review: ProductList and ProductEditor previously
// duplicated this exact block.
export function QueryState<TData>({
  query,
  errorMessage,
  children,
}: {
  query: UseQueryResult<TData>;
  errorMessage: string;
  children: (data: TData) => React.ReactNode;
}) {
  if (query.isPending) {
    return (
      <Stack sx={{ py: 6, alignItems: 'center' }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (query.isError) {
    return <Alert severity="error">{errorMessage}</Alert>;
  }

  return <>{children(query.data)}</>;
}
