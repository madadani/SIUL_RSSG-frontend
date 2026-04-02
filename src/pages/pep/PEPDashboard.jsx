import { useState } from 'react';
import { Search, Filter, RefreshCw, Check, Send, ClipboardList, Clock, Ban, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import useDataStore from '../../store/dataStore';
import useUIStore from '../../store/ui';
import DetailUsulanModal from '../../components/ui/DetailUsulanModal';
import DisposisiModal from '../../components/ui/DisposisiModal';
import { useUsulanActions } from '../../hooks/useUsulan';
import { toast } from '../../components/ui/Toast';

export default function PEPDashboard() {
  const { isDarkMode } = useUIStore();
  const { usulanList, pptkUsers, loading, fetchData } = useDataStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('terbaru');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPptk, setSelectedPptk] = useState('');
  const [catatan, setCatatan] = useState('');
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailUsulan, setDetailUsulan] = useState(null);

  const [showDisposisiModal, setShowDisposisiModal] = useState(false);
  const [disposisiUsulan, setDisposisiUsulan] = useState(null);

  const openDetail = (u) => { setDetailUsulan(u); setShowDetailModal(true); };
  
  const openDisposisi = (u) => { 
    setDisposisiUsulan(u); 
    setSelectedPptk(''); 
    setCatatan(''); 
    setShowDisposisiModal(true); 
  };

  const { handleDisposisiPEP } = useUsulanActions();

  const handleDisposisi = async () => {
    if (!selectedPptk) { toast.warning("Pilih PPTK terlebih dahulu!"); return; }
    const ok = await handleDisposisiPEP(disposisiUsulan.id, selectedPptk, catatan);
    if (ok) {
        toast.success('Usulan berhasil didisposisikan ke PPTK!');
        setShowDisposisiModal(false);
        setDisposisiUsulan(null);
        setSelectedPptk('');
        setCatatan('');
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await api.post(`/pep/usulan/${id}/diketahui`);
      toast.success('Notifikasi return telah diketahui.');
      fetchData();
    } catch (err) {
      toast.error("Gagal memproses: " + (err.response?.data?.message || err.message));
    }
  };

  const waitCount = usulanList.filter(u => u.status_kode === 'MENUNGGU_PEP').length;
  const processCount = usulanList.filter(u => ['DIDISPOSISI_PPTK', 'DIKEMBALIKAN_KE_PPTK', 'DIDISPOSISI_PPKOM', 'DISETUJUI_PPKOM'].includes(u.status_kode)).length;
  const returnCount = usulanList.filter(u => u.status_kode === 'DIKEMBALIKAN_KE_PEP').length;

  // dashboard actionable: items that need attention from PEP
  let filteredList = usulanList.filter(u => 
    u.status_kode === 'MENUNGGU_PEP' || 
    (u.status_kode === 'DIKEMBALIKAN_KE_PEP' && !u.is_return_diketahui)
  );
  
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

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex gap-4 mb-6 flex-col md:flex-row w-full">
          <div onClick={() => navigate('/dashboard/riwayat_usulan?status=MENUNGGU_PEP')} className={`cursor-pointer rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-1 border md:min-w-[240px] flex-1 group ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>MENUNGGU DISPOSISI</p>
                <h3 className="text-4xl font-bold text-blue-500">{waitCount}</h3>
              </div>
              <div className={`p-3 rounded-xl shadow-inner ${isDarkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600'}`}><ClipboardList className="w-7 h-7" /></div>
            </div>
            <div className={`mt-4 pt-3 border-t flex justify-end font-bold text-[10px] uppercase tracking-wider transition-colors ${isDarkMode ? 'border-slate-700/50 text-slate-500 group-hover:text-blue-400' : 'border-gray-100 text-gray-400 group-hover:text-blue-600'}`}>
              Lihat Semua &rarr;
            </div>
          </div>
          <div onClick={() => navigate('/dashboard/riwayat_usulan?status=DIDISPOSISI_PPTK')} className={`cursor-pointer rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-1 border md:min-w-[240px] flex-1 group ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>SEDANG DIPROSES</p>
                <h3 className="text-4xl font-bold text-yellow-500">{processCount}</h3>
              </div>
              <div className={`p-3 rounded-xl shadow-inner ${isDarkMode ? 'bg-yellow-900/40 text-yellow-400' : 'bg-yellow-100 text-yellow-600'}`}><Clock className="w-7 h-7" /></div>
            </div>
            <div className={`mt-4 pt-3 border-t flex justify-end font-bold text-[10px] uppercase tracking-wider transition-colors ${isDarkMode ? 'border-slate-700/50 text-slate-500 group-hover:text-yellow-400' : 'border-gray-100 text-gray-400 group-hover:text-yellow-600'}`}>
              Lihat Semua &rarr;
            </div>
          </div>
          <div onClick={() => navigate('/dashboard/riwayat_usulan?status=DIKEMBALIKAN_KE_PEP')} className={`cursor-pointer rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-1 border md:min-w-[240px] flex-1 group ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>DIKEMBALIKAN (RETURN)</p>
                <h3 className="text-4xl font-bold text-red-500">{returnCount}</h3>
              </div>
              <div className={`p-3 rounded-xl shadow-inner ${isDarkMode ? 'bg-red-900/40 text-red-500' : 'bg-red-100 text-red-600'}`}><Ban className="w-7 h-7" /></div>
            </div>
            <div className={`mt-4 pt-3 border-t flex justify-end font-bold text-[10px] uppercase tracking-wider transition-colors ${isDarkMode ? 'border-slate-700/50 text-slate-500 group-hover:text-red-400' : 'border-gray-100 text-gray-400 group-hover:text-red-600'}`}>
              Lihat Semua &rarr;
            </div>
          </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
            <input type="text" placeholder="Cari nama barang atau unit..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold border focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-200 placeholder-slate-500 focus:ring-blue-500/40 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-blue-500/20 focus:border-blue-500'}`} />
          </div>
          <div className="flex items-center gap-2">
            <Filter className={`w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={`pl-4 pr-9 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:ring-2 transition-all cursor-pointer ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-200 focus:ring-blue-500/40' : 'bg-white border-gray-200 text-gray-700 focus:ring-blue-500/20'}`} >
              <option value="terbaru">Terbaru</option>
              <option value="terlama">Terlama</option>
              <option value="az">A - Z</option>
              <option value="za">Z - A</option>
            </select>
            <button onClick={fetchData} className={`p-2.5 rounded-xl border transition-colors ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-white border-gray-200 text-blue-600 hover:bg-gray-50'}`}><RefreshCw className="w-4 h-4" /></button>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
          <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700/50 bg-[#0f172a]/30' : 'border-gray-100 bg-gray-50/50'}`}>
              <h3 className={`font-bold text-lg ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>Perlu Disposisi Segera</h3>
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{filteredList.length} data perlu aksi</span>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-xs uppercase tracking-wider whitespace-nowrap ${isDarkMode ? 'bg-[#0f172a]/50 text-slate-400 border-b border-slate-700/50' : 'bg-gray-50/50 text-gray-500'}`}>
                <th className="px-4 py-4 font-bold text-center w-16">NO</th>
                <th className="px-4 py-4 font-bold min-w-[300px]">BARANG / JASA</th>
                <th className="px-4 py-4 font-bold min-w-[180px]">PEMOHON</th>
                <th className="px-4 py-4 font-bold text-center min-w-[150px]">KEGENTINGAN</th>
                <th className="px-4 py-4 font-bold text-center min-w-[150px]">KEPENTINGAN</th>
                <th className="px-4 py-4 font-bold text-center min-w-[150px]">TANGGAL DIUSULKAN</th>
                <th className="px-4 py-4 font-bold text-center min-w-[280px]">AKSI</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-12">Memuat data...</td></tr>
                ) : filteredList.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-12">Tidak ada usulan</td></tr>
                ) : filteredList.map((item, idx) => (
                  <tr key={item.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}>
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
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className={`font-bold text-[13px] whitespace-nowrap ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{item.nama_pengusul || '-'}</span>
                        <span className={`text-[10px] opacity-70 mt-0.5 whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{item.unit_ruangan || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight whitespace-nowrap ${item.tingkat_kegentingan === 'Sangat Genting' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>{item.tingkat_kegentingan || 'Genting'}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight whitespace-nowrap ${item.tingkat_kepentingan === 'Sangat Penting' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>{item.tingkat_kepentingan || 'Penting'}</span>
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span className={`font-bold text-[11px] ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                           {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric'})}
                        </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center items-center gap-2 whitespace-nowrap">
                        {item.status_kode === 'MENUNGGU_PEP' && (
                          <button onClick={() => openDisposisi(item)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md shadow-blue-500/20 font-bold text-[12px] tracking-wide flex items-center transition-all active:scale-[0.98]">
                            Disposisi
                          </button>
                        )}
                        
                        {item.status_kode === 'DIKEMBALIKAN_KE_PEP' && !item.is_return_diketahui && (
                          <button onClick={() => handleAcknowledge(item.id)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md shadow-green-500/20 font-bold text-[12px] tracking-wide flex items-center transition-all active:scale-[0.98]">
                            Diketahui <Check className="w-4 h-4 ml-1" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <DetailUsulanModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} usulan={detailUsulan} />
      <DisposisiModal
        isOpen={showDisposisiModal}
        onClose={() => setShowDisposisiModal(false)}
        usulan={disposisiUsulan}
        users={pptkUsers || []}
        targetLabel="Pilih Pejabat PPTK Penerima Disposisi"
        selectedUser={selectedPptk}
        setSelectedUser={setSelectedPptk}
        catatan={catatan}
        setCatatan={setCatatan}
        onSubmit={handleDisposisi}
      />
    </div>
  );
}
