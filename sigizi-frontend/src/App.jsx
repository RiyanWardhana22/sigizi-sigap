import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import InputDataWilayah from './pages/InputDataWilayah';
import DataAnak from "./pages/DataAnak";
import VerifikasiData from "./pages/VerifikasiData";
import LaporanPemangku from "./pages/LaporanPemangku";
import PetaSpasial from "./pages/PetaSpasial";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/peta" element={<PetaSpasial />} />
        <Route path="/dashboard/users" element={<Users />} />
        <Route path="/input-wilayah" element={<InputDataWilayah />} />
        <Route path="/dashboard/anak" element={<DataAnak />} />
        <Route path="/dashboard/verifikasi" element={<VerifikasiData />} />
        <Route path="/dashboard/laporan" element={<LaporanPemangku />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
