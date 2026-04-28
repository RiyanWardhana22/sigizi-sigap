// sigizi-frontend/src/pages/DataAnak.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function DataAnak() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [semuaAnak, setSemuaAnak] = useState([]);
  const [selectedAnakId, setSelectedAnakId] = useState(null);
  const [selectedAnakData, setSelectedAnakData] = useState(null);
  const [stats, setStats] = useState({
    totalAnak: 0,
    normal: 0,
    stunting: 0,
    praStunting: 0
  });
  const [growthData, setGrowthData] = useState([]);
  const [latestMeasurement, setLatestMeasurement] = useState(null);
  const [zScoreData, setZScoreData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Cache untuk menyimpan data riwayat per orang tua
  const riwayatCache = useRef({});

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
    fetchSemuaAnak();
  }, [navigate]);

  const fetchSemuaAnak = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_semua_anak.php`);
      const data = await response.json();
      
      if (data.status === "success") {
        console.log("Data anak dari API:", data.data);
        setSemuaAnak(data.data);
        calculateStats(data.data);
        
        if (data.data.length > 0) {
          const firstAnakId = data.data[0].id;
          setSelectedAnakId(firstAnakId);
          await fetchAnakDetails(firstAnakId);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengambil riwayat berdasarkan orang_tua_id
  const fetchRiwayatByOrangTua = async (orangTuaId) => {
    // Cek cache dulu
    if (riwayatCache.current[orangTuaId]) {
      console.log("Menggunakan cached data untuk orang_tua_id:", orangTuaId);
      return riwayatCache.current[orangTuaId];
    }
    
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/get_riwayat_anak.php?user_id=${orangTuaId}`;
      console.log("Fetching riwayat from:", apiUrl);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      console.log("Response riwayat:", data);
      
      // Simpan ke cache
      riwayatCache.current[orangTuaId] = data;
      return data;
    } catch (error) {
      console.error("Error fetching riwayat:", error);
      return null;
    }
  };

  // Fungsi untuk mengambil detail anak
  const fetchAnakDetails = async (anakId) => {
    if (!anakId) return;
    
    setLoadingDetail(true);
    
    try {
      // Cari anak dari daftar semuaAnak
      const selectedAnak = semuaAnak.find(a => a.id === anakId);
      
      if (!selectedAnak) {
        console.error("Anak tidak ditemukan dalam daftar. ID:", anakId);
        setLoadingDetail(false);
        return;
      }

      console.log(`Mengambil detail untuk anak:`, selectedAnak);
      console.log(`orang_tua_id: ${selectedAnak.orang_tua_id}`);
      
      // Ambil riwayat berdasarkan orang_tua_id
      const riwayatData = await fetchRiwayatByOrangTua(selectedAnak.orang_tua_id);
      
      if (riwayatData && riwayatData.status === "success") {
        // Cari anak yang spesifik dari daftar
        const anakDetail = riwayatData.data.find(a => Number(a.id) === Number(anakId));
        
        console.log("Anak detail ditemukan:", anakDetail);
        
        if (anakDetail) {
          // Proses data riwayat
          const riwayatProcessed = (anakDetail.riwayat || [])
            .map(r => ({
              ...r,
              tanggal_pengukuran: r.tanggal_pengukuran,
              tinggi_badan: parseFloat(r.tinggi_badan),
              berat_badan: parseFloat(r.berat_badan),
              z_score: r.z_score ? parseFloat(r.z_score) : null,
              status_gizi: r.status_gizi
            }))
            .sort((a, b) => new Date(a.tanggal_pengukuran) - new Date(b.tanggal_pengukuran));
          
          console.log("Riwayat processed:", riwayatProcessed);
          console.log("Jumlah data pengukuran:", riwayatProcessed.length);
          
          // Gabungkan data
          const completeAnakData = {
            ...anakDetail,
            id: Number(anakDetail.id),
            nama_anak: anakDetail.nama_anak,
            tanggal_lahir: anakDetail.tanggal_lahir,
            jenis_kelamin: anakDetail.jenis_kelamin,
            status_verifikasi: anakDetail.status_verifikasi,
            nama_orang_tua: selectedAnak.nama_orang_tua || "-",
            riwayat: riwayatProcessed
          };
          
          setSelectedAnakData(completeAnakData);
          
          // Generate grafik
          if (riwayatProcessed.length > 0) {
            const formattedData = riwayatProcessed.map(r => ({
              tanggal: r.tanggal_pengukuran,
              tinggi: r.tinggi_badan,
              berat: r.berat_badan,
            }));
            console.log("Setting growth data:", formattedData);
            setGrowthData(formattedData);
            setLatestMeasurement(riwayatProcessed[riwayatProcessed.length - 1]);
            calculateZScore(completeAnakData);
          } else {
            setGrowthData([]);
            setLatestMeasurement(null);
            setZScoreData(null);
          }
        } else {
          console.log(`Anak dengan ID ${anakId} tidak ditemukan dalam riwayat`);
          const emptyAnakData = {
            ...selectedAnak,
            id: selectedAnak.id,
            nama_anak: selectedAnak.nama_anak,
            tanggal_lahir: selectedAnak.tanggal_lahir,
            jenis_kelamin: selectedAnak.jenis_kelamin,
            status_verifikasi: selectedAnak.status_verifikasi,
            nama_orang_tua: selectedAnak.nama_orang_tua,
            riwayat: []
          };
          setSelectedAnakData(emptyAnakData);
          setGrowthData([]);
          setLatestMeasurement(null);
          setZScoreData(null);
        }
      } else {
        console.log("Tidak ada data riwayat untuk orang tua ini");
        const emptyAnakData = {
          ...selectedAnak,
          id: selectedAnak.id,
          nama_anak: selectedAnak.nama_anak,
          tanggal_lahir: selectedAnak.tanggal_lahir,
          jenis_kelamin: selectedAnak.jenis_kelamin,
          status_verifikasi: selectedAnak.status_verifikasi,
          nama_orang_tua: selectedAnak.nama_orang_tua,
          riwayat: []
        };
        setSelectedAnakData(emptyAnakData);
        setGrowthData([]);
        setLatestMeasurement(null);
        setZScoreData(null);
      }
    } catch (error) {
      console.error("Error fetching anak details:", error);
      setSelectedAnakData(null);
      setGrowthData([]);
      setLatestMeasurement(null);
      setZScoreData(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const calculateStats = (anakList) => {
    const statsData = {
      totalAnak: anakList.length,
      normal: 0,
      stunting: 0,
      praStunting: 0
    };
    
    anakList.forEach(anak => {
      const lastStatus = anak.status_gizi_terakhir;
      if (lastStatus === "Normal") statsData.normal++;
      else if (lastStatus === "Stunting") statsData.stunting++;
      else if (lastStatus === "Pra-stunting") statsData.praStunting++;
    });
    
    setStats(statsData);
  };

  const calculateZScore = (anak) => {
    if (!anak || !anak.riwayat || anak.riwayat.length === 0) {
      setZScoreData(null);
      return;
    }
    
    const lastMeasurement = anak.riwayat[anak.riwayat.length - 1];
    const birthDate = new Date(anak.tanggal_lahir);
    const measurementDate = new Date(lastMeasurement.tanggal_pengukuran);
    
    let months = (measurementDate.getFullYear() - birthDate.getFullYear()) * 12;
    months -= birthDate.getMonth();
    months += measurementDate.getMonth();
    if (measurementDate.getDate() < birthDate.getDate()) months--;
    
    const height = lastMeasurement.tinggi_badan;
    const weight = lastMeasurement.berat_badan;
    
    let tbUStatus = "", bbUStatus = "";
    
    if (months > 0 && months <= 60) {
      if (height < 0) {
        tbUStatus = "Data tidak valid";
      } else if (months <= 12) {
        const stdHeight = 50 + (months * 1.5);
        const diff = height - stdHeight;
        if (diff < -5) tbUStatus = "Stunting (Severe)";
        else if (diff < -3) tbUStatus = "Stunting (Moderate)";
        else if (diff < -2) tbUStatus = "Stunting (Mild)";
        else if (diff <= 2) tbUStatus = "Normal";
        else tbUStatus = "Tinggi";
      } else {
        const stdHeight = 75 + ((months - 12) * 0.8);
        const diff = height - stdHeight;
        if (diff < -6) tbUStatus = "Stunting (Severe)";
        else if (diff < -4) tbUStatus = "Stunting (Moderate)";
        else if (diff < -2) tbUStatus = "Stunting (Mild)";
        else if (diff <= 2) tbUStatus = "Normal";
        else tbUStatus = "Tinggi";
      }
    } else if (months > 60) {
      const stdHeight = 110 + ((months - 60) * 0.5);
      const diff = height - stdHeight;
      if (diff < -8) tbUStatus = "Stunting (Severe)";
      else if (diff < -5) tbUStatus = "Stunting (Moderate)";
      else if (diff < -3) tbUStatus = "Stunting (Mild)";
      else if (diff <= 3) tbUStatus = "Normal";
      else tbUStatus = "Tinggi";
    }
    
    let expectedWeight;
    if (months <= 12) {
      expectedWeight = 3.5 + (months * 0.5);
    } else if (months <= 24) {
      expectedWeight = 8 + ((months - 12) * 0.25);
    } else {
      expectedWeight = 11 + ((months - 24) * 0.2);
    }
    
    const weightRatio = weight / expectedWeight;
    if (weightRatio < 0.6) bbUStatus = "Gizi Buruk";
    else if (weightRatio < 0.7) bbUStatus = "Gizi Kurang (Severe)";
    else if (weightRatio < 0.8) bbUStatus = "Gizi Kurang (Moderate)";
    else if (weightRatio < 0.9) bbUStatus = "Gizi Kurang (Mild)";
    else if (weightRatio < 1.1) bbUStatus = "Gizi Baik";
    else if (weightRatio < 1.2) bbUStatus = "Gizi Lebih (Mild)";
    else if (weightRatio < 1.3) bbUStatus = "Gizi Lebih (Moderate)";
    else bbUStatus = "Gizi Lebih (Severe)";
    
    setZScoreData({
      months,
      height,
      weight,
      expectedWeight: expectedWeight.toFixed(1),
      tbUStatus,
      bbUStatus,
      lastStatus: lastMeasurement.status_gizi,
      zScore: lastMeasurement.z_score
    });
  };

  const handleAnakChange = async (anakId) => {
    console.log(`Ganti anak ke ID: ${anakId}`);
    setSelectedAnakId(anakId);
    setGrowthData([]);
    setLatestMeasurement(null);
    setZScoreData(null);
    setSelectedAnakData(null);
    await fetchAnakDetails(anakId);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const getStatusBadge = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const statusMap = {
      "Normal": "bg-green-100 text-green-800",
      "Stunting": "bg-red-100 text-red-800",
      "Pra-stunting": "bg-yellow-100 text-yellow-800",
      "Wasting": "bg-orange-100 text-orange-800",
      "Gizi Kurang": "bg-orange-100 text-orange-800",
      "Gizi Buruk": "bg-red-100 text-red-800",
      "Gizi Lebih": "bg-blue-100 text-blue-800"
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status) => {
    if (!status) return "border-gray-300 bg-gray-50";
    if (status === "Normal" || status === "Gizi Baik") return "border-green-500 bg-green-50";
    if (status === "Stunting" || status.includes("Stunting")) return "border-red-500 bg-red-50";
    if (status === "Pra-stunting" || status.includes("Kurang")) return "border-yellow-500 bg-yellow-50";
    if (status.includes("Lebih")) return "border-orange-500 bg-orange-50";
    return "border-gray-300 bg-gray-50";
  };

  const getStatusTextColor = (status) => {
    if (!status) return "text-gray-600";
    if (status === "Normal" || status === "Gizi Baik") return "text-green-700";
    if (status === "Stunting" || status.includes("Stunting")) return "text-red-700";
    if (status === "Pra-stunting" || status.includes("Kurang")) return "text-yellow-700";
    if (status.includes("Lebih")) return "text-orange-700";
    return "text-gray-600";
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

  const filteredAnak = semuaAnak.filter(anak => {
    const matchesSearch = anak.nama_anak?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          anak.nama_orang_tua?.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStatus = true;
    if (filterStatus === "normal") {
      matchesStatus = anak.status_gizi_terakhir === "Normal";
    } else if (filterStatus === "pra-stunting") {
      matchesStatus = anak.status_gizi_terakhir === "Pra-stunting";
    } else if (filterStatus === "stunting") {
      matchesStatus = anak.status_gizi_terakhir === "Stunting";
    }
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar handleLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sigizi-green mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data semua anak...</p>
          </div>
        </div>
      </div>
    );
  }

  const age = selectedAnakData ? calculateAge(selectedAnakData.tanggal_lahir) : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar handleLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-6 py-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={fas.faChildren} className="text-2xl text-sigizi-green" />
            <h1 className="text-xl font-bold text-gray-800">Data Semua Anak</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">Menampilkan seluruh data anak dari semua orang tua</p>
        </header>

        <main className="p-6 overflow-y-auto">
          {/* Statistik Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-sigizi-green">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Anak</p>
                  <p className="text-2xl font-bold">{stats.totalAnak}</p>
                </div>
                <FontAwesomeIcon icon={fas.faBaby} className="text-3xl text-sigizi-green opacity-50" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Status Normal</p>
                  <p className="text-2xl font-bold text-green-600">{stats.normal}</p>
                </div>
                <FontAwesomeIcon icon={fas.faCheckCircle} className="text-3xl text-green-500 opacity-50" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pra-stunting</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.praStunting}</p>
                </div>
                <FontAwesomeIcon icon={fas.faExclamationTriangle} className="text-3xl text-yellow-500 opacity-50" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Stunting</p>
                  <p className="text-2xl font-bold text-red-600">{stats.stunting}</p>
                </div>
                <FontAwesomeIcon icon={fas.faChild} className="text-3xl text-red-500 opacity-50" />
              </div>
            </div>
          </div>

          {/* Filter dan Search */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cari Anak / Orang Tua</label>
                <input
                  type="text"
                  placeholder="Ketik nama anak atau orang tua..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sigizi-green"
                />
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sigizi-green"
                >
                  <option value="semua">Semua Status</option>
                  <option value="normal">Normal</option>
                  <option value="pra-stunting">Pra-stunting</option>
                  <option value="stunting">Stunting</option>
                </select>
              </div>
              <div className="flex items-end">
                <p className="text-sm text-gray-500">Menampilkan {filteredAnak.length} dari {semuaAnak.length} anak</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daftar Semua Anak */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={fas.faList} />
                  Daftar Semua Anak
                </h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredAnak.length > 0 ? (
                    filteredAnak.map(anak => (
                      <div
                        key={anak.id}
                        onClick={() => handleAnakChange(anak.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedAnakId === anak.id
                            ? "bg-sigizi-green text-white shadow-md"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`font-semibold ${selectedAnakId === anak.id ? "text-white" : "text-gray-800"}`}>
                              {anak.nama_anak}
                            </p>
                            <p className={`text-xs ${selectedAnakId === anak.id ? "text-white/80" : "text-gray-500"}`}>
                              Orang Tua: {anak.nama_orang_tua}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            selectedAnakId === anak.id
                              ? "bg-white/20 text-white"
                              : getStatusBadge(anak.status_gizi_terakhir)
                          }`}>
                            {anak.status_gizi_terakhir || "-"}
                          </span>
                        </div>
                        {anak.tinggi_terakhir && anak.berat_terakhir && (
                          <div className={`flex gap-3 mt-2 text-xs ${selectedAnakId === anak.id ? "text-white/70" : "text-gray-400"}`}>
                            <span>📏 {anak.tinggi_terakhir} cm</span>
                            <span>⚖️ {anak.berat_terakhir} kg</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Tidak ada data anak</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detail Anak Terpilih */}
            <div className="lg:col-span-2">
              {loadingDetail ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sigizi-green mx-auto"></div>
                  <p className="mt-3 text-gray-500">Memuat detail anak...</p>
                </div>
              ) : selectedAnakData ? (
                <>
                  {/* Profil Anak */}
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{selectedAnakData.nama_anak}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-gray-500 text-sm">Tanggal Lahir</p>
                        <p className="font-semibold">{selectedAnakData.tanggal_lahir}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Usia</p>
                        <p className="font-semibold">{age?.years || 0} th {age?.months || 0} bln</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Jenis Kelamin</p>
                        <p className="font-semibold">{selectedAnakData.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Status Verifikasi</p>
                        <p className={`font-semibold ${selectedAnakData.status_verifikasi === "Disetujui" ? "text-green-600" : "text-yellow-600"}`}>
                          {selectedAnakData.status_verifikasi || "Menunggu"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-gray-500 text-sm">Orang Tua</p>
                      <p className="font-semibold">{selectedAnakData.nama_orang_tua}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-500">
                        Jumlah Data Pengukuran: {selectedAnakData.riwayat?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Grafik Pertumbuhan */}
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FontAwesomeIcon icon={fas.faChartLine} /> Grafik Pertumbuhan Anak
                    </h3>
                    {growthData.length > 0 ? (
                      <div style={{ height: "400px", width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={growthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis 
                              dataKey="tanggal" 
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis 
                              yAxisId="left" 
                              label={{ value: 'Tinggi (cm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              label={{ value: 'Berat (kg)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd' }}
                              labelStyle={{ fontWeight: 'bold', color: '#285A48' }}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Line 
                              yAxisId="left" 
                              type="monotone" 
                              dataKey="tinggi" 
                              stroke="#285A48" 
                              strokeWidth={3}
                              name="Tinggi Badan (cm)"
                              dot={{ fill: "#285A48", strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                            <Line 
                              yAxisId="right" 
                              type="monotone" 
                              dataKey="berat" 
                              stroke="#E74C3C" 
                              strokeWidth={3}
                              name="Berat Badan (kg)"
                              dot={{ fill: "#E74C3C", strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <FontAwesomeIcon icon={fas.faChartLine} className="text-4xl mb-3 opacity-30" />
                        <p>Belum ada data pengukuran untuk anak ini</p>
                        <p className="text-sm mt-1">Silakan tambahkan data pengukuran melalui menu Data Anak oleh orang tua</p>
                      </div>
                    )}
                  </div>

                  {/* Riwayat Gizi */}
                  {selectedAnakData.riwayat && selectedAnakData.riwayat.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={fas.faHistory} /> Riwayat Gizi
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left">Tanggal</th>
                              <th className="px-4 py-2 text-left">Tinggi (cm)</th>
                              <th className="px-4 py-2 text-left">Berat (kg)</th>
                              <th className="px-4 py-2 text-left">Status Gizi</th>
                              <th className="px-4 py-2 text-left">Z-Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedAnakData.riwayat.map((item, idx) => (
                              <tr key={idx} className="border-t">
                                <td className="px-4 py-2">{item.tanggal_pengukuran}</td>
                                <td className="px-4 py-2">{item.tinggi_badan}</td>
                                <td className="px-4 py-2">{item.berat_badan}</td>
                                <td className="px-4 py-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(item.status_gizi)}`}>
                                    {item.status_gizi}
                                  </span>
                                </td>
                                <td className="px-4 py-2">{item.z_score || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-yellow-50 rounded-xl p-8 text-center">
                  <FontAwesomeIcon icon={fas.faChild} className="text-4xl text-yellow-500 mb-3" />
                  <p className="text-gray-600">Pilih anak dari daftar untuk melihat detail</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}