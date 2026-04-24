import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function OrangTuaDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [anakList, setAnakList] = useState([]);
  const [selectedAnakId, setSelectedAnakId] = useState(null);
  const [selectedAnakData, setSelectedAnakData] = useState(null);
  const [showAnakDropdown, setShowAnakDropdown] = useState(false);
  const [stats, setStats] = useState({
    totalAnak: 0,
    normal: 0,
    stunting: 0,
    giziKurang: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [latestMeasurement, setLatestMeasurement] = useState(null);
  
  // State untuk Super Admin
  const [orangTuaList, setOrangTuaList] = useState([]);
  const [selectedOrangTuaId, setSelectedOrangTuaId] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "orang_tua" && parsedUser.role !== "super_admin") {
      navigate("/dashboard");
      return;
    }
    setUser(parsedUser);
    setUserRole(parsedUser.role);
    
    if (parsedUser.role === "super_admin") {
      fetchOrangTuaList();
    } else {
      fetchData(parsedUser.id);
    }
  }, [navigate]);

  const fetchOrangTuaList = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_users.php`);
      const data = await response.json();
      
      if (data.status === "success") {
        const orangTua = data.data.filter(u => u.role === "orang_tua");
        setOrangTuaList(orangTua);
        if (orangTua.length > 0) {
          setSelectedOrangTuaId(orangTua[0].id);
          await fetchData(orangTua[0].id);
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error fetching orang tua list:", error);
      setLoading(false);
    }
  };

  const fetchData = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_riwayat_anak.php?user_id=${userId}`);
      const data = await response.json();

      if (data.status === "success") {
        const processedAnakList = data.data.map(anak => ({
          ...anak,
          id: Number(anak.id),
          riwayat: (anak.riwayat || []).map(r => ({
            ...r,
            tanggal_pengukuran: r.tanggal_pengukuran,
            tinggi_badan: Number(r.tinggi_badan),
            berat_badan: Number(r.berat_badan),
            z_score: r.z_score ? Number(r.z_score) : null,
            status_gizi: r.status_gizi
          }))
        }));
        
        setAnakList(processedAnakList);
        
        const statsData = {
          totalAnak: processedAnakList.length,
          normal: processedAnakList.filter(a => {
            const lastStatus = a.riwayat?.slice(-1)[0]?.status_gizi;
            return lastStatus === "Normal";
          }).length,
          stunting: processedAnakList.filter(a => {
            const lastStatus = a.riwayat?.slice(-1)[0]?.status_gizi;
            return lastStatus === "Stunting";
          }).length,
          giziKurang: processedAnakList.filter(a => {
            const lastStatus = a.riwayat?.slice(-1)[0]?.status_gizi;
            return lastStatus === "Pra-stunting" || lastStatus === "Wasting";
          }).length,
        };
        setStats(statsData);

        if (processedAnakList.length > 0) {
          const firstAnakId = processedAnakList[0].id;
          setSelectedAnakId(firstAnakId);
          setSelectedAnakData(processedAnakList[0]);
          generateNotifications(processedAnakList);
          
          if (processedAnakList[0].riwayat && processedAnakList[0].riwayat.length > 0) {
            setLatestMeasurement(processedAnakList[0].riwayat[processedAnakList[0].riwayat.length - 1]);
          }
          
          generateGrowthData(processedAnakList[0]);
        } else {
          setSelectedAnakData(null);
          setGrowthData([]);
          setLatestMeasurement(null);
          generateNotifications(processedAnakList);
        }
      } else if (data.status === "empty") {
        setAnakList([]);
        setSelectedAnakData(null);
        setGrowthData([]);
        setLatestMeasurement(null);
        setStats({
          totalAnak: 0,
          normal: 0,
          stunting: 0,
          giziKurang: 0
        });
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateGrowthData = (anak) => {
    if (!anak || !anak.riwayat || anak.riwayat.length === 0) {
      setGrowthData([]);
      return;
    }
    const formattedData = anak.riwayat.map(r => ({
      tanggal: r.tanggal_pengukuran,
      tinggi: parseFloat(r.tinggi_badan),
      berat: parseFloat(r.berat_badan),
    }));
    setGrowthData(formattedData);
  };

  const generateNotifications = (anakListData) => {
    const notif = [];
    
    anakListData.forEach(anak => {
      const lastMeasurement = anak.riwayat?.slice(-1)[0];
      const secondLast = anak.riwayat?.slice(-2, -1)[0];
      
      if (lastMeasurement) {
        if (lastMeasurement.status_gizi === "Stunting") {
          notif.push({
            id: `stunting-${anak.id}`,
            title: `PERHATIAN: ${anak.nama_anak}`,
            message: "Terindikasi stunting. Segera konsultasikan ke posyandu terdekat!",
            type: "danger",
          });
        } else if (lastMeasurement.status_gizi === "Pra-stunting") {
          notif.push({
            id: `pra-${anak.id}`,
            title: `${anak.nama_anak}`,
            message: "Berisiko stunting. Perbaiki asupan gizi segera!",
            type: "warning",
          });
        } else if (lastMeasurement.status_gizi === "Normal") {
          notif.push({
            id: `normal-${anak.id}`,
            title: `${anak.nama_anak}`,
            message: "Status gizi normal. Terus jaga pola makan sehat!",
            type: "success",
          });
        }
        
        if (secondLast && parseFloat(lastMeasurement.berat_badan) < parseFloat(secondLast.berat_badan)) {
          notif.push({
            id: `weight-${anak.id}`,
            title: `${anak.nama_anak}`,
            message: `Berat badan turun dari ${secondLast.berat_badan} kg menjadi ${lastMeasurement.berat_badan} kg`,
            type: "info",
          });
        }
      }
    });
    
    notif.push({
      id: "imunisasi",
      title: "JADWAL IMUNISASI",
      message: "Anak usia 0-12 bulan membutuhkan imunisasi dasar lengkap. Cek ke posyandu terdekat!",
      type: "info",
    });
    
    setNotifications(notif);
  };

  const handleOrangTuaChange = async (userId) => {
    setSelectedOrangTuaId(userId);
    await fetchData(userId);
  };

  const handleAnakChange = (anakId) => {
    const newSelectedAnakId = Number(anakId);
    setSelectedAnakId(newSelectedAnakId);
    
    const selectedAnak = anakList.find(a => a.id === newSelectedAnakId);
    if (selectedAnak) {
      setSelectedAnakData(selectedAnak);
      generateGrowthData(selectedAnak);
      if (selectedAnak.riwayat && selectedAnak.riwayat.length > 0) {
        setLatestMeasurement(selectedAnak.riwayat[selectedAnak.riwayat.length - 1]);
      } else {
        setLatestMeasurement(null);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

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

  const selectedAnak = selectedAnakData;
  const statusColor = latestMeasurement?.status_gizi === "Normal" ? "text-green-600" : 
                      latestMeasurement?.status_gizi === "Stunting" ? "text-red-600" : 
                      latestMeasurement?.status_gizi === "Pra-stunting" ? "text-yellow-600" : "text-gray-600";

  const selectedOrangTua = orangTuaList.find(o => o.id === selectedOrangTuaId);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar handleLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={fas.faHouse} className="text-2xl text-sigizi-green" />
            <h1 className="text-xl font-bold text-gray-800">Dashboard Orang Tua</h1>
          </div>
          
          <div className="flex gap-3">
            {userRole === "super_admin" && orangTuaList.length > 0 && (
              <select
                value={selectedOrangTuaId || ""}
                onChange={(e) => handleOrangTuaChange(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sigizi-green bg-white"
              >
                {orangTuaList.map(ot => (
                  <option key={ot.id} value={ot.id}>
                    {ot.nama_lengkap} - {ot.email}
                  </option>
                ))}
              </select>
            )}
            
            {/* Dropdown Anak dengan tampilan foto profil */}
            {anakList.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowAnakDropdown(!showAnakDropdown)}
                  className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sigizi-green transition"
                >
                  {selectedAnakData ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sigizi-green to-sigizi-light-green flex items-center justify-center text-white font-bold text-sm">
                        {selectedAnakData.nama_anak?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-700">{selectedAnakData.nama_anak}</span>
                      <FontAwesomeIcon icon={fas.faChevronDown} className="text-gray-400 text-sm ml-1" />
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={fas.faBaby} className="text-sigizi-green" />
                      <span className="text-gray-700">Pilih Anak</span>
                      <FontAwesomeIcon icon={fas.faChevronDown} className="text-gray-400 text-sm" />
                    </>
                  )}
                </button>
                
                {showAnakDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowAnakDropdown(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                      <div className="p-2 max-h-96 overflow-y-auto">
                        {anakList.map(anak => {
                          const isSelected = selectedAnakId === anak.id;
                          const lastStatus = anak.riwayat?.slice(-1)[0]?.status_gizi;
                          let statusColor = "";
                          let statusBg = "";
                          if (lastStatus === "Normal") {
                            statusColor = "text-green-600";
                            statusBg = "bg-green-50";
                          } else if (lastStatus === "Stunting") {
                            statusColor = "text-red-600";
                            statusBg = "bg-red-50";
                          } else if (lastStatus === "Pra-stunting") {
                            statusColor = "text-yellow-600";
                            statusBg = "bg-yellow-50";
                          }
                          
                          return (
                            <button
                              key={anak.id}
                              onClick={() => {
                                handleAnakChange(anak.id);
                                setShowAnakDropdown(false);
                              }}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all mb-1 ${
                                isSelected ? 'bg-sigizi-green/10 border border-sigizi-green/20' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                isSelected ? 'bg-sigizi-green' : 'bg-gray-400'
                              }`}>
                                {anak.nama_anak?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-semibold text-gray-800">{anak.nama_anak}</p>
                                <div className="flex items-center gap-2 text-xs mt-0.5">
                                  <span className="text-gray-500">
                                    {anak.tanggal_lahir}
                                  </span>
                                  {lastStatus && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className={`${statusColor} font-medium px-1.5 py-0.5 rounded ${statusBg}`}>
                                        {lastStatus}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <FontAwesomeIcon icon={fas.faCheckCircle} className="text-sigizi-green text-sm" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="p-6 overflow-y-auto">
          {/* Info Super Admin */}
          {userRole === "super_admin" && selectedOrangTua && (
            <div className="mb-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={fas.faUserShield} className="text-blue-600 text-xl" />
                <div>
                  <p className="text-sm text-blue-800">Mode Super Admin</p>
                  <p className="font-semibold text-blue-900">
                    Menampilkan data untuk: {selectedOrangTua.nama_lengkap}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Statistik Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                  <p className="text-gray-500 text-sm">Gizi Kurang</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.giziKurang}</p>
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

          {/* Pesan jika tidak ada data */}
          {anakList.length === 0 && (
            <div className="bg-yellow-50 rounded-xl p-8 text-center mb-6">
              <FontAwesomeIcon icon={fas.faBaby} className="text-4xl text-yellow-500 mb-3" />
              <p className="text-gray-600 font-medium">Belum ada data anak untuk orang tua ini</p>
              <p className="text-gray-500 text-sm mt-1">Silakan tambah data anak terlebih dahulu</p>
            </div>
          )}

          {/* Informasi Anak Terpilih */}
          {selectedAnak && (
            <div className="bg-gradient-to-r from-sigizi-green to-sigizi-light-green text-white rounded-xl p-6 mb-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedAnak.nama_anak}</h2>
                  <p className="opacity-90 mt-1">
                    Lahir: {selectedAnak.tanggal_lahir} | 
                    JK: {selectedAnak.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} |
                    Status Verifikasi: {selectedAnak.status_verifikasi || "Menunggu"}
                  </p>
                  {latestMeasurement && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                        <FontAwesomeIcon icon={fas.faWeightScale} />
                        <span className="font-medium">{latestMeasurement.berat_badan} kg</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                        <FontAwesomeIcon icon={fas.faRuler} />
                        <span className="font-medium">{latestMeasurement.tinggi_badan} cm</span>
                      </div>
                      <div className={`flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5 ${statusColor}`}>
                        <FontAwesomeIcon icon={fas.faChartLine} />
                        <span className="font-medium">{latestMeasurement.status_gizi}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-75">Terakhir diupdate</p>
                  <p className="font-semibold">
                    {latestMeasurement?.tanggal_pengukuran || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grafik Pertumbuhan */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={fas.faChartLine} /> Grafik Pertumbuhan {selectedAnak?.nama_anak || ""}
              </h3>
              {growthData.length > 0 ? (
                <div style={{ height: "350px", width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="tanggal" 
                        tick={{ fontSize: 11 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis yAxisId="left" label={{ value: 'Tinggi (cm)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Berat (kg)', angle: 90, position: 'insideRight', style: { fontSize: 11 } }} />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="tinggi" stroke="#285A48" strokeWidth={2} name="Tinggi Badan" />
                      <Line yAxisId="right" type="monotone" dataKey="berat" stroke="#E74C3C" strokeWidth={2} name="Berat Badan" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FontAwesomeIcon icon={fas.faChartLine} className="text-4xl mb-2 opacity-30" />
                  <p>Belum ada data pengukuran untuk {selectedAnak?.nama_anak || "anak ini"}</p>
                </div>
              )}
            </div>

            {/* Notifikasi */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={fas.faBell} /> Notifikasi Penting
              </h3>
              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div key={notif.id} className={`p-3 rounded-lg border-l-4 ${
                      notif.type === "danger" ? "border-red-500 bg-red-50" :
                      notif.type === "warning" ? "border-yellow-500 bg-yellow-50" :
                      notif.type === "success" ? "border-green-500 bg-green-50" :
                      "border-blue-500 bg-blue-50"
                    }`}>
                      <div className="flex items-start gap-3">
                        <FontAwesomeIcon 
                          icon={notif.type === "danger" ? fas.faExclamationCircle : fas.faInfoCircle} 
                          className={notif.type === "danger" ? "text-red-500 mt-0.5" : "text-blue-500 mt-0.5"}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm">{notif.title}</p>
                          <p className="text-sm text-gray-600">{notif.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FontAwesomeIcon icon={fas.faBell} className="text-4xl mb-2 opacity-30" />
                    <p>Tidak ada notifikasi baru</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
