import { create } from 'zustand';
import api from '../api/client';
import useAuthStore from './auth';

const useDataStore = create((set, get) => ({
  usulanList: [],
  pptkUsers: [],
  ppkomUsers: [],
  ppUsers: [],
  allUsers: [],
  kategoriList: [],
  barangList: [],
  detailAnggaranList: [],
  loading: false,

  fetchData: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true });
    try {
      if (user.role === 'pep') {
        const [resU, resP, resA, resKat, resBarang, resDetailAnggaran] = await Promise.all([
          api.get('/pep/usulan'),
          api.get('/pep/master/users/pptk'),
          api.get('/pep/master/users/all'),
          api.get('/pep/master/kategori-belanja'),
          api.get('/pep/master/nama-barang'),
          api.get('/pep/usulan/detail-anggaran').catch(() => ({ data: { data: [] } }))
        ]);
        set({
          usulanList: resU.data.data || [],
          pptkUsers: resP.data.data || [],
          allUsers: resA.data.data || [],
          kategoriList: resKat.data.data || [],
          barangList: resBarang.data.data || [],
          detailAnggaranList: resDetailAnggaran.data.data || []
        });
      } else if (user.role === 'pptk') {
        const [resU, resPPKOM] = await Promise.all([
          api.get('/pptk/usulan'),
          api.get('/pptk/users/ppkom')
        ]);
        set({ usulanList: resU.data.data || [], ppkomUsers: resPPKOM.data.data || [] });
      } else if (user.role === 'ppkom') {
        const [resU, resPP] = await Promise.all([
          api.get('/ppkom/usulan'),
          api.get('/ppkom/users/pp')
        ]);
        set({ usulanList: resU.data.data || [], ppUsers: resPP.data.data || [] });
      } else if (user.role === 'pp') {
        const res = await api.get('/pp/usulan');
        set({ usulanList: res.data.data || [] });
      }
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      set({ loading: false });
    }
  }
}));

export default useDataStore;
