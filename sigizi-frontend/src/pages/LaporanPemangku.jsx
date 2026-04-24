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
  const [laporan, setLaporan] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterBulan, setFilterBulan] = useState("semua");
  const [filterTahun, setFilterTahun] = useState(
    new Date().getFullYear().toString(),
  );
  const [korelasiData, setKorelasiData] = useState([]);
  const handlePrint = () => {
    window.print();
  };

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
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Laporan_Gizi_${filterBulan !== "semua" ? "Bulan_" + filterBulan : "Semua"}_${filterTahun}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        alert("Akses Ditolak!");
        navigate("/dashboard");
      } else {
        fetchLaporan();
      }
    }
  }, [navigate, filterBulan, filterTahun]);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_laporan.php?bulan=${filterBulan}&tahun=${filterTahun}`,
      );
      const data = await response.json();
      if (data.status === "success") {
        setLaporan(data.data);
        setFilteredData(data.data);
      }

      const resKorelasi = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_korelasi_faktor.php`,
      );
      const dataKorelasi = await resKorelasi.json();
      if (dataKorelasi.status === "success") {
        const cleanKorelasi = dataKorelasi.data.map((item) => ({
          ...item,
          name: item.name.replace("Kabupaten ", "").replace("Kota ", ""),
        }));
        setKorelasiData(cleanKorelasi);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const barChartData = filteredData.map((item) => ({
    name: item.nama_kabupaten.replace("Kabupaten ", "").replace("Kota ", ""),
    Stunting: parseInt(item.total_stunting || 0),
    "Pra-Stunting": parseInt(item.total_prastunting || 0),
    Normal: parseInt(item.total_normal || 0),
  }));

  return (
    <div className="flex min-h-screen bg-sigizi-bg print:bg-white">
      <div className="print:hidden">
        <Sidebar handleLogout={handleLogout} />
      </div>

      <div className="flex-1 flex flex-col relative print:block">
        <header className="bg-white shadow px-4 md:px-8 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
              Analitik Strategis Gizi
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={handleExportCSV}
              className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <FaFileExcel /> <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 md:flex-none bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <FaFilePdf /> <span className="hidden sm:inline">Cetak PDF</span>
            </button>
          </div>
        </header>

        <main className="p-4 md:p-8 overflow-y-auto print:p-0">
          <div className="bg-white shadow-xl rounded-2xl p-6 md:p-10 w-full max-w-6xl mx-auto border border-gray-100 print:shadow-none print:border-none print:p-0 print:max-w-none">
            <div className="text-center border-b-4 border-sigizi-green pb-6 mb-8">
              <h1 className="text-3xl font-black text-sigizi-green tracking-tighter">
                SI-GIZI SIGAP
              </h1>
              <p className="text-gray-600 font-bold uppercase text-xs tracking-widest mt-1">
                Laporan Analitik Kerentanan Gizi Provinsi Sumatera Utara
              </p>
            </div>

            <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 print:hidden border-b border-gray-100 pb-6">
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl transition-all focus-within:ring-2 focus-within:ring-sigizi-green">
                  <FaFilter className="text-gray-400" />
                  <select
                    value={filterBulan}
                    onChange={(e) => setFilterBulan(e.target.value)}
                    className="bg-transparent outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                  >
                    <option value="semua">Semua Bulan</option>
                    <option value="1">Januari</option>
                    <option value="2">Februari</option>
                    <option value="3">Maret</option>
                    <option value="4">April</option>
                    <option value="5">Mei</option>
                    <option value="6">Juni</option>
                    <option value="7">Juli</option>
                    <option value="8">Agustus</option>
                    <option value="9">September</option>
                    <option value="10">Oktober</option>
                    <option value="11">November</option>
                    <option value="12">Desember</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl transition-all focus-within:ring-2 focus-within:ring-sigizi-green">
                  <FaCalendarAlt className="text-gray-400" />
                  <select
                    value={filterTahun}
                    onChange={(e) => setFilterTahun(e.target.value)}
                    className="bg-transparent outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                  >
                    <option value="semua">Semua Tahun</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>

              {/* Kolom Pencarian */}
              <div className="relative w-full lg:w-80">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari Kabupaten/Kota..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sigizi-green outline-none transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20 text-sigizi-green font-bold animate-pulse gap-3">
                <div className="w-6 h-6 border-4 border-sigizi-green border-t-transparent rounded-full animate-spin"></div>
                Memuat Data Wilayah...
              </div>
            ) : (
              <div className="space-y-12">
                <section className="print:break-inside-avoid">
                  <div className="flex items-center gap-2 mb-6 border-l-4 border-red-500 pl-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Visualisasi Sebaran Gizi Wilayah
                    </h3>
                  </div>

                  <div className="bg-gray-50 p-2 md:p-6 rounded-2xl border border-gray-200 overflow-x-auto">
                    <div
                      style={{
                        height: `${Math.max(400, filteredData.length * 40)}px`,
                        minWidth: "300px",
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={barChartData}
                          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
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
                            tick={{ fill: "#6b7280" }}
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={120}
                            tick={{
                              fontSize: 11,
                              fill: "#374151",
                              fontWeight: "bold",
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "12px",
                              border: "none",
                              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                            }}
                            cursor={{ fill: "#f3f4f6" }}
                          />
                          <Legend
                            wrapperStyle={{
                              paddingTop: "20px",
                              fontSize: "12px",
                            }}
                          />
                          <Bar
                            dataKey="Normal"
                            stackId="a"
                            fill="#22c55e"
                            radius={[0, 0, 0, 0]}
                          />
                          <Bar
                            dataKey="Pra-Stunting"
                            stackId="a"
                            fill="#eab308"
                            radius={[0, 0, 0, 0]}
                          />
                          <Bar
                            dataKey="Stunting"
                            stackId="a"
                            fill="#ef4444"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </section>

                {/* SECTION BARU: ANALISIS FAKTOR PENENTU */}
                <section className="print:break-inside-avoid mt-12 mb-8">
                  <div className="flex items-center justify-between mb-6 border-l-4 border-blue-500 pl-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Analisis Akar Masalah (Faktor Determinan)
                      </h3>
                      <p className="text-sm text-gray-500">
                        Korelasi antara Tingkat Stunting dengan Akses Sanitasi &
                        Air Bersih di 15 Wilayah Kritis
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-2 md:p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div style={{ height: "450px", width: "100%" }}>
                      <ResponsiveContainer>
                        <ComposedChart
                          data={korelasiData}
                          margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
                        >
                          <CartesianGrid
                            stroke="#f5f5f5"
                            strokeDasharray="3 3"
                          />

                          {/* Sumbu X untuk Nama Daerah */}
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            tick={{ fontSize: 11, fill: "#6b7280" }}
                            interval={0}
                          />

                          {/* Sumbu Y Kiri untuk Jumlah Stunting (Angka Mutlak) */}
                          <YAxis
                            yAxisId="left"
                            orientation="left"
                            stroke="#ef4444"
                            tick={{ fontSize: 12 }}
                          />

                          {/* Sumbu Y Kanan untuk Persentase (%) Sanitasi/Air */}
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#3b82f6"
                            domain={[0, 100]}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `${value}%`}
                          />

                          <Tooltip
                            contentStyle={{
                              borderRadius: "12px",
                              border: "none",
                              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                            }}
                          />
                          <Legend
                            wrapperStyle={{
                              paddingTop: "30px",
                              fontSize: "13px",
                              fontWeight: "bold",
                            }}
                          />

                          {/* Batang Merah untuk Stunting (Pakai Sumbu Kiri) */}
                          <Bar
                            yAxisId="left"
                            dataKey="total_stunting"
                            name="Total Stunting"
                            barSize={30}
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                          />

                          {/* Garis Biru untuk Sanitasi (Pakai Sumbu Kanan) */}
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="akses_sanitasi"
                            name="Akses Sanitasi Layak (%)"
                            stroke="#3b82f6"
                            strokeWidth={4}
                            dot={{ r: 5 }}
                            activeDot={{ r: 8 }}
                          />

                          {/* Garis Hijau untuk Air Bersih (Pakai Sumbu Kanan) */}
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="akses_air"
                            name="Akses Air Bersih (%)"
                            stroke="#10b981"
                            strokeWidth={4}
                            dot={{ r: 5 }}
                            activeDot={{ r: 8 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Insight Otomatis Berbasis Data */}
                  <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 px-5 py-4 rounded-xl flex gap-3 text-sm">
                    <span className="text-xl">💡</span>
                    <p>
                      <strong>Insight Strategis:</strong> Perhatikan titik
                      persilangan pada grafik di atas. Jika batang merah
                      (Stunting) sangat tinggi di suatu daerah, namun garis
                      biru/hijau (Sanitasi/Air) anjlok ke bawah, ini menandakan
                      bahwa{" "}
                      <strong>
                        buruknya infrastruktur air dan sanitasi adalah
                        penyumbang utama stunting di wilayah tersebut.
                      </strong>{" "}
                      Fokuskan anggaran infrastruktur ke wilayah ini!
                    </p>
                  </div>
                </section>

                <section className="print:break-inside-avoid">
                  <div className="flex items-center gap-2 mb-4 border-l-4 border-sigizi-green pl-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Tabel Rincian Rekapitulasi
                    </h3>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-sigizi-green text-white text-xs uppercase tracking-wider">
                          <th className="p-4 font-bold">No</th>
                          <th className="p-4 font-bold">Wilayah</th>
                          <th className="p-4 font-bold text-center">
                            Total Anak
                          </th>
                          <th className="p-4 font-bold text-center">Normal</th>
                          <th className="p-4 font-bold text-center">
                            Pra-stunting
                          </th>
                          <th className="p-4 font-bold text-center">
                            Stunting
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((row, index) => (
                          <tr
                            key={index}
                            className="text-sm border-b hover:bg-gray-50 transition"
                          >
                            <td className="p-4 text-center text-gray-400">
                              {index + 1}
                            </td>
                            <td className="p-4 font-bold text-gray-800">
                              {row.nama_kabupaten}
                            </td>
                            <td className="p-4 text-center font-bold text-blue-600">
                              {row.total_anak}
                            </td>
                            <td className="p-4 text-center text-green-600 font-medium">
                              {row.total_normal || 0}
                            </td>
                            <td className="p-4 text-center text-yellow-600 font-medium">
                              {row.total_prastunting || 0}
                            </td>
                            <td className="p-4 text-center text-red-600 font-black">
                              {row.total_stunting || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <div className="mt-16 flex justify-end print:block">
                  <div className="text-center w-64">
                    <p className="text-sm text-gray-600 mb-20">
                      Dicetak pada: {new Date().toLocaleDateString("id-ID")}
                    </p>
                    <p className="font-bold text-gray-800 border-b border-gray-800 pb-1">
                      Tim Analis SI-GIZI SIGAP
                    </p>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">
                      Pemerintah Provinsi Sumatera Utara
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
