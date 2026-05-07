// sigizi-frontend/src/pages/DataAnak.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DataAnak() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orangTuaList, setOrangTuaList] = useState([]);
  const [selectedOrangTuaId, setSelectedOrangTuaId] = useState(null);
  const [selectedOrangTuaData, setSelectedOrangTuaData] = useState(null);
  const [anakList, setAnakList] = useState([]);
  const [selectedAnakId, setSelectedAnakId] = useState(null);
  const [selectedAnakData, setSelectedAnakData] = useState(null);
  const [wilayahList, setWilayahList] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [latestMeasurement, setLatestMeasurement] = useState(null);
  const [searchOrangTua, setSearchOrangTua] = useState("");
  const [filterWilayah, setFilterWilayah] = useState("semua");
  const [searchAnak, setSearchAnak] = useState("");
  const [filterStatusGizi, setFilterStatusGizi] = useState("semua");
  const [orangTuaPage, setOrangTuaPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [stats, setStats] = useState({
    totalAnak: 0,
    normal: 0,
    stunting: 0,
    praStunting: 0,
    wasting: 0,
    giziBerlebih: 0,
  });

  const STATUS_GIZI_LIST = [
    { value: "semua", label: "Semua Status" },
    { value: "Normal", label: "Normal" },
    { value: "Pra-stunting", label: "Pra-stunting" },
    { value: "Stunting", label: "Stunting" },
    { value: "Wasting", label: "Wasting" },
    { value: "Gizi Berlebih", label: "Gizi Berlebih" },
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (
      parsedUser.role !== "super_admin" &&
      parsedUser.role !== "dinas_kesehatan" &&
      parsedUser.role !== "pemangku_kepentingan"
    ) {
      navigate("/dashboard");
      return;
    }
    setUser(parsedUser);
    fetchOrangTuaList();
    fetchWilayahList();
  }, [navigate]);

  const fetchWilayahList = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_wilayah.php`,
      );
      const data = await response.json();
      if (data.status === "success") {
        setWilayahList(data.data);
      }
    } catch (error) {
      console.error("Error fetching wilayah:", error);
    }
  };

  const fetchOrangTuaList = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_users.php?role=orang_tua`,
      );
      const data = await response.json();
      if (data.status === "success") {
        const orangTuaWithProfil = await Promise.all(
          data.data.map(async (ot) => {
            try {
              const profilRes = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/profil_orangtua.php?user_id=${ot.id}`,
              );
              const profilData = await profilRes.json();
              if (profilData.status === "success") {
                return { ...ot, ...profilData.data };
              }
              return ot;
            } catch {
              return ot;
            }
          }),
        );
        setOrangTuaList(orangTuaWithProfil);
        calculateStats(orangTuaWithProfil);
      }
    } catch (error) {
      console.error("Error fetching orang tua list:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnakList = async (orangTuaId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_riwayat_anak.php?user_id=${orangTuaId}`,
      );
      const data = await response.json();
      if (data.status === "success") {
        const processedAnakList = data.data.map((anak) => ({
          ...anak,
          id: Number(anak.id),
          riwayat: (anak.riwayat || []).map((r) => ({
            ...r,
            tanggal_pengukuran: r.tanggal_pengukuran,
            tinggi_badan: parseFloat(r.tinggi_badan),
            berat_badan: parseFloat(r.berat_badan),
            lingkar_kepala: r.lingkar_kepala
              ? parseFloat(r.lingkar_kepala)
              : null,
            z_score: r.z_score ? parseFloat(r.z_score) : null,
            status_gizi: r.status_gizi,
          })),
        }));
        setAnakList(processedAnakList);
        if (processedAnakList.length > 0 && !selectedAnakId) {
          setSelectedAnakId(processedAnakList[0].id);
          setSelectedAnakData(processedAnakList[0]);
          if (
            processedAnakList[0].riwayat &&
            processedAnakList[0].riwayat.length > 0
          ) {
            const formattedData = processedAnakList[0].riwayat
              .sort(
                (a, b) =>
                  new Date(a.tanggal_pengukuran) -
                  new Date(b.tanggal_pengukuran),
              )
              .map((r) => ({
                tanggal: r.tanggal_pengukuran,
                tinggi: r.tinggi_badan,
                berat: r.berat_badan,
              }));
            setGrowthData(formattedData);
            setLatestMeasurement(
              processedAnakList[0].riwayat[
                processedAnakList[0].riwayat.length - 1
              ],
            );
          } else {
            setGrowthData([]);
            setLatestMeasurement(null);
          }
        }
      } else {
        setAnakList([]);
        setSelectedAnakId(null);
        setSelectedAnakData(null);
        setGrowthData([]);
        setLatestMeasurement(null);
      }
    } catch (error) {
      console.error("Error fetching anak list:", error);
      setAnakList([]);
    }
  };

  const calculateStats = (orangTuaListData) => {
    setStats({
      totalAnak: 0,
      normal: 0,
      stunting: 0,
      praStunting: 0,
      wasting: 0,
      giziBerlebih: 0,
    });
  };

  const handleOrangTuaSelect = async (orangTuaId) => {
    setSelectedOrangTuaId(orangTuaId);
    const selected = orangTuaList.find((ot) => ot.id === Number(orangTuaId));
    setSelectedOrangTuaData(selected || null);
    setSelectedAnakId(null);
    setSelectedAnakData(null);
    setGrowthData([]);
    setLatestMeasurement(null);
    if (orangTuaId) {
      await fetchAnakList(orangTuaId);
    } else {
      setAnakList([]);
    }
  };

  const handleAnakSelect = (anakId) => {
    setSelectedAnakId(anakId);
    const anak = anakList.find((a) => a.id === Number(anakId));
    setSelectedAnakData(anak || null);
    if (anak && anak.riwayat && anak.riwayat.length > 0) {
      const formattedData = anak.riwayat
        .sort(
          (a, b) =>
            new Date(a.tanggal_pengukuran) - new Date(b.tanggal_pengukuran),
        )
        .map((r) => ({
          tanggal: r.tanggal_pengukuran,
          tinggi: r.tinggi_badan,
          berat: r.berat_badan,
        }));
      setGrowthData(formattedData);
      setLatestMeasurement(anak.riwayat[anak.riwayat.length - 1]);
    } else {
      setGrowthData([]);
      setLatestMeasurement(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return { years: 0, months: 0 };
    const today = new Date();
    const birth = new Date(birthDate);
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years, months };
  };

  const formatAge = (birthDate) => {
    if (!birthDate) return "-";
    const age = calculateAge(birthDate);
    return `${age.years} th ${age.months} bln`;
  };

  const getStatusBadge = (status) => {
    if (!status) return "bg-gray-100 text-gray-700";
    const statusMap = {
      Normal: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Stunting: "bg-red-100 text-red-700 border-red-200",
      "Pra-stunting": "bg-amber-100 text-amber-700 border-amber-200",
      Wasting: "bg-orange-100 text-orange-700 border-orange-200",
      "Gizi Kurang": "bg-orange-100 text-orange-700 border-orange-200",
      "Gizi Buruk": "bg-red-100 text-red-700 border-red-200",
      "Gizi Lebih": "bg-blue-100 text-blue-700 border-blue-200",
      "Gizi Berlebih": "bg-purple-100 text-purple-700 border-purple-200",
    };
    return statusMap[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      Normal: fas.faCheckCircle,
      Stunting: fas.faChild,
      "Pra-stunting": fas.faExclamationTriangle,
      Wasting: fas.faWeightScale,
      "Gizi Berlebih": fas.faCircleExclamation,
    };
    return iconMap[status] || fas.faInfoCircle;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      Normal: "#10b981",
      Stunting: "#ef4444",
      "Pra-stunting": "#f59e0b",
      Wasting: "#f97316",
      "Gizi Berlebih": "#8b5cf6",
    };
    return colorMap[status] || "#6b7280";
  };

  const filteredOrangTua = orangTuaList.filter((ot) => {
    const matchesSearch =
      ot.nama_lengkap?.toLowerCase().includes(searchOrangTua.toLowerCase()) ||
      ot.email?.toLowerCase().includes(searchOrangTua.toLowerCase());
    let matchesWilayah = true;
    if (filterWilayah !== "semua") {
      matchesWilayah =
        ot.nama_kabupaten === filterWilayah ||
        ot.wilayah_id === Number(filterWilayah);
    }
    return matchesSearch && matchesWilayah;
  });

  const totalOrangTuaPages = Math.ceil(
    filteredOrangTua.length / ITEMS_PER_PAGE,
  );
  const paginatedOrangTua = filteredOrangTua.slice(
    (orangTuaPage - 1) * ITEMS_PER_PAGE,
    orangTuaPage * ITEMS_PER_PAGE,
  );

  const handleSearchOrangTuaChange = (e) => {
    setSearchOrangTua(e.target.value);
    setOrangTuaPage(1);
  };

  const handleFilterWilayahChange = (e) => {
    setFilterWilayah(e.target.value);
    setOrangTuaPage(1);
  };

  const filteredAnak = anakList.filter((anak) => {
    const matchesSearch = anak.nama_anak
      ?.toLowerCase()
      .includes(searchAnak.toLowerCase());
    if (filterStatusGizi === "semua") return matchesSearch;
    const lastStatus = anak.riwayat?.slice(-1)[0]?.status_gizi;
    return matchesSearch && lastStatus === filterStatusGizi;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
        <Sidebar handleLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
              <FontAwesomeIcon
                icon={fas.faBaby}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600 text-xl"
              />
            </div>
            <p className="mt-6 text-gray-600 font-medium">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <Sidebar handleLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-emerald-100 px-8 py-6 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Data Orang Tua & Anak
                </h1>
                <p className="text-gray-500 text-xs mt-0.5">
                  Kelola dan pantau data orang tua beserta data anak
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 overflow-y-auto">
          {/* Tabel Orang Tua */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 transition-all duration-300 hover:shadow-md">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-7 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2.5 rounded-xl">
                    <FontAwesomeIcon
                      icon={fas.faUser}
                      className="text-white text-lg"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Daftar Orang Tua
                    </h2>
                    <p className="text-emerald-100 text-sm">
                      Pilih orang tua untuk melihat data anak
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter dan Search */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[250px]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Cari Orang Tua
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={fas.faSearch}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Cari nama atau email..."
                      value={searchOrangTua}
                      onChange={(e) => handleSearchOrangTuaChange(e)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white shadow-sm transition-all"
                    />
                  </div>
                </div>
                <div className="w-64">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Filter Domisili
                  </label>
                  <select
                    value={filterWilayah}
                    onChange={(e) => handleFilterWilayahChange(e)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white shadow-sm transition-all"
                  >
                    <option value="semua">Semua Domisili</option>
                    {wilayahList.map((w) => (
                      <option key={w.id} value={w.nama_kabupaten}>
                        {w.nama_kabupaten}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tabel */}
            <div className="overflow-auto max-h-[500px]">
              <table className="w-full">
                <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                      No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Domisili
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedOrangTua.length > 0 ? (
                    paginatedOrangTua.map((ot, index) => (
                      <tr
                        key={ot.id}
                        className={`transition-all duration-200 ${
                          selectedOrangTuaId === ot.id
                            ? "bg-emerald-50 border-l-4 border-emerald-500"
                            : "border-l-4 border-transparent hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                          {(orangTuaPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <span
                                className={`font-semibold text-sm ${
                                  selectedOrangTuaId === ot.id
                                    ? "text-emerald-700"
                                    : "text-gray-800"
                                }`}
                              >
                                {ot.nama_lengkap}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {ot.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            <FontAwesomeIcon
                              icon={fas.faLocationDot}
                              className="text-emerald-500 text-xs"
                            />
                            {ot.nama_kabupaten || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleOrangTuaSelect(ot.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              selectedOrangTuaId === ot.id
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {selectedOrangTuaId === ot.id
                              ? "Terpilih"
                              : "Pilih"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="bg-gray-100 p-6 rounded-full mb-4">
                            <FontAwesomeIcon
                              icon={fas.faUsers}
                              className="text-4xl text-gray-400"
                            />
                          </div>
                          <p className="text-gray-500 font-medium">
                            Tidak ada data orang tua
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Data akan muncul setelah ada pendaftaran
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Orang Tua */}
            {filteredOrangTua.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-gray-500">
                  Menampilkan{" "}
                  <span className="font-semibold text-gray-700">
                    {(orangTuaPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  –{" "}
                  <span className="font-semibold text-gray-700">
                    {Math.min(
                      orangTuaPage * ITEMS_PER_PAGE,
                      filteredOrangTua.length,
                    )}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-gray-700">
                    {filteredOrangTua.length}
                  </span>{" "}
                  orang tua
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOrangTuaPage((p) => Math.max(p - 1, 1))}
                    disabled={orangTuaPage === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed border-gray-200 bg-white text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
                  >
                    <FontAwesomeIcon
                      icon={fas.faChevronLeft}
                      className="text-xs"
                    />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalOrangTuaPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === totalOrangTuaPages ||
                          Math.abs(p - orangTuaPage) <= 1,
                      )
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) {
                          acc.push("...");
                        }
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === "..." ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-2 text-gray-400 text-sm"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setOrangTuaPage(item)}
                            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 ${
                              orangTuaPage === item
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                                : "bg-white border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
                            }`}
                          >
                            {item}
                          </button>
                        ),
                      )}
                  </div>

                  <button
                    onClick={() =>
                      setOrangTuaPage((p) =>
                        Math.min(p + 1, totalOrangTuaPages),
                      )
                    }
                    disabled={orangTuaPage === totalOrangTuaPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed border-gray-200 bg-white text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
                  >
                    Next
                    <FontAwesomeIcon
                      icon={fas.faChevronRight}
                      className="text-xs"
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Data Diri Orang Tua Terpilih */}
          {selectedOrangTuaData && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-7 py-5">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2.5 rounded-xl">
                    <FontAwesomeIcon
                      icon={fas.faIdCard}
                      className="text-white text-lg"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Data Diri Orang Tua
                    </h2>
                    <p className="text-blue-100 text-sm">
                      Detail informasi orang tua terpilih
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-7">
                {/* Baris Pertama: Identitas Dasar */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={fas.faUser}
                        className="text-blue-600 text-lg"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Nama Lengkap
                      </p>
                      <p className="font-bold text-gray-800">
                        {selectedOrangTuaData.nama_lengkap}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={fas.faEnvelope}
                        className="text-gray-500 text-lg"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="font-bold text-gray-800 text-sm">
                        {selectedOrangTuaData.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={fas.faLocationDot}
                        className="text-emerald-600 text-lg"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Domisili
                      </p>
                      <p className="font-bold text-gray-800">
                        {selectedOrangTuaData.nama_kabupaten || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={fas.faCalendar}
                        className="text-orange-600 text-lg"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Tanggal Lahir
                      </p>
                      <p className="font-bold text-gray-800">
                        {selectedOrangTuaData.tanggal_lahir || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Baris Kedua: Sosial Ekonomi (termasuk Pendidikan Ibu) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-5 border-t border-gray-100">
                  {/* Pendidikan Ibu - DITAMBAHKAN DI SINI */}
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={fas.faGraduationCap}
                        className="text-indigo-600 text-lg"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Pendidikan Ibu
                      </p>
                      <p className="font-bold text-gray-800">
                        {selectedOrangTuaData.pendidikan_ibu || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={fas.faMoneyBillWave}
                        className="text-emerald-600 text-lg"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Penghasilan
                      </p>
                      <p className="font-bold text-gray-800 text-sm">
                        {selectedOrangTuaData.penghasilan_range
                          ? `Rp ${selectedOrangTuaData.penghasilan_range}`
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-cyan-50 to-white rounded-xl border border-cyan-100">
                    <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={fas.faDroplet}
                        className="text-cyan-600 text-lg"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Kualitas Air
                      </p>
                      <p className="font-bold text-gray-800">
                        {selectedOrangTuaData.kualitas_air || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={fas.faToilet}
                        className="text-purple-600 text-lg"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Sanitasi
                      </p>
                      <p className="font-bold text-gray-800">
                        {selectedOrangTuaData.sanitasi || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Baris Ketiga: Info Tambahan */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5 pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-rose-50 to-white rounded-xl border border-rose-100">
                    <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={fas.faHospital}
                        className="text-rose-600 text-lg"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Akses Kesehatan
                      </p>
                      <p className="font-bold text-gray-800">
                        {selectedOrangTuaData.akses_kesehatan || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Jika profil tidak lengkap, tampilkan pesan */}
                {!selectedOrangTuaData.profil_lengkap && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
                    <FontAwesomeIcon
                      icon={fas.faCircleExclamation}
                      className="text-amber-500 text-lg"
                    />
                    <p className="text-sm text-amber-700 font-medium">
                      Data profil orang tua ini belum lengkap
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tabel Data Anak */}
          {selectedOrangTuaId && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 transition-all duration-300">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-7 py-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-xl">
                      <FontAwesomeIcon
                        icon={fas.faBaby}
                        className="text-white text-lg"
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Data Anak
                      </h2>
                      <p className="text-emerald-100 text-sm">
                        {anakList.length} anak terdaftar
                      </p>
                    </div>
                  </div>
                  {anakList.length > 0 && (
                    <div className="flex gap-3 flex-wrap">
                      <div className="relative">
                        <FontAwesomeIcon
                          icon={fas.faSearch}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Cari nama anak..."
                          value={searchAnak}
                          onChange={(e) => setSearchAnak(e.target.value)}
                          className="pl-10 pr-4 py-2.5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 text-white placeholder-white/60 text-sm w-56 backdrop-blur-sm"
                        />
                      </div>
                      <select
                        value={filterStatusGizi}
                        onChange={(e) => setFilterStatusGizi(e.target.value)}
                        className="px-4 py-2.5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 text-white text-sm backdrop-blur-sm"
                      >
                        {STATUS_GIZI_LIST.map((status) => (
                          <option
                            key={status.value}
                            value={status.value}
                            className="text-gray-800"
                          >
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {anakList.length > 0 ? (
                <div className="overflow-auto max-h-[500px]">
                  <table className="w-full">
                    <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Nama Anak
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Tgl Lahir
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Umur
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          JK
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Tinggi
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Berat
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          L. Kepala
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status Gizi
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Z-Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredAnak.length > 0 ? (
                        filteredAnak.map((anak) => {
                          const lastRiwayat = anak.riwayat?.slice(-1)[0];
                          return (
                            <tr
                              key={anak.id}
                              onClick={() => handleAnakSelect(anak.id)}
                              className={`cursor-pointer transition-all duration-200 ${
                                selectedAnakId === anak.id
                                  ? "bg-emerald-50 border-l-4 border-emerald-500"
                                  : "border-l-4 border-transparent hover:bg-gray-50"
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md ${
                                      selectedAnakId === anak.id
                                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                        : "bg-gradient-to-br from-gray-400 to-gray-500"
                                    }`}
                                  >
                                    {anak.nama_anak?.charAt(0).toUpperCase()}
                                  </div>
                                  <span
                                    className={`font-semibold text-sm ${
                                      selectedAnakId === anak.id
                                        ? "text-emerald-700"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {anak.nama_anak}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {anak.tanggal_lahir}
                              </td>
                              <td className="px-6 py-4 text-sm text-blue-600 font-semibold">
                                {formatAge(anak.tanggal_lahir)}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    anak.jenis_kelamin === "L"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-pink-100 text-pink-700"
                                  }`}
                                >
                                  {anak.jenis_kelamin === "L" ? "L" : "P"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                {lastRiwayat?.tinggi_badan || "-"} cm
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                {lastRiwayat?.berat_badan || "-"} kg
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                {lastRiwayat?.lingkar_kepala || "-"} cm
                              </td>
                              <td className="px-6 py-4">
                                {lastRiwayat?.status_gizi ? (
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusBadge(lastRiwayat.status_gizi)}`}
                                  >
                                    <FontAwesomeIcon
                                      icon={getStatusIcon(
                                        lastRiwayat.status_gizi,
                                      )}
                                      className="text-xs"
                                    />
                                    {lastRiwayat.status_gizi}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">
                                    -
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                {lastRiwayat?.z_score || "-"}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={9} className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center">
                              <div className="bg-gray-100 p-6 rounded-full mb-4">
                                <FontAwesomeIcon
                                  icon={fas.faBaby}
                                  className="text-4xl text-gray-400"
                                />
                              </div>
                              <p className="text-gray-500 font-medium">
                                Tidak ada anak dengan filter yang dipilih
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-16 text-center">
                  <div className="bg-gray-100 p-6 rounded-full inline-flex mb-4">
                    <FontAwesomeIcon
                      icon={fas.faBaby}
                      className="text-5xl text-gray-400"
                    />
                  </div>
                  <p className="text-gray-500 font-medium">
                    Belum ada data anak untuk orang tua ini
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Pilih orang tua lain atau tambahkan data anak
                  </p>
                </div>
              )}
            </div>
          )}

          {!selectedOrangTuaId && (
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-12 text-center border border-emerald-100">
              <div className="bg-white p-6 rounded-full inline-flex mb-6 shadow-md">
                <FontAwesomeIcon
                  icon={fas.faHandPointer}
                  className="text-5xl text-emerald-400"
                />
              </div>
              <p className="text-gray-700 font-bold text-lg">
                Pilih orang tua dari tabel di atas
              </p>
              <p className="text-gray-500 mt-2">
                Klik tombol "Pilih" pada baris orang tua untuk melihat data anak
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
