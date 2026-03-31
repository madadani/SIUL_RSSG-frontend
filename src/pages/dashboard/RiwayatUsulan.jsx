import { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, FileText, Eye, ClipboardList } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import useDataStore from '../../store/dataStore';
import useUIStore from '../../store/ui';
import { getStatusBadgeClass, formatStatus } from '../../utils/statusBadge';
import DetailUsulanModal from '../../components/ui/DetailUsulanModal';

export default function RiwayatUsulan() {
  const { isDarkMode } = useUIStore();
  const { usulanList, loading, fetchData } = useDataStore();
  
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('terbaru');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailUsulan, setDetailUsulan] = useState(null);

  const openDetail = (u) => { setDetailUsulan(u); setShowDetailModal(true); };

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(status);
    }
  }, [searchParams]);

  const statusLabel = {
    'MENUNGGU_PEP': 'Menunggu Disposisi PPTK',
    'DIDISPOSISI_PPTK': 'Sedang Diproses PPTK',
    'DIKEMBALIKAN_KE_PEP': 'Dikembalikan ke PEP',
    'ALL': 'Semua Usulan'
  };

  let filteredList = usulanList.filter(u => statusFilter === 'ALL' || u.status_kode === statusFilter);

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}>Riwayat Usulan</h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Filter: <span className="font-bold">{statusLabel[statusFilter] || statusFilter}</span> — {filteredList.length} data</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setStatusFilter('ALL')} className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${statusFilter === 'ALL' ? 'bg-blue-600 text-white' : (isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}`}>Semua</button>
          <button onClick={() => setStatusFilter('MENUNGGU_PEP')} className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${statusFilter === 'MENUNGGU_PEP' ? 'bg-blue-600 text-white' : (isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}`}>Menunggu</button>
          <button onClick={() => setStatusFilter('DIDISPOSISI_PPTK')} className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${statusFilter === 'DIDISPOSISI_PPTK' ? 'bg-yellow-600 text-white' : (isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}`}>Diproses</button>
          <button onClick={() => setStatusFilter('DIKEMBALIKAN_KE_PEP')} className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${statusFilter === 'DIKEMBALIKAN_KE_PEP' ? 'bg-red-600 text-white' : (isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}`}>Dikembalikan</button>
        </div>
      </div>

      <div className={`flex flex-col sm:flex-row gap-3 mb-6`}>
        <div className="relative flex-1">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Cari nama barang atau kode tiket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold border focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-200 placeholder-slate-500 focus:ring-blue-500/40 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-blue-500/20 focus:border-blue-500'}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className={`w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={`pl-4 pr-9 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:ring-2 transition-all cursor-pointer ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-200 focus:ring-blue-500/40' : 'bg-white border-gray-200 text-gray-700 focus:ring-blue-500/20'}`}
          >
            <option value="terbaru">Terbaru</option>
            <option value="terlama">Terlama</option>
            <option value="az">A - Z</option>
            <option value="za">Z - A</option>
          </select>
          <button onClick={fetchData} className={`p-2.5 rounded-xl border transition-colors ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-white border-gray-200 text-blue-600 hover:bg-gray-50'}`}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700/50 bg-[#0f172a]/30' : 'border-gray-100 bg-gray-50/50'}`}>
          <h3 className={`font-bold text-lg ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>Daftar Usulan — {statusLabel[statusFilter] || 'Semua'}</h3>
          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{filteredList.length} hasil</span>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-xs uppercase tracking-wider ${isDarkMode ? 'bg-[#0f172a]/50 text-slate-400 border-b border-slate-700/50' : 'bg-gray-50/50 text-gray-500'}`}>
                <th className="px-6 py-4 font-bold">No</th>
                <th className="px-6 py-4 font-bold">Kode Tiket</th>
                <th className="px-6 py-4 font-bold">Nama Barang/Jasa</th>
                <th className="px-6 py-4 font-bold">Tingkat Kepentingan</th>
                <th className="px-6 py-4 font-bold text-center">Info</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Memuat data...</span>
                  </div>
                </td></tr>
              ) : filteredList.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <FileText className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-slate-600' : 'text-gray-200'}`} />
                    <span className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{searchQuery ? 'Tidak ditemukan usulan yang cocok' : 'Belum ada usulan untuk filter ini'}</span>
                  </div>
                </td></tr>
              ) : filteredList.map((item, idx) => (
                <tr key={item.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}>
                  <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{idx + 1}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold px-2 py-1 rounded text-sm ${isDarkMode ? 'text-slate-200 bg-slate-700' : 'text-gray-900 bg-gray-100'}`}>{item.kode_tiket}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{item.nama_usulan}</span>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-400'}`}>Kategori: {item.kategori?.nama_kategori || `ID ${item.kategori_belanja_id}`}</span>
                      </div>
                      {item.catatan_pep && (
                        <div className={`mt-2 p-2 rounded-lg border-l-4 text-[10px] italic flex items-center gap-2 ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
                           <ClipboardList className="w-3 h-3 min-w-[12px]" />
                           <span className="truncate max-w-[200px]">PEP: "{item.catatan_pep}"</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm whitespace-nowrap border ${
                      item.tingkat_kepentingan === 'Sangat Penting' ? (isDarkMode ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700') :
                      item.tingkat_kepentingan === 'Penting' ? (isDarkMode ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-700') :
                      (isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-gray-100 border-gray-200 text-gray-700')
                    }`}>
                      {item.tingkat_kepentingan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => openDetail(item)} className={`p-2 rounded-xl transition-all border flex items-center justify-center mx-auto text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-blue-50/50 border-blue-100 text-blue-600 hover:bg-blue-100'}`}><Eye className="w-3.5 h-3.5 mr-1.5"/> Log</button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border shadow-sm ${getStatusBadgeClass(item.status_kode)}`}>
                      {formatStatus(item.status_kode)}
                    </span>
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
