import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MapDashboard from "../components/MapDashboard";
import { FaMapMarkedAlt, FaUserFriends, FaChartArea } from "react-icons/fa";

export default function PetaSpasial() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [modePeta, setModePeta] = useState("balita");

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

  if (!user) return null;
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Bersih */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center gap-4 z-10 relative">
          <FaMapMarkedAlt className="text-2xl text-sigizi-green" />
          <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wider">
            Sistem Informasi Geografis (GIS)
          </h1>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col gap-6">
            
            {/* Control Panel: Pilihan Mode yang Desktop & Mobile Friendly */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setModePeta("balita")}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  modePeta === "balita"
                    ? "border-sigizi-green bg-white text-sigizi-green"
                    : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                }`}
              >
                <div className={`p-3 rounded-lg ${modePeta === "balita" ? "bg-sigizi-green text-white" : "bg-gray-200 text-gray-500"}`}>
                  <FaUserFriends className="text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase">Peta Sebaran Balita</h3>
                  <p className="text-xs opacity-80 font-medium">Data Mikro: Lokasi individu & status gizi anak</p>
                </div>
              </button>

              <button
                onClick={() => setModePeta("kerentanan")}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  modePeta === "kerentanan"
                    ? "border-blue-600 bg-white text-blue-600"
                    : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                }`}
              >
                <div className={`p-3 rounded-lg ${modePeta === "kerentanan" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                  <FaChartArea className="text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase">Peta Kerentanan Wilayah</h3>
                  <p className="text-xs opacity-80 font-medium">Data Makro: Prediksi Machine Learning per Kabupaten</p>
                </div>
              </button>
            </div>

            {/* Kontainer Peta */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-tighter">
                  {modePeta === "balita" ? "Visualisasi Titik Kasus" : "Visualisasi Poligon Risiko"}
                </h2>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase">Live Database</span>
                </div>
              </div>

              <div className="w-full h-[500px] z-0 relative">
                <MapDashboard mode={modePeta} />
              </div>

              {/* Legenda Pintar */}
              <div className="p-6 border-t border-gray-100 bg-white">
                <div className="flex flex-wrap gap-6 justify-center">
                  {modePeta === "balita" ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-xs font-bold text-gray-600">Gizi Normal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="text-xs font-bold text-gray-600">Pra-Stunting</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="text-xs font-bold text-gray-600">Stunting</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-2 rounded-sm bg-green-500 border border-green-600"></span>
                        <span className="text-xs font-bold text-gray-600">Risiko Rendah</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-2 rounded-sm bg-yellow-400 border border-yellow-500"></span>
                        <span className="text-xs font-bold text-gray-600">Risiko Sedang</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-2 rounded-sm bg-orange-500 border border-orange-600"></span>
                        <span className="text-xs font-bold text-gray-600">Risiko Tinggi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-2 rounded-sm bg-red-600 border border-red-700"></span>
                        <span className="text-xs font-bold text-gray-600">Risiko Sangat Tinggi</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}