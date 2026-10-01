import { AppProvider, useApp } from './context/AppContext';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { CustomerApp } from './components/customer/CustomerApp';
import { CaptainApp } from './components/captain/CaptainApp';
import { AdminApp } from './components/admin/AdminApp';
import { CityModal } from './components/customer/CityModal';
import { LoadingScreen, ErrorScreen, EmptyScreen } from './components/common/StatusScreens';
import { useState } from 'react';

function AppShell() {
  const { role, isLoading, loadError, allCities, resetToDefault } = useApp();
  const [isCityModalOpen, setCityModalOpen] = useState(false);

  if (isLoading) return <LoadingScreen />;
  if (loadError) return <ErrorScreen message={loadError} onRetry={resetToDefault} />;
  if (allCities.length === 0) return <EmptyScreen onRetry={resetToDefault} />;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <RoleSwitcherBar onOpenCityModal={() => setCityModalOpen(true)} />

      {role === 'customer' && <CustomerApp />}
      {role === 'captain' && <CaptainApp />}
      {role === 'admin' && <AdminApp />}

      <CityModal isOpen={isCityModalOpen} onClose={() => setCityModalOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
