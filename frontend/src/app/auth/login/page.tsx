'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Box, Button, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { AppShell } from '@/components/layout/app-shell';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? '/creator/tours';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    const result = await supabaseBrowser.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);
    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  };

  const handleSignup = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (fullName.trim().length < 2) {
      setErrorMessage('Please enter a valid full name.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Password and confirm password must match.');
      return;
    }

    setIsSubmitting(true);

    const result = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          company_name: companyName.trim(),
          role: 'creator',
        },
      },
    });

    setIsSubmitting(false);
    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }

    setSuccessMessage('Signup successful. You can now login as creator.');
    setAuthMode('login');
    setConfirmPassword('');
  };

  return (
    <AppShell title="Login">
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2} component="form" onSubmit={handleLogin}>
              <Stack direction="row" spacing={1}>
                <Button
                  type="button"
                  variant={authMode === 'login' ? 'contained' : 'outlined'}
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </Button>
                <Button
                  type="button"
                  variant={authMode === 'signup' ? 'contained' : 'outlined'}
                  onClick={() => setAuthMode('signup')}
                >
                  Creator Sign Up
                </Button>
              </Stack>
              <Typography color="text.secondary">
                {authMode === 'login'
                  ? 'Access your creator dashboard.'
                  : 'Create creator account with basic details.'}
              </Typography>
              {errorMessage.length > 0 && <Alert severity="error">{errorMessage}</Alert>}
              {successMessage.length > 0 && <Alert severity="success">{successMessage}</Alert>}
              {authMode === 'signup' && (
                <>
                  <TextField
                    required
                    label="Full name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                  <TextField
                    label="Phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                  <TextField
                    label="Company / Brand (optional)"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                  />
                </>
              )}
              <TextField
                required
                type="email"
                label="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <TextField
                required
                type="password"
                label="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {authMode === 'signup' && (
                <TextField
                  required
                  type="password"
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              )}
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {authMode === 'login' ? (
                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                    Login
                  </Button>
                ) : (
                  <Button type="button" variant="contained" disabled={isSubmitting} onClick={handleSignup}>
                    Create Creator Account
                  </Button>
                )}
                <Button component={Link} href="/" variant="text">
                  Back to Public
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            sx={{
              p: { xs: 3, md: 5 },
              minHeight: '100%',
              background: 'linear-gradient(130deg, #003580 0%, #006ce4 100%)',
              color: 'white',
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="h4">Manage tours like a pro</Typography>
              <Typography sx={{ opacity: 0.95 }}>
                Publish beautiful tour pages, track bookings in real time, and share links with your audience.
              </Typography>
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.14)' }}>
                <Typography>Private dashboard includes:</Typography>
                <Typography sx={{ opacity: 0.95 }}>- Tour creation and editing</Typography>
                <Typography sx={{ opacity: 0.95 }}>- Share link generation</Typography>
                <Typography sx={{ opacity: 0.95 }}>- Booking status controls</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </AppShell>
  );
}
