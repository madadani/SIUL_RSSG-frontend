import { X, ClipboardList, User, Clock, CheckCircle2, AlertCircle, FileText, TrendingUp } from 'lucide-react';
import useUIStore from '../../store/ui';

export default function DetailUsulanModal({ isOpen, onClose, usulan }) {
  const { isDarkMode } = useUIStore();

  if (!isOpen || !usulan) return null;

  const steps = [
    { label: 'Usulan Dibuat (Public)', note: usulan.keterangan, date: usulan.created_at, color: 'blue' },
    { label: 'Disposisi PEP -> PPTK', note: usulan.catatan_pep, date: usulan.disposisi_pep_at, color: 'indigo' },
    { label: 'Verifikasi PPTK -> PPKOM', note: usulan.catatan_pptk, date: usulan.disposisi_pptk_at, color: 'purple' },
    { label: 'Persetujuan PPKOM -> PP', note: usulan.catatan_ppkom, date: usulan.setuju_ppkom_at, color: 'emerald' },
    { label: 'Realisasi Selesai (PP)', note: usulan.realisasi?.catatan, date: usulan.realisasi?.created_at, color: 'green' },
  ];

  // Also handle returns/rejects
  if (usulan.alasan_return) {
    steps.push({ label: 'Dikembalikan ke PEP (PPTK)', note: usulan.alasan_return, date: usulan.return_at, color: 'red', icon: <AlertCircle className="w-5 h-5" /> });
  }
  if (usulan.alasan_tolak) {
    steps.push({ label: 'Ditolak PPKOM', note: usulan.alasan_tolak, date: usulan.reject_at, color: 'red', icon: <AlertCircle className="w-5 h-5" /> });
  }

  // Sort by date if possible
  const validSteps = steps.filter(s => s.note || s.date).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-2xl rounded-3xl shadow-2xl border overflow-hidden ${isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-gray-100'}`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-gray-100 bg-gray-50/30'}`}>
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-blue-500/10 rounded-xl"><FileText className="w-6 h-6 text-blue-500" /></div>
             <div>
                <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Detail Usulan & Riwayat</h3>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{usulan.kode_tiket}</p>
             </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-8">
            {/* Core Info Info */}
            <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-gray-50/50 border-gray-100'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Nama Usulan</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{usulan.nama_usulan}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-gray-50/50 border-gray-100'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Status Saat Ini</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-blue-100 text-blue-700 shadow-sm border border-blue-200 inline-block`}>{usulan.status_kode?.replace(/_/g, ' ')}</span>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 space-y-10 border-l-2 border-dashed border-slate-300/30">
               <h4 className={`text-md font-black uppercase tracking-widest mb-6 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>Log Perjalanan Usulan</h4>
               
               {validSteps.map((step, idx) => (
                 <div key={idx} className="relative animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[30px] top-1 w-4 h-4 rounded-full border-4 shadow-sm transition-transform hover:scale-125 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-blue-400'}`}></div>
                    
                    {/* Badge Date */}
                    <div className="flex items-center space-x-2 mb-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
                            {new Date(step.date).toLocaleString('id-ID')}
                        </span>
                        <TrendingUp className={`w-3 h-3 ${isDarkMode ? 'text-slate-700' : 'text-gray-200'}`} />
                        <span className={`text-[10px] font-bold text-${step.color}-500 uppercase tracking-tight`}>{step.label}</span>
                    </div>

                    {/* Note Box */}
                    <div className={`p-4 rounded-2xl border-l-4 shadow-sm transition-all hover:shadow-md ${isDarkMode ? 'bg-[#1e293b] border-slate-700 border-l-blue-500' : 'bg-slate-50 border-gray-100 border-l-blue-400'}`}>
                        <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-inner'}`}>
                                {step.icon || <FileText className="w-4 h-4 text-slate-400" />}
                            </div>
                            <p className={`text-sm italic font-medium leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                                "{step.note || 'Tidak ada catatan khusus.'}"
                            </p>
                        </div>
                    </div>
                 </div>
               ))}

               {validSteps.length === 0 && (
                  <p className="text-sm italic text-gray-400 ml-2">Belum ada riwayat disposisi tercatat.</p>
               )}
            </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 flex items-center justify-end ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50/50'}`}>
           <button onClick={onClose} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Selesai</button>
        </div>
      </div>
    </div>
  );
}
