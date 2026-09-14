'use client';

import { createTheme } from '@mui/material/styles';

// A system font stack rather than a webfont: nothing is fetched at build or run time, so the app
// renders identically on a machine with no network.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1f2937' },
    secondary: { main: '#2563eb' },
    background: { default: '#f6f7f9', paper: '#ffffff' },
  },
  typography: {
    fontFamily: [
      'system-ui',
      '-apple-system',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontSize: '1.9rem', fontWeight: 600 },
    h2: { fontSize: '1.4rem', fontWeight: 600 },
    h3: { fontSize: '1.15rem', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});

export default theme;
