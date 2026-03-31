export const getStatusBadgeClass = (kode) => {
  const map = {
    'MENUNGGU_PEP': 'bg-yellow-100 text-yellow-800',
    'DIDISPOSISI_PPTK': 'bg-blue-100 text-blue-700',
    'DIKEMBALIKAN_KE_PEP': 'bg-red-100 text-red-700',
    'GESER_TAHUN_DEPAN': 'bg-gray-200 text-gray-700',
    'DIDISPOSISI_PPKOM': 'bg-purple-100 text-purple-700',
    'DIDISPOSISI_PP': 'bg-indigo-100 text-indigo-700',
    'REALISASI_SELESAI': 'bg-green-100 text-green-700',
  };
  return map[kode] || 'bg-gray-100 text-gray-600';
};

export const formatStatus = (kode) => {
  const map = {
    'MENUNGGU_PEP': 'Menunggu PEP',
    'DIDISPOSISI_PPTK': 'Proses PPTK',
    'DIKEMBALIKAN_KE_PEP': 'Return PEP',
    'GESER_TAHUN_DEPAN': 'Tunda/Geser',
    'DIDISPOSISI_PPKOM': 'Proses PPKOM',
    'DIDISPOSISI_PP': 'Proses PP',
    'REALISASI_SELESAI': 'Selesai',
  };
  return map[kode] || (kode || 'N/A').replace(/_/g, ' ');
};

