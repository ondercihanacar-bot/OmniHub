import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LicensesPage from './pages/LicensesPage';
import CustomersPage from './pages/CustomersPage';
import RenewalRadarPage from './pages/RenewalRadarPage';
import TelemetryPage from './pages/TelemetryPage';
import ProductsPage from './pages/ProductsPage';
import SettingsPage from './pages/SettingsPage';

import LicenseGeneratorModal from './components/LicenseGeneratorModal';
import LicenseCertificateModal from './components/LicenseCertificateModal';
import RenewModal from './components/RenewModal';
import HeartbeatSimulatorModal from './components/HeartbeatSimulatorModal';

import { getAuthToken, getCurrentUser, setAuthToken, setCurrentUser, api } from './api';

export default function App() {
  const [user, setUser] = useState(getCurrentUser());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [generatorCustomerId, setGeneratorCustomerId] = useState(null);

  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [selectedCertificateLicense, setSelectedCertificateLicense] = useState(null);

  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [selectedRenewLicense, setSelectedRenewLicense] = useState(null);

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorKey, setSimulatorKey] = useState('');

  // Initial filter navigation state for Licenses page
  const [licenseFilters, setLicenseFilters] = useState({});

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setUser(null);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Modal Handlers
  const handleOpenGenerator = (customerId = null) => {
    setGeneratorCustomerId(customerId);
    setIsGeneratorOpen(true);
  };

  const handleOpenCertificate = async (lic) => {
    try {
      const res = await api.getLicense(lic.id);
      setSelectedCertificateLicense(res.license);
      setIsCertificateOpen(true);
    } catch (err) {
      alert(err.message || 'Sertifika yüklenemedi');
    }
  };

  const handleOpenRenew = (lic) => {
    setSelectedRenewLicense(lic);
    setIsRenewOpen(true);
  };

  const handleOpenSimulator = (key = '') => {
    setSimulatorKey(key);
    setIsSimulatorOpen(true);
  };

  const handleNavigate = (tab, filters = {}) => {
    setActiveTab(tab);
    if (tab === 'licenses') {
      setLicenseFilters(filters);
    }
  };

  if (!user) {
    return <LoginPage onLoginSuccess={(u) => setUser(u)} />;
  }

  const pageHeaders = {
    dashboard: {
      title: 'Genel Bakış & Kontrol Paneli',
      subtitle: 'Merkezi dağıtıcı metrikleri ve yenileme alarmları'
    },
    licenses: {
      title: 'Kriptografik Lisans Yönetimi',
      subtitle: 'OMNIFlow & OmniSpot kurumsal lisans tahsis ve anti-korsan denetimi'
    },
    customers: {
      title: 'Müşteri CRM & Dağıtım Rehberi',
      subtitle: 'Kayıtlı kurumlar, yetkili kişiler ve bağlı yazılım lisansları'
    },
    renewals: {
      title: 'Lisans Yenileme Radarı & Satış Merkezi',
      subtitle: 'Süresi biten sözleşmeler ve tek tıkla WhatsApp/E-posta teklifleri'
    },
    telemetry: {
      title: 'Canlı Telemetri & Heartbeat Akışı',
      subtitle: 'İstemcilerden merkeze ulaşan doğrulama sinyalleri ve donanım denetimi'
    },
    products: {
      title: 'Ürün & Modül Matrisi',
      subtitle: 'OMNIFlow ve OmniSpot lisanslanabilir modül katalogu'
    },
    settings: {
      title: 'Sistem Parametreleri & Güvenlik',
      subtitle: 'Yönetici şifresi, şablonlar ve AES-256 kripto anahtarları'
    }
  };

  const currentHeader = pageHeaders[activeTab] || pageHeaders.dashboard;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex cyber-grid selection:bg-cyan-500 selection:text-black">
      {/* 1. Permanent Cyber Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setLicenseFilters({});
          setActiveTab(tab);
        }}
        onLogout={handleLogout}
        user={user}
        onOpenGenerator={() => handleOpenGenerator()}
        onOpenSimulator={() => handleOpenSimulator()}
      />

      {/* 2. Main Content Area (Full-Width, No Artificial Max-W) */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={currentHeader.title}
          subtitle={currentHeader.subtitle}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onOpenGenerator={() => handleOpenGenerator()}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              key={refreshTrigger}
              onNavigate={handleNavigate}
              onOpenGenerator={handleOpenGenerator}
              onOpenCertificate={handleOpenCertificate}
              onOpenRenew={handleOpenRenew}
            />
          )}

          {activeTab === 'licenses' && (
            <LicensesPage
              key={refreshTrigger}
              initialFilters={licenseFilters}
              onOpenGenerator={handleOpenGenerator}
              onOpenCertificate={handleOpenCertificate}
              onOpenRenew={handleOpenRenew}
              onOpenSimulator={handleOpenSimulator}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersPage
              key={refreshTrigger}
              onOpenGenerator={handleOpenGenerator}
              onNavigateToLicenses={(cid) => handleNavigate('licenses', { customer_id: cid })}
            />
          )}

          {activeTab === 'renewals' && (
            <RenewalRadarPage
              key={refreshTrigger}
              onOpenRenew={handleOpenRenew}
            />
          )}

          {activeTab === 'telemetry' && (
            <TelemetryPage
              key={refreshTrigger}
              onOpenSimulator={handleOpenSimulator}
            />
          )}

          {activeTab === 'products' && (
            <ProductsPage key={refreshTrigger} />
          )}

          {activeTab === 'settings' && (
            <SettingsPage key={refreshTrigger} />
          )}
        </main>

        {/* 3. Permanent Page Footer */}
        <Footer />
      </div>

      {/* MODALS */}
      <LicenseGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        initialCustomerId={generatorCustomerId}
        onGenerated={() => handleRefresh()}
      />

      <LicenseCertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        license={selectedCertificateLicense}
      />

      <RenewModal
        isOpen={isRenewOpen}
        onClose={() => setIsRenewOpen(false)}
        license={selectedRenewLicense}
        onRenewed={() => handleRefresh()}
      />

      <HeartbeatSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        defaultKey={simulatorKey}
      />
    </div>
  );
}
