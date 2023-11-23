import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
import 'react-toastify/dist/ReactToastify.css';
// components
import { StyledChart } from './components/chart';
import ScrollToTop from './components/scroll-to-top';
// css
import './assets/css/style.css';
import TopBarProgress from './utils/TopBarProgress';
// ----------------------------------------------------------------------

export default function App() {
    return (
        <HelmetProvider>
            <BrowserRouter>
                <ThemeProvider>
                    <ScrollToTop />
                    <StyledChart />
                    <ToastContainer position="top-right" pauseOnHover newestOnTop autoClose={3000} />
                    <Suspense
                        fallback={
                            <div>
                                <TopBarProgress />
                            </div>
                        }
                    >
                        <Router />
                    </Suspense>
                </ThemeProvider>
            </BrowserRouter>
        </HelmetProvider>
    );
}
