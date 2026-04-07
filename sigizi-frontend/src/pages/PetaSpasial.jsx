import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MapDashboard from "../components/MapDashboard";
import { FaMapMarkedAlt } from "react-icons/fa";

export default function PetaSpasial() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
    <div className="flex min-h-screen bg-sigizi-bg">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white shadow px-8 py-4 flex items-center gap-4 z-10 relative">
          <FaMapMarkedAlt className="text-2xl text-sigizi-green" />
          <h1 className="text-xl font-bold text-gray-800">
            Peta Spasial (Web GIS)
          </h1>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6 flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Sebaran Kerentanan Gizi Sumatera Utara
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Visualisasi sebaran kasus stunting dan pra-stunting
                  terintegrasi secara real-time.
                </p>
              </div>
              <span className="bg-green-100 text-green-700 font-bold px-4 py-2 rounded-lg text-sm">
                Status: Live Data
              </span>
            </div>

            {/* Memanggil Komponen Peta */}
            <div className="w-full z-0 relative">
              <MapDashboard />
            </div>

            {/* Legenda Peta (Keterangan Warna) */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-green-500 inline-block"></span>
                <span className="text-sm font-semibold text-gray-700">
                  Aman (Normal)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-yellow-500 inline-block"></span>
                <span className="text-sm font-semibold text-gray-700">
                  Waspada (Pra-stunting)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-red-500 inline-block"></span>
                <span className="text-sm font-semibold text-gray-700">
                  Bahaya (Stunting)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-gray-400 inline-block"></span>
                <span className="text-sm font-semibold text-gray-700">
                  Belum Ada Data
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
