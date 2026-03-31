import { useState } from 'react';
import { RefreshCw, PackageCheck, X } from 'lucide-react';
import useDataStore from '../../store/dataStore';
import useUIStore from '../../store/ui';
import { getStatusBadgeClass } from '../../utils/statusBadge';
import api from '../../api/client';
import DetailUsulanModal from '../../components/ui/DetailUsulanModal';
import { Eye } from 'lucide-react';


export default function PPDashboard() {
  const { isDarkMode } = useUIStore();
  const { usulanList, loading, fetchData } = useDataStore();
  
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

  const handleRealisasi = async () => {
    if (!realisasiForm.nama_vendor || !realisasiForm.harga_final) { alert("Nama vendor & harga final wajib diisi"); return; }
    try {
      const res = await api.post(`/pp/usulan/${realisasiId}/realisasi`, {
        ...realisasiForm,
        harga_final: parseFloat(realisasiForm.harga_final)
      });
      if (res.data.success) { alert("Realisasi berhasil dicatat!"); setShowRealisasiModal(false); fetchData(); }
    } catch (err) { alert("Gagal: " + (err.response?.data?.message || err.message)); }
  };

  const total = usulanList.length;
  const inProcessCount = usulanList.filter(u => u.status_kode === 'DIDISPOSISI_PP').length;
  const finishedCount = usulanList.filter(u => u.status_kode === 'REALISASI_SELESAI').length;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-sm border flex flex-col hover:shadow-md transition-shadow ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
          <span className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total</span>
          <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{total}</span>
        </div>
        <div className={`p-6 rounded-xl shadow-sm border flex flex-col hover:shadow-md transition-shadow ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
          <span className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Proses Pengadaan</span>
          <span className={`text-3xl font-bold text-orange-600`}>{inProcessCount}</span>
        </div>
        <div className={`p-6 rounded-xl shadow-sm border flex flex-col hover:shadow-md transition-shadow ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
          <span className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Selesai</span>
          <span className={`text-3xl font-bold text-green-600`}>{finishedCount}</span>
        </div>
      </div>
      <DetailUsulanModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} usulan={detailUsulan} />

      <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700/50 bg-[#0f172a]/30' : 'border-gray-100 bg-gray-50/50'}`}>
            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>Lelang / Pengadaan Barang</h3>
            <button onClick={fetchData} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"><RefreshCw className="w-4 h-4" /></button>
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
                      <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${getStatusBadgeClass(item.status_kode)}`}>{(item.status_kode || 'N/A').replace(/_/g, ' ')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRealisasiModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in duration-300">
            <button onClick={() => setShowRealisasiModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold">✕</button>
            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Input Realisasi Pengadaan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Vendor *</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={realisasiForm.nama_vendor} onChange={(e) => setRealisasiForm({...realisasiForm, nama_vendor: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Harga Final (Rp) *</label>
                <input type="number" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={realisasiForm.harga_final} onChange={(e) => setRealisasiForm({...realisasiForm, harga_final: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Catatan Realisasi (Opsional)</label>
                <textarea className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none" rows="2" value={realisasiForm.catatan} onChange={(e) => setRealisasiForm({...realisasiForm, catatan: e.target.value})} placeholder="Keterangan tambahan pengadaan..."></textarea>
              </div>
            </div>
            <div className="flex space-x-3 mt-8">
              <button onClick={() => setShowRealisasiModal(false)} className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={handleRealisasi} className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
