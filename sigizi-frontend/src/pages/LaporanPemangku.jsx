import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaFilePdf,
  FaFileExcel,
  FaChartBar,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaDatabase,
  FaLightbulb,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts";

export default function LaporanPemangku() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sebaran");
  const [laporan, setLaporan] = useState([]);
  const [korelasiData, setKorelasiData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBulan, setFilterBulan] = useState("semua");
  const [filterTahun, setFilterTahun] = useState(
    new Date().getFullYear().toString(),
  );
  const [loading, setLoading] = useState(true);
  const handlePrint = () => window.print();
  const handleExportCSV = () => {
    const headers = [
      "Kabupaten/Kota",
      "Total Anak",
      "Normal",
      "Pra-Stunting",
      "Stunting",
    ];
    const csvRows = laporan.map(
      (row) =>
        `"${row.nama_kabupaten}",${row.total_anak},${row.total_normal || 0},${row.total_prastunting || 0},${row.total_stunting || 0}`,
    );
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      csvRows.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute(
      "download",
      `Laporan_Gizi_Sumut_${activeTab}_${filterTahun}.csv`,
    );
    link.click();
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(userData);
      if (
        parsedUser.role !== "pemangku_kepentingan" &&
        parsedUser.role !== "super_admin"
      ) {
        navigate("/dashboard");
      } else {
        fetchLaporan();
      }
    }
  }, [filterBulan, filterTahun]);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      // 1. Ambil Laporan Utama (Tabel & Sebaran)
      const resL = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_laporan.php?bulan=${filterBulan}&tahun=${filterTahun}`,
      );
      const dataL = await resL.json();
      if (dataL.status === "success") {
        setLaporan(dataL.data);
        setFilteredData(dataL.data);
      }

      // 2. Ambil Data Korelasi Akar Masalah (Analisis)
      const resK = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_korelasi_faktor.php`,
      );
      const dataK = await resK.json();
      if (dataK.status === "success") {
        // Bersihkan nama wilayah agar rapi di grafik
        setKorelasiData(
          dataK.data.map((item) => ({
            ...item,
            name: item.name.replace("Kabupaten ", "").replace("Kota ", ""),
          })),
        );
      }
    } catch (error) {
      console.error("Gagal sinkronisasi data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logika Filter Pencarian (Khusus Tab Tabel)
  useEffect(() => {
    const results = laporan.filter((item) =>
      item.nama_kabupaten.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredData(results);
  }, [searchTerm, laporan]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 print:bg-white">
      <div className="print:hidden">
        <Sidebar handleLogout={handleLogout} />
      </div>

      <div className="flex-1 flex flex-col relative print:block">
        <header className="bg-white border-b px-4 md:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            {" "}
            LAPORAN KEBIJAKAN
          </h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
              <FaCalendarAlt className="text-gray-400 text-xs" />
              <select
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              >
                <option value="2025">Periode 2025</option>
                <option value="2026">Periode 2026</option>
              </select>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 overflow-y-auto print:p-0">
          {/* KONTAINER LAPORAN UTAMA */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 print:shadow-none print:border-none max-w-7xl mx-auto w-full">
            {/* NAVIGASI TAB & TOOLBOX EKSPOR */}
            <div className="p-4 md:p-6 bg-gradient-to-r from-sigizi-green to-green-900 text-white flex flex-col lg:flex-row justify-between items-center gap-6 print:hidden">
              {/* Navigasi Tab */}
              <div className="flex flex-wrap justify-center gap-1 bg-black/20 p-1 rounded-xl w-full lg:w-auto">
                <button
                  onClick={() => setActiveTab("sebaran")}
                  className={`flex-1 lg:flex-none px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === "sebaran" ? "bg-white text-sigizi-green shadow-xl scale-105" : "text-white hover:bg-white/10"}`}
                >
                  Sebaran Gizi
                </button>
                <button
                  onClick={() => setActiveTab("analisis")}
                  className={`flex-1 lg:flex-none px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === "analisis" ? "bg-white text-sigizi-green shadow-xl scale-105" : "text-white hover:bg-white/10"}`}
                >
                  Akar Masalah
                </button>
                <button
                  onClick={() => setActiveTab("tabel")}
                  className={`flex-1 lg:flex-none px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === "tabel" ? "bg-white text-sigizi-green shadow-xl scale-105" : "text-white hover:bg-white/10"}`}
                >
                  Database Tabel
                </button>
              </div>

              {/* Toolbox Ekspor Contextual */}
              <div className="flex gap-2 w-full lg:w-auto justify-center">
                <button
                  onClick={handleExportCSV}
                  className="flex-1 lg:flex-none bg-white/10 hover:bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition backdrop-blur-sm"
                >
                  <FaFileExcel className="text-green-400" /> Export Excel
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 lg:flex-none bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95"
                >
                  <FaFilePdf /> Cetak Dokumen
                </button>
              </div>
            </div>

            <div className="p-6 md:p-10">
              {loading ? (
                <div className="py-32 text-center flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-sigizi-green border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-400 font-bold tracking-widest animate-pulse uppercase text-xs">
                    Sinkronisasi Intelijen Wilayah...
                  </p>
                </div>
              ) : (
                <div className="animate-fadeIn">
                  {activeTab === "sebaran" && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-black text-gray-800">
                          PROFIL KERENTANAN WILAYAH
                        </h2>
                        <p className="text-gray-500 text-sm">
                          Visualisasi perbandingan status gizi di 33
                          Kabupaten/Kota se-Sumatera Utara.
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 md:p-8 rounded-3xl border border-gray-200">
                        <div className="h-[1200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              layout="vertical"
                              data={laporan.map((i) => ({
                                ...i,
                                name: i.nama_kabupaten
                                  .replace("Kabupaten ", "")
                                  .replace("Kota ", ""),
                              }))}
                              margin={{ left: 20, right: 30 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={true}
                                vertical={false}
                                stroke="#e5e7eb"
                              />
                              <XAxis
                                type="number"
                                fontSize={11}
                                stroke="#9ca3af"
                              />
                              <YAxis
                                dataKey="name"
                                type="category"
                                width={110}
                                fontSize={11}
                                tick={{ fontWeight: "bold", fill: "#374151" }}
                              />
                              <Tooltip
                                cursor={{ fill: "#f3f4f6" }}
                                contentStyle={{
                                  borderRadius: "12px",
                                  border: "none",
                                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                                }}
                              />
                              <Legend
                                wrapperStyle={{
                                  paddingTop: "20px",
                                  fontSize: "12px",
                                }}
                              />
                              <Bar
                                dataKey="total_normal"
                                name="Normal"
                                stackId="a"
                                fill="#22c55e"
                                radius={[0, 0, 0, 0]}
                              />
                              <Bar
                                dataKey="total_prastunting"
                                name="Pra-Stunting"
                                stackId="a"
                                fill="#eab308"
                                radius={[0, 0, 0, 0]}
                              />
                              <Bar
                                dataKey="total_stunting"
                                name="Stunting"
                                stackId="a"
                                fill="#ef4444"
                                radius={[0, 4, 4, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: ANALISIS AKAR MASALAH (MULTI-VARIABEL) */}
                  {activeTab === "analisis" && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">
                          Analisis Faktor Determinan
                        </h2>
                        <p className="text-gray-500 text-sm">
                          Mencari korelasi antara stunting dengan infrastruktur,
                          ekonomi, dan kesehatan ibu.
                        </p>
                      </div>

                      <div className="bg-white p-4 md:p-8 rounded-3xl border border-gray-200 shadow-sm h-[600px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={korelasiData}>
                            <CartesianGrid
                              stroke="#f1f5f9"
                              strokeDasharray="5 5"
                            />
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
                                value: "Jumlah Jiwa (Stunting)",
                                angle: -90,
                                position: "insideLeft",
                                fontSize: 10,
                                fontWeight: "bold",
                              }}
                            />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              domain={[0, 100]}
                              stroke="#3b82f6"
                              label={{
                                value: "Indikator Persentase (%)",
                                angle: 90,
                                position: "insideRight",
                                fontSize: 10,
                                fontWeight: "bold",
                              }}
                            />
                            <Tooltip
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
                              dot={{ r: 4 }}
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="akses_air"
                              name="Air Bersih (%)"
                              stroke="#10b981"
                              strokeWidth={3}
                              dot={{ r: 4 }}
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
                          <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-4 shadow-lg">
                            <FaLightbulb />
                          </div>
                          <h4 className="font-bold text-blue-900 mb-2">
                            Intervensi Infrastruktur
                          </h4>
                          <p className="text-xs text-blue-700 leading-relaxed font-medium">
                            Jika garis Biru/Hijau (Air & Sanitasi) berada di
                            bawah tren batang merah, wilayah tersebut memerlukan
                            percepatan pembangunan sanitasi total berbasis
                            masyarakat.
                          </p>
                        </div>
                        <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl">
                          <div className="w-10 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center mb-4 shadow-lg"></div>
                          <h4 className="font-bold text-orange-900 mb-2">
                            Peringatan BBLR
                          </h4>
                          <p className="text-xs text-orange-700 leading-relaxed font-medium">
                            Garis oranye putus-putus menunjukkan prevalensi bayi
                            lahir rendah. Ini menandakan masalah gizi kronis
                            yang sudah terjadi sejak dalam kandungan.
                          </p>
                        </div>
                        <div className="p-6 bg-purple-50 border border-purple-100 rounded-2xl">
                          <div className="w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center mb-4 shadow-lg">
                            <FaDatabase />
                          </div>
                          <h4 className="font-bold text-purple-900 mb-2">
                            Kesehatan Ibu
                          </h4>
                          <p className="text-xs text-purple-700 leading-relaxed font-medium">
                            Pantau garis ungu. Penurunan akses gizi ibu hamil di
                            wilayah zona merah memerlukan program PMT (Pemberian
                            Makanan Tambahan) darurat.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: TABEL RINCIAN DETAIL */}
                  {activeTab === "tabel" && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">
                            Database Rekapitulasi
                          </h2>
                          <p className="text-gray-500 text-sm">
                            Data mentah administratif per kabupaten untuk
                            verifikasi detail.
                          </p>
                        </div>
                        <div className="relative w-full md:w-80">
                          <FaSearch className="absolute left-4 top-3.5 text-gray-400 text-sm" />
                          <input
                            type="text"
                            placeholder="Cari wilayah spesifik..."
                            className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-sigizi-green transition-all shadow-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-3xl border border-gray-200 shadow-inner">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="p-5 font-black text-gray-500 uppercase text-[10px] tracking-widest">
                                Wilayah Administratif
                              </th>
                              <th className="p-5 font-black text-gray-500 uppercase text-[10px] tracking-widest text-center">
                                Total Sampel
                              </th>
                              <th className="p-5 font-black text-green-700 uppercase text-[10px] tracking-widest text-center bg-green-50">
                                Normal
                              </th>
                              <th className="p-5 font-black text-yellow-700 uppercase text-[10px] tracking-widest text-center bg-yellow-50">
                                Pra-Stunting
                              </th>
                              <th className="p-5 font-black text-red-700 uppercase text-[10px] tracking-widest text-center bg-red-50">
                                Stunting
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredData.length > 0 ? (
                              filteredData.map((row, idx) => (
                                <tr
                                  key={idx}
                                  className="border-b hover:bg-gray-50 transition"
                                >
                                  <td className="p-5 font-bold text-gray-800">
                                    {row.nama_kabupaten}
                                  </td>
                                  <td className="p-5 text-center font-black text-gray-600">
                                    {row.total_anak}
                                  </td>
                                  <td className="p-5 text-center font-bold text-green-600 bg-green-50/30">
                                    {row.total_normal || 0}
                                  </td>
                                  <td className="p-5 text-center font-bold text-yellow-600 bg-yellow-50/30">
                                    {row.total_prastunting || 0}
                                  </td>
                                  <td className="p-5 text-center font-black text-red-600 bg-red-50/30">
                                    {row.total_stunting || 0}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="5"
                                  className="p-20 text-center text-gray-400 italic"
                                >
                                  Data tidak ditemukan untuk pencarian tersebut.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* KOP TANDA TANGAN (KHUSUS PRINT) */}
                  <div className="mt-20 hidden print:flex justify-end">
                    <div className="text-center w-80">
                      <p className="text-sm text-gray-600 mb-24">
                        Dicetak:{" "}
                        {new Date().toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="font-bold text-gray-900 border-b-2 border-gray-900 pb-1 uppercase tracking-tighter">
                        Kepala Analis Sistem SI-GIZI SIGAP
                      </p>
                      <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-widest">
                        Pemerintah Provinsi Sumatera Utara
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
