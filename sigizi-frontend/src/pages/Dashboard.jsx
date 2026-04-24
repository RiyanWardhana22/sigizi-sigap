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
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-800">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center z-10 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Selamat datang kembali, pantau statistik gizi secara real-time.
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-24">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4 text-[#0A2A20]">
              <div className="w-10 h-10 border-4 border-[#0A2A20] border-t-transparent rounded-full animate-spin"></div>
              <p className="font-medium text-sm animate-pulse text-slate-500">
                Memuat data analitik sistem...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fadeIn">
              {/* Kartu 1: Total Anak (Biru/Indigo) */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shrink-0">
                    <FaBaby />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Total Anak
                    </p>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-800">
                  {stats.total_anak}
                </h3>
              </div>

              {/* Kartu 2: Stunting (Merah/Rose) */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shrink-0">
                    <FaExclamationTriangle />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Kasus Stunting
                    </p>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-800">
                  {stats.total_stunting}
                </h3>
              </div>

              {/* Kartu 3: Pra-stunting (Kuning/Amber) */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
                    <FaChartLine />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Pra-stunting
                    </p>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-800">
                  {stats.total_prastunting}
                </h3>
              </div>

              {/* Kartu 4: Normal (Hijau/Emerald) */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                    <FaCheckCircle />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Gizi Normal
                    </p>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-800">
                  {stats.total_normal}
                </h3>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100 overflow-hidden flex flex-col animate-fadeIn">
            <div className="p-5 md:px-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-800 tracking-tight">
                  {modePeta === "balita"
                    ? "Peta Sebaran Kasus Balita"
                    : "Peta Kerentanan Wilayah (AI Model)"}
                </h3>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Live
                  </span>
                </div>
              </div>

              {/* Tombol Toggle - Modern Segmented Control */}
              <div className="flex bg-slate-100/80 p-1 rounded-xl w-full md:w-auto">
                <button
                  onClick={() => setModePeta("balita")}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    modePeta === "balita"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <FaUserFriends
                    className={modePeta === "balita" ? "text-emerald-500" : ""}
                  />{" "}
                  Mikro (Titik)
                </button>
                <button
                  onClick={() => setModePeta("kerentanan")}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    modePeta === "kerentanan"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <FaChartArea
                    className={
                      modePeta === "kerentanan" ? "text-amber-500" : ""
                    }
                  />{" "}
                  Makro (Area ML)
                </button>
              </div>
            </div>

            {/* Area Peta */}
            <div className="w-full h-[500px] relative z-0 bg-slate-50">
              <MapDashboard mode={modePeta} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
