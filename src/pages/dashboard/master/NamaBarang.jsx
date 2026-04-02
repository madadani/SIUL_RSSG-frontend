import { useState } from 'react';
import { Search, Plus, RefreshCw, Edit, Trash2, X, Save } from 'lucide-react';
import useDataStore from '../../../store/dataStore';
import useUIStore from '../../../store/ui';

export default function NamaBarang() {
  const { isDarkMode } = useUIStore();
  const { barangList, kategoriList, loading, fetchData, addBarang, updateBarang, deleteBarang } = useDataStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    nama_barang: '', 
    kategori_belanja_id: '', 
    satuan: '', 
    harga_referensi: 0,
    spesifikasi: ''
  });

  let filteredBarang = barangList;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredBarang = filteredBarang.filter(b => 
      (b.nama_barang || '').toLowerCase().includes(q) || 
      (b.satuan || '').toLowerCase().includes(q) ||
      (b.kategori?.nama_kategori || '').toLowerCase().includes(q)
    );
  }

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ nama_barang: '', kategori_belanja_id: kategoriList[0]?.id || '', satuan: '', harga_referensi: 0, spesifikasi: '' });
    setShowModal(true);
  };

  const openEditModal = (b) => {
    setEditingId(b.id);
    setFormData({ 
      nama_barang: b.nama_barang, 
      kategori_belanja_id: b.kategori_belanja_id, 
      satuan: b.satuan, 
      harga_referensi: b.harga_referensi,
      spesifikasi: b.spesifikasi || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, harga_referensi: Number(formData.harga_referensi), kategori_belanja_id: Number(formData.kategori_belanja_id) };
    if (editingId) {
      await updateBarang(editingId, payload);
    } else {
      await addBarang(payload);
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus barang ini?')) {
      await deleteBarang(id);
    }
  };

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden animate-in fade-in duration-500 ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
      <div className={`px-6 py-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 ${isDarkMode ? 'border-slate-700/50 bg-[#0f172a]/30' : 'border-gray-50/50 bg-gray-50/20'}`}>
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}>Nama Barang</h2>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Kelola referensi komoditas barang dan jasa — {filteredBarang.length} data</p>
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
          <button onClick={openAddModal} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm shadow-sm transition-all active:scale-95">
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
              <th className="px-6 py-4 font-bold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-12">Memuat...</td></tr>
            ) : filteredBarang.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-12">Tidak ada data nama barang yang cocok</td></tr>
            ) : filteredBarang.map((b, idx) => (
              <tr key={b.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}>
                <td className={`px-6 py-4 text-center font-medium ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{idx + 1}</td>
                <td className="px-6 py-4 text-xs font-semibold flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{b.kategori?.nama_kategori || 'N/A'}</span>
                </td>
                <td className={`px-6 py-4 font-bold w-1/3 ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{b.nama_barang}</td>
                <td className={`px-6 py-4 text-sm whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{b.satuan}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center space-x-3">
                    <button onClick={() => openEditModal(b)} className={`transition-colors p-1 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(b.id)} className={`transition-colors p-1 ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{editingId ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Nama Barang</label>
                  <input 
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/40' : 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-blue-500/20'}`}
                    placeholder="Masukkan nama barang"
                    value={formData.nama_barang}
                    onChange={(e) => setFormData({...formData, nama_barang: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Kategori Belanja</label>
                  <select 
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/40' : 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-blue-500/20'}`}
                    value={formData.kategori_belanja_id}
                    onChange={(e) => setFormData({...formData, kategori_belanja_id: e.target.value})}
                    required
                  >
                    {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama_kategori}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Satuan</label>
                  <input 
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/40' : 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-blue-500/20'}`}
                    placeholder="E.g: Pcs, Rim, Box"
                    value={formData.satuan}
                    onChange={(e) => setFormData({...formData, satuan: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Spesifikasi</label>
                <textarea 
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/40' : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-500/20'}`}
                  placeholder="Keterangan tambahan barang"
                  rows="3"
                  value={formData.spesifikasi}
                  onChange={(e) => setFormData({...formData, spesifikasi: e.target.value})}
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Batal</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center">
                  <Save className="w-4 h-4 mr-2" /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
