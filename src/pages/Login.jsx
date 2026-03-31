import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/auth';
import { Loader2, Eye, EyeOff } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-emerald-400 via-emerald-500 to-sky-500 relative overflow-hidden p-6 font-poppins">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateZ(0); }
          50% { transform: translateY(-15px) translateZ(0); }
        }
        .bubble {
          position: absolute;
          background: white;
          border-radius: 20%;
          animation: float 10s infinite ease-in-out;
          pointer-events: none;
          opacity: 0.1;
          will-change: transform;
        }
      `}</style>
      
      {/* Optimized Bubbles (Static properties, minimal movement) */}
      <div className="bubble w-20 h-20 top-20 left-10" style={{ animationDelay: '0s' }}></div>
      <div className="bubble w-32 h-32 bottom-20 left-1/4" style={{ animationDelay: '2s' }}></div>
      <div className="bubble w-16 h-16 top-40 right-[15%]" style={{ animationDelay: '4s' }}></div>
      <div className="bubble w-40 h-40 bottom-40 right-[5%]" style={{ animationDelay: '1s', opacity: 0.05 }}></div>

      <div className="max-w-md w-full space-y-8 bg-white/95 p-10 rounded-[40px] shadow-2xl border border-white/50 relative z-10 transition-all mb-8 mt-auto">
        <div>
          <div className="mx-auto flex h-20 w-auto items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Logo RS" 
              className="h-20 w-auto object-contain" 
              fetchpriority="high"
              decoding="async"
            />
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
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold bg-gray-50/50 backdrop-blur-sm"
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
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold bg-gray-50/50 backdrop-blur-sm"
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
      
      <div className="text-center text-sm text-gray-500 font-bold z-10 w-full px-4 mb-auto">
        SIUL PBJ © 2026 IT RSUD dr. Soeratno Gemolong<br/>
      </div>
    </div>
  );
}
