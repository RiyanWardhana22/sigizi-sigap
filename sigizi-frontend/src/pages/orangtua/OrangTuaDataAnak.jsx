// sigizi-frontend/src/pages/orangtua/OrangTuaDataAnak.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";

export default function OrangTuaDataAnak() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [anakList, setAnakList] = useState([]);
  const [selectedAnakId, setSelectedAnakId] = useState(null);
  const [selectedAnakData, setSelectedAnakData] = useState(null);
  const [showAnakDropdown, setShowAnakDropdown] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [orangTuaList, setOrangTuaList] = useState([]);
  const [selectedOrangTuaId, setSelectedOrangTuaId] = useState(null);
  
  const [formData, setFormData] = useState({
    nama_anak: "",
    tanggal_lahir: "",
    jenis_kelamin: "L",
    tinggi_badan: "",
    berat_badan: "",
    lingkar_kepala: ""
  });

  const [updateData, setUpdateData] = useState({
    tinggi_badan: "",
    berat_badan: "",
    lingkar_kepala: ""
  });

  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    const parsedUser = JSON.parse(userData);
    console.log("User data:", parsedUser);
    setUser(parsedUser);
    setUserRole(parsedUser.role);
    
    if (parsedUser.role === "super_admin") {
      fetchOrangTuaList();
    } else if (parsedUser.role === "orang_tua") {
      fetchData(parsedUser.id);
    } else {
      navigate("/dashboard");
    }
  }, [navigate]);

  const fetchOrangTuaList = async () => {
    try {
      console.log("Fetching orang tua list...");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_users.php`);
      const data = await response.json();
      console.log("Orang tua list response:", data);
      
      if (data.status === "success") {
        const orangTua = data.data.filter(u => u.role === "orang_tua");
        console.log("Filtered orang tua:", orangTua);
        setOrangTuaList(orangTua);
        if (orangTua.length > 0) {
          setSelectedOrangTuaId(orangTua[0].id);
          await fetchData(orangTua[0].id);
        } else {
          setLoading(false);
        }
      } else {
        setError("Gagal memuat data orang tua");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching orang tua list:", error);
      setError("Gagal memuat data orang tua: " + error.message);
      setLoading(false);
    }
  };

  const fetchData = async (userId) => {
    setLoading(true);
    setError(null);
    
    console.log("Fetching data for user ID:", userId);
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/get_riwayat_anak.php?user_id=${userId}`;
    console.log("API URL:", apiUrl);
    
    try {
      const response = await fetch(apiUrl);
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Full API Response:", data);
      
      if (data.status === "success") {
        const validAnakList = data.data.map(anak => ({
          ...anak,
          id: Number(anak.id),
          riwayat: (anak.riwayat || []).map(r => ({
            ...r,
            tanggal_pengukuran: r.tanggal_pengukuran,
            tinggi_badan: Number(r.tinggi_badan),
            berat_badan: Number(r.berat_badan),
            lingkar_kepala: r.lingkar_kepala ? Number(r.lingkar_kepala) : null,
            z_score: r.z_score ? Number(r.z_score) : null,
            status_gizi: r.status_gizi
          }))
        }));
        
        console.log("Processed anak list:", validAnakList.map(a => ({ id: a.id, nama: a.nama_anak })));
        setAnakList(validAnakList);
        
        if (validAnakList.length > 0) {
          const firstAnakId = validAnakList[0].id;
          console.log("Setting selected anak ID to:", firstAnakId);
          setSelectedAnakId(firstAnakId);
          setSelectedAnakData(validAnakList[0]);
        } else {
          setSelectedAnakId(null);
          setSelectedAnakData(null);
        }
      } else if (data.status === "empty") {
        console.log("No data found");
        setAnakList([]);
        setSelectedAnakId(null);
        setSelectedAnakData(null);
      } else {
        setError(data.message || "Gagal memuat data anak");
        setAnakList([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Terjadi kesalahan saat memuat data: " + error.message);
      setAnakList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrangTuaChange = async (userId) => {
    console.log("Changing orang tua to:", userId);
    setSelectedOrangTuaId(userId);
    await fetchData(userId);
  };

  const handleAnakChange = (anakId) => {
    console.log("Changing selected anak to:", anakId);
    const newSelectedAnakId = Number(anakId);
    setSelectedAnakId(newSelectedAnakId);
    
    const selectedAnak = anakList.find(a => a.id === newSelectedAnakId);
    if (selectedAnak) {
      console.log("Selected anak data:", selectedAnak);
      setSelectedAnakData(selectedAnak);
    } else {
      setSelectedAnakData(null);
    }
    
    setUpdateData({
      tinggi_badan: "",
      berat_badan: "",
      lingkar_kepala: ""
    });
    setShowAnalysis(false);
    setAnalysisResult(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateChange = (e) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

  const handleAddAnak = async (e) => {
    e.preventDefault();
    const targetUserId = userRole === "super_admin" ? selectedOrangTuaId : user.id;
    const payload = { ...formData, orang_tua_id: targetUserId };
    
    console.log("Adding anak with payload:", payload);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/add_anak.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("Add anak response:", data);
      
      if (data.status === "success") {
        alert("Data anak berhasil ditambahkan!");
        setFormData({
          nama_anak: "",
          tanggal_lahir: "",
          jenis_kelamin: "L",
          tinggi_badan: "",
          berat_badan: "",
          lingkar_kepala: ""
        });
        setShowAddForm(false);
        await fetchData(targetUserId);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal menambahkan data anak: " + error.message);
    }
  };

  const handleUpdatePertumbuhan = async (e) => {
    e.preventDefault();
    if (!selectedAnakId) return;
    
    const targetUserId = userRole === "super_admin" ? selectedOrangTuaId : user.id;
    
    const payload = {
        anak_id: selectedAnakId,
        orang_tua_id: targetUserId,
        tinggi_badan: updateData.tinggi_badan,
        berat_badan: updateData.berat_badan,
        tanggal_pengukuran: new Date().toISOString().split('T')[0]
    };
    
    if (updateData.lingkar_kepala && updateData.lingkar_kepala.trim() !== "") {
        payload.lingkar_kepala = updateData.lingkar_kepala;
    }
    
    console.log("Update growth payload:", payload);
    
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/add_pengukuran.php`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("JSON Parse error:", e);
            throw new Error("Server mengembalikan response yang tidak valid");
        }
        
        if (data.status === "success") {
            setAnalysisResult(data.hasil);
            setShowAnalysis(true);
            
            setUpdateData({
                tinggi_badan: "",
                berat_badan: "",
                lingkar_kepala: ""
            });
            
            setShowUpdateForm(false);
            await fetchData(targetUserId);
            
            setTimeout(() => {
                setShowAnalysis(false);
            }, 5000);
        } else {
            alert(data.message || "Gagal mengupdate data pertumbuhan");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan: " + error.message);
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

  const getStatusBadge = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const statusMap = {
      "Normal": "bg-green-100 text-green-800",
      "Stunting": "bg-red-100 text-red-800",
      "Pra-stunting": "bg-yellow-100 text-yellow-800",
      "Gizi Kurang": "bg-orange-100 text-orange-800",
      "Gizi Buruk": "bg-red-100 text-red-800",
      "Gizi Lebih": "bg-blue-100 text-blue-800"
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const age = selectedAnakData ? calculateAge(selectedAnakData.tanggal_lahir) : null;
  const selectedOrangTua = orangTuaList.find(o => o.id === selectedOrangTuaId);

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
        <header className="bg-white shadow px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={fas.faChild} className="text-2xl text-sigizi-green" />
            <h1 className="text-xl font-bold text-gray-800">Data Anak</h1>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-sigizi-green text-white px-4 py-2 rounded-lg hover:bg-sigizi-light-green transition"
            >
              <FontAwesomeIcon icon={fas.faPlus} /> Tambah Anak
            </button>
            {selectedAnakData && (
              <button
                onClick={() => setShowUpdateForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <FontAwesomeIcon icon={fas.faChartLine} /> Update Pertumbuhan
              </button>
            )}
          </div>
        </header>

        <main className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <FontAwesomeIcon icon={fas.faExclamationTriangle} className="mr-2" />
              {error}
            </div>
          )}
          
          {/* Super Admin Mode */}
          {userRole === "super_admin" && orangTuaList.length > 0 && (
            <div className="mb-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <FontAwesomeIcon icon={fas.faUsers} className="text-blue-600" />
                <h3 className="font-semibold text-blue-800">Mode Super Admin</h3>
              </div>
              <select
                value={selectedOrangTuaId || ""}
                onChange={(e) => handleOrangTuaChange(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {orangTuaList.map(ot => (
                  <option key={ot.id} value={ot.id}>
                    {ot.nama_lengkap} - {ot.email}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Analysis Result */}
          {showAnalysis && analysisResult && (
            <div className="mb-6 bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">Hasil Analisis</h3>
                  <p>Usia: {analysisResult.umur_bulan} bulan</p>
                  <p>Z-Score: {analysisResult.z_score}</p>
                  <p>Status: {analysisResult.status_gizi}</p>
                </div>
                <button onClick={() => setShowAnalysis(false)} className="text-gray-500">
                  <FontAwesomeIcon icon={fas.faTimes} />
                </button>
              </div>
            </div>
          )}

          {/* Dropdown Anak dengan tampilan foto profil */}
          {anakList.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Anak</label>
              <div className="relative">
                <button
                  onClick={() => setShowAnakDropdown(!showAnakDropdown)}
                  className="w-full md:w-96 flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sigizi-green transition"
                >
                  <div className="flex items-center gap-3">
                    {selectedAnakData ? (
                      <>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sigizi-green to-sigizi-light-green flex items-center justify-center text-white font-bold text-sm">
                          {selectedAnakData.nama_anak?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-800">{selectedAnakData.nama_anak}</p>
                          <p className="text-xs text-gray-500">
                            {selectedAnakData.tanggal_lahir}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={fas.faBaby} className="text-sigizi-green text-xl" />
                        <span className="text-gray-700">Pilih Anak</span>
                      </>
                    )}
                  </div>
                  <FontAwesomeIcon icon={fas.faChevronDown} className="text-gray-400" />
                </button>
                
                {showAnakDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowAnakDropdown(false)}
                    ></div>
                    <div className="absolute left-0 mt-2 w-full md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
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
                                    Lahir: {anak.tanggal_lahir}
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
                                {anak.riwayat && anak.riwayat.length > 0 && (
                                  <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                    <span>T: {anak.riwayat[anak.riwayat.length - 1].tinggi_badan} cm</span>
                                    <span>B: {anak.riwayat[anak.riwayat.length - 1].berat_badan} kg</span>
                                  </div>
                                )}
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
            </div>
          )}

          {/* Profile Anak - Menggunakan selectedAnakData */}
          {selectedAnakData && (
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
            </div>
          )}

          {/* Riwayat Gizi - Menggunakan selectedAnakData */}
          {selectedAnakData && selectedAnakData.riwayat && selectedAnakData.riwayat.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Riwayat Gizi</h3>
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
                        <td className="px-4 py-2">{item.z_score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedAnakData && (!selectedAnakData.riwayat || selectedAnakData.riwayat.length === 0) && (
            <div className="bg-yellow-50 rounded-xl p-6 text-center">
              <p>Belum ada data pengukuran untuk anak ini</p>
              <button
                onClick={() => setShowUpdateForm(true)}
                className="mt-3 bg-sigizi-green text-white px-6 py-2 rounded-lg"
              >
                Tambah Pengukuran
              </button>
            </div>
          )}

          {anakList.length === 0 && !error && (
            <div className="bg-blue-50 rounded-xl p-8 text-center">
              <p>Belum ada data anak</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-3 bg-sigizi-green text-white px-6 py-2 rounded-lg"
              >
                Tambah Anak
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modal Tambah Anak */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Tambah Anak Baru</h2>
            <form onSubmit={handleAddAnak} className="space-y-4">
              <input
                type="text"
                name="nama_anak"
                placeholder="Nama Anak"
                value={formData.nama_anak}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="date"
                name="tanggal_lahir"
                value={formData.tanggal_lahir}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <select
                name="jenis_kelamin"
                value={formData.jenis_kelamin}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
              <input
                type="number"
                step="0.1"
                name="tinggi_badan"
                placeholder="Tinggi Badan (cm)"
                value={formData.tinggi_badan}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="number"
                step="0.1"
                name="berat_badan"
                placeholder="Berat Badan (kg)"
                value={formData.berat_badan}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Batal</button>
                <button type="submit" className="flex-1 bg-sigizi-green text-white py-2 rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Update Pertumbuhan */}
      {showUpdateForm && selectedAnakData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Update Pertumbuhan - {selectedAnakData.nama_anak}</h2>
            <form onSubmit={handleUpdatePertumbuhan} className="space-y-4">
              <input
                type="number"
                step="0.1"
                name="tinggi_badan"
                placeholder="Tinggi Badan (cm)"
                value={updateData.tinggi_badan}
                onChange={handleUpdateChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="number"
                step="0.1"
                name="berat_badan"
                placeholder="Berat Badan (kg)"
                value={updateData.berat_badan}
                onChange={handleUpdateChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowUpdateForm(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Batal</button>
                <button type="submit" className="flex-1 bg-sigizi-green text-white py-2 rounded-lg">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}