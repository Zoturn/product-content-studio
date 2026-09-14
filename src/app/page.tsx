import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function HomePage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: { xs: 4, md: 8 } }}>
        <Typography variant="h1" gutterBottom>
          Product Content Studio
        </Typography>
        <Typography color="text.secondary">
          The public catalog is delivered by the add-public-catalog change.
        </Typography>
      </Box>
    </Container>
  );
}
