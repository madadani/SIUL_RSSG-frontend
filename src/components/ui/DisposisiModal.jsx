import { X, FileImage, Send } from 'lucide-react';
import useUIStore from '../../store/ui';

export default function DisposisiModal({ 
  isOpen, 
  onClose, 
  usulan, 
  users, 
  targetLabel, 
  selectedUser, 
  setSelectedUser, 
  catatan, 
  setCatatan, 
  onSubmit 
}) {
  const { isDarkMode } = useUIStore();

  if (!isOpen || !usulan) return null;

  const getImageUrl = (path) => {
    if (!path) return '';
    // Jika path sudah mengandung /uploads/, bersihkan agar tidak double
    const cleanPath = path.replace(/^\/?uploads\//, '');
    return `http://localhost:8080/uploads/${cleanPath}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-2xl rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-gray-100'}`}>
        
        {/* Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-gray-100 bg-gray-50/30'}`}>
          <h3 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Disposisi Usulan</h3>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* Identitas Barang */}
          <div className={`pb-4 border-b grid grid-cols-1 md:grid-cols-3 gap-4 ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
            <div className="col-span-1 md:col-span-1">
              <p className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{usulan.nama_usulan}</p>
            </div>
            <div className="col-span-1 md:col-span-1">
               <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{usulan.kategori?.nama_kategori || 'Kategori'}</p>
            </div>
            <div className="col-span-1 md:col-span-1">
               <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{usulan.jumlah_barang} {usulan.satuan}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Foto Barang</p>
              {usulan.foto_barang ? (
                <a href={getImageUrl(usulan.foto_barang)} target="_blank" rel="noreferrer" className={`inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 text-blue-400 hover:bg-slate-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                  <FileImage className="w-4 h-4 mr-2" /> Lihat Lampiran
                </a>
              ) : (
                <span className={`text-sm italic ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Tidak ada lampiran</span>
              )}
            </div>

            <div className={`pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
              <p className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Spesifikasi / Keterangan Barang</p>
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{usulan.keterangan || '-'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800">
               <div>
                  <p className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Pemohon</p>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{usulan.nama_pengusul || 'Unknown'}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{usulan.no_hp || ''}</p>
               </div>
               <div>
                  <p className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Unit / Ruangan</p>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{usulan.unit_ruangan || 'Unknown'}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Kegentingan</p>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-tight rounded-full border shadow-sm ${usulan.tingkat_kegentingan === 'Sangat Genting' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-orange-500/10 border-orange-500/30 text-orange-500'}`}>{usulan.tingkat_kegentingan || 'Genting'}</span>
               </div>
               <div>
                  <p className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Kepentingan</p>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-tight rounded-full border shadow-sm ${usulan.tingkat_kepentingan === 'Sangat Penting' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-500'}`}>{usulan.tingkat_kepentingan || 'Penting'}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className={`px-6 py-6 border-t ${isDarkMode ? 'bg-slate-800/80 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
           <div className="flex flex-col gap-5">
             <div>
               <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Pilih Pejabat Penerima Disposisi</label>
               <select 
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-200 cursor-pointer' : 'bg-white border-gray-200 text-gray-700'}`} 
                  value={selectedUser} 
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">-- {targetLabel} --</option>
                  {users.map(u => (<option key={u.id} value={u.id}>{u.nama}</option>))}
                </select>
             </div>

             <div>
               <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Catatan / Instruksi Disposisi</label>
               <input 
                  type="text" 
                  placeholder="Masukkan catatan instruksi..." 
                  className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-semibold text-sm ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-200 placeholder-slate-500' : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400'}`}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
               />
             </div>

             <button 
                onClick={onSubmit} 
                disabled={!selectedUser}
                className={`w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl transition-all shadow-lg text-sm font-black uppercase tracking-widest ${selectedUser ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-[0.98]' : (isDarkMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')}`}
              >
                 <Send className="w-4 h-4" /> Disposisi Usulan
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
