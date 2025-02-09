import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';

export const LandingPage = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID ?? ''}>
      <div>랜딩페이지</div>
    </GoogleOAuthProvider>
  );
};
