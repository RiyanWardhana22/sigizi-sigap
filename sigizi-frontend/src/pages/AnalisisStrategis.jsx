import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaChartLine,
  FaExclamationTriangle,
  FaTrophy,
  FaMedal,
  FaLightbulb,
  FaCalendarCheck,
} from "react-icons/fa";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalisisStrategis() {
  const navigate = useNavigate();
  const [korelasiData, setKorelasiData] = useState([]);
  const [evaluasiData, setEvaluasiData] = useState({
    peringatan: [],
    prestasi: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) navigate("/");
    else fetchIntelijenData();
  }, []);

  const fetchIntelijenData = async () => {
    setLoading(true);
    try {
      const resK = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_korelasi_faktor.php`,
      );
      const dataK = await resK.json();
      if (dataK.status === "success") {
        setKorelasiData(
          dataK.data.map((i) => ({
            ...i,
            name: i.name.replace("Kabupaten ", "").replace("Kota ", ""),
          })),
        );
      }
      const resE = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_evaluasi_kinerja.php`,
      );
      const dataE = await resE.json();
      if (dataE.status === "success") setEvaluasiData(dataE.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        handleLogout={() => {
          localStorage.removeItem("user");
          navigate("/");
        }}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b px-8 py-5 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 uppercase">
            Analisis & Evaluasi Strategis
          </h1>
        </header>

        <main className="p-4 md:p-8 overflow-y-auto space-y-12">
          <section className="animate-fadeIn">
            <h2 className="text-lg font-black text-gray-800 mb-6 uppercase">
              Monitoring Tren Kinerja Wilayah
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-red-50 border border-red-200 rounded-3xl p-6">
                <h3 className="text-md font-bold text-red-800 flex items-center gap-2 mb-4 border-b border-red-100 pb-3">
                  <FaExclamationTriangle className="animate-pulse" /> Peringatan
                  Lonjakan Kasus
                </h3>
                <div className="space-y-3">
                  {evaluasiData.peringatan.length > 0 ? (
                    evaluasiData.peringatan.map((a, i) => (
                      <div
                        key={i}
                        className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-gray-800">
                            {a.wilayah}
                          </h4>
                          <p className="text-[10px] text-red-600 font-bold uppercase">
                            {a.pesan}
                          </p>
                        </div>
                        <span className="text-[9px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-black">
                          {a.tingkat}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Tidak ada lonjakan kasus bulan ini.
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6">
                <h3 className="text-md font-bold text-yellow-800 flex items-center gap-2 mb-4 border-b border-yellow-100 pb-3">
                  <FaTrophy /> Top 5 Penurunan Stunting
                </h3>
                <div className="space-y-3">
                  {evaluasiData.prestasi.map((p, i) => (
                    <div
                      key={i}
                      className="bg-white p-4 rounded-xl shadow-sm border border-yellow-100 flex items-center gap-4"
                    >
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-black text-xs">
                        <FaMedal />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-800">
                          {p.wilayah}
                        </h4>
                        <p className="text-[10px] text-green-600 font-bold">
                          {p.pesan}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: AKAR MASALAH (BAWAH) */}
          <section className="animate-fadeIn">
            <h2 className="text-lg font-black text-gray-800 mb-6 uppercase">
              Analisis Faktor Determinan (Kausalitas)
            </h2>
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="h-[500px] w-full">
                <ResponsiveContainer>
                  <ComposedChart data={korelasiData}>
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="5 5" />
                    <XAxis
                      dataKey="name"
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fontWeight: "bold" }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#ef4444"
                      label={{
                        value: "Jumlah Stunting",
                        angle: -90,
                        position: "insideLeft",
                        fontSize: 10,
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      stroke="#3b82f6"
                      label={{
                        value: "Persentase (%)",
                        angle: 90,
                        position: "insideRight",
                        fontSize: 10,
                      }}
                    />
                    <Tooltip
                      formatter={(v) => Math.round(v)}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar
                      yAxisId="left"
                      dataKey="total_stunting"
                      name="Total Stunting"
                      fill="#ef4444"
                      barSize={35}
                      radius={[6, 6, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="akses_sanitasi"
                      name="Sanitasi (%)"
                      stroke="#3b82f6"
                      strokeWidth={3}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="akses_air"
                      name="Air Bersih (%)"
                      stroke="#10b981"
                      strokeWidth={3}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="prevalensi_bblr"
                      name="BBLR (%)"
                      stroke="#f97316"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="kesehatan_ibu"
                      name="Gizi Ibu (%)"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                  <FaLightbulb className="text-blue-600 text-2xl" />
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">
                    <strong>Insight Infrastruktur:</strong> Jika batang merah
                    tinggi namun garis hijau/biru rendah, wilayah tersebut
                    memerlukan percepatan pembangunan sanitasi dan akses air
                    bersih segera.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl flex gap-3">
                  <p className="text-xs text-purple-800 leading-relaxed font-medium">
                    <strong>Insight Kesehatan:</strong> Tren garis ungu (Gizi
                    Ibu) yang menurun di zona merah menandakan perlunya program
                    intervensi gizi spesifik bagi ibu hamil di wilayah tersebut.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
