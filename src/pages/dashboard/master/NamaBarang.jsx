import { useState } from 'react';
import { Search, Plus, RefreshCw, Edit, Trash2 } from 'lucide-react';
import useDataStore from '../../../store/dataStore';
import useUIStore from '../../../store/ui';

export default function NamaBarang() {
  const { isDarkMode } = useUIStore();
  const { barangList, loading, fetchData } = useDataStore();
  
  const [searchQuery, setSearchQuery] = useState('');

  let filteredBarang = barangList;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredBarang = filteredBarang.filter(b => 
      (b.nama_barang || '').toLowerCase().includes(q) || 
      (b.satuan || '').toLowerCase().includes(q) ||
      (b.kategori?.nama_kategori || '').toLowerCase().includes(q)
    );
  }

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden animate-in fade-in duration-500 ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
      <div className={`px-6 py-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 ${isDarkMode ? 'border-slate-700/50 bg-[#0f172a]/30' : 'border-gray-50/50 bg-gray-50/20'}`}>
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}>Nama Barang</h2>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Kelola referensi komoditas kelengkapan barang dan jasa — {filteredBarang.length} data</p>
        </div>
        <div className="flex flex-wrap space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}/>
            <input 
              className={`pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 w-full md:w-64 text-sm transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 focus:ring-blue-500/40' : 'bg-white border-gray-200 text-gray-800 focus:ring-blue-500/20'}`} 
              placeholder="Cari barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm shadow-sm transition-all active:scale-95">
            <Plus className="w-4 h-4 mr-2"/> Tambah
          </button>
          <button onClick={fetchData} className={`flex items-center px-3 py-2 rounded-lg transition-colors text-sm font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-xs uppercase tracking-wider ${isDarkMode ? 'bg-[#0f172a]/50 text-slate-400 border-b border-slate-700/50' : 'bg-gray-50/50 text-gray-500'}`}>
              <th className="px-6 py-4 font-bold w-12 text-center">No</th>
              <th className="px-6 py-4 font-bold">Kategori</th>
              <th className="px-6 py-4 font-bold">Nama Barang</th>
              <th className="px-6 py-4 font-bold">Satuan</th>
              <th className="px-6 py-4 font-bold">Estimasi (Rp)</th>
              <th className="px-6 py-4 font-bold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-12">Memuat...</td></tr>
            ) : filteredBarang.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-12">Tidak ada data nama barang yang cocok</td></tr>
            ) : filteredBarang.map((b, idx) => (
              <tr key={b.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}>
                <td className={`px-6 py-4 text-center font-medium ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{idx + 1}</td>
                <td className="px-6 py-4 text-xs font-semibold flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{b.kategori?.nama_kategori || 'N/A'}</span>
                </td>
                <td className={`px-6 py-4 font-bold w-1/3 ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{b.nama_barang}</td>
                <td className={`px-6 py-4 text-sm whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{b.satuan}</td>
                <td className={`px-6 py-4 font-mono text-sm whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-gray-800'}`}>{b.harga_referensi.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center space-x-3">
                    <button className={`transition-colors p-1 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}><Edit className="w-4 h-4" /></button>
                    <button className={`transition-colors p-1 ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
