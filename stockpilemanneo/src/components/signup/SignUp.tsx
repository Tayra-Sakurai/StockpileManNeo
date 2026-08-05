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
import { styled } from '@mui/material/styles';
import { FormContainer, TextFieldElement, PasswordElement } from 'react-hook-form-mui';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
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

export default function SignUp(props: { disableCustomTheme?: boolean; }) {
  

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
        <FormContainer
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
        >
          <FormControl fullWidth>
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
          <FormControl fullWidth>
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
          <FormControl fullWidth>
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
          >
            この内容で登録する
          </Button>
        </FormContainer>
        <Divider>
          <Typography sx={{ color: 'text.secondary' }}>or</Typography>
        </Divider>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ textAlign: 'center' }}>
            アカウントをお持ちの場合{' '}
            <Link
              href="/material-ui/getting-started/templates/sign-in/"
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
