'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProductStatus } from '@prisma/client';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  PRODUCT_LIMITS,
  productUpdateSchema,
  type ProductUpdateInput,
} from '@/lib/validation/product';
import {
  adminProductKeys,
  fetchProduct,
  saveProduct,
  type AdminProduct,
} from '@/lib/api/adminProducts';
import { ApiError } from '@/lib/api/client';
import { QueryState } from '@/components/admin/QueryState';

// Prisma's Json scalar has no shape guarantee at the type level (src/lib/services/products.ts
// types it `unknown`, deliberately, rather than the hand-typed `Record<string, unknown>` this
// component used to assume). Narrow before treating it as an object, rather than crash on
// Object.entries if it were ever something else — see the "attributes has no runtime shape
// validation" finding from the full-project review.
function asAttributeEntries(attributes: unknown): [string, unknown][] {
  if (attributes && typeof attributes === 'object' && !Array.isArray(attributes)) {
    return Object.entries(attributes);
  }
  return [];
}

export function ProductEditor({ productId }: { productId: string }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: adminProductKeys.detail(productId),
    queryFn: () => fetchProduct(productId),
  });

  return (
    <QueryState query={query} errorMessage="Could not load this product. Try reloading the page.">
      {(product) => (
        <EditorForm
          product={product}
          onSaved={() => queryClient.invalidateQueries({ queryKey: adminProductKeys.list })}
        />
      )}
    </QueryState>
  );
}

function EditorForm({ product, onSaved }: { product: AdminProduct; onSaved: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProductUpdateInput>({
    resolver: zodResolver(productUpdateSchema),
    defaultValues: {
      description: product.description,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      status: product.status,
    },
  });

  // One subscription for all three counted fields instead of three, each re-subscribing to the
  // form's internal state on every keystroke — see the "efficiency" finding from the
  // full-project review.
  const [description, seoTitle, seoDescription] = useWatch({
    control,
    name: ['description', 'seoTitle', 'seoDescription'],
  });

  // Covers reload and tab close. The App Router has no supported route-change guard, so the
  // browser back button is a known gap — see openspec/changes/.../design.md.
  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const mutation = useMutation({
    mutationFn: (input: ProductUpdateInput) => saveProduct(product.id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(adminProductKeys.detail(product.id), updated);
      onSaved();
      // Re-baselines the form's dirty tracking against the values just saved — without this,
      // formState.isDirty stays true forever after the first edit, and the unsaved-changes
      // warning (beforeunload above, handleBackClick below) fires even right after a
      // successful save. See the "isDirty never resets" finding from the full-project review.
      reset({
        description: updated.description,
        seoTitle: updated.seoTitle,
        seoDescription: updated.seoDescription,
        status: updated.status,
      });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          if (field in productUpdateSchema.shape) {
            setError(field as keyof ProductUpdateInput, { message: messages[0] });
          }
        }
      }
    },
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  function handleBackClick(event: React.MouseEvent) {
    if (isDirty && !window.confirm('You have unsaved changes. Leave without saving?')) {
      event.preventDefault();
      return;
    }
    router.push('/admin/products');
  }

  // mutation.isSuccess already reflects "the last save succeeded and nothing has been
  // resubmitted since" on its own — calling mutate() again flips it back to pending
  // immediately, so a separate "did we just save" state would only ever duplicate it.
  const showSavedBanner = mutation.isSuccess;

  let generalError: string | null = null;
  if (mutation.isError) {
    if (mutation.error instanceof ApiError) {
      generalError = mutation.error.code === 'VALIDATION_ERROR' ? null : mutation.error.message;
    } else {
      generalError = 'Something went wrong. Your edits have not been lost — try saving again.';
    }
  }

  return (
    <Box>
      <Button onClick={handleBackClick} sx={{ mb: 2 }}>
        ← Back to products
      </Button>

      <Typography variant="h2" sx={{ fontSize: '1.125rem' }}>
        {product.name}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
        {asAttributeEntries(product.attributes)
          .map(([key, value]) => `${key}: ${value}`)
          .join(' · ')}
      </Typography>

      <Stack component="form" onSubmit={onSubmit} spacing={3} noValidate>
        {generalError && <Alert severity="error">{generalError}</Alert>}
        {showSavedBanner && <Alert severity="success">Saved.</Alert>}

        <Box>
          <TextField
            label="Description"
            multiline
            minRows={4}
            fullWidth
            error={!!errors.description}
            helperText={errors.description?.message}
            disabled={mutation.isPending}
            {...register('description')}
          />
          <FieldCounter length={description.length} limit={PRODUCT_LIMITS.description} />
        </Box>
        <Box>
          <TextField
            label="SEO title"
            fullWidth
            error={!!errors.seoTitle}
            helperText={errors.seoTitle?.message}
            disabled={mutation.isPending}
            {...register('seoTitle')}
          />
          <FieldCounter length={seoTitle.length} limit={PRODUCT_LIMITS.seoTitle} />
        </Box>
        <Box>
          <TextField
            label="SEO description"
            multiline
            minRows={2}
            fullWidth
            error={!!errors.seoDescription}
            helperText={errors.seoDescription?.message}
            disabled={mutation.isPending}
            {...register('seoDescription')}
          />
          <FieldCounter length={seoDescription.length} limit={PRODUCT_LIMITS.seoDescription} />
        </Box>
        <TextField
          select
          label="Status"
          defaultValue={product.status}
          disabled={mutation.isPending}
          {...register('status')}
        >
          <MenuItem value={ProductStatus.DRAFT}>Draft</MenuItem>
          <MenuItem value={ProductStatus.PUBLISHED}>Published</MenuItem>
        </TextField>

        <Button
          type="submit"
          variant="contained"
          disabled={mutation.isPending}
          sx={{ alignSelf: 'flex-start' }}
        >
          {mutation.isPending ? 'Saving…' : 'Save'}
        </Button>
      </Stack>
    </Box>
  );
}

// Deliberately its own component, rendering outside the TextField's own props (not as
// helperText). Feeding a value that changes on every keystroke into a multiline MUI TextField's
// helperText was cascading into its internal autosize measurement and tripping React's
// "Maximum update depth exceeded" guard under rapid input — see the fix commit for the repro.
function FieldCounter({ length, limit }: { length: number; limit: number }) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: 'block', mt: 0.5, ml: 1.75 }}
    >
      {length}/{limit}
    </Typography>
  );
}
