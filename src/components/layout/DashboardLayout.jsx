import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, User, LogOut, Home, History, List, Database, ChevronDown, ChevronUp, Tag, Package, Users, ClipboardList, Moon, Sun, MoreVertical } from 'lucide-react';
import useAuthStore from '../../store/auth';
import useUIStore from '../../store/ui';
import useDataStore from '../../store/dataStore';

export default function DashboardLayout() {
  const { user, token, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode, sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const { fetchData } = useDataStore();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [masterDataOpen, setMasterDataOpen] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    fetchData();
  }, [user, token]);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const roleLabel = {
    pep: 'PEP',
    pptk: 'PPTK',
    ppkom: 'PPKOM',
    pp: 'Pejabat Pengadaan'
  };

  const getPageTitle = () => {
    if (path.includes('master')) return 'Manajemen Master Data';
    if (path.includes('laporan')) return 'Laporan & Statistik';
    return `Portal ${roleLabel[user?.role] || ''}`;
  };

  const NavItem = ({ to, icon: Icon, label, requiresHover = true }) => {
    const isActive = path === to || (to !== '/dashboard' && path.startsWith(to));
    return (
      <NavLink 
        to={to}
        onClick={() => { window.innerWidth < 768 && setSidebarOpen(false); }}
        className={`w-full flex items-center ${sidebarOpen ? 'px-4 justify-start' : 'justify-center'} py-3 rounded-lg font-semibold transition-all ${isActive ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
        title={label}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${sidebarOpen ? 'mr-3' : ''}`} /> 
        {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
      </NavLink>
    );
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#0f172a] text-slate-200' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${isDarkMode ? 'bg-[#111827] border-r border-slate-800' : 'bg-slate-900'} text-white transition-all duration-300 ease-in-out md:relative flex flex-col ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-20 md:translate-x-0'}`}>
        <div className={`flex items-center ${sidebarOpen ? 'px-6' : 'px-0 justify-center'} py-4 border-b ${isDarkMode ? 'border-slate-800 bg-[#1e293b]/30' : 'border-slate-700 bg-slate-950/30'} h-[73px]`}>
          <img src="/logo.png" alt="Logo" className={`h-10 w-auto ${sidebarOpen ? 'mr-3' : 'mr-0'}`} />
          {sidebarOpen && <span className="text-xl font-bold tracking-wider uppercase tracking-tighter">SIUL PBJ</span>}
          {sidebarOpen && <button className="md:hidden ml-auto" onClick={() => setSidebarOpen(false)}>✕</button>}
        </div>
        
        <nav className="p-4 space-y-1 overflow-y-auto overflow-x-hidden flex-1">
          <NavItem to="/dashboard" icon={Home} label="Dashboard" />
          <NavItem to="/dashboard/riwayat_usulan" icon={History} label="Riwayat Usulan" />
          <NavItem to="/dashboard/rincian_belanja" icon={List} label="Rincian Belanja" />

          {user?.role === 'pep' && (
            <div className="pt-2">
              <button 
                onClick={() => { if(!sidebarOpen) setSidebarOpen(true); setMasterDataOpen(!masterDataOpen); }}
                className={`w-full flex items-center ${sidebarOpen ? 'justify-between px-4' : 'justify-center'} py-3 rounded-lg font-semibold transition-all text-slate-400 hover:bg-slate-800/50 hover:text-white ${path.includes('master') ? 'bg-slate-800/40 text-blue-400' : ''}`}
                title="Master Data"
              >
                <div className="flex items-center">
                  <Database className={`w-5 h-5 flex-shrink-0 ${sidebarOpen ? 'mr-3' : ''}`} />
                  {sidebarOpen && <span className="whitespace-nowrap">Master Data</span>}
                </div>
                {sidebarOpen && (masterDataOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />)}
              </button>
              
              <div className={`mt-1 ml-4 pl-4 border-l border-slate-700/50 space-y-1 transition-all duration-300 overflow-hidden ${masterDataOpen && sidebarOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0 hidden'}`}>
                <NavLink to="/dashboard/master/kategori" className={({isActive}) => `w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isActive ? 'bg-slate-800/80 text-blue-400 shadow-sm' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
                  <Tag className="w-4 h-4 mr-3 opacity-80 flex-shrink-0" /> <span className="whitespace-nowrap">Kategori Belanja</span>
                </NavLink>
                <NavLink to="/dashboard/master/barang" className={({isActive}) => `w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isActive ? 'bg-slate-800/80 text-blue-400 shadow-sm' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
                  <Package className="w-4 h-4 mr-3 opacity-80 flex-shrink-0" /> <span className="whitespace-nowrap">Nama Barang</span>
                </NavLink>
                <NavLink to="/dashboard/master/users" className={({isActive}) => `w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isActive ? 'bg-slate-800/80 text-blue-400 shadow-sm' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
                  <Users className="w-4 h-4 mr-3 opacity-80 flex-shrink-0" /> <span className="whitespace-nowrap">Pengguna</span>
                </NavLink>
              </div>
            </div>
          )}

          <div className="pt-2">
            <NavItem to="/dashboard/laporan" icon={ClipboardList} label="Laporan" />
          </div>
        </nav>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main Container */}
      <div className="flex flex-col flex-1 w-full overflow-hidden relative">
        {/* Header */}
        <header className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'bg-[#1e293b] border-slate-800 text-slate-200' : 'bg-white border-gray-200 text-gray-800'}`}>
          <div className="flex items-center">
            <button className={`p-1 rounded-lg transition-colors mr-4 flex-shrink-0 ${isDarkMode ? 'hover:bg-slate-700/50 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'}`} onClick={toggleSidebar}>
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold hidden md:block">
              {getPageTitle()}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode} 
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-yellow-400 hover:bg-slate-700 bg-slate-800' : 'text-slate-500 hover:bg-gray-100 bg-gray-50'}`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="relative z-50">
              <div className={`flex items-center space-x-2 pl-4 border-l ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} cursor-pointer hover:opacity-80`} onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="hidden md:flex flex-col max-w-[150px]">
                  <span className={`font-bold text-sm leading-tight truncate ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{user?.nama || 'Pengguna'}</span>
                  <span className={`text-xs font-semibold uppercase ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{user?.role}</span>
                </div>
                <MoreVertical className={`w-5 h-5 ml-2 transition-transform duration-300 ${isProfileOpen ? 'rotate-90' : ''} ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
              </div>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className={`absolute right-0 mt-4 w-48 rounded-xl shadow-xl border overflow-hidden animate-in fade-in slide-in-from-top-2 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-gray-200'}`}>
                  <button onClick={handleLogout} className={`w-full flex items-center px-4 py-3 font-bold transition-colors ${isDarkMode ? 'text-red-400 hover:bg-slate-800' : 'text-red-600 hover:bg-red-50'}`}>
                    <LogOut className="w-5 h-5 mr-3" /> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main id="main-content" className={`flex-1 overflow-x-hidden overflow-y-auto w-full max-w-[100vw] sm:max-w-none ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50/50'} relative`}>
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
