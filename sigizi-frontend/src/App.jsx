// sigizi-frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnakProvider } from "./contexts/AnakContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import InputDataWilayah from './pages/InputDataWilayah';
import DataAnak from "./pages/DataAnak";
import VerifikasiData from "./pages/VerifikasiData";
import LaporanPemangku from "./pages/LaporanPemangku";
import PetaSpasial from "./pages/PetaSpasial";

// Import halaman untuk Orang Tua
import OrangTuaDashboard from "./pages/orangtua/OrangTuaDashboard";
import OrangTuaDataAnak from "./pages/orangtua/OrangTuaDataAnak";
import OrangTuaPemantauanGizi from "./pages/orangtua/OrangTuaPemantauanGizi";
import OrangTuaPengaturan from "./pages/orangtua/OrangTuaPengaturan";

function App() {
  return (
    <BrowserRouter>
      <AnakProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Routes untuk Super Admin & Dinas Kesehatan */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/peta" element={<PetaSpasial />} />
          <Route path="/dashboard/users" element={<Users />} />
          <Route path="/input-wilayah" element={<InputDataWilayah />} />
          <Route path="/dashboard/anak" element={<DataAnak />} />
          <Route path="/dashboard/verifikasi" element={<VerifikasiData />} />
          <Route path="/dashboard/laporan" element={<LaporanPemangku />} />
          
          {/* Routes untuk Orang Tua (juga bisa diakses Super Admin) */}
          <Route path="/orangtua/dashboard" element={<OrangTuaDashboard />} />
          <Route path="/orangtua/data-anak" element={<OrangTuaDataAnak />} />
          <Route path="/orangtua/pemantauan-gizi" element={<OrangTuaPemantauanGizi />} />
          <Route path="/orangtua/pengaturan" element={<OrangTuaPengaturan />} />
        </Routes>
      </AnakProvider>
    </BrowserRouter>
  );
}

export default App;
