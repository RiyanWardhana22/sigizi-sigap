import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaChartLine,
  FaExclamationTriangle,
  FaTrophy,
  FaMedal,
  FaLightbulb,
  FaBrain,
  FaCheckCircle,
  FaInfoCircle,
  FaShieldAlt,
} from "react-icons/fa";
import { GiProgression } from "react-icons/gi";
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
  const [prediksiData, setPrediksiData] = useState([]);
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

      const resP = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_prediksi_hotspot.php`,
      );
      const dataP = await resP.json();
      if (dataP.status === "success") setPrediksiData(dataP.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-xl">
          <p className="font-semibold text-slate-800 mb-3">{label}</p>
          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-6 text-xs mb-1.5"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-600">{entry.name}</span>
              </div>
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
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white px-8 py-5 flex justify-between items-center z-10 shadow-sm border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2 uppercase">
              {" "}
              Analisis & Evaluasi Strategis
            </h1>
          </div>
        </header>

        <main className="p-6 md:p-8 overflow-y-auto space-y-8 pb-24">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4 text-[#0A2A20]">
              <div className="w-10 h-10 border-4 border-[#0A2A20] border-t-transparent rounded-full animate-spin"></div>
              <p className="font-medium text-sm animate-pulse text-slate-500">
                Memproses Algoritma AI & Sinkronisasi Data...
              </p>
            </div>
          ) : (
            <>
              {/* SECTION 1: EVALUASI KINERJA */}
              <section className="animate-fadeIn">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  Monitoring Tren Kinerja
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Peringatan Card */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                        <FaExclamationTriangle />
                      </div>
                      <h3 className="text-base font-semibold text-slate-800">
                        Peringatan Lonjakan
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {evaluasiData.peringatan.length > 0 ? (
                        evaluasiData.peringatan.map((a, i) => (
                          <div
                            key={i}
                            className="group flex justify-between items-center pb-4 border-b border-slate-50 last:border-0 last:pb-0"
                          >
                            <div>
                              <h4 className="font-semibold text-sm text-slate-800">
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
                        <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-xl">
                          Semua wilayah terkendali bulan ini.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Prestasi Card */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <GiProgression />
                      </div>
                      <h3 className="text-base font-semibold text-slate-800">
                        Top 5 Kabupaten/Kota Penurunan Stunting
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {evaluasiData.prestasi.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${i === 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}
                          >
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

              {/* SECTION 2: AKAR MASALAH */}
              <section className="animate-fadeIn">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  Analisis Faktor Akar Masalah
                </h2>
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                  <div className="h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={korelasiData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                      >
                        <CartesianGrid stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="name"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#64748b" }}
                          dy={10}
                          angle={-35}
                          textAnchor="end"
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
                          barSize={28}
                          radius={[4, 4, 0, 0]}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="akses_sanitasi"
                          name="Sanitasi (%)"
                          stroke="#0ea5e9"
                          strokeWidth={3}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="akses_air"
                          name="Air Bersih (%)"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ r: 3 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="prevalensi_bblr"
                          name="BBLR (%)"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          strokeDasharray="4 4"
                          dot={{ r: 3 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="kesehatan_ibu"
                          name="Gizi Ibu (%)"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ r: 3 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              {/* SECTION 3: AI FORESIGHT (REDESIGNED) */}
              <section className="animate-fadeIn">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-bold text-slate-800">
                    Prediksi Masa Depan Kabupaten/Kota Rawan Stunting
                  </h2>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                  <div className="flex flex-col lg:flex-row gap-6 mb-8 pb-8 border-b border-slate-100">
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 leading-relaxed mb-4">
                        Algoritma{" "}
                        <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 ">
                          Random Forest
                        </span>{" "}
                        memprediksi daerah rentan gizi berdasarkan pelemahan
                        variabel infrastruktur dan kesehatan, sebelum lonjakan
                        kasus terjadi.
                      </p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium text-slate-500">
                        <FaCheckCircle className="text-emerald-500" /> Data
                        Terverifikasi Dinkes
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs uppercase tracking-wider mb-2">
                          <FaExclamationTriangle /> Indikator Krisis
                        </div>
                        <p className="text-xs text-slate-600">
                          Sanitasi Layak &lt; 40% <br /> Air Bersih &lt; 40%
                        </p>
                      </div>
                      <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs uppercase tracking-wider mb-2">
                          <FaInfoCircle /> Indikator Waspada
                        </div>
                        <p className="text-xs text-slate-600">
                          Gizi Ibu &lt; 60% <br /> BBLR &gt; 15%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Prediction Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {prediksiData.length > 0 ? (
                      prediksiData.map((item, idx) => (
                        <div
                          key={idx}
                          className="relative bg-white border border-slate-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group"
                        >
                          {/* Accent Line */}
                          <div
                            className={`absolute top-0 left-0 w-1 h-full ${item.klaster === 2 ? "bg-rose-500" : "bg-amber-400"}`}
                          ></div>

                          <div className="flex justify-between items-start mb-3 pl-2">
                            <h4 className="font-bold text-slate-800 text-base">
                              {item.wilayah}
                            </h4>
                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-md font-bold ${item.klaster === 2 ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 mb-5 pl-2 leading-relaxed">
                            {item.pesan}
                          </p>

                          <div className="grid grid-cols-3 gap-3 pl-2">
                            <div className="bg-slate-50 rounded-lg p-2.5">
                              <div className="text-[10px] text-slate-400 font-medium mb-1">
                                Sanitasi
                              </div>
                              <div
                                className={`text-sm font-bold ${item.data_mentah.p_sanitasi < 40 ? "text-rose-600" : "text-slate-700"}`}
                              >
                                {item.data_mentah.p_sanitasi}%
                              </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-2.5">
                              <div className="text-[10px] text-slate-400 font-medium mb-1">
                                Air Bersih
                              </div>
                              <div
                                className={`text-sm font-bold ${item.data_mentah.p_air < 40 ? "text-rose-600" : "text-slate-700"}`}
                              >
                                {item.data_mentah.p_air}%
                              </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-2.5">
                              <div className="text-[10px] text-slate-400 font-medium mb-1">
                                Gizi Ibu
                              </div>
                              <div
                                className={`text-sm font-bold ${item.data_mentah.p_ibu < 60 ? "text-rose-600" : "text-slate-700"}`}
                              >
                                {item.data_mentah.p_ibu}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 bg-slate-50 border border-slate-100 border-dashed rounded-xl text-center">
                        <FaCheckCircle className="text-4xl mx-auto mb-3 text-emerald-400" />
                        <h4 className="font-semibold text-slate-800">
                          Zonasi Aman Terkendali
                        </h4>
                        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                          Berdasarkan model AI saat ini, tidak ada wilayah yang
                          diprediksi akan mengalami lonjakan krisis dalam waktu
                          dekat.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* AI Recommendation Footer */}
                  <div className="mt-8 flex items-start gap-4 bg-indigo-50/50 border border-indigo-100 p-5 rounded-xl">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                      <FaLightbulb className="text-lg" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-indigo-900 mb-1">
                        Rekomendasi Tindakan
                      </h5>
                      <p className="text-xs text-indigo-800/80 leading-relaxed">
                        Fokuskan alokasi anggaran infrastruktur (Dana Desa/Dinas
                        PU) segera pada wilayah{" "}
                        <span className="font-semibold text-rose-600">
                          KRISIS
                        </span>
                        . Untuk wilayah berstatus{" "}
                        <span className="font-semibold text-amber-600">
                          WASPADA
                        </span>
                        , optimalkan program Pemberian Makanan Tambahan (PMT)
                        dan pengawasan berkala melalui Posyandu terdekat.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
