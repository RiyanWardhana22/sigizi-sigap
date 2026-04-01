import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaChild,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartLine,
} from "react-icons/fa";
import MapDashboard from "../components/MapDashboard";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user)
    return <div className="p-8 text-center text-gray-600">Memuat data...</div>;

  return (
    <div className="flex min-h-screen bg-sigizi-bg">
      {/* Sidebar Kiri */}
      <Sidebar handleLogout={handleLogout} />

      {/* Konten Utama Kanan */}
      <div className="flex-1 flex flex-col">
        {/* Header (Top Bar) */}
        <header className="bg-white shadow px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Ringkasan Sistem</h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sigizi-light-green flex items-center justify-center text-white font-bold">
              {user.nama_lengkap.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">
                {user.nama_lengkap}
              </p>
              <p className="text-xs text-gray-500 uppercase">
                {user.role.replace("_", " ")}
              </p>
            </div>
          </div>
        </header>

        {/* Area Konten */}
        <main className="p-8 overflow-y-auto">
          {/* Ucapan Selamat Datang */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border-l-4 border-sigizi-green">
            <h2 className="text-2xl font-bold text-gray-800">
              Selamat Datang, {user.nama_lengkap}!
            </h2>
            <p className="text-gray-600 mt-1">
              Berikut adalah pemantauan data gizi anak di Sumatera Utara saat
              ini.
            </p>
          </div>

          {/* Kartu Statistik (Data Dummy sementara) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Anak Terdata"
              value="125.982"
              icon={<FaChild />}
              color="bg-blue-500"
            />
            <StatCard
              title="Kasus Stunting"
              value="8.760"
              icon={<FaExclamationTriangle />}
              color="bg-red-500"
            />
            <StatCard
              title="Gizi Normal"
              value="110.500"
              icon={<FaCheckCircle />}
              color="bg-green-500"
            />
            <StatCard
              title="Tren Kenaikan"
              value="+12%"
              icon={<FaChartLine />}
              color="bg-orange-500"
            />
          </div>

          {/* PETA SPASIAL WEB GIS */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Peta Sebaran Kerentanan Gizi Sumatera Utara
              </h3>
              <span className="bg-sigizi-light-green text-white text-xs px-3 py-1 rounded-full">
                Live Data
              </span>
            </div>
            <MapDashboard />
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border border-gray-100">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
