import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MapDashboard from "../components/MapDashboard";
import {
  FaBaby,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartLine,
  FaUserFriends,
  FaChartArea,
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

  // State BARU untuk mengatur mode peta di Dashboard
  const [modePeta, setModePeta] = useState("balita");

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
        `${import.meta.env.VITE_API_BASE_URL}/get_dashboard_stats.php`,
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-800">DASHBOARD UTAMA</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="text-center p-4 text-gray-500 font-bold animate-pulse">
              Memuat data analitik sistem...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6 border-l-4 border-l-blue-500 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-500 rounded-lg text-2xl">
                    <FaBaby />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                      Total Anak Terdata
                    </p>
                    <h3 className="text-2xl font-black text-gray-800">
                      {stats.total_anak}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Kartu 2: Stunting (Merah) */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 border-l-4 border-l-red-500 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-500 rounded-lg text-2xl">
                    <FaExclamationTriangle />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                      Kasus Stunting
                    </p>
                    <h3 className="text-2xl font-black text-gray-800">
                      {stats.total_stunting}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Kartu 3: Pra-stunting (Kuning) */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 border-l-4 border-l-yellow-500 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-50 text-yellow-500 rounded-lg text-2xl">
                    <FaChartLine />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                      Pra-stunting (Waspada)
                    </p>
                    <h3 className="text-2xl font-black text-gray-800">
                      {stats.total_prastunting}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Kartu 4: Normal (Hijau) */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 border-l-4 border-l-green-500 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 text-green-500 rounded-lg text-2xl">
                    <FaCheckCircle />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                      Gizi Normal
                    </p>
                    <h3 className="text-2xl font-black text-gray-800">
                      {stats.total_normal}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              BAGIAN PETA SPASIAL DENGAN TOMBOL TOGGLE 
              ========================================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            {/* Header Kartu Peta */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">
                  {modePeta === "balita"
                    ? "Peta Sebaran Kasus Balita"
                    : "Peta Kerentanan Wilayah (ML)"}
                </h3>
                <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Live
                  </span>
                </div>
              </div>

              {/* Tombol Toggle Flat Design */}
              <div className="flex bg-gray-200 p-1 rounded-lg border border-gray-300">
                <button
                  onClick={() => setModePeta("balita")}
                  className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    modePeta === "balita"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FaUserFriends /> Mikro (Titik)
                </button>
                <button
                  onClick={() => setModePeta("kerentanan")}
                  className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    modePeta === "kerentanan"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FaChartArea /> Makro (Poligon ML)
                </button>
              </div>
            </div>

            {/* Area Peta */}
            <div className="w-full h-[480px] relative z-0 bg-gray-50">
              <MapDashboard mode={modePeta} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
