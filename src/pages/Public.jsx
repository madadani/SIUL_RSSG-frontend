import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, FileSearch, ShieldCheck, Info } from 'lucide-react';
import axios from 'axios';

export default function PublicPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama_usulan: '',
    kategori_belanja_id: '1',
    tingkat_kepentingan: 'Biasa',
    keterangan: ''
  });
  const [success, setSuccess] = useState(false);
  const [ticketKode, setTicketKode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Endpoint public: simulai pembuatan JSON request 
      const res = await axios.post('http://localhost:8080/api/v1/usulan', {
        nama_usulan: formData.nama_usulan,
        kategori_belanja_id: parseInt(formData.kategori_belanja_id),
        tingkat_kepentingan: formData.tingkat_kepentingan,
        keterangan: formData.keterangan
      });

      if (res.data.success) {
        setSuccess(true);
        setTicketKode(res.data.data.nomor_tiket);
        setFormData({ nama_usulan: '', kategori_belanja_id: '1', tingkat_kepentingan: 'Biasa', keterangan: '' });
      }
    } catch (err) {
      alert("Gagal mengirim usulan, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans">
      {/* Header / Navbar Public */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 w-full py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">SIUL PBJ</h1>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors border border-slate-300"
        >
          Masuk Pegawai (Admin)
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Layanan Pengusulan <span className="text-blue-600">Barang & Jasa</span>
          </h2>
          <p className="text-lg text-slate-600 font-semibold max-w-2xl mx-auto">
            Sistem pengajuan cepat, transparan, dan terintegrasi untuk kebutuhan internal dan pelayanan publik terpadu.
          </p>
        </div>

        {/* Content Tabs Toggles (Mocking tab effect) */}
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          
          {/* Card Kiri: Form Usulan */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 w-full md:w-2/3">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Send className="w-6 h-6 mr-2 text-blue-600" />
              Buat Usulan Baru
            </h3>
            
            {success ? (
              <div className="bg-green-50 rounded-xl p-8 text-center border border-green-200">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-green-800 mb-2">Usulan Berhasil Dikirim!</h4>
                <p className="text-green-700 font-semibold mb-6">Nomor tiket Anda:</p>
                <div className="bg-white border-2 border-green-300 rounded-lg py-3 px-6 text-3xl font-extrabold text-slate-800 inline-block tracking-widest mb-6">
                  {ticketKode}
                </div>
                <p className="text-sm font-semibold text-green-600 mb-6 flex justify-center items-center">
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
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Barang / Jasa *</label>
                  <input 
                    type="text" 
                    name="nama_usulan"
                    required
                    value={formData.nama_usulan}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 bg-gray-50 border p-3 font-semibold focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contoh: Kertas HVS A4 untuk Ruang Rapat" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori Belanja *</label>
                    <select 
                      name="kategori_belanja_id"
                      value={formData.kategori_belanja_id}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 bg-gray-50 border p-3 font-semibold focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    >
                      <option value="1">Alat Tulis Kantor (ATK)</option>
                      <option value="2">Pemeliharaan Gedung</option>
                      <option value="3">Jasa Konsultansi</option>
                      <option value="4">Peralatan Elektronik</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tingkat Kepentingan *</label>
                    <select 
                      name="tingkat_kepentingan"
                      value={formData.tingkat_kepentingan}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 bg-gray-50 border p-3 font-semibold focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    >
                      <option className="font-semibold text-red-600" value="Sangat Penting">🔴 Sangat Penting (Mendesak)</option>
                      <option className="font-semibold text-orange-500" value="Penting">🟠 Penting</option>
                      <option className="font-semibold text-slate-800" value="Biasa">⚪ Biasa (Reguler)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Keterangan / Spesifikasi</label>
                  <textarea 
                    name="keterangan"
                    rows="3" 
                    value={formData.keterangan}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 bg-gray-50 border p-3 font-semibold focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tuliskan alasan / rincian tambahan jika ada..."
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-center items-center disabled:bg-blue-300"
                  >
                   {loading ? "Mengirim..." : "Kirim Usulan"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Card Kanan: Cek Status Lacak */}
          <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-8 w-full md:w-1/3 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <FileSearch className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lacak Status Usulan</h3>
            <p className="text-slate-400 font-semibold text-sm mb-6">
              Sudah pernah mengajukan? Masukkan kode tracking Anda di bawah ini untuk melihat progres *real-time*.
            </p>
            <div className="w-full space-y-3">
              <input 
                type="text" 
                className="w-full rounded-lg border-slate-700 bg-slate-800 border p-3 font-bold text-center text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex. USL-2026-001X" 
              />
              <button className="w-full border-2 border-blue-500 text-blue-400 font-bold py-3 hover:bg-blue-500 hover:text-white rounded-lg transition-colors">
                Cek Tiket Pelacakan
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Basic */}
      <footer className="w-full py-8 text-center text-slate-500 font-semibold border-t border-gray-200 mt-12 bg-white">
        SIUL PBJ © 2026 — Modul Pengadaan Elektronik (Dummy View)
      </footer>
    </div>
  );
}
