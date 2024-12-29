import * as React from 'react';
import { useState, useEffect } from 'react';
import { Loader, RefreshCw } from 'lucide-react';
import { Button } from '.';

let timeout: any;

export const ContainerLoading = () => {
  const [error, setError] = useState(false);
  // const history = useHistory();
  // const location = useLocation();

  useEffect(() => {
    timeout = setTimeout(() => {
      setError(true);
      clearTimeout(timeout);
    }, 10000);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const handleRefresh = () => {
    // history.replace(location.pathname || '/');
    window.location.reload();
  };

  return (
    <React.Fragment>
      {error ? (
        <div className="loading-error">
          <span>
            An error occurred on this page.
            <br /> Please press the refresh button.
          </span>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw />
            refresh
          </Button>
        </div>
      ) : (
        <div className="loading">
          <Loader />
        </div>
      )}
    </React.Fragment>
  );
};
