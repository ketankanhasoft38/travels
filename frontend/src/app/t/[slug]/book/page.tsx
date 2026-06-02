'use client';

import { useState } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LockIcon from '@mui/icons-material/Lock';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { bookingDraftStore } from '@/lib/booking-draft';

export default function BookTourPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();

  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmitBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    if (!params.slug) {
      setErrorMessage('Invalid tour link');
      return;
    }

    bookingDraftStore.save({
      slug: params.slug,
      visitorName,
      visitorEmail,
      guestCount,
      specialRequests,
    });

    router.push(`/t/${params.slug}/payment`);
  };

  return (
    <AppShell title="Book Tour">
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={2.25}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">Traveler Details</Typography>
                  <Typography color="text.secondary">
                    Enter guest information to continue to secure payment.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <LockIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Encrypted form
                  </Typography>
                </Stack>
              </Stack>
              <Divider />
              <Stack component="form" spacing={2} onSubmit={handleSubmitBooking}>
              {errorMessage.length > 0 && <Alert severity="error">{errorMessage}</Alert>}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Chip icon={<PersonOutlineOutlinedIcon />} label="Lead traveler information" />
                <Chip icon={<CalendarMonthIcon />} label="You can review before payment" />
              </Stack>
              <TextField
                required
                label="Full name"
                placeholder="e.g. John Doe"
                value={visitorName}
                onChange={(event) => setVisitorName(event.target.value)}
              />
              <TextField
                required
                type="email"
                label="Email address"
                placeholder="you@example.com"
                value={visitorEmail}
                onChange={(event) => setVisitorEmail(event.target.value)}
              />
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Guest count"
                    value={guestCount}
                    onChange={(event) => setGuestCount(Number(event.target.value))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Promo code (optional)" placeholder="SUMMER2026" />
                </Grid>
              </Grid>
              <TextField
                multiline
                minRows={3}
                label="Special requests"
                placeholder="Airport pickup timing, meal preferences, room requests..."
                value={specialRequests}
                onChange={(event) => setSpecialRequests(event.target.value)}
              />
              <Stack spacing={1}>
                <Button type="submit" variant="contained" size="large">
                  Continue to Payment
                </Button>
                <Typography variant="caption" color="text.secondary">
                  By continuing, you agree to booking terms and cancellation policy.
                </Typography>
              </Stack>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <Typography variant="h6">Booking Confidence</Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <VerifiedUserIcon color="success" fontSize="small" />
                  <Typography color="text.secondary">Verified creators and curated experiences</Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <VerifiedUserIcon color="success" fontSize="small" />
                  <Typography color="text.secondary">Secure payment step with booking confirmation</Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <VerifiedUserIcon color="success" fontSize="small" />
                  <Typography color="text.secondary">Status updates from creator dashboard</Typography>
                </Stack>
              </Stack>
            </Paper>
            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={1.2}>
                <Typography variant="h6">Need Assistance?</Typography>
                <Typography color="text.secondary">
                  Contact our travel support team for any booking or itinerary question.
                </Typography>
                <Box sx={{ mt: 0.5, p: 1.5, bgcolor: '#f6f9ff', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    support@tourbookingpro.com
                  </Typography>
                </Box>
              </Stack>
            </Paper>
            <Paper sx={{ p: 2.5, bgcolor: '#f8fbff' }}>
              <Typography variant="body2" color="text.secondary">
                Next step: dummy payment page, then success confirmation + downloadable receipt PDF.
              </Typography>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </AppShell>
  );
}
