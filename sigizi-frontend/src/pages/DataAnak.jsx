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
  const [stats, setStats] = useState({
    totalAnak: 0,
    normal: 0,
    stunting: 0,
    praStunting: 0,
    wasting: 0,
    giziBerlebih: 0,
  });

  // Daftar status gizi untuk filter
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
    if (parsedUser.role !== "super_admin" && parsedUser.role !== "dinas_kesehatan" && parsedUser.role !== "pemangku_kepentingan") {
      navigate("/dashboard");
      return;
    }
    setUser(parsedUser);
    fetchOrangTuaList();
    fetchWilayahList();
  }, [navigate]);

  const fetchWilayahList = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_wilayah.php`);
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_users.php?role=orang_tua`);
      const data = await response.json();
      if (data.status === "success") {
        // Ambil data profil untuk setiap orang tua
        const orangTuaWithProfil = await Promise.all(
          data.data.map(async (ot) => {
            try {
              const profilRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profil_orangtua.php?user_id=${ot.id}`);
              const profilData = await profilRes.json();
              if (profilData.status === "success") {
                return {
                  ...ot,
                  ...profilData.data,
                };
              }
              return ot;
            } catch {
              return ot;
            }
          })
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_riwayat_anak.php?user_id=${orangTuaId}`);
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
            lingkar_kepala: r.lingkar_kepala ? parseFloat(r.lingkar_kepala) : null,
            z_score: r.z_score ? parseFloat(r.z_score) : null,
            status_gizi: r.status_gizi,
          })),
        }));
        setAnakList(processedAnakList);
        if (processedAnakList.length > 0 && !selectedAnakId) {
          setSelectedAnakId(processedAnakList[0].id);
          setSelectedAnakData(processedAnakList[0]);
          if (processedAnakList[0].riwayat && processedAnakList[0].riwayat.length > 0) {
            const formattedData = processedAnakList[0].riwayat
              .sort((a, b) => new Date(a.tanggal_pengukuran) - new Date(b.tanggal_pengukuran))
              .map((r) => ({
                tanggal: r.tanggal_pengukuran,
                tinggi: r.tinggi_badan,
                berat: r.berat_badan,
              }));
            setGrowthData(formattedData);
            setLatestMeasurement(processedAnakList[0].riwayat[processedAnakList[0].riwayat.length - 1]);
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
    // Stats akan diupdate setelah memilih orang tua
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
        .sort((a, b) => new Date(a.tanggal_pengukuran) - new Date(b.tanggal_pengukuran))
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

  // Fungsi untuk mendapatkan class badge status gizi dengan 5 status
  const getStatusBadge = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const statusMap = {
      "Normal": "bg-green-100 text-green-800 border border-green-300",
      "Stunting": "bg-red-100 text-red-800 border border-red-300",
      "Pra-stunting": "bg-yellow-100 text-yellow-800 border border-yellow-300",
      "Wasting": "bg-orange-100 text-orange-800 border border-orange-300",
      "Gizi Kurang": "bg-orange-100 text-orange-800 border border-orange-300",
      "Gizi Buruk": "bg-red-100 text-red-800 border border-red-300",
      "Gizi Lebih": "bg-blue-100 text-blue-800 border border-blue-300",
      "Gizi Berlebih": "bg-purple-100 text-purple-800 border border-purple-300",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800 border border-gray-300";
  };

  // Icon untuk setiap status gizi
  const getStatusIcon = (status) => {
    const iconMap = {
      "Normal": fas.faCheckCircle,
      "Stunting": fas.faChild,
      "Pra-stunting": fas.faExclamationTriangle,
      "Wasting": fas.faWeightScale,
      "Gizi Berlebih": fas.faCircleExclamation,
    };
    return iconMap[status] || fas.faInfoCircle;
  };

  // Warna untuk setiap status gizi (untuk indikator visual)
  const getStatusColor = (status) => {
    const colorMap = {
      "Normal": "#22c55e",      // green-500
      "Stunting": "#ef4444",    // red-500
      "Pra-stunting": "#eab308", // yellow-500
      "Wasting": "#f97316",    // orange-500
      "Gizi Berlebih": "#a855f7", // purple-500
    };
    return colorMap[status] || "#6b7280"; // gray-500
  };

  // Filter orang tua
  const filteredOrangTua = orangTuaList.filter((ot) => {
    const matchesSearch = ot.nama_lengkap?.toLowerCase().includes(searchOrangTua.toLowerCase()) || ot.email?.toLowerCase().includes(searchOrangTua.toLowerCase());
    let matchesWilayah = true;
    if (filterWilayah !== "semua") {
      matchesWilayah = ot.nama_kabupaten === filterWilayah || ot.wilayah_id === Number(filterWilayah);
    }
    return matchesSearch && matchesWilayah;
  });

  // Filter anak
  const filteredAnak = anakList.filter((anak) => {
    const matchesSearch = anak.nama_anak?.toLowerCase().includes(searchAnak.toLowerCase());
    if (filterStatusGizi === "semua") return matchesSearch;
    const lastStatus = anak.riwayat?.slice(-1)[0]?.status_gizi;
    return matchesSearch && lastStatus === filterStatusGizi;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar handleLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sigizi-green mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-6 py-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={fas.faUsers} className="text-2xl text-sigizi-green" />
            <h1 className="text-xl font-bold text-gray-800">Data Orang Tua & Anak</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Kelola dan pantau data orang tua beserta data anak
          </p>
        </header>

        <main className="p-6 overflow-y-auto">
          {/* ==========================================
              TABEL ORANG TUA
              ========================================== */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-sigizi-green to-sigizi-light-green px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <FontAwesomeIcon icon={fas.faUser} className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Daftar Orang Tua</h2>
                </div>
              </div>
            </div>

            {/* Filter dan Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Cari</label>
                  <div className="relative">
                    <FontAwesomeIcon icon={fas.faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Cari nama atau email..."
                      value={searchOrangTua}
                      onChange={(e) => setSearchOrangTua(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sigizi-green text-sm"
                    />
                  </div>
                </div>
                <div className="w-56">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Filter Domisili</label>
                  <select
                    value={filterWilayah}
                    onChange={(e) => setFilterWilayah(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sigizi-green text-sm bg-white"
                  >
                    <option value="semua">Semua Domisili</option>
                    {wilayahList.map((w) => (
                      <option key={w.id} value={w.nama_kabupaten}>{w.nama_kabupaten}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tabel Orang Tua dengan Scrollbar */}
            <div className="overflow-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Domisili</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrangTua.length > 0 ? (
                    filteredOrangTua.map((ot, index) => (
                      <tr
                        key={ot.id}
                        onClick={() => handleOrangTuaSelect(ot.id)}
                        className={`cursor-pointer transition-colors hover:bg-sigizi-green/5 ${
                          selectedOrangTuaId === ot.id ? "bg-sigizi-green/10 border-l-4 border-sigizi-green" : "border-l-4 border-transparent"
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                              selectedOrangTuaId === ot.id ? "bg-sigizi-green" : "bg-gray-400"
                            }`}>
                              {ot.nama_lengkap?.charAt(0).toUpperCase()}
                            </div>
                            <span className={`font-medium text-sm ${
                              selectedOrangTuaId === ot.id ? "text-sigizi-green font-semibold" : "text-gray-800"
                            }`}>
                              {ot.nama_lengkap}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{ot.email}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                            <FontAwesomeIcon icon={fas.faLocationDot} className="text-gray-400 text-xs" />
                            {ot.nama_kabupaten || "-"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        <FontAwesomeIcon icon={fas.faUsers} className="text-3xl mb-2 opacity-30 block mx-auto" />
                        <p>Tidak ada data orang tua</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ==========================================
              DATA DIRI ORANG TUA TERPILIH
              ========================================== */}
          {selectedOrangTuaData && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <FontAwesomeIcon icon={fas.faIdCard} className="text-white text-lg" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Data Diri Orang Tua</h2>
                    <p className="text-sm text-white/80">Detail informasi orang tua terpilih</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FontAwesomeIcon icon={fas.faUser} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Nama Lengkap</p>
                      <p className="font-semibold text-gray-800 text-sm">{selectedOrangTuaData.nama_lengkap}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <FontAwesomeIcon icon={fas.faEnvelope} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-gray-800 text-sm">{selectedOrangTuaData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <FontAwesomeIcon icon={fas.faLocationDot} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Domisili</p>
                      <p className="font-semibold text-gray-800 text-sm">{selectedOrangTuaData.nama_kabupaten || "-"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <FontAwesomeIcon icon={fas.faCalendar} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tanggal Lahir</p>
                      <p className="font-semibold text-gray-800 text-sm">{selectedOrangTuaData.tanggal_lahir || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Sosial Ekonomi */}
                {selectedOrangTuaData.profil_lengkap && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <FontAwesomeIcon icon={fas.faMoneyBillWave} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Penghasilan</p>
                        <p className="font-semibold text-gray-800 text-sm">Rp {selectedOrangTuaData.penghasilan_range}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                        <FontAwesomeIcon icon={fas.faDroplet} className="text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Kualitas Air</p>
                        <p className="font-semibold text-gray-800 text-sm">{selectedOrangTuaData.kualitas_air || "-"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <FontAwesomeIcon icon={fas.faToilet} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Sanitasi</p>
                        <p className="font-semibold text-gray-800 text-sm">{selectedOrangTuaData.sanitasi || "-"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                        <FontAwesomeIcon icon={fas.faHospital} className="text-rose-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Akses Kesehatan</p>
                        <p className="font-semibold text-gray-800 text-sm">{selectedOrangTuaData.akses_kesehatan || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              TABEL DATA ANAK
              ========================================== */}
          {selectedOrangTuaId && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-sigizi-green to-sigizi-light-green px-6 py-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <FontAwesomeIcon icon={fas.faBaby} className="text-white text-lg" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Data Anak</h2>
                      <p className="text-sm text-white/80">{anakList.length} anak terdaftar</p>
                    </div>
                  </div>
                  {anakList.length > 0 && (
                    <div className="flex gap-3">
                      <div className="relative">
                        <FontAwesomeIcon icon={fas.faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="text"
                          placeholder="Cari nama anak..."
                          value={searchAnak}
                          onChange={(e) => setSearchAnak(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/60 text-sm w-48"
                        />
                      </div>
                      <select
                        value={filterStatusGizi}
                        onChange={(e) => setFilterStatusGizi(e.target.value)}
                        className="px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white text-sm"
                      >
                        {STATUS_GIZI_LIST.map((status) => (
                          <option key={status.value} value={status.value} className="text-gray-800">
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabel Anak dengan Scrollbar */}
              {anakList.length > 0 ? (
                <div className="overflow-auto max-h-80">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Nama Anak</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Tanggal Lahir</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Umur</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">JK</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Tinggi (cm)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Berat (kg)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Lingkar Kepala (cm)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status Gizi</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Z-Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredAnak.length > 0 ? (
                        filteredAnak.map((anak) => {
                          const lastRiwayat = anak.riwayat?.slice(-1)[0];
                          return (
                            <tr
                              key={anak.id}
                              onClick={() => handleAnakSelect(anak.id)}
                              className={`cursor-pointer transition-colors hover:bg-sigizi-green/5 ${
                                selectedAnakId === anak.id ? "bg-sigizi-green/10 border-l-4 border-sigizi-green" : "border-l-4 border-transparent"
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                                    selectedAnakId === anak.id ? "bg-sigizi-green" : "bg-gray-400"
                                  }`}>
                                    {anak.nama_anak?.charAt(0).toUpperCase()}
                                  </div>
                                  <span className={`font-medium text-sm ${
                                    selectedAnakId === anak.id ? "text-sigizi-green font-semibold" : "text-gray-800"
                                  }`}>
                                    {anak.nama_anak}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{anak.tanggal_lahir}</td>
                              <td className="px-4 py-3 text-sm text-blue-600 font-medium whitespace-nowrap">{formatAge(anak.tanggal_lahir)}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  anak.jenis_kelamin === "L" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                                }`}>
                                  {anak.jenis_kelamin === "L" ? "L" : "P"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{lastRiwayat?.tinggi_badan || "-"}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{lastRiwayat?.berat_badan || "-"}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{lastRiwayat?.lingkar_kepala || "-"}</td>
                              <td className="px-4 py-3">
                                {lastRiwayat?.status_gizi ? (
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(lastRiwayat.status_gizi)}`}>
                                    <FontAwesomeIcon icon={getStatusIcon(lastRiwayat.status_gizi)} className="text-xs" />
                                    {lastRiwayat.status_gizi}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{lastRiwayat?.z_score || "-"}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                            <FontAwesomeIcon icon={fas.faBaby} className="text-3xl mb-2 opacity-30 block mx-auto" />
                            <p>Tidak ada anak dengan filter yang dipilih</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <FontAwesomeIcon icon={fas.faBaby} className="text-4xl mb-3 opacity-30" />
                  <p>Belum ada data anak untuk orang tua ini</p>
                </div>
              )}
            </div>
          )}

          {!selectedOrangTuaId && (
            <div className="bg-blue-50 rounded-xl p-8 text-center">
              <FontAwesomeIcon icon={fas.faHandPointer} className="text-4xl text-blue-400 mb-3" />
              <p className="text-gray-600 font-medium">Pilih orang tua dari tabel di atas</p>
              <p className="text-gray-500 text-sm mt-1">Klik pada baris orang tua untuk melihat data anak</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}