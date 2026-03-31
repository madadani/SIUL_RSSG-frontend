import useAuthStore from '../../store/auth';
import PEPDashboard from '../pep/PEPDashboard';
import PPTKDashboard from '../pptk/PPTKDashboard';
import PPKOMDashboard from '../ppkom/PPKOMDashboard';
import PPDashboard from '../pp/PPDashboard';

/**
 * DashboardHome acts as a dynamic dispatcher that renders 
 * the role-specific dashboard based on the logged-in user.
 */
export default function DashboardHome() {
  const { user } = useAuthStore();

  if (!user) return <div className="p-8 text-center">Memuat data pengguna...</div>;

  switch (user.role) {
    case 'pep':
      return <PEPDashboard />;
    case 'pptk':
      return <PPTKDashboard />;
    case 'ppkom':
      return <PPKOMDashboard />;
    case 'pp':
      return <PPDashboard />;
    default:
      return (
        <div className="p-10 text-center">
          <h2 className="text-xl font-bold text-red-500">Akses Tidak Dikenali</h2>
          <p className="text-gray-500 mt-2">Role {user.role} tidak memiliki tampilan dashboard khusus.</p>
        </div>
      );
  }
}
