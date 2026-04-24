import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaExclamationTriangle,
  FaMedal,
  FaLightbulb,
  FaHeartbeat,
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
      // Simulasi fetch atau sesuaikan dengan endpoint asli Anda
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

  // Custom Tooltip untuk Recharts agar lebih modern
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl">
          <p className="font-semibold text-slate-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs mb-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600">{entry.name}:</span>
              <span className="font-bold text-slate-800">
                {Math.round(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-800">
      {/* Catatan: Untuk mencocokkan referensi sepenuhnya, pastikan komponen <Sidebar /> 
          Anda diatur menggunakan warna bg-[#0A2A20] (Hijau Tua) dan teks putih */}
      <Sidebar
        handleLogout={() => {
          localStorage.removeItem("user");
          navigate("/");
        }}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white px-8 py-5 flex justify-between items-center shadow-sm z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2 uppercase">
              Analisis & Evaluasi
            </h1>
          </div>
        </header>

        <main className="p-6 md:p-8 overflow-y-auto space-y-8">
          <section className="animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    Peringatan Lonjakan Kasus
                  </h3>
                  <div className="p-2 bg-rose-50 rounded-lg">
                    <FaExclamationTriangle className="text-rose-500 text-sm" />
                  </div>
                </div>

                <div className="space-y-4">
                  {evaluasiData.peringatan.length > 0 ? (
                    evaluasiData.peringatan.map((a, i) => (
                      <div
                        key={i}
                        className="group flex justify-between items-center pb-4 border-b border-slate-50 last:border-0 last:pb-0"
                      >
                        <div>
                          <h4 className="font-semibold text-sm text-slate-800 group-hover:text-rose-600 transition-colors">
                            {a.wilayah}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {a.pesan}
                          </p>
                        </div>
                        <span className="text-[10px] bg-rose-50 border border-rose-100 text-rose-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                          {a.tingkat}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-slate-400">
                        Tidak ada lonjakan kasus bulan ini.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Prestasi */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    Top 5 Kabupaten/Kota Penurunan Stunting
                  </h3>
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <FaMedal className="text-emerald-500 text-sm" />
                  </div>
                </div>

                <div className="space-y-4">
                  {evaluasiData.prestasi.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0 mt-0.5">
                        #{i + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-slate-800">
                          {p.wilayah}
                        </h4>
                        <p className="text-xs text-emerald-600 font-medium mt-1">
                          {p.pesan}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Grafik & Analisis */}
          <section className="animate-fadeIn bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Analisis Faktor Determinan
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Korelasi antara total stunting dan faktor
                  infrastruktur/kesehatan
                </p>
              </div>
            </div>

            {/* Chart Container */}
            <div className="h-[400px] w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={korelasiData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b" }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="left"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="circle"
                  />

                  <Bar
                    yAxisId="left"
                    dataKey="total_stunting"
                    name="Total Stunting"
                    fill="#C44545"
                    barSize={24}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="akses_sanitasi"
                    name="Sanitasi (%)"
                    stroke="#0ea5e9" // Sky Blue
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="akses_air"
                    name="Air Bersih (%)"
                    stroke="#10b981" // Emerald
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="prevalensi_bblr"
                    name="BBLR (%)"
                    stroke="#f59e0b" // Amber
                    strokeWidth={3}
                    strokeDasharray="4 4"
                    dot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="kesehatan_ibu"
                    name="Gizi Ibu (%)"
                    stroke="#8b5cf6" // Violet
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Insights Section - Tampilan lebih terintegrasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
              <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <FaLightbulb className="text-blue-500 text-lg" />
                </div>
                <div>
                  <h5 className="font-semibold text-sm text-slate-800 mb-1">
                    Insight Infrastruktur
                  </h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Jika batang abu-abu (Stunting) tinggi namun garis
                    sanitasi/air bersih rendah, wilayah tersebut memerlukan
                    percepatan pembangunan infrastruktur dasar segera.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
                  <FaHeartbeat className="text-violet-500 text-lg" />
                </div>
                <div>
                  <h5 className="font-semibold text-sm text-slate-800 mb-1">
                    Insight Kesehatan
                  </h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tren garis ungu (Gizi Ibu) yang menurun menandakan perlunya
                    program intervensi gizi spesifik bagi ibu hamil pada wilayah
                    terdampak.
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
