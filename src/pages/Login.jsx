import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/auth';
import { ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 shadow-inner">
            <ShieldCheck className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Login SIUL PBJ
          </h2>
          <p className="mt-2 text-center text-sm font-semibold text-gray-500">
            Sistem Informasi Usulan Layanan<br/>Pengadaan Barang dan Jasa
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold bg-gray-50"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="password">Password</label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold bg-gray-50"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-xl">
              <p className="text-sm font-bold text-red-700 leading-tight">{error}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:bg-blue-400"
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" /> Memproses...
                </span>
              ) : (
                'Masuk Sekarang'
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-10 text-center text-sm text-gray-500 font-bold">
        Sistem Integrasi © 2026<br/>
        <a href="/" className="text-blue-600 hover:text-blue-800 transition-colors inline-block mt-2 font-extrabold underline-offset-4 hover:underline">Akses Web Publik (Tanpa Login)</a>
      </div>
    </div>
  );
}
