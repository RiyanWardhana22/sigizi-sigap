import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaFilePdf,
  FaFileExcel,
  FaSearch,
  FaCalendarAlt,
  FaTable,
  FaChartBar,
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
} from "recharts";

export default function LaporanPemangku() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sebaran");
  const [laporan, setLaporan] = useState([]);
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
    link.setAttribute("download", `Laporan_Rekapitulasi_${filterTahun}.csv`);
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
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_laporan.php?bulan=${filterBulan}&tahun=${filterTahun}`,
      );
      const data = await response.json();
      if (data.status === "success") {
        setLaporan(data.data);
        setFilteredData(data.data);
      }
    } catch (error) {
      console.error(error);
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
              <span className="font-bold text-slate-800">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-800 print:bg-white">
      <div className="print:hidden">
        <Sidebar
          handleLogout={() => {
            localStorage.removeItem("user");
            navigate("/");
          }}
        />
      </div>
      <div className="flex-1 flex flex-col relative print:block h-screen overflow-hidden print:h-auto print:overflow-visible">
        <header className="bg-white border-b border-slate-100 px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 shadow-sm print:shadow-none print:border-b-2 print:border-black print:px-0 print:py-4 print:mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2 uppercase">
              Laporan Rekapitulasi Wilayah
            </h1>
            <p className="text-xs text-slate-500 mt-1 print:text-slate-800 print:font-medium">
              Data sebaran gizi anak tingkat Kabupaten/Kota - Tahun{" "}
              {filterTahun}
            </p>
          </div>

          {/* Tombol filter disembunyikan saat print */}
          <div className="flex items-center gap-3 print:hidden">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
              <FaCalendarAlt className="text-slate-400 text-sm" />
              <select
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="2025">Tahun 2025</option>
                <option value="2026">Tahun 2026</option>
              </select>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8 overflow-y-auto pb-24 print:p-0 print:overflow-visible">
          <div className="bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-2xl border border-slate-100 overflow-hidden print:shadow-none print:border-none print:w-full">
            {/* Control Bar - Disembunyikan saat di print */}
            <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4 print:hidden">
              <div className="flex bg-slate-100/80 p-1 rounded-xl w-full lg:w-auto">
                <button
                  onClick={() => setActiveTab("sebaran")}
                  className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === "sebaran"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Grafik Sebaran
                </button>
                <button
                  onClick={() => setActiveTab("tabel")}
                  className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === "tabel"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Tabel Rekapitulasi
                </button>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto">
                {activeTab === "tabel" && (
                  <div className="relative w-full lg:w-64">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Cari wilayah..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-400 focus:bg-white transition-colors"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                )}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors"
                  >
                    <FaFileExcel className="text-emerald-600" /> Excel
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0A2A20] hover:bg-[#124233] text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                  >
                    <FaFilePdf className="text-rose-400" /> PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 print:p-0">
              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4 text-[#0A2A20] print:hidden">
                  <div className="w-10 h-10 border-4 border-[#0A2A20] border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-medium text-sm animate-pulse text-slate-500">
                    Menarik Data Laporan...
                  </p>
                </div>
              ) : (
                <>
                  {activeTab === "sebaran" ? (
                    <div className="animate-fadeIn">
                      <div className="mb-6 flex justify-between items-end print:hidden">
                        <div>
                          <h2 className="text-lg font-bold text-slate-800">
                            Grafik Kerentanan Wilayah
                          </h2>
                          <p className="text-sm text-slate-500 mt-1">
                            Distribusi status gizi di Kabupaten/Kota
                          </p>
                        </div>
                      </div>

                      <div className="h-[900px] w-full bg-white rounded-xl print:h-auto print:min-h-[800px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={laporan.map((i) => ({
                              ...i,
                              name: i.nama_kabupaten
                                .replace("Kabupaten ", "")
                                .replace("Kota ", ""),
                            }))}
                            margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                          >
                            <CartesianGrid
                              stroke="#f1f5f9"
                              horizontal={true}
                              vertical={false}
                              strokeDasharray="4 4"
                            />
                            <XAxis
                              type="number"
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: "#64748b" }}
                            />
                            <YAxis
                              dataKey="name"
                              type="category"
                              width={120}
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: "#475569", fontWeight: 500 }}
                            />
                            <Tooltip
                              content={<CustomTooltip />}
                              cursor={{ fill: "#f8fafc" }}
                            />
                            <Legend
                              wrapperStyle={{
                                paddingTop: "20px",
                                paddingBottom: "20px",
                              }}
                              iconType="circle"
                            />

                            <Bar
                              dataKey="total_normal"
                              name="Normal"
                              stackId="a"
                              fill="#10b981"
                              barSize={16}
                            />
                            <Bar
                              dataKey="total_prastunting"
                              name="Pra-Stunting"
                              stackId="a"
                              fill="#f59e0b"
                              barSize={16}
                            />
                            <Bar
                              dataKey="total_stunting"
                              name="Stunting"
                              stackId="a"
                              fill="#ef4444"
                              radius={[0, 4, 4, 0]}
                              barSize={16}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-fadeIn">
                      <div className="mb-6 print:hidden">
                        <h2 className="text-lg font-bold text-slate-800">
                          Tabel Rekapitulasi
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                          Rincian data numerik per Kabupaten/Kota
                        </p>
                      </div>

                      <div className="overflow-x-auto border border-slate-100 rounded-xl print:border-black print:overflow-visible">
                        <table className="w-full text-left text-sm whitespace-nowrap print:text-xs">
                          <thead className="bg-slate-50 border-b border-slate-100 print:bg-white print:border-black print:border-b-2">
                            <tr>
                              <th className="px-6 py-4 font-semibold text-slate-700 print:px-2 print:py-2">
                                Wilayah
                              </th>
                              <th className="px-6 py-4 font-semibold text-slate-700 text-center print:px-2 print:py-2">
                                Total Anak
                              </th>
                              <th className="px-6 py-4 font-semibold text-emerald-700 text-center print:px-2 print:py-2 print:text-black">
                                Normal
                              </th>
                              <th className="px-6 py-4 font-semibold text-amber-700 text-center print:px-2 print:py-2 print:text-black">
                                Pra-Stunting
                              </th>
                              <th className="px-6 py-4 font-semibold text-rose-700 text-center print:px-2 print:py-2 print:text-black">
                                Stunting
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 print:divide-gray-300">
                            {filteredData.length > 0 ? (
                              filteredData.map((row, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-slate-50/50 transition-colors print:hover:bg-transparent"
                                >
                                  <td className="px-6 py-4 font-medium text-slate-800 print:px-2 print:py-2">
                                    {row.nama_kabupaten}
                                  </td>
                                  <td className="px-6 py-4 text-center text-slate-600 print:px-2 print:py-2 print:text-black">
                                    {row.total_anak}
                                  </td>
                                  <td className="px-6 py-4 text-center print:px-2 print:py-2">
                                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold print:bg-transparent print:text-black print:px-0">
                                      {row.total_normal}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-center print:px-2 print:py-2">
                                    <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-semibold print:bg-transparent print:text-black print:px-0">
                                      {row.total_prastunting}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-center print:px-2 print:py-2">
                                    <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-semibold print:bg-transparent print:text-black print:px-0">
                                      {row.total_stunting}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="5"
                                  className="px-6 py-12 text-center text-slate-500"
                                >
                                  Data wilayah tidak ditemukan.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
