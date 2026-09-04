import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { TopModuleNavBar } from './components/common/TopModuleNavBar';
import { PersonnelDossierModal } from './components/personnel/PersonnelDossierModal';
import { AddPersonnelModal } from './components/personnel/AddPersonnelModal';
import { ParadeStatePrintSheet } from './components/parade/ParadeStatePrintSheet';
import { DailyParadeStateModal } from './components/parade/DailyParadeStateModal';
import { OutOfUnitManagerModal } from './components/parade/OutOfUnitManagerModal';
import { Personnel } from './types';

// Pages
import { LoginPage } from './pages/LoginPage';
import { MainDashboardPage } from './pages/MainDashboardPage';
import { MasterPersonnelPage } from './pages/MasterPersonnelPage';
import { BatteryDashboardPage } from './pages/BatteryDashboardPage';
import { ParadeStatePage } from './pages/ParadeStatePage';
import { RsmDashboardPage } from './pages/RsmDashboardPage';
import { CoDashboardPage } from './pages/CoDashboardPage';
import { OffrDashboardPage } from './pages/OffrDashboardPage';
import { AdminPanelPage } from './pages/AdminPanelPage';

const AppContent: React.FC = () => {
  const {
    activePage,
    isAuthenticated,
    dailyParadeModalOpen,
    setDailyParadeModalOpen,
    outOfUnitModalOpen,
    setOutOfUnitModalOpen,
    activeOutOfUnitCategory,
  } = useApp();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Modal States
  const [dossierPerson, setDossierPerson] = useState<Personnel | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const handleViewDossier = (person: Personnel) => {
    setDossierPerson(person);
    setIsDossierOpen(true);
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'login':
        return <LoginPage />;
      case 'main_dashboard':
        return (
          <MainDashboardPage
            onViewDossier={handleViewDossier}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        );
      case 'master_personnel':
        return (
          <MasterPersonnelPage
            onViewDossier={handleViewDossier}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        );
      case 'battery_dashboard':
        return (
          <BatteryDashboardPage
            onViewDossier={handleViewDossier}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        );
      case 'parade_state':
        return (
          <ParadeStatePage
            onViewDossier={handleViewDossier}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        );
      case 'rsm_dashboard':
        return (
          <RsmDashboardPage
            onViewDossier={handleViewDossier}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        );
      case 'co_dashboard':
        return (
          <CoDashboardPage
            onViewDossier={handleViewDossier}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        );
      case 'offr_dashboard':
        return (
          <OffrDashboardPage
            onViewDossier={handleViewDossier}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        );
      case 'admin_panel':
        return <AdminPanelPage />;
      default:
        return (
          <MainDashboardPage
            onViewDossier={handleViewDossier}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        );
    }
  };

  // Strict Route Guard: If not authenticated or on login page, render isolated login screen
  if (!isAuthenticated || activePage === 'login') {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Responsive Sidebar */}
        <Sidebar
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-72 min-w-0 flex flex-col">
          <TopModuleNavBar />
          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">{renderActivePage()}</div>
        </main>
      </div>

      {/* Global Dossier Modal */}
      <PersonnelDossierModal
        person={dossierPerson}
        isOpen={isDossierOpen}
        onClose={() => {
          setIsDossierOpen(false);
          setDossierPerson(null);
        }}
      />

      {/* Global Add / Enlist Soldier Modal */}
      <AddPersonnelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Official Military Print Document Modal */}
      <ParadeStatePrintSheet
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      {/* Updt Daily Parade State Modal (29 Points) */}
      <DailyParadeStateModal
        isOpen={dailyParadeModalOpen}
        onClose={() => setDailyParadeModalOpen(false)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
      />

      {/* Updt Out Of Unit Modal (ERE, Msn, Att, FDMN, CMH, Course, Comd, Leaves) */}
      <OutOfUnitManagerModal
        isOpen={outOfUnitModalOpen}
        onClose={() => setOutOfUnitModalOpen(false)}
        defaultCategory={activeOutOfUnitCategory}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
