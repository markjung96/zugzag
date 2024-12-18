import React from 'react';
import { AppRouter } from './router';
import { LayoutProvider, ThemeProvider } from './provider';

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <LayoutProvider>
          <AppRouter />
        </LayoutProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
