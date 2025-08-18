import { AuthProvider } from '../lib/authContext';
import type { AppProps } from 'next/app';
import '../app/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
