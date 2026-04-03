import { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, FileText, Eye, ClipboardList } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import useDataStore from '../../store/dataStore';
import useUIStore from '../../store/ui';
import api from '../../api/client';
import useAuthStore from '../../store/auth';
import { useUsulanActions } from '../../hooks/useUsulan';
import { toast } from '../../utils/toast';
import DetailUsulanModal from '../../components/ui/DetailUsulanModal';
import DisposisiModal from '../../components/ui/DisposisiModal';

export default function RiwayatUsulan() {
  const { isDarkMode } = useUIStore();
  const { user } = useAuthStore();
  const { usulanList, pptkUsers, ppkomUsers, ppUsers, loading, fetchData } = useDataStore();
  const { handleDisposisiPEP } = useUsulanActions();
  
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('terbaru');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailUsulan, setDetailUsulan] = useState(null);

  const [showDisposisiModal, setShowDisposisiModal] = useState(false);
  const [disposisiUsulan, setDisposisiUsulan] = useState(null);
  const [targetUserId, setTargetUserId] = useState('');
  const [catatan, setCatatan] = useState('');

  const openDetail = (u) => { setDetailUsulan(u); setShowDetailModal(true); };

  const openDisposisi = (u) => {
    setDisposisiUsulan(u);
    setTargetUserId('');
    let defaultCatatan = '';
    if (user?.role === 'pptk') defaultCatatan = 'ACC PPTK, Lanjut proses lelang.';
    if (user?.role === 'ppkom') defaultCatatan = 'Disetujui PPKOM. Lanjut proses pengadaan.';
    setCatatan(defaultCatatan);
    setShowDisposisiModal(true);
  };

  const getDisposisiConfig = () => {
    if (!user || !disposisiUsulan) return null;
    if (user.role === 'pep' && disposisiUsulan.status_kode === 'MENUNGGU_PEP') {
      return {
        targetLabel: "Pilih Pejabat PPTK Penerima Disposisi",
        users: pptkUsers || [],
        selectedUser: targetUserId,
        setSelectedUser: setTargetUserId,
        onSubmit: async () => {
          if (!targetUserId) { toast.warning("Pilih PPTK terlebih dahulu!"); return; }
          const ok = await handleDisposisiPEP(disposisiUsulan.id, targetUserId, catatan);
          if (ok) {
            setShowDisposisiModal(false);
            fetchData();
          }
        }
      };
    }
    if (user.role === 'pptk' && disposisiUsulan.status_kode === 'DIDISPOSISI_PPTK') {
      return {
        targetLabel: "Pilih Pejabat PPKOM Penerima Disposisi",
        users: ppkomUsers || [],
        selectedUser: targetUserId,
        setSelectedUser: setTargetUserId,
        onSubmit: async () => {
          if (!targetUserId) { toast.warning("Pilih PPKOM terlebih dahulu!"); return; }
          try {
            const res = await api.post(`/pptk/usulan/${disposisiUsulan.id}/disposisi`, { 
              ppkom_user_id: parseInt(targetUserId), 
              catatan: catatan || "ACC PPTK" 
            });
            if (res.data.success) {
              toast.success('Usulan berhasil didisposisikan ke PPKOM!');
              setShowDisposisiModal(false);
              fetchData();
            }
          } catch (err) { toast.error("Gagal proses: " + (err.response?.data?.message || err.message)); }
        }
      };
    }
    if (user.role === 'ppkom' && disposisiUsulan.status_kode === 'DIDISPOSISI_PPKOM') {
      return {
        targetLabel: "Pilih Pejabat Pengadaan (PP) Penerima",
        users: ppUsers || [],
        selectedUser: targetUserId,
        setSelectedUser: setTargetUserId,
        onSubmit: async () => {
          if (!targetUserId) { toast.warning("Pilih PP terlebih dahulu!"); return; }
          try {
            const res = await api.post(`/ppkom/usulan/${disposisiUsulan.id}/setujui`, { 
              pp_user_id: parseInt(targetUserId), 
              catatan: catatan || "Disetujui PPKOM" 
            });
            if (res.data.success) {
              toast.success('Usulan berhasil disetujui dan diteruskan ke PP!');
              setShowDisposisiModal(false);
              fetchData();
            }
          } catch (err) { toast.error("Gagal: " + (err.response?.data?.message || err.message)); }
        }
      };
    }
    return null;
  };

  const currentDisposisiConfig = getDisposisiConfig();

  useEffect(() => {
    fetchData();
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(status);
    }
  }, [searchParams, fetchData]);

  const statusLabel = {
    'MENUNGGU_PEP': 'Menunggu Disposisi',
    'DIDISPOSISI_PPTK': 'Proses PPTK',
    'DIDISPOSISI_PPKOM': 'Proses PPKOM',
    'DIDISPOSISI_PP': 'Proses Pengadaan',
    'REALISASI_SELESAI': 'Selesai Realisasi',
    'DIKEMBALIKAN_KE_PEP': 'Return ke PEP',
    'DIKEMBALIKAN_KE_PPTK': 'Return ke PPTK',
    'ALL': 'Semua Usulan'
  };

  let filteredList = usulanList.filter(u => statusFilter === 'ALL' || u.status_kode === statusFilter);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredList = filteredList.filter(u =>
      (u.nama_usulan || '').toLowerCase().includes(q) ||
      (u.kode_tiket || '').toLowerCase().includes(q)
    );
  }

  filteredList = [...filteredList].sort((a, b) => {
    if (sortOrder === 'az') return (a.nama_usulan || '').localeCompare(b.nama_usulan || '');
    if (sortOrder === 'za') return (b.nama_usulan || '').localeCompare(a.nama_usulan || '');
    if (sortOrder === 'terlama') return (a.id || 0) - (b.id || 0);
    return (b.id || 0) - (a.id || 0);
  });

  const FilterBtn = ({ code, label, colorClass }) => (
    <button 
      onClick={() => setStatusFilter(code)} 
      className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all active:scale-95 border ${statusFilter === code ? `${colorClass} text-white border-transparent shadow-lg` : (isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50')}`}
    >
      {label}
    </button>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}>Riwayat & Arsip Usulan</h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Tampilan seluruh riwayat data usulan — {filteredList.length} data</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <FilterBtn code="ALL" label="Semua" colorClass="bg-slate-600" />
          <FilterBtn code="MENUNGGU_PEP" label="Masuk" colorClass="bg-blue-600" />
          <FilterBtn code="DIDISPOSISI_PPTK" label="PPTK" colorClass="bg-indigo-600" />
          <FilterBtn code="DIDISPOSISI_PPKOM" label="PPKOM" colorClass="bg-purple-600" />
          <FilterBtn code="DIDISPOSISI_PP" label="Lelang" colorClass="bg-orange-600" />
          <FilterBtn code="REALISASI_SELESAI" label="Selesai" colorClass="bg-green-600" />
          <FilterBtn code="DIKEMBALIKAN_KE_PEP" label="Return PEP" colorClass="bg-red-600" />
          <FilterBtn code="DIKEMBALIKAN_KE_PPTK" label="Return PPTK" colorClass="bg-rose-600" />
        </div>
      </div>

      <div className={`flex flex-col sm:flex-row gap-3 mb-6`}>
        <div className="relative flex-1">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Cari nama barang atau kode tiket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold border focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-200 placeholder-slate-500 focus:ring-blue-500/40 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-blue-500/20 focus:border-blue-500'}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className={`w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={`pl-4 pr-9 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:ring-2 transition-all cursor-pointer ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-200 focus:ring-blue-500/40' : 'bg-white border-gray-200 text-gray-700 focus:ring-blue-500/20'}`}
          >
            <option value="terbaru">Terbaru</option>
            <option value="terlama">Terlama</option>
            <option value="az">A - Z</option>
            <option value="za">Z - A</option>
          </select>
          <button onClick={fetchData} className={`p-2.5 rounded-xl border transition-colors ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-white border-gray-200 text-blue-600 hover:bg-gray-50'}`}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700/50 bg-[#0f172a]/30' : 'border-gray-100 bg-gray-50/50'}`}>
          <h3 className={`font-bold text-lg ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>Daftar Usulan — {statusLabel[statusFilter] || 'Semua'}</h3>
          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{filteredList.length} hasil</span>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-xs uppercase tracking-wider whitespace-nowrap ${isDarkMode ? 'bg-[#0f172a]/50 text-slate-400 border-b border-slate-700/50' : 'bg-gray-50/50 text-gray-500'}`}>
                <th className="px-4 py-4 font-bold text-center w-16">NO</th>
                <th className="px-4 py-4 font-bold min-w-[300px]">BARANG / JASA</th>
                <th className="px-4 py-4 font-bold min-w-[180px]">PEMOHON</th>
                <th className="px-4 py-4 font-bold text-center min-w-[180px]">PRIORITAS</th>
                <th className="px-4 py-4 font-bold text-center min-w-[150px]">TANGGAL</th>
                <th className="px-4 py-4 font-bold text-center min-w-[200px]">AKSI</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Memuat data...</span>
                  </div>
                </td></tr>
              ) : filteredList.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <FileText className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-slate-600' : 'text-gray-200'}`} />
                    <span className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{searchQuery ? 'Tidak ditemukan usulan yang cocok' : 'Belum ada usulan untuk filter ini'}</span>
                  </div>
                </td></tr>
              ) : filteredList.map((item, idx) => (
                <tr key={item.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}>
                  <td className={`px-4 py-4 font-black text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{idx + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className={`font-bold text-[13px] ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{item.nama_usulan}</span>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                         <span className={`text-[10px] font-semibold whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Kategori: {item.kategori?.nama_kategori || '-'}</span>
                         {item.kode_tiket && <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border whitespace-nowrap ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>{item.kode_tiket}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`font-bold text-[13px] whitespace-nowrap ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{item.nama_pengusul || '-'}</span>
                      <span className={`text-[10px] opacity-70 mt-0.5 whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{item.unit_ruangan || '-'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight whitespace-nowrap ${item.tingkat_kegentingan === 'Sangat Genting' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>{item.tingkat_kegentingan || 'Genting'}</span>
                  </td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                      <span className={`font-bold text-[11px] ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                         {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric'})}
                      </span>
                  </td>
                   <td className="px-4 py-4">
                     <div className="flex justify-center items-center gap-2 whitespace-nowrap">
                       {/* Tombol Disposisi dinamis berdasarkan role & status */}
                       {user?.role === 'pep' && item.status_kode === 'MENUNGGU_PEP' && (
                          <button onClick={() => openDisposisi(item)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md shadow-blue-500/20 active:scale-95">
                            Disposisi
                          </button>
                       )}
                       {user?.role === 'pptk' && item.status_kode === 'DIDISPOSISI_PPTK' && (
                          <button onClick={() => openDisposisi(item)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md shadow-blue-500/20 active:scale-95">
                            Disposisi
                          </button>
                       )}
                       {user?.role === 'ppkom' && item.status_kode === 'DIDISPOSISI_PPKOM' && (
                          <button onClick={() => openDisposisi(item)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md shadow-blue-500/20 active:scale-95">
                            Disposisi
                          </button>
                       )}

                       <button onClick={() => openDetail(item)} className={`px-4 py-2 rounded-xl border font-bold text-sm tracking-wide transition-all ${isDarkMode ? 'bg-white text-slate-900 border-transparent hover:bg-gray-200' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}>
                         Detail
                       </button>
                     </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <DetailUsulanModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} usulan={detailUsulan} />
      {currentDisposisiConfig && (
        <DisposisiModal
          isOpen={showDisposisiModal}
          onClose={() => setShowDisposisiModal(false)}
          usulan={disposisiUsulan}
          users={currentDisposisiConfig.users}
          targetLabel={currentDisposisiConfig.targetLabel}
          selectedUser={currentDisposisiConfig.selectedUser}
          setSelectedUser={currentDisposisiConfig.setSelectedUser}
          catatan={catatan}
          setCatatan={setCatatan}
          onSubmit={currentDisposisiConfig.onSubmit}
        />
      )}
    </div>
  );
}
