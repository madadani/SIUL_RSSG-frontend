import { useState } from 'react';
import { RefreshCw, PackageCheck, X, ClipboardList, Eye, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDataStore from '../../store/dataStore';
import useUIStore from '../../store/ui';
import api from '../../api/client';
import DetailUsulanModal from '../../components/ui/DetailUsulanModal';
import { toast } from '../../utils/toast';

export default function PPDashboard() {
  const { isDarkMode } = useUIStore();
  const { usulanList, kategoriList, loading, fetchData } = useDataStore();
  const navigate = useNavigate();
  
  const [showRealisasiModal, setShowRealisasiModal] = useState(false);
  const [realisasiId, setRealisasiId] = useState(null);
  const [realisasiForm, setRealisasiForm] = useState({ nama_vendor: '', nomor_kontrak: '', harga_final: '', catatan: '', kategori_id: '' });

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailUsulan, setDetailUsulan] = useState(null);

  const openDetail = (u) => { setDetailUsulan(u); setShowDetailModal(true); };

  const openRealisasiModal = (item) => {
    setRealisasiId(item.id);
    setRealisasiForm({ nama_vendor: '', nomor_kontrak: '', harga_final: '', catatan: '', kategori_id: item.kategori_belanja_id || '' });
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
    if (!realisasiForm.nama_vendor || !realisasiForm.harga_final) { toast.warning("Nama vendor & harga final wajib diisi!"); return; }
    const confirmed = await confirmDialog({
      title: 'Simpan Realisasi?',
      message: `Data realisasi untuk vendor "${realisasiForm.nama_vendor}" senilai Rp ${formatThousand(realisasiForm.harga_final)} akan disimpan. Lanjutkan?`,
      type: 'success',
      confirmText: 'Ya, Simpan',
    });
    if (!confirmed) return;
    try {
      const res = await api.post(`/pp/usulan/${realisasiId}/realisasi`, {
        ...realisasiForm,
        harga_final: parseFloat(realisasiForm.harga_final),
        kategori_id: realisasiForm.kategori_id ? parseInt(realisasiForm.kategori_id) : undefined
      });
      if (res.data.success) { 
        toast.success('Realisasi berhasil dicatat!');
        setShowRealisasiModal(false); 
        fetchData(); 
      }
    } catch (err) { toast.error("Gagal: " + (err.response?.data?.message || err.message)); }
  };

  const total = usulanList.length;
  const inProcessCount = usulanList.filter(u => u.status_kode === 'DIDISPOSISI_PP').length;
  const finishedCount = usulanList.filter(u => u.status_kode === 'REALISASI_SELESAI').length;

  // dashboard actionable: only show items waiting for PP realization
  const filteredList = usulanList.filter(u => ['DIDISPOSISI_PP'].includes(u.status_kode));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex gap-4 mb-6 flex-col md:flex-row w-full">
          <div onClick={() => navigate('/dashboard/riwayat_usulan')} className={`cursor-pointer rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-1 border md:min-w-[240px] flex-1 group ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>TOTAL USULAN MASUK</p>
                <h3 className="text-4xl font-bold text-blue-500">{total}</h3>
              </div>
              <div className={`p-3 rounded-xl shadow-inner ${isDarkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600'}`}><ClipboardList className="w-7 h-7" /></div>
            </div>
            <div className={`mt-4 pt-3 border-t flex justify-end font-bold text-[10px] uppercase tracking-wider transition-colors ${isDarkMode ? 'border-slate-700/50 text-slate-500 group-hover:text-blue-400' : 'border-gray-100 text-gray-400 group-hover:text-blue-600'}`}>
              Lihat Semua &rarr;
            </div>
          </div>
          <div onClick={() => navigate('/dashboard/riwayat_usulan?status=DIDISPOSISI_PP')} className={`cursor-pointer rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-1 border md:min-w-[240px] flex-1 group ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>PROSES PENGADAAN</p>
                <h3 className="text-4xl font-bold text-yellow-500">{inProcessCount}</h3>
              </div>
              <div className={`p-3 rounded-xl shadow-inner ${isDarkMode ? 'bg-yellow-900/40 text-yellow-400' : 'bg-yellow-100 text-yellow-600'}`}><Clock className="w-7 h-7" /></div>
            </div>
            <div className={`mt-4 pt-3 border-t flex justify-end font-bold text-[10px] uppercase tracking-wider transition-colors ${isDarkMode ? 'border-slate-700/50 text-slate-500 group-hover:text-yellow-400' : 'border-gray-100 text-gray-400 group-hover:text-yellow-600'}`}>
              Lihat Semua &rarr;
            </div>
          </div>
          <div onClick={() => navigate('/dashboard/riwayat_usulan?status=REALISASI_SELESAI')} className={`cursor-pointer rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-1 border md:min-w-[240px] flex-1 group ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>SELESAI REALISASI</p>
                <h3 className="text-4xl font-bold text-green-500">{finishedCount}</h3>
              </div>
              <div className={`p-3 rounded-xl shadow-inner ${isDarkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-600'}`}><CheckCircle className="w-7 h-7" /></div>
            </div>
            <div className={`mt-4 pt-3 border-t flex justify-end font-bold text-[10px] uppercase tracking-wider transition-colors ${isDarkMode ? 'border-slate-700/50 text-slate-500 group-hover:text-green-400' : 'border-gray-100 text-gray-400 group-hover:text-green-600'}`}>
              Lihat Semua &rarr;
            </div>
          </div>
      </div>

        <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
          <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700/50 bg-[#0f172a]/30' : 'border-gray-100 bg-gray-50/50'}`}>
              <h3 className={`font-bold text-lg ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>Pekerjaan Pengadaan Segera</h3>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{filteredList.length} data perlu aksi</span>
                <button onClick={fetchData} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'bg-slate-800 text-blue-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><RefreshCw className="w-4 h-4" /></button>
              </div>
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
                <tr><td colSpan="7" className="text-center py-12">Memuat...</td></tr>
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
                      {item.catatan_ppkom && (
                        <div className={`mt-2 p-2 rounded-lg border-l-4 text-[10px] italic flex items-center gap-2 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                           <ClipboardList className="w-3 h-3" />
                           <span>PPKOM: "{item.catatan_ppkom}"</span>
                        </div>
                      )}
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
                        {item.status_kode === 'DIDISPOSISI_PP' && (
                          <button onClick={() => openRealisasiModal(item)} className={`px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md shadow-indigo-500/20 font-bold text-[12px] tracking-wide flex items-center transition-all active:scale-[0.98]`}>
                            Realisasi
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
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Kategori Barang</label>
                <select 
                    className={`w-full px-4 py-3 border rounded-xl font-semibold focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-[#0f172a] border-slate-700 text-white focus:ring-indigo-500/40' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-indigo-500/20'}`} 
                    value={realisasiForm.kategori_id} 
                    onChange={(e) => setRealisasiForm({...realisasiForm, kategori_id: e.target.value})}
                >
                    <option value="">-- Pilih Kategori --</option>
                    {kategoriList.map(k => (
                        <option key={k.id} value={k.id}>{k.nama_kategori}</option>
                    ))}
                </select>
                <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>Anda bisa mengganti kategori barang jika terdapat ketidaksesuaian.</p>
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
