import { AppProvider, useApp } from './context/AppContext';
import { AppHeader } from './components/common/AppHeader';
import { AccountSheet } from './components/common/AccountSheet';
import { SiteFooter } from './components/common/SiteFooter';
import { CustomerApp } from './components/customer/CustomerApp';
import { CaptainApp } from './components/captain/CaptainApp';
import { CitySheet } from './components/customer/CitySheet';
import { LoadingScreen, ErrorScreen, EmptyScreen } from './components/common/StatusScreens';
import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { pushBackHandler, runBackHandlers } from './utils/backStack';

function AppShell() {
  const { role, setRole, customerTab, setCustomerTab, selectedCategoryId, setSelectedCategoryId, isLoading, loadError, allCities, resetToDefault } = useApp();
  const [isCityOpen, setCityOpen] = useState(false);
  const [isAccountOpen, setAccountOpen] = useState(false);

  // Page-level Back: category page -> grid, other tab -> Home, captain area -> customer.
  // (Open sheets register their own, higher-priority Back handlers.)
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

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [role]);

  if (isLoading) return <LoadingScreen />;
  if (loadError) return <ErrorScreen message={loadError} onRetry={resetToDefault} />;
  if (allCities.length === 0) return <EmptyScreen onRetry={resetToDefault} />;

  return (
    <div className="min-h-dvh flex flex-col">
      <AppHeader onOpenCity={() => setCityOpen(true)} onOpenAccount={() => setAccountOpen(true)} />

      <div className="flex-1">
        {role === 'customer' && <CustomerApp onOpenCity={() => setCityOpen(true)} onOpenAccount={() => setAccountOpen(true)} />}
        {role === 'captain' && <CaptainApp />}
      </div>

      <SiteFooter />

      <CitySheet open={isCityOpen} onClose={() => setCityOpen(false)} />
      <AccountSheet open={isAccountOpen} onClose={() => setAccountOpen(false)} />
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
