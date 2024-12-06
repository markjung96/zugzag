import React from 'react';
import { AppRouter } from './router';
import { ThemeProvider } from './provider';

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </div>
  );
}

export default App;
