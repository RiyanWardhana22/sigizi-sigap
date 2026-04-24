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

  // Load saved selection from localStorage (only for orang_tua)
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setCurrentUserRole(parsedUser.role);
      
      // Only restore selection for orang_tua role
      if (parsedUser.role === "orang_tua") {
        const savedAnakId = localStorage.getItem('selectedAnakId');
        const savedUserId = localStorage.getItem('currentUserId');
        if (savedAnakId && savedUserId === currentUserId?.toString()) {
          setSelectedAnakId(parseInt(savedAnakId));
        }
      }
    }
  }, [currentUserId]);

  // Save to localStorage when selection changes (only for orang_tua)
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
    setAnakList(list);
    setCurrentUserId(userId);
    setCurrentUserRole(userRole);
    
    // Only auto-select first anak for orang_tua role
    if (userRole === "orang_tua") {
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
      
      // Otherwise select first anak if available
      if (list.length > 0 && !selectedAnakId) {
        setSelectedAnakId(list[0].id);
        setSelectedAnakData(list[0]);
      }
    } else {
      // For super_admin, don't auto-select any anak
      setSelectedAnakId(null);
      setSelectedAnakData(null);
    }
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
      resetForSuperAdmin
    }}>
      {children}
    </AnakContext.Provider>
  );
}
