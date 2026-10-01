import { AppProvider, useApp } from './context/AppContext';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { CustomerApp } from './components/customer/CustomerApp';
import { CaptainApp } from './components/captain/CaptainApp';
import { AdminApp } from './components/admin/AdminApp';
import { CityModal } from './components/customer/CityModal';
import { useState } from 'react';

function AppShell() {
  const { role } = useApp();
  const [isCityModalOpen, setCityModalOpen] = useState(false);

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
