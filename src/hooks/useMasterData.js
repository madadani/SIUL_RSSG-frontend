import { useMemo } from 'react';
import useDataStore from '../store/dataStore';

/**
 * Hook to provide easy access and filtered master data
 */
export function useMasterData() {
  const { kategoriList, barangList, allUsers } = useDataStore();

  const pptkUsers = useMemo(() => allUsers.filter(u => u.role === 'pptk'), [allUsers]);
  const ppkomUsers = useMemo(() => allUsers.filter(u => u.role === 'ppkom'), [allUsers]);
  const ppUsers = useMemo(() => allUsers.filter(u => u.role === 'pp'), [allUsers]);

  const getKategoriName = (id) => kategoriList.find(k => k.id === id)?.nama_kategori || 'N/A';

  return {
    kategoriList,
    barangList,
    pptkUsers,
    ppkomUsers,
    ppUsers,
    getKategoriName
  };
}
