import { useState } from 'react';
import { Search, Filter, RefreshCw, Eye, Ban, Check, ClipboardList } from 'lucide-react';
import useDataStore from '../../store/dataStore';
import useUIStore from '../../store/ui';
import { getStatusBadgeClass, formatStatus } from '../../utils/statusBadge';
import api from '../../api/client';
import DetailUsulanModal from '../../components/ui/DetailUsulanModal';

export default function PPKOMDashboard() {
  const { isDarkMode } = useUIStore();
  const { usulanList, ppUsers, loading, fetchData } = useDataStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('terbaru');
  const [selectedId, setSelectedId] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [targetPPId, setTargetPPId] = useState('');
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailUsulan, setDetailUsulan] = useState(null);

  const openDetail = (u) => { setDetailUsulan(u); setShowDetailModal(true); };

  const handleSetujuiPPKOM = async (id) => {
    if (!targetPPId) { alert("Pilih Pejabat Pengadaan (PP) tujuan!"); return; }
    try {
      const res = await api.post(`/ppkom/usulan/${id}/setujui`, { 
        pp_user_id: parseInt(targetPPId),
        catatan: catatan || "Disetujui PPKOM. Lanjut proses pengadaan." 
      });
      if (res.data.success) { 
        alert("Disetujui! Diteruskan ke Pejabat Pengadaan (PP)."); 
        setSelectedId(null);
        setCatatan('');
        setTargetPPId('');
        fetchData(); 
      }
    } catch (err) { alert("Gagal: " + (err.response?.data?.message || err.message)); }
  };

  const handleTolakPPKOM = async (id) => {
    const alasan = prompt("Masukkan alasan penolakan:");
    if (!alasan) return;
    try {
      const res = await api.post(`/ppkom/usulan/${id}/tolak`, { alasan_tolak: alasan });
      if (res.data.success) { alert("Dikembalikan ke PPTK."); fetchData(); }
    } catch (err) { alert("Gagal: " + (err.response?.data?.message || err.message)); }
  };

  const total = usulanList.length;
  const pendingCount = usulanList.filter(u => u.status_kode === 'DIDISPOSISI_PPKOM').length;
  const approvedCount = usulanList.filter(u => u.status_kode === 'DIDISPOSISI_PP' || u.status_kode === 'REALISASI_SELESAI').length;

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
    return (b.id || 0) - (a.id || 0);
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-sm border flex flex-col hover:shadow-md transition-shadow ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
          <span className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Laporan</span>
          <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{total}</span>
        </div>
        <div className={`p-6 rounded-xl shadow-sm border flex flex-col hover:shadow-md transition-shadow ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
          <span className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Perlu Persetujuan</span>
          <span className={`text-3xl font-bold text-orange-600`}>{pendingCount}</span>
        </div>
        <div className={`p-6 rounded-xl shadow-sm border flex flex-col hover:shadow-md transition-shadow ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
          <span className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Sudah Disetujui</span>
          <span className={`text-3xl font-bold text-green-600`}>{approvedCount}</span>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700/50 bg-[#0f172a]/30' : 'border-gray-100 bg-gray-50/50'}`}>
            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>Verifikasi PPKOM</h3>
            <button onClick={fetchData} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-gray-100 text-gray-700'}`}><RefreshCw className="w-4 h-4" /></button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-xs uppercase tracking-wider ${isDarkMode ? 'bg-[#0f172a]/50 text-slate-400 border-b border-slate-700/50' : 'bg-gray-50/50 text-gray-500'}`}>
              <th className="px-6 py-4 font-bold">Kode Tiket</th>
              <th className="px-6 py-4 font-bold">Nama Barang</th>
              <th className="px-6 py-4 font-bold text-center">Info</th>
              <th className="px-6 py-4 font-bold text-center">Keputusan</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-12">Memuat...</td></tr>
              ) : filteredList.map((item) => (
                <tr key={item.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 font-bold">{item.kode_tiket}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{item.nama_usulan}</span>
                      {item.catatan_pptk && (
                        <div className={`mt-2 p-2 rounded-lg border-l-4 text-[10px] italic flex items-center gap-2 ${isDarkMode ? 'bg-purple-500/10 border-purple-500/50 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
                           <div className="p-1 rounded-sm bg-purple-500/20"><ClipboardList className="w-3 h-3" /></div>
                           <span>Diteruskan oleh PPTK: "{item.catatan_pptk}"</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => openDetail(item)} className={`p-2 rounded-xl transition-all border flex items-center justify-center mx-auto text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-blue-50/50 border-blue-100 text-blue-600 hover:bg-blue-100'}`}><Eye className="w-3.5 h-3.5 mr-1.5"/> Log</button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.status_kode === 'DIDISPOSISI_PPKOM' ? (
                      <div className="flex flex-col items-center space-y-2">
                        {selectedId === item.id ? (
                          <div className={`flex flex-col space-y-2 p-3 rounded-2xl border backdrop-blur-md transition-all animate-in zoom-in-95 duration-200 min-w-[240px] ${isDarkMode ? 'bg-slate-800/80 border-indigo-500/30 shadow-xl' : 'bg-white border-indigo-100 shadow-md'}`}>
                            <select 
                              className={`text-[11px] p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-bold ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-gray-50 border-gray-100 text-gray-700'}`}
                              value={targetPPId}
                              onChange={(e) => setTargetPPId(e.target.value)}
                            >
                              <option value="">-- Pilih Pejabat PP --</option>
                              {ppUsers.map(u => <option key={u.id} value={u.id}>{u.username.toUpperCase()}</option>)}
                            </select>
                            <input 
                              type="text" 
                              placeholder="Catatan..." 
                              className={`text-[11px] p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-slate-200 placeholder-slate-600' : 'bg-gray-50 border-gray-100 text-gray-700'}`}
                              value={catatan}
                              onChange={(e) => setCatatan(e.target.value)}
                            />
                            <div className="flex space-x-2">
                              <button onClick={() => handleSetujuiPPKOM(item.id)} className="flex-1 text-[10px] bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest py-2 px-3 rounded-xl transition-all shadow-lg shadow-green-500/20">Setujui</button>
                              <button onClick={() => { setSelectedId(null); setCatatan(''); }} className={`text-[10px] font-bold py-2 px-3 rounded-xl transition-all ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Batal</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <button onClick={() => { setSelectedId(item.id); setCatatan(''); }} className={`text-[10px] font-black uppercase tracking-widest py-2.5 px-4 rounded-xl transition-all bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20`}>Setujui</button>
                            <button onClick={() => handleTolakPPKOM(item.id)} className={`text-[10px] font-black uppercase tracking-widest py-2.5 px-4 rounded-xl transition-all ${isDarkMode ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'}`}>Tolak</button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${getStatusBadgeClass(item.status_kode)}`}>{formatStatus(item.status_kode)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <DetailUsulanModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} usulan={detailUsulan} />
    </div>
  );
}
