import { AppProvider, useApp } from './context/AppContext';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { CustomerApp } from './components/customer/CustomerApp';
import { CaptainApp } from './components/captain/CaptainApp';
import { CityModal } from './components/customer/CityModal';
import { LoadingScreen, ErrorScreen, EmptyScreen } from './components/common/StatusScreens';
import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { pushBackHandler, runBackHandlers } from './utils/backStack';

function AppShell() {
  const { role, setRole, customerTab, setCustomerTab, selectedCategoryId, setSelectedCategoryId, isLoading, loadError, allCities, resetToDefault } = useApp();
  const [isCityModalOpen, setCityModalOpen] = useState(false);

  // Close the global city picker on Back.
  useEffect(() => {
    if (!isCityModalOpen) return;
    return pushBackHandler(() => {
      setCityModalOpen(false);
      return true;
    });
  }, [isCityModalOpen]);

  // Page-level Back: category page -> grid, other tab -> Home, captain area -> customer.
  useEffect(() => {
    return pushBackHandler(() => {
      if (selectedCategoryId) {
        if (window.history.state?.homeservCat) window.history.back();
        else setSelectedCategoryId(null);
        return true;
      }
      if (role === 'customer' && customerTab !== 'home') {
        setCustomerTab('home');
        return true;
      }
      if (role === 'captain') {
        setRole('customer');
        return true;
      }
      return false;
    });
  }, [role, customerTab, selectedCategoryId, setRole, setCustomerTab, setSelectedCategoryId]);

  // Wire the Android hardware Back button (no-op in a normal browser).
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const handle = CapacitorApp.addListener('backButton', () => {
      if (!runBackHandlers()) CapacitorApp.exitApp();
    });
    return () => {
      handle.then((h) => h.remove());
    };
  }, []);

  if (isLoading) return <LoadingScreen />;
  if (loadError) return <ErrorScreen message={loadError} onRetry={resetToDefault} />;
  if (allCities.length === 0) return <EmptyScreen onRetry={resetToDefault} />;

  return (
    <div className="min-h-screen bg-transparent">
      <RoleSwitcherBar onOpenCityModal={() => setCityModalOpen(true)} />

      {role === 'customer' && <CustomerApp />}
      {role === 'captain' && <CaptainApp />}

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
