import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, Menu, User, Bell, ChevronRight, Check, X, PackageCheck, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from './store/auth';
import axios from 'axios';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user, token } = useAuthStore();
  const navigate = useNavigate();

  const [usulanList, setUsulanList] = useState([]);
  const [pptkUsers, setPptkUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPptk, setSelectedPptk] = useState('');

  // Modal state for PP Realisasi
  const [showRealisasiModal, setShowRealisasiModal] = useState(false);
  const [realisasiId, setRealisasiId] = useState(null);
  const [realisasiForm, setRealisasiForm] = useState({ nama_vendor: '', nomor_kontrak: '', harga_final: '', catatan: '' });

  const api = () => axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchData = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const ax = api();
      if (user.role === 'pep') {
        const [resU, resP] = await Promise.all([
          ax.get('/pep/usulan'),
          ax.get('/pep/master/users/pptk')
        ]);
        setUsulanList(resU.data.data || []);
        setPptkUsers(resP.data.data || []);
      } else if (user.role === 'pptk') {
        const res = await ax.get('/pptk/usulan');
        setUsulanList(res.data.data || []);
      } else if (user.role === 'ppkom') {
        const res = await ax.get('/ppkom/usulan');
        setUsulanList(res.data.data || []);
      } else if (user.role === 'pp') {
        const res = await ax.get('/pp/usulan');
        setUsulanList(res.data.data || []);
      }
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user, token]);

  const handleLogout = (e) => { e.preventDefault(); logout(); navigate('/login'); };

  // ================== PEP ACTIONS ==================
  const handleDisposisi = async (id) => {
    if (!selectedPptk) { alert("Pilih PPTK terlebih dahulu"); return; }
    try {
      const res = await api().post(`/pep/usulan/${id}/disposisi`, {
        pptk_user_id: parseInt(selectedPptk),
        catatan: "Harap ditindak lanjuti segera."
      });
      if (res.data.success) { alert("Berhasil disposisi ke PPTK!"); setSelectedId(null); fetchData(); }
    } catch (err) { alert("Gagal disposisi: " + (err.response?.data?.message || err.message)); }
  };

  // ================== PPTK ACTIONS ==================
  const handleTeruskanPPKOM = async (id) => {
    try {
      const res = await api().post(`/pptk/usulan/${id}/disposisi`, { catatan: "ACC PPTK, Lanjut proses lelang." });
      if (res.data.success) { alert("Berhasil diteruskan ke PPKOM!"); fetchData(); }
    } catch (err) { alert("Gagal proses: " + (err.response?.data?.message || err.message)); }
  };

  const handleReturnPEP = async (id) => {
    const alasan = prompt("Masukkan alasan return (misal: Anggaran habis):");
    if (!alasan) return;
    try {
      const res = await api().post(`/pptk/usulan/${id}/return`, { alasan_return: alasan });
      if (res.data.success) { alert("Berhasil dikembalikan ke PEP!"); fetchData(); }
    } catch (err) { alert("Gagal return: " + (err.response?.data?.message || err.message)); }
  };

  // ================== PPKOM ACTIONS ==================
  const handleSetujuiPPKOM = async (id) => {
    try {
      const res = await api().post(`/ppkom/usulan/${id}/setujui`, { catatan: "Disetujui PPKOM." });
      if (res.data.success) { alert("Disetujui! Diteruskan ke Pejabat Pengadaan (PP)."); fetchData(); }
    } catch (err) { alert("Gagal: " + (err.response?.data?.message || err.message)); }
  };

  const handleTolakPPKOM = async (id) => {
    const alasan = prompt("Masukkan alasan penolakan:");
    if (!alasan) return;
    try {
      const res = await api().post(`/ppkom/usulan/${id}/tolak`, { alasan_tolak: alasan });
      if (res.data.success) { alert("Dikembalikan ke PPTK."); fetchData(); }
    } catch (err) { alert("Gagal: " + (err.response?.data?.message || err.message)); }
  };

  // ================== PP ACTIONS ==================
  const openRealisasiModal = (id) => {
    setRealisasiId(id);
    setRealisasiForm({ nama_vendor: '', nomor_kontrak: '', harga_final: '', catatan: '' });
    setShowRealisasiModal(true);
  };

  const handleRealisasi = async () => {
    if (!realisasiForm.nama_vendor || !realisasiForm.harga_final) { alert("Nama vendor & harga final wajib diisi"); return; }
    try {
      const res = await api().post(`/pp/usulan/${realisasiId}/realisasi`, {
        ...realisasiForm,
        harga_final: parseFloat(realisasiForm.harga_final)
      });
      if (res.data.success) { alert("Realisasi berhasil dicatat!"); setShowRealisasiModal(false); fetchData(); }
    } catch (err) { alert("Gagal: " + (err.response?.data?.message || err.message)); }
  };

  // ================== HELPER: Role Label ==================
  const roleLabel = {
    pep: 'PEP',
    pptk: 'PPTK',
    ppkom: 'PPKOM',
    pp: 'Pejabat Pengadaan'
  };

  // ================== HELPER: Status Badge ==================
  const statusBadge = (kode) => {
    const map = {
      'MENUNGGU_PEP': 'bg-yellow-100 text-yellow-800',
      'DIDISPOSISI_PPTK': 'bg-blue-100 text-blue-700',
      'DIKEMBALIKAN_KE_PEP': 'bg-red-100 text-red-700',
      'GESER_TAHUN_DEPAN': 'bg-gray-200 text-gray-700',
      'DIDISPOSISI_PPKOM': 'bg-purple-100 text-purple-700',
      'DIDISPOSISI_PP': 'bg-indigo-100 text-indigo-700',
      'REALISASI_SELESAI': 'bg-green-100 text-green-700',
    };
    return map[kode] || 'bg-gray-100 text-gray-600';
  };

  // ================== SUMMARY CARDS per role ==================
  const renderSummaryCards = () => {
    const total = usulanList.length;
    const cards = [
      { label: 'Total Daftar Usulan', value: total, color: 'text-gray-900', sub: 'Usulan terpantau', subColor: 'text-green-500' },
    ];

    if (user?.role === 'pep') {
      cards.push({ label: 'Menunggu Proses (PEP)', value: usulanList.filter(u => u.status_kode === 'MENUNGGU_PEP').length, color: 'text-orange-600', sub: 'Harus didisposisi', subColor: 'text-slate-500' });
      cards.push({ label: 'Diproses PPTK', value: usulanList.filter(u => u.status_kode === 'DIDISPOSISI_PPTK').length, color: 'text-blue-600', sub: 'Sedang Cek Anggaran', subColor: 'text-slate-500' });
    } else if (user?.role === 'pptk') {
      cards.push({ label: 'Menunggu Proses Anda', value: usulanList.filter(u => u.status_kode === 'DIDISPOSISI_PPTK').length, color: 'text-orange-600', sub: 'Perlu Verifikasi Anggaran', subColor: 'text-slate-500' });
      cards.push({ label: 'Sudah Diteruskan', value: usulanList.filter(u => u.status_kode === 'DIDISPOSISI_PPKOM').length, color: 'text-green-600', sub: 'Diteruskan ke PPKOM', subColor: 'text-slate-500' });
    } else if (user?.role === 'ppkom') {
      cards.push({ label: 'Perlu Persetujuan', value: usulanList.filter(u => u.status_kode === 'DIDISPOSISI_PPKOM').length, color: 'text-orange-600', sub: 'Menunggu keputusan Anda', subColor: 'text-slate-500' });
      cards.push({ label: 'Sudah Disetujui', value: usulanList.filter(u => u.status_kode === 'DIDISPOSISI_PP' || u.status_kode === 'REALISASI_SELESAI').length, color: 'text-green-600', sub: 'Diteruskan ke PP', subColor: 'text-slate-500' });
    } else if (user?.role === 'pp') {
      cards.push({ label: 'Proses Pengadaan', value: usulanList.filter(u => u.status_kode === 'DIDISPOSISI_PP').length, color: 'text-orange-600', sub: 'Perlu realisasi', subColor: 'text-slate-500' });
      cards.push({ label: 'Realisasi Selesai', value: usulanList.filter(u => u.status_kode === 'REALISASI_SELESAI').length, color: 'text-green-600', sub: 'Pengadaan tuntas', subColor: 'text-slate-500' });
    }

    return cards.map((card, i) => (
      <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
        <span className="text-gray-500 text-sm font-semibold mb-2">{card.label}</span>
        <span className={`text-3xl font-bold ${card.color}`}>{card.value}</span>
        <span className={`text-sm font-semibold ${card.subColor} mt-2`}>{card.sub}</span>
      </div>
    ));
  };

  // ================== RENDER ACTION COLUMN ==================
  const renderActionColumn = (item) => {
    const role = user?.role;
    const status = item.status_kode;

    // PEP: Disposisi ke PPTK
    if (role === 'pep' && status === 'MENUNGGU_PEP') {
      return (
        <div className="flex items-center space-x-2">
          {selectedId === item.id ? (
            <>
              <select className="border rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" value={selectedPptk} onChange={(e) => setSelectedPptk(e.target.value)}>
                <option value="">-- Pilih PPTK --</option>
                {(pptkUsers || []).map(p => (<option key={p.id} value={p.id}>{p.nama}</option>))}
              </select>
              <button onClick={() => handleDisposisi(item.id)} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-all active:scale-95 shadow-sm"><Check className="w-4 h-4" /></button>
            </>
          ) : (
            <button onClick={() => setSelectedId(item.id)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all active:scale-95 shadow-sm">
              Disposisi <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      );
    }

    // PPTK: Teruskan / Return
    if (role === 'pptk' && status === 'DIDISPOSISI_PPTK') {
      return (
        <div className="flex items-center space-x-2">
          <button onClick={() => handleTeruskanPPKOM(item.id)} className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all active:scale-95 shadow-sm">
            Teruskan ke PPKOM
          </button>
          <button onClick={() => handleReturnPEP(item.id)} className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all active:scale-95 shadow-sm">
            Return
          </button>
        </div>
      );
    }

    // PPKOM: Setujui / Tolak
    if (role === 'ppkom' && status === 'DIDISPOSISI_PPKOM') {
      return (
        <div className="flex items-center space-x-2">
          <button onClick={() => handleSetujuiPPKOM(item.id)} className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all active:scale-95 shadow-sm">
            Setujui ✓
          </button>
          <button onClick={() => handleTolakPPKOM(item.id)} className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all active:scale-95 shadow-sm">
            Tolak ✕
          </button>
        </div>
      );
    }

    // PP: Input Realisasi
    if (role === 'pp' && status === 'DIDISPOSISI_PP') {
      return (
        <button onClick={() => openRealisasiModal(item.id)} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all active:scale-95 shadow-sm">
          <PackageCheck className="w-4 h-4 mr-1" /> Input Realisasi
        </button>
      );
    }

    // Default: Status badge (read-only)
    return (
      <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${statusBadge(status)}`}>
        {(status || 'N/A').replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900 font-sans">

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center p-6 border-b border-slate-700">
          <span className="text-xl font-bold tracking-wider">SIUL PBJ</span>
          <button className="md:hidden ml-auto" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className="p-4 space-y-2">
          <a href="#" className="flex items-center px-4 py-3 bg-blue-600 rounded-lg text-white font-semibold shadow-md">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </a>
          <a href="#" className="flex items-center px-4 py-3 hover:bg-slate-800 rounded-lg text-slate-300 font-semibold transition-colors">
            <FileText className="w-5 h-5 mr-3" /> Rekap Usulan
          </a>
          <a href="#" className="flex items-center px-4 py-3 hover:bg-slate-800 rounded-lg text-slate-300 font-semibold transition-colors">
            <Settings className="w-5 h-5 mr-3" /> Master Data
          </a>
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
          <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 hover:bg-slate-800 rounded-lg text-slate-300 font-semibold transition-colors">
            <LogOut className="w-5 h-5 mr-3 text-red-400" /> Logout
          </button>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <button className="md:hidden text-slate-500 hover:text-slate-800" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="ml-4 md:ml-0 text-2xl font-bold text-gray-800">
              Dashboard {roleLabel[user?.role] || 'User'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <User className="w-6 h-6" />
              </div>
              <span className="hidden md:block font-semibold text-gray-700">{user?.nama || 'Memuat...'}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {renderSummaryCards()}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-800">Daftar Usulan</h3>
              <button onClick={fetchData} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center">
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Kode Tiket</th>
                    <th className="px-6 py-4 font-bold">Nama Barang/Jasa</th>
                    <th className="px-6 py-4 font-bold">Tingkat Kepentingan</th>
                    <th className="px-6 py-4 font-bold text-center">Aksi & Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="4" className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <span className="font-bold text-slate-400">Memuat data usulan...</span>
                      </div>
                    </td></tr>
                  ) : usulanList.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-gray-200 mb-4" />
                        <span className="font-bold text-slate-400">Belum ada usulan masuk untuk Anda</span>
                      </div>
                    </td></tr>
                  ) : usulanList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-sm">{item.kode_tiket}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{item.nama_usulan}</span>
                          <span className="text-xs text-gray-400 mt-1">Kategori: {item.kategori?.nama_kategori || `ID ${item.kategori_belanja_id}`}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          item.tingkat_kepentingan === 'Sangat Penting' ? 'bg-red-100 text-red-700' :
                          item.tingkat_kepentingan === 'Penting' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.tingkat_kepentingan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {renderActionColumn(item)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ================== REALISASI MODAL (PP) ================== */}
      {showRealisasiModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in">
            <button onClick={() => setShowRealisasiModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Input Realisasi Pengadaan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Vendor *</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="PT. Contoh Vendor" value={realisasiForm.nama_vendor} onChange={(e) => setRealisasiForm({...realisasiForm, nama_vendor: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nomor Kontrak</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="SPK-2026-001" value={realisasiForm.nomor_kontrak} onChange={(e) => setRealisasiForm({...realisasiForm, nomor_kontrak: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Harga Final (Rp) *</label>
                <input type="number" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="50000000" value={realisasiForm.harga_final} onChange={(e) => setRealisasiForm({...realisasiForm, harga_final: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Catatan</label>
                <textarea className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none" rows="2" placeholder="Catatan tambahan..." value={realisasiForm.catatan} onChange={(e) => setRealisasiForm({...realisasiForm, catatan: e.target.value})}></textarea>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setShowRealisasiModal(false)} className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={handleRealisasi} className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]">Simpan Realisasi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
