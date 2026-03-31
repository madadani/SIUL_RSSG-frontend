import { useState } from 'react';
import { Search, Filter, RefreshCw, Check, ChevronRight, ClipboardList, Clock, Ban, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDataStore from '../../store/dataStore';
import useUIStore from '../../store/ui';
import { getStatusBadgeClass, formatStatus } from '../../utils/statusBadge';
import DetailUsulanModal from '../../components/ui/DetailUsulanModal';
import { useUsulanActions } from '../../hooks/useUsulan';

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

  const openDetail = (u) => { setDetailUsulan(u); setShowDetailModal(true); };

  const { handleDisposisiPEP } = useUsulanActions();

  const handleDisposisi = async (id) => {
    if (!selectedPptk) { alert("Pilih PPTK terlebih dahulu"); return; }
    const ok = await handleDisposisiPEP(id, selectedPptk, catatan);
    if (ok) {
        setSelectedId(null);
        setCatatan('');
    }
  };

  const waitCount = usulanList.filter(u => u.status_kode === 'MENUNGGU_PEP').length;
  const processCount = usulanList.filter(u => ['DIDISPOSISI_PPTK'].includes(u.status_kode)).length;
  const returnCount = usulanList.filter(u => u.status_kode === 'DIKEMBALIKAN_KE_PEP').length;

  let filteredList = usulanList;
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
          <div onClick={() => navigate('/dashboard/riwayat_usulan?status=MENUNGGU_PEP')} className={`cursor-pointer rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-1 border md:min-w-[240px] flex-1 ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>MENUNGGU DISPOSISI PPTK</p>
                <h3 className="text-4xl font-bold text-blue-500">{waitCount}</h3>
              </div>
              <div className={`p-3 rounded-xl shadow-inner ${isDarkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600'}`}><ClipboardList className="w-7 h-7" /></div>
            </div>
          </div>
          <div onClick={() => navigate('/dashboard/riwayat_usulan?status=DIDISPOSISI_PPTK')} className={`cursor-pointer rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-1 border md:min-w-[240px] flex-1 ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>SEDANG DIPROSES PPTK</p>
                <h3 className="text-4xl font-bold text-yellow-500">{processCount}</h3>
              </div>
              <div className={`p-3 rounded-xl shadow-inner ${isDarkMode ? 'bg-yellow-900/40 text-yellow-400' : 'bg-yellow-100 text-yellow-600'}`}><Clock className="w-7 h-7" /></div>
            </div>
          </div>
          <div onClick={() => navigate('/dashboard/riwayat_usulan?status=DIKEMBALIKAN_KE_PEP')} className={`cursor-pointer rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-1 border md:min-w-[240px] flex-1 ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>DIKEMBALIKAN KE PEP</p>
                <h3 className="text-4xl font-bold text-red-500">{returnCount}</h3>
              </div>
              <div className={`p-3 rounded-xl shadow-inner ${isDarkMode ? 'bg-red-900/40 text-red-500' : 'bg-red-100 text-red-600'}`}><Ban className="w-7 h-7" /></div>
            </div>
          </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
            <input type="text" placeholder="Cari nomor tiket atau nama usulan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold border focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-200 placeholder-slate-500 focus:ring-blue-500/40 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-blue-500/20 focus:border-blue-500'}`} />
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
              <h3 className={`font-bold text-lg ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>Daftar Usulan Masuk</h3>
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{filteredList.length} data total</span>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-xs uppercase tracking-wider ${isDarkMode ? 'bg-[#0f172a]/50 text-slate-400 border-b border-slate-700/50' : 'bg-gray-50/50 text-gray-500'}`}>
                <th className="px-6 py-4 font-bold">Kode Tiket</th>
                <th className="px-6 py-4 font-bold">Nama Barang/Jasa</th>
                <th className="px-6 py-4 font-bold text-center">Info</th>
                <th className="px-6 py-4 font-bold text-center">Aksi & Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-12">Memuat data...</td></tr>
                ) : filteredList.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-12">Tidak ada usulan</td></tr>
                ) : filteredList.map((item) => (
                  <tr key={item.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4"><span className={`font-bold px-2 py-1 rounded text-sm ${isDarkMode ? 'text-slate-200 bg-slate-700' : 'text-gray-900 bg-gray-100'}`}>{item.kode_tiket}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{item.nama_usulan}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-400'}`}>Kategori: {item.kategori?.nama_kategori || `ID ${item.kategori_belanja_id}`}</span>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight ${item.tingkat_kepentingan === 'Sangat Penting' ? 'bg-red-500/10 text-red-500' : item.tingkat_kepentingan === 'Penting' ? 'bg-orange-500/10 text-orange-500' : (isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700')}`}>{item.tingkat_kepentingan}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => openDetail(item)} className={`p-2 rounded-xl transition-all border flex items-center justify-center mx-auto text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-blue-50/50 border-blue-100 text-blue-600 hover:bg-blue-100'}`}><Eye className="w-3.5 h-3.5 mr-1.5"/> Log</button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {item.status_kode === 'MENUNGGU_PEP' ? (
                          <div className="flex items-center space-x-2">
                             {selectedId === item.id ? (
                              <div className={`flex flex-col space-y-2 p-3 rounded-2xl border backdrop-blur-md transition-all animate-in zoom-in-95 duration-200 min-w-[220px] ${isDarkMode ? 'bg-slate-800/80 border-blue-500/30 shadow-xl' : 'bg-white border-blue-100 shadow-md'}`}>
                                <div className="flex items-center justify-between gap-2">
                                  <select 
                                    className={`flex-1 border rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200 cursor-pointer' : 'bg-gray-50 border-gray-100 text-gray-700'}`} 
                                    value={selectedPptk} 
                                    onChange={(e) => setSelectedPptk(e.target.value)}
                                  >
                                    <option value="">-- Pilih PPTK --</option>
                                    {(pptkUsers || []).map(p => (<option key={p.id} value={p.id}>{p.nama}</option>))}
                                  </select>
                                  <button onClick={() => { setSelectedId(null); setCatatan(''); }} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-500 hover:bg-red-500/20 hover:text-red-400' : 'text-gray-400 hover:bg-red-50 hover:text-red-500'}`}><Ban className="w-4 h-4" /></button>
                                </div>
                                <input 
                                  type="text" 
                                  placeholder="Catatan..." 
                                  className={`text-[11px] p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-slate-200 placeholder-slate-600' : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400'}`}
                                  value={catatan}
                                  onChange={(e) => setCatatan(e.target.value)}
                                />
                                <button onClick={() => handleDisposisi(item.id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 text-[10px] font-black uppercase tracking-widest flex items-center justify-center">
                                  Kirim Disposisi <Check className="w-3.5 h-3.5 ml-2" />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => { setSelectedId(item.id); setCatatan(''); }} className={`text-[10px] font-black uppercase tracking-widest py-2.5 px-5 rounded-xl transition-all active:scale-95 shadow-lg flex items-center ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'}`}>Disposisi <ChevronRight className="w-4 h-4 ml-1.5 opacity-50" /></button>
                            )}
                          </div>
                        ) : (
                          <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${getStatusBadgeClass(item.status_kode)}`}>{formatStatus(item.status_kode)}</span>
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
    </div>
  );
}
