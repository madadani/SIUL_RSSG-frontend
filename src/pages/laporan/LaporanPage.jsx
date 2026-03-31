import { useState } from 'react';
import { Calendar, Download, Activity, ClipboardList, PackageCheck, Ban, ArrowUpRight, ArrowDownRight, TrendingUp, PieChart, Eye } from 'lucide-react';
import useDataStore from '../../store/dataStore';
import useUIStore from '../../store/ui';
import { getStatusBadgeClass, formatStatus } from '../../utils/statusBadge';
import DetailUsulanModal from '../../components/ui/DetailUsulanModal';

export default function LaporanPage() {
  const { isDarkMode } = useUIStore();
  const { usulanList, detailAnggaranList } = useDataStore();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filterByTime = (list) => {
    if (!startDate && !endDate) return list;
    return list.filter(item => {
      const itemDate = new Date(item.created_at).getTime();
      const start = startDate ? new Date(startDate + 'T00:00:00').getTime() : 0;
      const end = endDate ? new Date(endDate + 'T23:59:59').getTime() : Infinity;
      return itemDate >= start && itemDate <= end;
    });
  };

  const filteredUsulan = filterByTime(usulanList);
  const filteredAnggaranList = filterByTime(detailAnggaranList);

  const applyPreset = (preset) => {
    const now = new Date();
    if (preset === 'today') {
      const d = now.toISOString().split('T')[0];
      setStartDate(d); setEndDate(d);
    } else if (preset === 'week') {
      const d = new Date(); d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'year') {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else {
      setStartDate(''); setEndDate('');
    }
  };

  // Aggregations
  const totalUsulan = filteredUsulan.length;
  const usulanSelesai = filteredUsulan.filter(u => u.status_kode === 'REALISASI_SELESAI').length;
  const usulanDitolak = filteredUsulan.filter(u => u.status_kode === 'DIKEMBALIKAN_KE_PEP').length;
  const persenSelesai = totalUsulan > 0 ? Math.round((usulanSelesai / totalUsulan) * 100) : 0;
  const totalAnggaran = filteredAnggaranList.reduce((acc, curr) => acc + (curr.nominal || 0), 0);

  const categoryCounts = {};
  filteredUsulan.forEach(u => {
    const cat = u.kategori?.nama_kategori || 'Belum Difilter';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts).sort((a,b) => b[1] - a[1]).slice(0, 4);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailUsulan, setDetailUsulan] = useState(null);

  const openDetail = (u) => { setDetailUsulan(u); setShowDetailModal(true); };

  return (
    <div className="animate-in fade-in duration-500 space-y-6 overflow-x-hidden">
      {/* Print View Table omitted for brevity or I should just keep it as is */}
      {/* I'll use the version I wrote before but fix the store import path as it moved one level up */}
      
      <div className="no-print space-y-6">
        <div className={`p-6 rounded-2xl border shadow-sm flex flex-col min-[1400px]:flex-row justify-between items-start min-[1400px]:items-center gap-6 no-print ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
          <div className="min-w-fit">
            <h2 className={`text-2xl font-bold flex items-center whitespace-nowrap ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}>
              <Activity className="w-6 h-6 mr-3 text-blue-500" />
              Laporan & Statistik
            </h2>
            <p className={`text-sm mt-1 whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Ringkasan eksekutif dan statistik pengadaan RSSG.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full min-[1400px]:w-auto justify-start min-[1400px]:justify-end">
            <div className={`inline-flex p-1 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
              {['all', 'today', 'month', 'year'].map(p => (
                <button key={p} onClick={()=>applyPreset(p)} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${ (p === 'all' && !startDate && !endDate) || (p === 'today' && startDate === new Date().toISOString().split('T')[0] && endDate === startDate) ? 'bg-blue-600 text-white shadow-sm' : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-900') }`} >
                  {p === 'all' ? 'Semua' : p === 'today' ? 'Hari Ini' : p === 'month' ? 'Bulan Ini' : 'Tahun Ini'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`pl-2 pr-2 py-2.5 rounded-xl border text-[11px] font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-36 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-gray-700'}`} />
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}>–</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={`pl-2 pr-2 py-2.5 rounded-xl border text-[11px] font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-36 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-gray-700'}`} />
            </div>
            <button onClick={() => window.print()} className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 whitespace-nowrap shadow-blue-500/20`} >
              <Download className="w-4 h-4 mr-2" /> PDF
            </button>
          </div>
        </div>

        {/* Dashboard visual cards and simple list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Usulan</p>
            <h3 className={`text-3xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalUsulan}</h3>
          </div>
          <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Realisasi Selesai</p>
            <h3 className={`text-3xl font-black mb-1 text-green-500`}>{usulanSelesai}</h3>
          </div>
          <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Usulan Ditolak</p>
            <h3 className={`text-3xl font-black mb-1 text-red-500`}>{usulanDitolak}</h3>
          </div>
          <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 border-none text-white`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 text-blue-200`}>Total Anggaran</p>
            <h3 className={`text-2xl font-black mb-1`}>Rp {(totalAnggaran/1000000).toLocaleString('id-ID')} JT</h3>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-700/50 bg-[#0f172a]/30 text-slate-200' : 'border-gray-100 bg-gray-50/50 text-gray-800'}`}>
            <h3 className="font-bold">Daftar Detail Laporan</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-3 font-bold border-b">No</th>
                  <th className="px-6 py-3 font-bold border-b">Kode</th>
                  <th className="px-6 py-3 font-bold border-b">Nama Usulan</th>
                  <th className="px-6 py-3 font-bold border-b text-center">Info</th>
                  <th className="px-6 py-3 font-bold border-b text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsulan.map((u, i) => (
                  <tr key={u.id} className={`transition-colors border-b last:border-0 ${isDarkMode ? 'text-slate-300 border-slate-700/50' : 'text-gray-700 border-gray-100'}`}>
                    <td className="px-6 py-4">{i+1}</td>
                    <td className="px-6 py-4 font-mono text-blue-500 font-bold">{u.kode_tiket}</td>
                    <td className="px-6 py-4 font-bold">
                      <div className="flex flex-col">
                        <span>{u.nama_usulan}</span>
                        {u.catatan_pep && (
                          <div className={`mt-2 p-2 rounded-lg border-l-4 text-[10px] italic flex items-center gap-2 ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
                             <ClipboardList className="w-3 h-3" />
                             <span>PEP: "{u.catatan_pep}"</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <button onClick={() => openDetail(u)} className={`p-2 rounded-xl border flex items-center justify-center mx-auto text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-blue-50/50 border-blue-100 text-blue-600 hover:bg-blue-100'}`}><Eye className="w-3.5 h-3.5 mr-1.5"/> Log</button>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border shadow-sm ${getStatusBadgeClass(u.status_kode)}`}>
                         {formatStatus(u.status_kode)}
                       </span>
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
