import { GoogleOAuthProvider } from '@react-oauth/google';

import { ThemeProvider } from './provider';
import { AppRouter } from './router';

function App() {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return <div>Client ID not found</div>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <GoogleOAuthProvider clientId={clientId}>
        <div className="App">
          <AppRouter />
        </div>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App;
