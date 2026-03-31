import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, FileSearch, Info, Sun, Moon, Search, Filter, Eye, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

export default function PublicPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama_pengusul: '',
    no_hp: '',
    unit_ruangan: '',
    nama_usulan: '',
    keterangan: '',
    jumlah: '',
    satuan: '',
    kegentingan: '',
    tingkat_kepentingan: '',
    foto_barang: null
  });
  const [success, setSuccess] = useState(false);
  const [ticketKode, setTicketKode] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('formulir'); // 'formulir' | 'riwayat'
  
  // States for Riwayat List
  const [usulanList, setUsulanList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // States for Detail View (reused)
  const [searchKode, setSearchKode] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [usulanDetail, setUsulanDetail] = useState(null);
  const [usulanRiwayat, setUsulanRiwayat] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Autocomplete Master Data
  const [masterBarangList, setMasterBarangList] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchMasterBarang = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/v1/master-barang');
        if (res.data.success) {
          setMasterBarangList(res.data.data);
        }
      } catch (err) {
        console.error("Gagal load master barang", err);
      }
    };
    fetchMasterBarang();
  }, []);

  useEffect(() => {
    if (activeTab === 'riwayat' && !usulanDetail) {
      fetchUsulanList();
    }
  }, [activeTab, page, limit, searchQuery, usulanDetail]);

  const fetchUsulanList = async () => {
    setListLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/usulan?page=${page}&limit=${limit}&search=${searchQuery}`);
      if (res.data.success) {
        setUsulanList(res.data.data);
        setTotalData(res.data.meta.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          payload.append(key, formData[key]);
        }
      });

      const res = await axios.post('http://localhost:8080/api/v1/usulan', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        // Reset formulir
        setFormData({ 
          nama_pengusul: '', no_hp: '', unit_ruangan: '', nama_usulan: '', 
          keterangan: '', jumlah: '', satuan: '', kegentingan: '', tingkat_kepentingan: '', foto_barang: null 
        });
        
        // Arahkan langsung ke History Detail
        setActiveTab('riwayat');
        handleViewDetail(res.data.data.nomor_tiket);
      }
    } catch (err) {
      console.error("Submission error:", err);
      const msg = err.response?.data?.message || "Gagal mengirim usulan, silakan periksa koneksi atau kelengkapan data.";
      const detail = err.response?.data?.details || "";
      alert(`${msg}\n${detail}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, foto_barang: e.target.files[0] });
    }
  };

  const handleViewDetail = async (nomor_tiket) => {
    setSearchLoading(true);
    setSearchError('');
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/usulan/${nomor_tiket}`);
      if (res.data.success) {
        setUsulanDetail(res.data.data.usulan);
        setUsulanRiwayat(res.data.data.riwayat || []);
      }
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Usulan tidak ditemukan.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Helper untuk format tanggal
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className={`min-h-screen flex flex-col relative font-sans overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-slate-200' : 'bg-gradient-to-tr from-blue-50 via-emerald-50 to-orange-50'}`}>
      {/* Dynamic Background Elements */}
      <div className={`absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 blur-3xl rounded-full transition-opacity ${darkMode ? 'bg-amber-900/10' : 'bg-orange-200/20'}`}></div>
      <div className={`absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 blur-3xl rounded-full transition-opacity ${darkMode ? 'bg-blue-900/10' : 'bg-blue-200/20'}`}></div>
      
      {/* Header / Navbar Public */}
      <header className={`backdrop-blur-md shadow-sm border-b sticky top-0 z-10 w-full py-3 px-6 md:px-12 flex flex-col md:flex-row md:justify-between items-center transition-colors ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/80 border-gray-100'}`}>
        <div className="flex items-center w-full md:w-auto justify-between mb-4 md:mb-0">
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Logo RS" 
              className="h-10 w-auto mr-3" 
              fetchpriority="high"
              decoding="async"
            />
            <h1 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>SIUL PBJ</h1>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
          {/* Tab Switcher in Header */}
          <div className={`p-1 rounded-lg border inline-flex shadow-sm transition-colors w-full md:w-auto ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100/80 border-gray-200'}`}>
            <button
              onClick={() => setActiveTab('formulir')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-md font-bold text-sm transition-all ${
                activeTab === 'formulir' 
                  ? (darkMode ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-600 shadow-sm')
                  : (darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50')
              }`}
            >
              <div className="flex items-center justify-center">
                <Send className="w-4 h-4 mr-2 hidden md:block" /> Formulir
              </div>
            </button>
            <button
              onClick={() => setActiveTab('riwayat')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-md font-bold text-sm transition-all ${
                activeTab === 'riwayat' 
                  ? (darkMode ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-600 shadow-sm')
                  : (darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50')
              }`}
            >
              <div className="flex items-center justify-center">
                <FileSearch className="w-4 h-4 mr-2 hidden md:block" /> Riwayat
              </div>
            </button>
          </div>

          <div className="flex items-center justify-end space-x-2 w-full md:w-auto">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors border ${darkMode ? 'bg-slate-800 border-slate-700 text-yellow-500 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Login Button */}
            <button
              onClick={() => navigate('/login')}
              className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors border ${darkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'}`}
            >
              Login
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-6 md:py-8 w-full">
        <div className="text-center mb-8 relative">
          <h2 className={`text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Layanan Pengusulan <br />
            <span className="bg-gradient-to-r from-blue-500 via-emerald-400 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">Barang & Jasa</span>
          </h2>
          <p className={`text-xl font-bold max-w-2xl mx-auto leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Sistem pengajuan cepat, transparan, dan terintegrasi untuk kebutuhan internal dan pelayanan publik terpadu.
          </p>
        </div>

        {/* Content Area */}
        <div className="flex justify-center w-full">

          {/* Form Usulan */}
          {activeTab === 'formulir' && (
          <div className={`rounded-2xl shadow-2xl border p-8 md:p-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ${darkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100'}`}>
            <h3 className={`text-3xl font-bold mb-8 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Send className="w-8 h-8 mr-3 text-blue-500" />
              Formulir Usulan
            </h3>

            {success ? (
              <div className={`rounded-xl p-8 text-center border ${darkMode ? 'bg-green-900/20 border-green-900' : 'bg-green-50 border-green-200'}`}>
                <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <img src="/logo.png" className="h-full w-auto object-contain" alt="Success" />
                </div>
                <h4 className={`text-xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-green-800'}`}>Usulan Berhasil Dikirim!</h4>
                <p className={`font-semibold mb-6 ${darkMode ? 'text-green-500' : 'text-green-700'}`}>Nomor tiket Anda:</p>
                <div className={`border-2 rounded-lg py-3 px-6 text-3xl font-extrabold inline-block tracking-widest mb-6 ${darkMode ? 'bg-slate-900 border-green-500 text-white' : 'bg-white border-green-300 text-slate-800'}`}>
                  {ticketKode}
                </div>
                <p className={`text-sm font-semibold mb-6 flex justify-center items-center ${darkMode ? 'text-green-500' : 'text-green-600'}`}>
                  <Info className="w-4 h-4 mr-1" /> Harap simpan nomor tiket ini untuk melacak status usulan.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Ajukan Usulan Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-left w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Nama Lengkap <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="nama_pengusul"
                      required
                      value={formData.nama_pengusul}
                      onChange={handleChange}
                      className={`w-full rounded-lg border p-3 font-semibold focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>No. HP <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="no_hp"
                      required
                      value={formData.no_hp}
                      onChange={handleChange}
                      className={`w-full rounded-lg border p-3 font-semibold focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Unit / Ruangan <span className="text-gray-400 text-xs font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    name="unit_ruangan"
                    value={formData.unit_ruangan}
                    onChange={handleChange}
                    className={`w-full rounded-lg border p-3 font-semibold focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div className="relative">
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Nama Barang <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="nama_usulan"
                    required
                    value={formData.nama_usulan}
                    onChange={handleChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    autoComplete="off"
                    className={`w-full rounded-lg border p-3 font-semibold focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  />
                  {/* Dropdown Suggestions */}
                  {showSuggestions && formData.nama_usulan.length > 0 && (
                    <ul className={`absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-lg shadow-xl border scrollbar-thin scrollbar-thumb-gray-400 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                      {masterBarangList
                        .filter(item => item.nama_barang.toLowerCase().includes(formData.nama_usulan.toLowerCase()))
                        .sort((a, b) => a.nama_barang.localeCompare(b.nama_barang))
                        .map((item) => (
                          <li
                            key={item.id}
                            onMouseDown={(e) => {
                              e.preventDefault(); // Mencegah onBlur input
                              setFormData({ 
                                ...formData, 
                                nama_usulan: item.nama_barang, 
                                satuan: item.satuan || formData.satuan 
                              });
                              setShowSuggestions(false);
                            }}
                            className={`px-4 py-3 cursor-pointer text-sm font-semibold transition-colors border-b last:border-0 ${darkMode ? 'text-slate-200 hover:bg-slate-700 border-slate-700' : 'text-gray-700 hover:bg-slate-50 border-gray-100'}`}
                          >
                            {item.nama_barang}
                          </li>
                        ))}
                      {masterBarangList.filter(item => item.nama_barang.toLowerCase().includes(formData.nama_usulan.toLowerCase())).length === 0 && (
                        <li className={`px-4 py-3 text-sm font-semibold italic ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          Lanjut ketik / enter untuk usulan baru...
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Spesifikasi / Keterangan Barang <span className="text-gray-400 text-xs font-normal">(Opsional)</span>
                  </label>
                  <textarea
                    name="keterangan"
                    rows="4"
                    value={formData.keterangan}
                    onChange={handleChange}
                    className={`w-full rounded-lg border p-3 font-semibold focus:ring-blue-500 focus:border-blue-500 resize-y ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Jumlah <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="jumlah"
                      required
                      min="1"
                      value={formData.jumlah}
                      onChange={handleChange}
                      className={`w-full rounded-lg border p-3 font-semibold focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Satuan <span className="text-gray-400 text-xs font-normal">(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      name="satuan"
                      value={formData.satuan}
                      onChange={handleChange}
                      className={`w-full rounded-lg border p-3 font-semibold focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Kegentingan <span className="text-red-500">*</span></label>
                    <select
                      name="kegentingan"
                      required
                      value={formData.kegentingan}
                      onChange={handleChange}
                      className={`w-full rounded-lg border p-3 font-semibold focus:ring-blue-500 focus:border-blue-500 appearance-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                    >
                      <option value="" disabled>Pilih kegentingan...</option>
                      <option value="Sangat Genting">🔴 Sangat Genting</option>
                      <option value="Genting">🟠 Genting</option>
                      <option value="Biasa">⚪ Biasa</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Kepentingan <span className="text-red-500">*</span></label>
                    <select
                      name="tingkat_kepentingan"
                      required
                      value={formData.tingkat_kepentingan}
                      onChange={handleChange}
                      className={`w-full rounded-lg border p-3 font-semibold focus:ring-blue-500 focus:border-blue-500 appearance-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                    >
                      <option value="" disabled>Pilih kepentingan...</option>
                      <option value="Sangat Penting">🔴 Sangat Penting (Prioritas Tinggi)</option>
                      <option value="Penting">🟠 Penting</option>
                      <option value="Biasa">⚪ Biasa (Reguler)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Foto Barang <span className="text-gray-400 text-xs font-normal">(Opsional)</span>
                  </label>
                  <div className={`relative flex items-center w-full rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300 text-slate-800'}`}>
                     <label className={`cursor-pointer absolute left-0 h-full px-4 rounded-l-lg flex items-center font-bold text-sm transition-colors border-r ${darkMode ? 'bg-slate-100 text-slate-900 border-slate-600 hover:bg-white' : 'bg-white border-gray-300 hover:bg-gray-100 text-blue-600 shadow-sm'}`}>
                        Telusuri...
                        <input
                           type="file"
                           name="foto_barang"
                           className="hidden"
                           accept="image/jpeg,image/png,image/pdf"
                           onChange={handleFileChange}
                        />
                     </label>
                     <span className={`pl-32 py-3 px-4 font-semibold text-sm ${!formData.foto_barang ? (darkMode ? 'text-slate-400' : 'text-slate-500') : ''}`}>
                       {formData.foto_barang ? formData.foto_barang.name : 'Tidak ada berkas dipilih.'}
                     </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-medium">Format: JPG, PNG, PDF. Maks 2MB.</p>
                </div>

                <div className="pt-4 border-t border-slate-200/50 mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-colors flex justify-center items-center disabled:bg-blue-400 text-lg tracking-wide"
                  >
                    {loading ? "Mengirim Data..." : "Kirim Usulan"}
                  </button>
                </div>
              </form>
            )}
          </div>
          )}

          {/* Cek Status Lacak (Tabel Riwayat Publik) */}
          {activeTab === 'riwayat' && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">
            {!usulanDetail ? (
              // Tampilan Tabel
              <div className={`rounded-2xl shadow-xl border w-full overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className={`p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
                  <h3 className={`text-xl font-bold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <FileSearch className="w-6 h-6 mr-3 text-blue-500" />
                    Riwayat Usulan
                  </h3>
                  <div className="flex w-full md:w-auto gap-2">
                    <button className={`p-2.5 border rounded-lg transition-colors flex items-center justify-center shrink-0 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      <Filter className="w-5 h-5 text-slate-400" />
                    </button>
                    <div className="relative w-full md:w-64">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Cari Nama Barang / Pemohon..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`${darkMode ? 'bg-slate-800/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'} border-b uppercase text-xs font-bold tracking-wider`}>
                        <th className="p-4 w-12 text-center">No.</th>
                        <th className="p-4 min-w-[200px]">Nama Barang</th>
                        <th className="p-4">Pemohon</th>
                        <th className="p-4">Jumlah</th>
                        <th className="p-4">Tanggal</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-200'}`}>
                      {listLoading ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-500 font-semibold animate-pulse">Memuat data...</td>
                        </tr>
                      ) : usulanList.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-500 font-semibold">Tidak ada data usulan ditemukan.</td>
                        </tr>
                      ) : (
                        usulanList.map((item, index) => (
                          <tr key={item.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/40 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}>
                            <td className="p-4 text-center text-sm font-semibold text-slate-500">
                              {(page - 1) * limit + index + 1}
                            </td>
                            <td className="p-4">
                              <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.nama_usulan}</p>
                              <p className="text-xs font-medium text-slate-400 mt-0.5 uppercase tracking-wide">
                                {item.kategori ? item.kategori.nama_kategori : 'KATEGORI LAINNYA'}
                              </p>
                            </td>
                            <td className="p-4 text-sm font-bold">
                              {item.nama_pengusul}
                            </td>
                            <td className="p-4 text-sm font-semibold">
                              {item.jumlah} <span className="text-xs font-normal text-slate-400 ml-1">{item.satuan}</span>
                            </td>
                            <td className="p-4 text-sm font-semibold">
                              {new Date(item.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block shadow-sm ${
                                item.status_kode === 'REALISASI_SELESAI' ? (darkMode?'bg-emerald-900/40 text-emerald-400 border border-emerald-800':'bg-emerald-100 text-emerald-700') :
                                item.status_kode === 'MENUNGGU_PEP' ? (darkMode?'bg-white/10 text-white border border-white/20':'bg-slate-800 text-white') :
                                item.status_kode === 'DIKEMBALIKAN_KE_PEP' ? (darkMode?'bg-red-900/40 text-red-400 border border-red-800':'bg-red-100 text-red-700') :
                                (darkMode?'bg-blue-900/40 text-blue-400 border border-blue-800':'bg-blue-100 text-blue-700')
                              }`}>
                                {item.status_kode.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button 
                                onClick={() => handleViewDetail(item.kode_tiket)}
                                className={`p-2 rounded-lg transition-colors shadow-sm border ${darkMode ? 'bg-blue-900/30 border-blue-800/50 text-blue-400 hover:bg-blue-600 hover:text-white' : 'bg-white border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300'}`}
                                title="Lihat Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Desktop & Mobile */}
                <div className={`p-4 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${darkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-gray-50/50'}`}>
                  <div className="flex items-center text-sm font-semibold text-slate-500">
                     Tampilkan
                     <select 
                       value={limit} 
                       onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                       className={`mx-2 rounded border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode?'bg-slate-800 border-slate-600 text-white':'bg-white border-slate-300'}`}
                     >
                       <option value="5">5</option>
                       <option value="10">10</option>
                       <option value="20">20</option>
                     </select>
                     per halaman
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={`p-2 border rounded-md transition-colors disabled:opacity-50 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-300 hover:bg-slate-50'}`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button className={`px-4 py-2 border rounded-md transition-colors font-bold ${darkMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                      {page}
                    </button>
                    <button 
                      onClick={() => setPage(p => p + 1)}
                      disabled={page * limit >= totalData}
                      className={`p-2 border rounded-md transition-colors disabled:opacity-50 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-300 hover:bg-slate-50'}`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-sm font-semibold text-slate-500">
                    Menampilkan {Math.min((page - 1) * limit + 1, totalData)} - {Math.min(page * limit, totalData)} dari {totalData} data
                  </div>
                </div>
              </div>
            ) : (
              // Tampilan Detail (Timeline)
              <div className={`rounded-2xl shadow-xl border p-8 w-full animate-in zoom-in-95 duration-500 ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
                
                {/* Back Button */}
                <div className="mb-6">
                  <button 
                    onClick={() => { setUsulanDetail(null); setUsulanRiwayat([]); fetchUsulanList(); }}
                    className={`flex items-center text-sm font-bold transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar
                  </button>
                </div>

                {searchLoading ? (
                   <div className="text-center p-12 text-slate-500 font-bold animate-pulse">Memuat detail lintasan...</div>
                ) : (
                  <>
                    <div className={`flex flex-col md:flex-row justify-between md:items-center border-b pb-6 mb-6 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                          {usulanDetail.kode_tiket}
                        </span>
                        <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{usulanDetail.nama_usulan}</h3>
                        <p className={`text-sm mt-1 font-semibold ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                           Pemohon: {usulanDetail.nama_pengusul} • Kategori: {usulanDetail.kategori?.nama_kategori || 'N/A'}
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0 text-left md:text-right">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm inline-block ${
                          usulanDetail.status_kode === 'REALISASI_SELESAI' ? 'bg-emerald-100 text-emerald-700' :
                          usulanDetail.status_kode === 'MENUNGGU_PEP' ? 'bg-slate-800 text-white' :
                          usulanDetail.status_kode === 'DIKEMBALIKAN_KE_PEP' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {usulanDetail.status_kode.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Timeline Data */}
                    <div className="relative">
                      <h4 className={`font-bold mb-6 text-lg tracking-wide ${darkMode ? 'text-white' : 'text-gray-800'}`}>Timeline Proses usulan</h4>
                      <div className={`absolute left-4 top-14 bottom-0 w-0.5 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                      <div className="space-y-6 relative">
                        {usulanRiwayat.map((r, idx) => (
                          <div key={r.id} className="flex relative items-start">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 mt-1 border-4 ${darkMode ? 'border-slate-900' : 'border-white'} ${idx === 0 ? 'bg-blue-500' : 'bg-slate-500'}`}>
                               <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-slate-900' : 'bg-white'}`}></div>
                            </div>
                            <div className={`ml-4 border rounded-xl p-4 flex-1 shadow-sm transition-all hover:shadow-md ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                              <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-800'}`}>{r.status_akhir.replace(/_/g, ' ')}</span>
                                <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{formatDate(r.created_at)}</span>
                              </div>
                              {r.catatan_alasan && (
                                <p className={`text-sm p-3 rounded-lg mt-3 font-semibold border leading-relaxed ${darkMode ? 'bg-slate-900 text-slate-300 border-slate-700' : 'bg-white text-gray-700 border-slate-200'}`}>
                                  "{r.catatan_alasan}"
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        {usulanRiwayat.length === 0 && (
                          <p className={`italic ml-10 font-medium ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>Belum ada riwayat proses tercatat.</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          )}
        </div>
      </main>

      {/* Sticky Footer Solution */}
      <footer className={`w-full py-4 text-center border-t mt-auto backdrop-blur-sm transition-colors ${darkMode ? 'bg-slate-950/40 border-slate-800 text-slate-600' : 'bg-white/40 border-gray-200/50 text-slate-500'}`}>
        <span className="text-[10px] uppercase tracking-widest font-black">SIUL PBJ © 2026 IT RSUD dr. Soeratno Gemolong</span>
      </footer>
    </div>
  );
}
