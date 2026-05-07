// sigizi-frontend/src/contexts/AnakContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AnakContext = createContext();

export function useAnak() {
  const context = useContext(AnakContext);
  if (!context) {
    throw new Error('useAnak must be used within AnakProvider');
  }
  return context;
}

export function AnakProvider({ children }) {
  const [selectedAnakId, setSelectedAnakId] = useState(null);
  const [selectedAnakData, setSelectedAnakData] = useState(null);
  const [anakList, setAnakList] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Load user role on mount only — jangan restore selectedAnak di sini,
  // biar updateAnakList yang handle setelah data anak berhasil di-fetch.
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setCurrentUserRole(parsedUser.role);
      setCurrentUserId(parsedUser.id);
    }
  }, []);

  // Simpan pilihan anak ke localStorage hanya untuk orang_tua
  useEffect(() => {
    if (selectedAnakId && currentUserId && currentUserRole === "orang_tua") {
      localStorage.setItem('selectedAnakId', selectedAnakId.toString());
      localStorage.setItem('currentUserId', currentUserId.toString());
    }
  }, [selectedAnakId, currentUserId, currentUserRole]);

  const updateSelectedAnak = (anakId, anakData, userId) => {
    setSelectedAnakId(anakId);
    setSelectedAnakData(anakData);
    if (userId) {
      setCurrentUserId(userId);
    }
  };

  const clearSelectedAnak = () => {
    setSelectedAnakId(null);
    setSelectedAnakData(null);
  };

  const updateAnakList = (list, userId, userRole) => {
    // FIX: Selalu reset state dulu sebelum menentukan pilihan baru.
    // Ini mencegah data anak user sebelumnya "bocor" ke user baru.
    setAnakList(list);
    setCurrentUserId(userId);
    setCurrentUserRole(userRole);
    setSelectedAnakId(null);
    setSelectedAnakData(null);

    if (userRole === "orang_tua") {
      // Coba restore pilihan anak yang tersimpan, tapi hanya jika userId cocok
      const savedAnakId = localStorage.getItem('selectedAnakId');
      const savedUserId = localStorage.getItem('currentUserId');

      if (savedAnakId && savedUserId === userId?.toString()) {
        const foundAnak = list.find(a => a.id === parseInt(savedAnakId));
        if (foundAnak) {
          setSelectedAnakId(parseInt(savedAnakId));
          setSelectedAnakData(foundAnak);
          return;
        }
      }

      // Jika tidak ada simpanan yang cocok, pilih anak pertama (jika ada)
      if (list.length > 0) {
        setSelectedAnakId(list[0].id);
        setSelectedAnakData(list[0]);
      }
      // Jika list kosong, state tetap null — tidak ada anak yang ditampilkan
    }
    // Untuk super_admin atau role lain: state sudah di-reset ke null di atas
  };

  // FIX: Fungsi logout yang bersih — hapus data anak dari localStorage
  // agar tidak bocor ke sesi/akun berikutnya.
  const handleLogoutCleanup = () => {
    setSelectedAnakId(null);
    setSelectedAnakData(null);
    setAnakList([]);
    setCurrentUserId(null);
    setCurrentUserRole(null);
    localStorage.removeItem('selectedAnakId');
    localStorage.removeItem('currentUserId');
  };

  const resetForSuperAdmin = () => {
    setSelectedAnakId(null);
    setSelectedAnakData(null);
    setAnakList([]);
  };

  return (
    <AnakContext.Provider value={{
      selectedAnakId,
      selectedAnakData,
      anakList,
      currentUserId,
      currentUserRole,
      updateSelectedAnak,
      clearSelectedAnak,
      updateAnakList,
      resetForSuperAdmin,
      handleLogoutCleanup,  // expose agar dipanggil saat logout
    }}>
      {children}
    </AnakContext.Provider>
  );
}