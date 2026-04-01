import { useState } from 'react';
import { Search, Filter, RefreshCw, RefreshCcw, Check, ArrowUpRight, ClipboardList, Eye, Clock, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDataStore from '../../store/dataStore';
import useUIStore from '../../store/ui';
import { getStatusBadgeClass, formatStatus } from '../../utils/statusBadge';
import api from '../../api/client';
import DetailUsulanModal from '../../components/ui/DetailUsulanModal';

export default function PPTKDashboard() {
  const { isDarkMode } = useUIStore();
  const { usulanList, ppkomUsers, loading, fetchData } = useDataStore();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('terbaru');
  const [selectedId, setSelectedId] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailUsulan, setDetailUsulan] = useState(null);

  const openDetail = (u) => { setDetailUsulan(u); setShowDetailModal(true); };

  const handleTeruskanPPKOM = async (id) => {
    if (!targetUserId) { alert("Pilih Pejabat PPKOM tujuan!"); return; }
    try {
      const res = await api.post(`/pptk/usulan/${id}/disposisi`, { 
        ppkom_user_id: parseInt(targetUserId),
        catatan: catatan || "ACC PPTK, Lanjut proses lelang." 
      });
      if (res.data.success) { 
        alert("Berhasil diteruskan ke PPKOM!"); 
        setSelectedId(null);
        setCatatan('');
        setTargetUserId('');
        fetchData(); 
      }
    } catch (err) { alert("Gagal proses: " + (err.response?.data?.message || err.message)); }
  };

  const handleReturnPEP = async (id) => {
    const alasan = prompt("Masukkan alasan return (misal: Anggaran habis):");
    if (!alasan) return;
    try {
      const res = await api.post(`/pptk/usulan/${id}/return`, { alasan_return: alasan });
      if (res.data.success) { alert("Berhasil dikembalikan ke PEP!"); fetchData(); }
    } catch (err) { alert("Gagal return: " + (err.response?.data?.message || err.message)); }
  };

  const waitCount = usulanList.filter(u => u.status_kode === 'DIDISPOSISI_PPTK').length;
  const processCount = usulanList.filter(u => u.status_kode === 'DIDISPOSISI_PPKOM').length;
  const returnCount = usulanList.filter(u => u.status_kode === 'DIKEMBALIKAN_KE_PPTK').length;

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
      <div className="flex gap-4 mb-6 flex-col md:flex-row w-full">
          <div onClick={() => navigate('/dashboard/riwayat_usulan?status=DIDISPOSISI_PPTK')} className={`cursor-pointer rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-1 border md:min-w-[240px] flex-1 ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>MENUNGGU DISPOSISI PPKOM</p>
                <h3 className="text-4xl font-bold text-blue-500">{waitCount}</h3>
              </div>
              <div className={`p-3 rounded-xl shadow-inner ${isDarkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600'}`}><ClipboardList className="w-7 h-7" /></div>
            </div>
          </div>
          <div onClick={() => navigate('/dashboard/riwayat_usulan?status=DIDISPOSISI_PPKOM')} className={`cursor-pointer rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-1 border md:min-w-[240px] flex-1 ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>SEDANG DIPROSES PPKOM</p>
                <h3 className="text-4xl font-bold text-yellow-500">{processCount}</h3>
              </div>
              <div className={`p-3 rounded-xl shadow-inner ${isDarkMode ? 'bg-yellow-900/40 text-yellow-400' : 'bg-yellow-100 text-yellow-600'}`}><Clock className="w-7 h-7" /></div>
            </div>
          </div>
          <div onClick={() => navigate('/dashboard/riwayat_usulan?status=DIKEMBALIKAN_KE_PPTK')} className={`cursor-pointer rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-1 border md:min-w-[240px] flex-1 ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>DIKEMBALIKAN KE PPTK</p>
                <h3 className="text-4xl font-bold text-red-500">{returnCount}</h3>
              </div>
              <div className={`p-3 rounded-xl shadow-inner ${isDarkMode ? 'bg-red-900/40 text-red-500' : 'bg-red-100 text-red-600'}`}><Ban className="w-7 h-7" /></div>
            </div>
          </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700/50 bg-[#0f172a]/30' : 'border-gray-100 bg-gray-50/50'}`}>
            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>Daftar Usulan (PPTK)</h3>
            <button onClick={fetchData} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-gray-100 text-gray-700'}`}><RefreshCw className="w-4 h-4" /></button>
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
                <tr><td colSpan="4" className="text-center py-12">Memuat...</td></tr>
              ) : filteredList.map((item) => (
                <tr key={item.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 font-bold">{item.kode_tiket}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{item.nama_usulan}</span>
                      {item.catatan_pep && (
                        <div className={`mt-2 p-2 rounded-lg border-l-4 text-[10px] italic flex items-center gap-2 ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
                           <ClipboardList className="w-3 h-3" />
                           <span>PEP: "{item.catatan_pep}"</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => openDetail(item)} className={`p-2 rounded-xl border flex items-center justify-center mx-auto text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-blue-50/50 border-blue-100 text-blue-600 hover:bg-blue-100'}`}><Eye className="w-3.5 h-3.5 mr-1.5"/> Log</button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.status_kode === 'DIDISPOSISI_PPTK' ? (
                      <div className="flex flex-col items-center space-y-2">
                        {selectedId === item.id ? (
                          <div className={`flex flex-col space-y-2 p-3 rounded-2xl border backdrop-blur-md transition-all animate-in zoom-in-95 duration-200 min-w-[240px] ${isDarkMode ? 'bg-slate-800/80 border-green-500/30 shadow-xl' : 'bg-white border-green-100 shadow-md'}`}>
                            <select 
                              className={`text-[11px] p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-green-500/40 transition-all font-bold ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-gray-50 border-gray-100 text-gray-700'}`}
                              value={targetUserId}
                              onChange={(e) => setTargetUserId(e.target.value)}
                            >
                              <option value="">-- Pilih PPKOM --</option>
                              {ppkomUsers.map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
                            </select>
                            <input 
                              type="text" 
                              placeholder="Catatan..." 
                              className={`text-[11px] p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-slate-200 placeholder-slate-600' : 'bg-gray-50 border-gray-100 text-gray-700'}`}
                              value={catatan}
                              onChange={(e) => setCatatan(e.target.value)}
                            />
                            <div className="flex space-x-2">
                              <button onClick={() => handleTeruskanPPKOM(item.id)} className="flex-1 text-[10px] bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest py-2 px-3 rounded-xl transition-all shadow-lg shadow-green-500/20">Kirim</button>
                              <button onClick={() => { setSelectedId(null); setCatatan(''); }} className={`text-[10px] font-bold py-2 px-3 rounded-xl transition-all ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Batal</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button onClick={() => { setSelectedId(item.id); setCatatan(''); }} className={`text-[10px] font-black uppercase tracking-widest py-2.5 px-4 rounded-xl transition-all bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 flex items-center`}>Teruskan <ArrowUpRight className="w-3.5 h-3.5 ml-1.5 opacity-60" /></button>
                            <button onClick={() => handleReturnPEP(item.id)} className={`text-[10px] font-black uppercase tracking-widest py-2.5 px-4 rounded-xl transition-all ${isDarkMode ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'}`}>Return</button>
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
