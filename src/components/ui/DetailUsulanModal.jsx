import { X, FileText, User, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import useUIStore from '../../store/ui';

export default function DetailUsulanModal({ isOpen, onClose, usulan }) {
  const { isDarkMode } = useUIStore();

  if (!isOpen || !usulan) return null;

  const getImageUrl = (path) => {
    if (!path) return '';
    // Handle both cases: path with leading /uploads/ and without
    const cleanPath = path.replace(/^\/?uploads\//, '');
    return `http://localhost:8080/uploads/${cleanPath}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-2xl rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-gray-100'}`}>
        
        {/* Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-gray-100 bg-gray-50/30'}`}>
          <h3 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Detail Usulan</h3>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* Section 1: Informasi Barang/Jasa */}
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-gray-50/30 border-gray-100'}`}>
            <div className="flex items-center gap-2 mb-6">
               <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500"><FileText className="w-4 h-4" /></div>
               <h4 className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Informasi Barang/Jasa</h4>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
               <div className="space-y-1">
                  <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Nama Barang</p>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{usulan.nama_usulan}</p>
               </div>
               <div className="space-y-1">
                  <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Kategori</p>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{usulan.kategori?.nama_kategori || '-'}</p>
               </div>
               <div className="space-y-1">
                  <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Jumlah</p>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{usulan.jumlah_barang} {usulan.satuan}</p>
               </div>
            </div>

            <div className="space-y-1 mb-6 pt-4 border-t border-slate-700/30">
               <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Foto Barang</p>
               {usulan.foto_barang ? (
                   <a href={getImageUrl(usulan.foto_barang)} target="_blank" rel="noreferrer" className="text-xs text-blue-500 font-bold hover:underline">Lihat Lampiran</a>
               ) : <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-800'}`}>-</p>}
            </div>

            <div className="space-y-1 mb-6 pt-4">
               <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Spesifikasi / Keterangan Barang</p>
               <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{usulan.keterangan || '-'}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-700/30 mb-6">
               <div className="space-y-1">
                  <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Pemohon</p>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{usulan.nama_pengusul || '-'}</p>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{usulan.no_hp || ''}</p>
               </div>
               <div className="space-y-1">
                  <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Unit / Ruangan</p>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{usulan.unit_ruangan || '-'}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Kegentingan</p>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-tight rounded-full border shadow-sm inline-block ${usulan.tingkat_kegentingan === 'Sangat Genting' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-orange-500/10 border-orange-500/30 text-orange-500'}`}>{usulan.tingkat_kegentingan || 'Genting'}</span>
               </div>
               <div className="space-y-2">
                  <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Kepentingan</p>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-tight rounded-full border shadow-sm inline-block ${usulan.tingkat_kepentingan === 'Sangat Penting' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-500'}`}>{usulan.tingkat_kepentingan || 'Penting'}</span>
               </div>
            </div>
          </div>

          {/* Section: Disposisi PEP */}
          {usulan.pptk_user_id && (
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50/50 border-blue-100'}`}>
              <div className="flex items-center gap-2 mb-4">
                 <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500"><User className="w-4 h-4" /></div>
                 <h4 className={`text-[11px] font-black uppercase tracking-widest text-blue-500`}>Disposisi PEP</h4>
              </div>
              <div className="space-y-1">
                  <p className={`text-[10px] font-bold ${isDarkMode ? 'text-blue-400/70' : 'text-blue-600/70'}`}>Nama PPTK (Tujuan Disposisi)</p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {(usulan.pptk_user?.id && usulan.pptk_user?.nama) ? usulan.pptk_user.nama : 'Unknown'}
                  </p>
                  {usulan.catatan_pep && <p className={`text-xs italic mt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>"{usulan.catatan_pep}"</p>}
              </div>
            </div>
          )}

          {/* Section: Disposisi PPTK */}
          {usulan.ppkom_user_id && (
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-purple-500/5 border-purple-500/20' : 'bg-purple-50/50 border-purple-100'}`}>
              <div className="flex items-center gap-2 mb-4">
                 <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-500"><User className="w-4 h-4" /></div>
                 <h4 className={`text-[11px] font-black uppercase tracking-widest text-purple-500`}>Disposisi PPTK</h4>
              </div>
              <div className="space-y-1">
                  <p className={`text-[10px] font-bold ${isDarkMode ? 'text-purple-400/70' : 'text-purple-600/70'}`}>Nama PPKOM (Tujuan Disposisi)</p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {(usulan.ppkom_user?.id && usulan.ppkom_user?.nama) ? usulan.ppkom_user.nama : 'Unknown'}
                  </p>
                  {usulan.catatan_pptk && <p className={`text-xs italic mt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>"{usulan.catatan_pptk}"</p>}
              </div>
            </div>
          )}

          {/* Section: Persetujuan PPKOM */}
          {usulan.pp_user_id && (
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-100'}`}>
              <div className="flex items-center gap-2 mb-4">
                 <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500"><User className="w-4 h-4" /></div>
                 <h4 className={`text-[11px] font-black uppercase tracking-widest text-emerald-500`}>Verifikasi PPKOM</h4>
              </div>
              <div className="space-y-1">
                  <p className={`text-[10px] font-bold ${isDarkMode ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>Nama Pejabat Pengadaan (PP)</p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {(usulan.pp_user?.id && usulan.pp_user?.nama) ? usulan.pp_user.nama : 'Unknown'}
                  </p>
                  {usulan.catatan_ppkom && <p className={`text-xs italic mt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>"{usulan.catatan_ppkom}"</p>}
              </div>
            </div>
          )}

          {/* Section: Rejection/Return */}
          {usulan.alasan_return && (
             <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50/50 border-red-100'}`}>
              <div className="flex items-center gap-2 mb-4">
                 <div className="p-1.5 bg-red-500/10 rounded-lg text-red-500"><AlertCircle className="w-4 h-4" /></div>
                 <h4 className={`text-[11px] font-black uppercase tracking-widest text-red-500`}>Usulan Dikembalikan</h4>
              </div>
              <div className="space-y-1">
                  <p className={`text-[10px] font-bold text-red-400`}>Alasan Pengembalian</p>
                  <p className={`text-sm italic font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>"{usulan.alasan_return}"</p>
              </div>
            </div>
          )}

          {usulan.realisasi && (
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50/50 border-green-100'}`}>
              <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-green-500/10 rounded-lg text-green-500"><CheckCircle2 className="w-4 h-4" /></div>
                  <h4 className={`text-[11px] font-black uppercase tracking-widest text-green-500`}>Realisasi Selesai</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-[10px] font-bold text-green-400`}>Vendor</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{usulan.realisasi.nama_vendor}</p>
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold text-green-400`}>Harga Final</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Rp {usulan.realisasi.harga_final.toLocaleString('id-ID')}</p>
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 flex items-center justify-end ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50/50'}`}>
           <button onClick={onClose} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Tutup</button>
        </div>
      </div>
    </div>
  );
}
