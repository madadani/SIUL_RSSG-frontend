import { useState } from 'react';
import api from '../api/client';
import useDataStore from '../store/dataStore';

/**
 * Custom Hook to handle usulan actions (disposisi, return, setuju, tolak, realisasi)
 */
export function useUsulanActions() {
  const [loadingAction, setLoadingAction] = useState(false);
  const fetchData = useDataStore(state => state.fetchData);

  const performAction = async (url, payload, successMsg) => {
    setLoadingAction(true);
    try {
      const res = await api.post(url, payload);
      if (res.data.success) {
        alert(successMsg || "Aksi berhasil dilakukan!");
        await fetchData();
        return true;
      }
    } catch (err) {
      alert("Gagal melakukan aksi: " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingAction(false);
    }
    return false;
  };

  const handleDisposisiPEP = (id, pptkId, catatan) => 
    performAction(`/pep/usulan/${id}/disposisi`, { pptk_user_id: parseInt(pptkId), catatan }, "Disposisi ke PPTK Berhasil!");

  const handleTeruskanPPTK = (id, catatan) => 
    performAction(`/pptk/usulan/${id}/disposisi`, { catatan }, "Berhasil diteruskan ke PPKOM!");

  const handleReturnPPTK = (id, alasan) => 
    performAction(`/pptk/usulan/${id}/return`, { alasan_return: alasan }, "Berhasil dikembalikan ke PEP!");

  const handleSetujuiPPKOM = (id, catatan) => 
    performAction(`/ppkom/usulan/${id}/setujui`, { catatan }, "Usulan disetujui, lanjut ke Pejabat Pengadaan!");

  const handleTolakPPKOM = (id, alasan) => 
    performAction(`/ppkom/usulan/${id}/tolak`, { alasan_tolak: alasan }, "Usulan ditolak ke PPTK.");

  const handleRealisasiPP = (id, form) => 
    performAction(`/pp/usulan/${id}/realisasi`, { ...form, harga_final: parseFloat(form.harga_final) }, "Realisasi pengadaan berhasil dicatat!");

  return {
    loadingAction,
    handleDisposisiPEP,
    handleTeruskanPPTK,
    handleReturnPPTK,
    handleSetujuiPPKOM,
    handleTolakPPKOM,
    handleRealisasiPP
  };
}
