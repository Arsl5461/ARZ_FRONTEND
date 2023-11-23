import { Helmet } from 'react-helmet-async';
// @mui
import { styled } from '@mui/material/styles';
import { Container, Typography } from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// components
import Iconify from '../components/iconify';
// sections
import { LoginForm } from '../sections/auth/login';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
    [theme.breakpoints.up('md')]: {
        display: 'flex',
    },
}));

const StyledSection = styled('div')(({ theme }) => ({
    width: '100%',
    maxWidth: 480,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: theme.customShadows.card,
    backgroundColor: theme.palette.background.default,
}));

const StyledContent = styled('div')(({ theme }) => ({
    maxWidth: 480,
    margin: 'auto',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function LoginPage() {
    const mdUp = useResponsive('up', 'md');

    return (
        <>
            <Helmet>
                <title> Login </title>
            </Helmet>

            <StyledRoot className="bg-white">
                {mdUp && (
                    <StyledSection className="auth_image">
                        <img src="/assets/illustrations/site_llogo.svg" alt="login" className="" />
                    </StyledSection>
                )}

                <Container maxWidth="md">
                    <h1 className="welcome_text">Hi, Welcome Back</h1>
                    <div className="form_content">
                        <StyledContent className="Login_wraper">
                            <Typography variant="h4" gutterBottom className="signIn_text">
                                Sign in
                                <p className="continue_text">Please sign-in below to continue.</p>
                            </Typography>

                            <Typography variant="body2" sx={{ mb: 5 }}>
                                {/* Don’t have an account? {''}
              <Link variant="subtitle2">Sign up</Link> */}
                            </Typography>
                            <LoginForm />
                        </StyledContent>
                    </div>
                </Container>
            </StyledRoot>
        </>
    );
}
