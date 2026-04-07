import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MapDashboard from "../components/MapDashboard";
import {
  FaBaby,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartLine,
} from "react-icons/fa";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total_anak: 0,
    total_stunting: 0,
    total_prastunting: 0,
    total_normal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
    } else {
      setUser(JSON.parse(userData));
      fetchStats();
    }
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        "http://localhost/sigizi-sigap/sigizi-backend/get_dashboard_stats.php",
      );
      const data = await response.json();
      if (data.status === "success") {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil statistik:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) return null;
  return (
    <div className="flex min-h-screen bg-sigizi-bg">
      <Sidebar handleLogout={handleLogout} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Dashboard Utama</h1>
            <p className="text-sm text-gray-500">
              Selamat datang kembali,{" "}
              <span className="font-semibold text-sigizi-green">
                {user.nama_lengkap}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-sigizi-light-green text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
              {user.role.replace("_", " ").toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="text-center p-4 text-gray-500">
              Memuat statistik sistem...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Kartu 1: Total Anak */}
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-500 rounded-lg text-2xl">
                    <FaBaby />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">
                      Total Anak Terdata
                    </p>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {stats.total_anak}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Kartu 2: Stunting (Merah) */}
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-500 rounded-lg text-2xl">
                    <FaExclamationTriangle />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">
                      Kasus Stunting
                    </p>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {stats.total_stunting}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Kartu 3: Pra-stunting (Kuning) */}
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-50 text-yellow-500 rounded-lg text-2xl">
                    <FaChartLine />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">
                      Pra-stunting (Waspada)
                    </p>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {stats.total_prastunting}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Kartu 4: Normal (Hijau) */}
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 text-green-500 rounded-lg text-2xl">
                    <FaCheckCircle />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">
                      Gizi Normal
                    </p>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {stats.total_normal}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Peta Spasial Web GIS */}
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
