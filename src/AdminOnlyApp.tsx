import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AdminApp } from './components/admin/AdminApp';
import { LoadingScreen, ErrorScreen, EmptyScreen } from './components/common/StatusScreens';

function AdminShell() {
  const { isLoading, loadError, allCities, resetToDefault } = useApp();

  useEffect(() => {
    document.title = 'HomeServ Admin';
  }, []);

  if (isLoading) return <LoadingScreen />;
  if (loadError) return <ErrorScreen message={loadError} onRetry={resetToDefault} />;
  if (allCities.length === 0) return <EmptyScreen onRetry={resetToDefault} />;

  return <AdminApp />;
}

function AdminOnlyApp() {
  return (
    <AppProvider>
      <AdminShell />
    </AppProvider>
  );
}

export default AdminOnlyApp;
