import * as React from 'react';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import { FormContainer, TextFieldElement, PasswordElement } from 'react-hook-form-mui';
import supabase from '../../client.js';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 0,
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignUp() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSignUp = async (data: { name?: string; email?: string; password?: string }) => {
    if (!data.email || !data.password) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.name,
            name: data.name,
          },
        },
      });
      if (authError) {
        setError(authError.message);
      } else {
        setSuccess('アカウント登録が完了しました。確認メールを送信した場合はメールをご確認ください。');
      }
    } catch (err: any) {
      setError(err?.message || '登録中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignUpContainer direction="column" sx={{ justifyContent: 'space-between' }}>
      <Card variant="outlined">
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          新規登録
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <FormContainer onSuccess={handleSignUp}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel htmlFor="name">表示名</FormLabel>
            <TextFieldElement
              autoComplete="nickname"
              name="name"
              required
              fullWidth
              id="name"
              placeholder="Jon Snow"
            />
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel htmlFor="email">メールアドレス</FormLabel>
            <TextFieldElement
              required
              fullWidth
              id="email"
              placeholder="your@email.com"
              name="email"
              autoComplete="email"
              variant="outlined"
              type="email"
            />
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel htmlFor="password">パスワード</FormLabel>
            <PasswordElement
              required
              fullWidth
              name="password"
              placeholder="••••••"
              id="password"
              autoComplete="new-password"
              variant="outlined"
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'この内容で登録する'}
          </Button>
        </FormContainer>
        <Divider>
          <Typography sx={{ color: 'text.secondary' }}>または</Typography>
        </Divider>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ textAlign: 'center' }}>
            アカウントをお持ちの場合{' '}
            <Link
              href="/signin"
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              サインイン
            </Link>
          </Typography>
        </Box>
      </Card>
    </SignUpContainer>
  );
}
