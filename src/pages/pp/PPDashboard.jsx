import { useState } from 'react';
import { RefreshCw, PackageCheck, X, ClipboardList, Eye, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDataStore from '../../store/dataStore';
import useUIStore from '../../store/ui';
import { getStatusBadgeClass, formatStatus } from '../../utils/statusBadge';
import api from '../../api/client';
import DetailUsulanModal from '../../components/ui/DetailUsulanModal';

export default function PPDashboard() {
  const { isDarkMode } = useUIStore();
  const { usulanList, loading, fetchData } = useDataStore();
  const navigate = useNavigate();
  
  const [showRealisasiModal, setShowRealisasiModal] = useState(false);
  const [realisasiId, setRealisasiId] = useState(null);
  const [realisasiForm, setRealisasiForm] = useState({ nama_vendor: '', nomor_kontrak: '', harga_final: '', catatan: '' });

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailUsulan, setDetailUsulan] = useState(null);

  const openDetail = (u) => { setDetailUsulan(u); setShowDetailModal(true); };

  const openRealisasiModal = (id) => {
    setRealisasiId(id);
    setRealisasiForm({ nama_vendor: '', nomor_kontrak: '', harga_final: '', catatan: '' });
    setShowRealisasiModal(true);
  };

  const formatThousand = (val) => {
    if (!val) return '';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePriceChange = (e) => {
    const rawVal = e.target.value.replace(/\./g, '');
    if (!isNaN(rawVal)) {
      setRealisasiForm({...realisasiForm, harga_final: rawVal});
    }
  };

  const handleRealisasi = async () => {
    if (!realisasiForm.nama_vendor || !realisasiForm.harga_final) { alert("Nama vendor & harga final wajib diisi"); return; }
    try {
      const res = await api.post(`/pp/usulan/${realisasiId}/realisasi`, {
        ...realisasiForm,
        harga_final: parseFloat(realisasiForm.harga_final)
      });
      if (res.data.success) { 
        alert("Realisasi berhasil dicatat!"); 
        setShowRealisasiModal(false); 
        fetchData(); 
      }
    } catch (err) { alert("Gagal: " + (err.response?.data?.message || err.message)); }
  };

  const total = usulanList.length;
  const inProcessCount = usulanList.filter(u => u.status_kode === 'DIDISPOSISI_PP').length;
  const finishedCount = usulanList.filter(u => u.status_kode === 'REALISASI_SELESAI').length;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex gap-4 mb-6 flex-col md:flex-row w-full">
          <div onClick={() => navigate('/dashboard/riwayat_usulan')} className={`cursor-pointer rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-1 border md:min-w-[240px] flex-1 ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>TOTAL USULAN MASUK</p>
                <h3 className="text-4xl font-bold text-blue-500">{total}</h3>
              </div>
              <div className={`p-3 rounded-xl shadow-inner ${isDarkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600'}`}><ClipboardList className="w-7 h-7" /></div>
            </div>
          </div>
          <div onClick={() => navigate('/dashboard/riwayat_usulan?status=DIDISPOSISI_PP')} className={`cursor-pointer rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-1 border md:min-w-[240px] flex-1 ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>PROSES PENGADAAN</p>
                <h3 className="text-4xl font-bold text-yellow-500">{inProcessCount}</h3>
              </div>
              <div className={`p-3 rounded-xl shadow-inner ${isDarkMode ? 'bg-yellow-900/40 text-yellow-400' : 'bg-yellow-100 text-yellow-600'}`}><Clock className="w-7 h-7" /></div>
            </div>
          </div>
          <div onClick={() => navigate('/dashboard/riwayat_usulan?status=REALISASI_SELESAI')} className={`cursor-pointer rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-1 border md:min-w-[240px] flex-1 ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>SELESAI REALISASI</p>
                <h3 className="text-4xl font-bold text-green-500">{finishedCount}</h3>
              </div>
              <div className={`p-3 rounded-xl shadow-inner ${isDarkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-600'}`}><CheckCircle className="w-7 h-7" /></div>
            </div>
          </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700/50 bg-[#0f172a]/30' : 'border-gray-100 bg-gray-50/50'}`}>
            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>Lelang / Pengadaan Barang</h3>
            <button onClick={fetchData} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-gray-100 text-gray-700'}`}><RefreshCw className="w-4 h-4" /></button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-xs uppercase tracking-wider ${isDarkMode ? 'bg-[#0f172a]/50 text-slate-400 border-b border-slate-700/50' : 'bg-gray-50/50 text-gray-500'}`}>
              <th className="px-6 py-4 font-bold">Kode Tiket</th>
              <th className="px-6 py-4 font-bold">Nama Barang</th>
              <th className="px-6 py-4 font-bold text-center">Info</th>
              <th className="px-6 py-4 font-bold text-center">Status & Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-12">Memuat...</td></tr>
              ) : usulanList.map((item) => (
                <tr key={item.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 font-bold">{item.kode_tiket}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{item.nama_usulan}</span>
                      {item.catatan_ppkom && (
                        <div className={`mt-2 p-2 rounded-lg border-l-4 text-[10px] italic flex items-center gap-2 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                           <ClipboardList className="w-3 h-3" />
                           <span>PPKOM: "{item.catatan_ppkom}"</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => openDetail(item)} className={`p-2 rounded-xl transition-all border flex items-center justify-center mx-auto text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-blue-50/50 border-blue-100 text-blue-600 hover:bg-blue-100'}`}><Eye className="w-3.5 h-3.5 mr-1.5"/> Log</button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.status_kode === 'DIDISPOSISI_PP' ? (
                      <button onClick={() => openRealisasiModal(item.id)} className={`text-[10px] font-black uppercase tracking-widest py-2.5 px-5 rounded-xl transition-all active:scale-95 shadow-lg flex items-center mx-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20`}>
                        <PackageCheck className="w-4 h-4 mr-2" /> Realisasi
                      </button>
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

      {/* Modal Realisasi */}
      {showRealisasiModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in duration-300 border ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-gray-100'}`}>
            <button onClick={() => setShowRealisasiModal(false)} className={`absolute top-4 right-4 transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}><X className="w-5 h-5"/></button>
            <h3 className={`text-xl font-bold mb-6 border-b pb-2 ${isDarkMode ? 'text-slate-100 border-slate-700' : 'text-gray-900 border-gray-100'}`}>Input Realisasi</h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Nama Vendor *</label>
                <input 
                    type="text" 
                    className={`w-full px-4 py-3 border rounded-xl font-semibold focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-[#0f172a] border-slate-700 text-white focus:ring-indigo-500/40' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-indigo-500/20'}`} 
                    value={realisasiForm.nama_vendor} 
                    onChange={(e) => setRealisasiForm({...realisasiForm, nama_vendor: e.target.value})} 
                />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Harga Final (Rp) *</label>
                <input 
                    type="text" 
                    className={`w-full px-4 py-3 border rounded-xl font-semibold focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-[#0f172a] border-slate-700 text-white focus:ring-indigo-500/40' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-indigo-500/20'}`} 
                    value={formatThousand(realisasiForm.harga_final)} 
                    onChange={handlePriceChange} 
                    placeholder="Contoh: 1.000.000"
                />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Catatan Tambahan</label>
                <textarea 
                    className={`w-full px-4 py-3 border rounded-xl font-semibold focus:outline-none focus:ring-2 transition-all resize-none ${isDarkMode ? 'bg-[#0f172a] border-slate-700 text-white focus:ring-indigo-500/40' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-indigo-500/20'}`} 
                    rows="2" 
                    value={realisasiForm.catatan} 
                    onChange={(e) => setRealisasiForm({...realisasiForm, catatan: e.target.value})} 
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-8">
              <button onClick={() => setShowRealisasiModal(false)} className={`flex-1 py-3 px-4 rounded-xl font-bold border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Batal</button>
              <button onClick={handleRealisasi} className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
