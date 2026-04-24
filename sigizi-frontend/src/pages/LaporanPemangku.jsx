import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaFilePdf,
  FaFileExcel,
  FaChartBar,
  FaSearch,
  FaCalendarAlt,
  FaDatabase,
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

  return (
    <div className="flex min-h-screen bg-gray-50 print:bg-white">
      <div className="print:hidden">
        <Sidebar
          handleLogout={() => {
            localStorage.removeItem("user");
            navigate("/");
          }}
        />
      </div>

      <div className="flex-1 flex flex-col relative print:block">
        <header className="bg-white border-b px-8 py-5 flex justify-between items-center print:hidden">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2 uppercase">
            Laporan Rekapitulasi Wilayah
          </h1>
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border">
            <FaCalendarAlt className="text-gray-400 text-xs" />
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="bg-transparent text-xs font-bold outline-none"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </header>

        <main className="p-4 md:p-8 overflow-y-auto">
          <div className="bg-white shadow-xl rounded-md overflow-hidden border border-gray-100 print:shadow-none print:border-none max-w-7xl mx-auto w-full">
            <div className="p-4 md:p-6 bg-sigizi-green text-white flex flex-col lg:flex-row justify-between items-center gap-6 print:hidden">
              <div className="flex gap-1 bg-black/20 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("sebaran")}
                  className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === "sebaran" ? "bg-white text-sigizi-green" : "text-white hover:bg-white/10"}`}
                >
                  Sebaran Gizi
                </button>
                <button
                  onClick={() => setActiveTab("tabel")}
                  className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === "tabel" ? "bg-white text-sigizi-green" : "text-white hover:bg-white/10"}`}
                >
                  Database Tabel
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition"
                >
                  <FaFileExcel /> Excel
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition"
                >
                  <FaFilePdf /> PDF
                </button>
              </div>
            </div>

            <div className="p-8">
              {loading ? (
                <div className="py-20 text-center animate-pulse text-gray-400 font-bold">
                  Sinkronisasi Data...
                </div>
              ) : (
                <>
                  {activeTab === "sebaran" ? (
                    <div className="space-y-8 animate-fadeIn">
                      <h2 className="text-xl font-bold text-gray-800 pl-4 uppercase">
                        Profil Kerentanan 33 Kabupaten/Kota
                      </h2>
                      <div className="h-[1200px] w-full bg-gray-50 p-4 rounded-xl border">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={laporan.map((i) => ({
                              ...i,
                              name: i.nama_kabupaten
                                .replace("Kabupaten ", "")
                                .replace("Kota ", ""),
                            }))}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              horizontal={true}
                              vertical={false}
                            />
                            <XAxis type="number" fontSize={11} />
                            <YAxis
                              dataKey="name"
                              type="category"
                              width={110}
                              fontSize={10}
                              tick={{ fontWeight: "bold" }}
                            />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="total_normal"
                              name="Normal"
                              stackId="a"
                              fill="#22c55e"
                            />
                            <Bar
                              dataKey="total_prastunting"
                              name="Pra-Stunting"
                              stackId="a"
                              fill="#eab308"
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
                  ) : (
                    <div className="animate-fadeIn">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800 uppercase">
                          Database Rekapitulasi
                        </h2>
                        <div className="relative w-64">
                          <FaSearch className="absolute left-3 top-3 text-gray-400 text-xs" />
                          <input
                            type="text"
                            placeholder="Cari wilayah..."
                            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg outline-none"
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="overflow-x-auto border rounded-xl">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="p-4 font-bold">Wilayah</th>
                              <th className="p-4 font-bold text-center">
                                Total Anak
                              </th>
                              <th className="p-4 font-bold text-center text-green-600">
                                Normal
                              </th>
                              <th className="p-4 font-bold text-center text-yellow-600">
                                Pra-Stunting
                              </th>
                              <th className="p-4 font-bold text-center text-red-600">
                                Stunting
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredData.map((row, idx) => (
                              <tr
                                key={idx}
                                className="border-b hover:bg-gray-50 transition"
                              >
                                <td className="p-4 font-bold text-gray-700">
                                  {row.nama_kabupaten}
                                </td>
                                <td className="p-4 text-center font-bold">
                                  {row.total_anak}
                                </td>
                                <td className="p-4 text-center text-green-600 font-medium">
                                  {row.total_normal}
                                </td>
                                <td className="p-4 text-center text-yellow-600 font-medium">
                                  {row.total_prastunting}
                                </td>
                                <td className="p-4 text-center text-red-600 font-black">
                                  {row.total_stunting}
                                </td>
                              </tr>
                            ))}
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
