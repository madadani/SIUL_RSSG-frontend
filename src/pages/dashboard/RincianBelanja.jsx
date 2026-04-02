import { useState } from 'react';
import { Search, Filter, RefreshCw, List, Plus, Edit, Trash2, X } from 'lucide-react';
import useDataStore from '../../store/dataStore';
import useUIStore from '../../store/ui';
import api from '../../api/client';
import { toast } from '../../components/ui/Toast';
import { confirmDialog } from '../../components/ui/ConfirmDialog';

export default function RincianBelanja() {
  const { isDarkMode } = useUIStore();
  const { detailAnggaranList, loading, fetchData, kategoriList, allUsers } = useDataStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('terbaru');
  
  const [showEditAnggaranModal, setShowEditAnggaranModal] = useState(false);
  const [editAnggaranForm, setEditAnggaranForm] = useState({ id: null, nama: '', category_id: '', nominal: '', pptk_id: '', ppkom_id: '', pp_id: '' });

  let filteredAnggaran = detailAnggaranList;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredAnggaran = filteredAnggaran.filter(item =>
      (item.nama || '').toLowerCase().includes(q) ||
      (item.kategori?.nama_kategori || '').toLowerCase().includes(q)
    );
  }

  filteredAnggaran = [...filteredAnggaran].sort((a, b) => {
    if (sortOrder === 'az') return (a.nama || '').localeCompare(b.nama || '');
    if (sortOrder === 'za') return (b.nama || '').localeCompare(a.nama || '');
    if (sortOrder === 'terlama') return (a.id || 0) - (b.id || 0);
    return (b.id || 0) - (a.id || 0);
  });

  const openEditAnggaranModal = (item) => {
    setEditAnggaranForm({
      id: item.id,
      nama: item.nama,
      category_id: item.category_id,
      nominal: item.nominal,
      pptk_id: item.pptk_id,
      ppkom_id: item.ppkom_id || '',
      pp_id: item.pp_id || ''
    });
    setShowEditAnggaranModal(true);
  };

  const handleSaveAnggaran = async () => {
    if (!editAnggaranForm.nama || !editAnggaranForm.category_id || !editAnggaranForm.nominal || !editAnggaranForm.pptk_id) {
      toast.warning("Harap lengkapi semua field wajib (*)");
      return;
    }
    try {
      const res = await api.put(`/pep/usulan/${editAnggaranForm.id}/detail_anggaran`, {
        ...editAnggaranForm,
        nominal: parseFloat(editAnggaranForm.nominal),
        pptk_id: parseInt(editAnggaranForm.pptk_id),
        ppkom_id: editAnggaranForm.ppkom_id ? parseInt(editAnggaranForm.ppkom_id) : null,
        pp_id: editAnggaranForm.pp_id ? parseInt(editAnggaranForm.pp_id) : null,
        category_id: parseInt(editAnggaranForm.category_id)
      });
      if (res.data.success) {
        toast.success("Data anggaran berhasil diperbarui!");
        setShowEditAnggaranModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Gagal update: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteAnggaran = async (id) => {
    const confirmed = await confirmDialog({
      title: 'Hapus Data Anggaran?',
      message: 'Data anggaran ini akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.',
      type: 'danger',
      confirmText: 'Ya, Hapus',
    });
    if (!confirmed) return;
    try {
      await api.delete(`/pep/usulan/${id}/detail_anggaran`);
      toast.success("Data berhasil dihapus!");
      fetchData();
    } catch (err) {
      toast.error("Gagal menghapus: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}>Rincian Belanja</h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Kelola detail kebutuhan anggaran belanja — {filteredAnggaran.length} data</p>
        </div>
      </div>

      <div className={`flex flex-col sm:flex-row gap-3 mb-6`}>
        <div className="relative flex-1">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Cari nama atau kategori..."
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
          <button className={`px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-colors bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center`}>
            <Plus className="w-4 h-4 mr-2"/> Tambah Data
          </button>
          <button onClick={fetchData} className={`p-2.5 rounded-xl border transition-colors ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-white border-gray-200 text-blue-600 hover:bg-gray-50'}`}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-gray-100'}`}>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-xs uppercase tracking-wider ${isDarkMode ? 'bg-[#0f172a]/50 text-slate-400 border-b border-slate-700/50' : 'bg-gray-50/50 text-gray-500'}`}>
                <th className="px-6 py-4 font-bold">No</th>
                <th className="px-6 py-4 font-bold">Nama Rincian</th>
                <th className="px-6 py-4 font-bold">Kategori</th>
                <th className="px-6 py-4 font-bold">Pihak Terkait</th>
                <th className="px-6 py-4 font-bold text-right">Anggaran</th>
                <th className="px-6 py-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Memuat data...</span>
                  </div>
                </td></tr>
              ) : filteredAnggaran.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <List className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-slate-600' : 'text-gray-200'}`} />
                    <span className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{searchQuery ? 'Tidak ditemukan data yang cocok' : 'Belum ada data rincian belanja'}</span>
                  </div>
                </td></tr>
              ) : filteredAnggaran.map((item, idx) => (
                <tr key={item.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}>
                  <td className={`px-6 py-4 font-medium text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{idx + 1}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{item.nama}</span>
                  </td>
                  <td className="px-6 py-4 min-w-[140px]">
                    <div className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider leading-relaxed border shadow-sm inline-block max-w-[160px] ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                      {item.kategori?.nama_kategori || `ID ${item.category_id}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-3 min-w-[180px]">
                      {[
                        { label: 'PPTK', name: item.pptk_user?.nama },
                        { label: 'PPKOM', name: item.ppkom_user?.nama },
                        { label: 'PP', name: item.pp_user?.nama }
                      ].filter(p => p.name).map((p, i) => (
                        <div key={i} className="flex gap-2 items-start leading-tight">
                          <span className={`w-12 flex-shrink-0 text-[10px] font-black uppercase tracking-tighter mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{p.label}:</span>
                          <span className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-right text-sm font-bold whitespace-nowrap min-w-[140px] ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
                    Rp {item.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <button onClick={() => openEditAnggaranModal(item)} className="text-blue-500 hover:text-blue-400 transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteAnggaran(item.id)} className="text-red-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEditAnggaranModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-100 bg-gray-50/50'}`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Edit Rincian Belanja</h3>
              <button onClick={() => setShowEditAnggaranModal(false)} className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Nama Rincian (Barang/Jasa) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editAnggaranForm.nama}
                  onChange={(e) => setEditAnggaranForm({...editAnggaranForm, nama: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500'}`}
                  placeholder="Contoh: Belanja Alat Listrik dan Elektronik"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editAnggaranForm.category_id}
                    onChange={(e) => setEditAnggaranForm({...editAnggaranForm, category_id: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold transition-all outline-none appearance-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500'}`}
                  >
                    <option value="">Pilih Kategori</option>
                    {kategoriList.map(cat => <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>)}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Anggaran (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={editAnggaranForm.nominal}
                    onChange={(e) => setEditAnggaranForm({...editAnggaranForm, nominal: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold transition-all outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500'}`}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Pejabat PPTK <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editAnggaranForm.pptk_id}
                    onChange={(e) => setEditAnggaranForm({...editAnggaranForm, pptk_id: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold transition-all outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500'}`}
                  >
                    <option value="">Pilih PPTK</option>
                    {allUsers.filter(u => u.role === 'pptk').map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Pejabat PPKOM <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editAnggaranForm.ppkom_id}
                    onChange={(e) => setEditAnggaranForm({...editAnggaranForm, ppkom_id: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold transition-all outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500'}`}
                  >
                    <option value="">Pilih PPKOM</option>
                    {allUsers.filter(u => u.role === 'ppkom').map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Pejabat PP <span className="text-red-500">*</span>
                </label>
                <select
                  value={editAnggaranForm.pp_id}
                  onChange={(e) => setEditAnggaranForm({...editAnggaranForm, pp_id: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold transition-all outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500'}`}
                >
                  <option value="">Pilih Pejabat Pengadaan</option>
                  {allUsers.filter(u => u.role === 'pp').map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
                </select>
              </div>
            </div>

            <div className={`px-6 py-4 flex items-center justify-end space-x-3 ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50/50'}`}>
              <button onClick={() => setEditAnggaranForm({ id: editAnggaranForm.id, nama: '', category_id: '', nominal: '', pptk_id: '', ppkom_id: '', pp_id: '' })} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${isDarkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                Reset
              </button>
              <button 
                onClick={handleSaveAnggaran}
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
