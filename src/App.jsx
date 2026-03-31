import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import RiwayatUsulan from './pages/dashboard/RiwayatUsulan';
import RincianBelanja from './pages/dashboard/RincianBelanja';
import KategoriBelanja from './pages/dashboard/master/KategoriBelanja';
import NamaBarang from './pages/dashboard/master/NamaBarang';
import Users from './pages/dashboard/master/Users';
import LaporanPage from './pages/laporan/LaporanPage';
import useAuthStore from './store/auth';

export default function App() {
  const { user } = useAuthStore();
  
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {/* Main Dashboard - uses Dispatcher internally */}
        <Route index element={<DashboardHome />} />
        
        <Route path="riwayat_usulan" element={<RiwayatUsulan />} />
        <Route path="rincian_belanja" element={<RincianBelanja />} />
        
        {/* Protected Routes for PEP only */}
        {user?.role === 'pep' && (
          <Route path="master">
            <Route path="kategori" element={<KategoriBelanja />} />
            <Route path="barang" element={<NamaBarang />} />
            <Route path="users" element={<Users />} />
          </Route>
        )}
        
        <Route path="laporan" element={<LaporanPage />} />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
