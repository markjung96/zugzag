import React from 'react';
import { AppRouter } from './router';
import { ThemeProvider } from './layout';

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
