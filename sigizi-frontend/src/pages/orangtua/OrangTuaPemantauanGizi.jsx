// sigizi-frontend/src/pages/orangtua/OrangTuaPemantauanGizi.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
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

export default function OrangTuaPemantauanGizi() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [anakList, setAnakList] = useState([]);
  const [selectedAnakId, setSelectedAnakId] = useState(null);
  const [selectedAnakData, setSelectedAnakData] = useState(null);
  const [showAnakDropdown, setShowAnakDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [zScoreData, setZScoreData] = useState(null);
  const [growthData, setGrowthData] = useState([]);

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
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_users.php`,
      );
      const data = await response.json();

      if (data.status === "success") {
        const orangTua = data.data.filter((u) => u.role === "orang_tua");
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
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_riwayat_anak.php?user_id=${userId}`,
      );
      const data = await response.json();

      if (data.status === "success") {
        const processedAnakList = data.data.map((anak) => ({
          ...anak,
          id: Number(anak.id),
          riwayat: (anak.riwayat || []).map((r) => ({
            ...r,
            tanggal_pengukuran: r.tanggal_pengukuran,
            tinggi_badan: Number(r.tinggi_badan),
            berat_badan: Number(r.berat_badan),
            z_score: r.z_score ? Number(r.z_score) : null,
            status_gizi: r.status_gizi,
          })),
        }));

        setAnakList(processedAnakList);

        if (processedAnakList.length > 0) {
          const firstAnakId = processedAnakList[0].id;
          setSelectedAnakId(firstAnakId);
          setSelectedAnakData(processedAnakList[0]);
          calculateZScore(processedAnakList[0]);
          generateGrowthData(processedAnakList[0]);
        } else {
          setSelectedAnakId(null);
          setSelectedAnakData(null);
          setZScoreData(null);
          setGrowthData([]);
        }
      } else if (data.status === "empty") {
        setAnakList([]);
        setSelectedAnakId(null);
        setSelectedAnakData(null);
        setZScoreData(null);
        setGrowthData([]);
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

    const formattedData = anak.riwayat.map((r) => ({
      tanggal: r.tanggal_pengukuran,
      tinggi: r.tinggi_badan,
      berat: r.berat_badan,
    }));
    setGrowthData(formattedData);
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

    let tbUStatus = "",
      bbUStatus = "";

    // Perhitungan TB/U
    if (months > 0 && months <= 60) {
      if (height < 0) {
        tbUStatus = "Data tidak valid";
      } else if (months <= 12) {
        const stdHeight = 50 + months * 1.5;
        const diff = height - stdHeight;
        if (diff < -5) tbUStatus = "Stunting (Severe)";
        else if (diff < -3) tbUStatus = "Stunting (Moderate)";
        else if (diff < -2) tbUStatus = "Stunting (Mild)";
        else if (diff <= 2) tbUStatus = "Normal";
        else tbUStatus = "Tinggi";
      } else {
        const stdHeight = 75 + (months - 12) * 0.8;
        const diff = height - stdHeight;
        if (diff < -6) tbUStatus = "Stunting (Severe)";
        else if (diff < -4) tbUStatus = "Stunting (Moderate)";
        else if (diff < -2) tbUStatus = "Stunting (Mild)";
        else if (diff <= 2) tbUStatus = "Normal";
        else tbUStatus = "Tinggi";
      }
    } else if (months > 60) {
      const stdHeight = 110 + (months - 60) * 0.5;
      const diff = height - stdHeight;
      if (diff < -8) tbUStatus = "Stunting (Severe)";
      else if (diff < -5) tbUStatus = "Stunting (Moderate)";
      else if (diff < -3) tbUStatus = "Stunting (Mild)";
      else if (diff <= 3) tbUStatus = "Normal";
      else tbUStatus = "Tinggi";
    }

    // Perhitungan BB/U
    let expectedWeight;
    if (months <= 12) {
      expectedWeight = 3.5 + months * 0.5;
    } else if (months <= 24) {
      expectedWeight = 8 + (months - 12) * 0.25;
    } else {
      expectedWeight = 11 + (months - 24) * 0.2;
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
      zScore: lastMeasurement.z_score,
    });
  };

  const handleOrangTuaChange = async (userId) => {
    setSelectedOrangTuaId(userId);
    await fetchData(userId);
  };

  const handleAnakChange = (anakId) => {
    const newSelectedAnakId = Number(anakId);
    setSelectedAnakId(newSelectedAnakId);
    const selectedAnak = anakList.find((a) => a.id === newSelectedAnakId);
    if (selectedAnak) {
      setSelectedAnakData(selectedAnak);
      calculateZScore(selectedAnak);
      generateGrowthData(selectedAnak);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const getStatusColor = (status) => {
    if (!status) return "border-gray-300 bg-gray-50";
    if (status === "Normal" || status === "Gizi Baik")
      return "border-green-500 bg-green-50";
    if (status === "Stunting" || status.includes("Stunting"))
      return "border-red-500 bg-red-50";
    if (status === "Pra-stunting" || status.includes("Kurang"))
      return "border-yellow-500 bg-yellow-50";
    if (status.includes("Lebih")) return "border-orange-500 bg-orange-50";
    return "border-gray-300 bg-gray-50";
  };

  const getStatusTextColor = (status) => {
    if (!status) return "text-gray-600";
    if (status === "Normal" || status === "Gizi Baik") return "text-green-700";
    if (status === "Stunting" || status.includes("Stunting"))
      return "text-red-700";
    if (status === "Pra-stunting" || status.includes("Kurang"))
      return "text-yellow-700";
    if (status.includes("Lebih")) return "text-orange-700";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar handleLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sigizi-green mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data pemantauan gizi...</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedAnak = selectedAnakData;
  const selectedOrangTua = orangTuaList.find(
    (o) => o.id === selectedOrangTuaId,
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">PEMANTUAN GIZI</h1>
          </div>

          <div className="flex gap-3">
            {userRole === "super_admin" && orangTuaList.length > 0 && (
              <select
                value={selectedOrangTuaId || ""}
                onChange={(e) => handleOrangTuaChange(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sigizi-green bg-white"
              >
                {orangTuaList.map((ot) => (
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
                      <span className="font-medium text-gray-700">
                        {selectedAnakData.nama_anak}
                      </span>
                      <FontAwesomeIcon
                        icon={fas.faChevronDown}
                        className="text-gray-400 text-sm ml-1"
                      />
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={fas.faBaby}
                        className="text-sigizi-green"
                      />
                      <span className="text-gray-700">Pilih Anak</span>
                      <FontAwesomeIcon
                        icon={fas.faChevronDown}
                        className="text-gray-400 text-sm"
                      />
                    </>
                  )}
                </button>

                {showAnakDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowAnakDropdown(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                      <div className="p-2 max-h-96 overflow-y-auto">
                        {anakList.map((anak) => {
                          const isSelected = selectedAnakId === anak.id;
                          const lastMeasurement = anak.riwayat?.slice(-1)[0];
                          const statusColor =
                            lastMeasurement?.status_gizi === "Normal"
                              ? "text-green-600"
                              : lastMeasurement?.status_gizi === "Stunting"
                                ? "text-red-600"
                                : lastMeasurement?.status_gizi ===
                                    "Pra-stunting"
                                  ? "text-yellow-600"
                                  : "text-gray-500";
                          const statusBg =
                            lastMeasurement?.status_gizi === "Normal"
                              ? "bg-green-50"
                              : lastMeasurement?.status_gizi === "Stunting"
                                ? "bg-red-50"
                                : lastMeasurement?.status_gizi ===
                                    "Pra-stunting"
                                  ? "bg-yellow-50"
                                  : "";

                          // Hitung usia
                          const birthDate = new Date(anak.tanggal_lahir);
                          const today = new Date();
                          let ageMonths =
                            (today.getFullYear() - birthDate.getFullYear()) *
                            12;
                          ageMonths -= birthDate.getMonth();
                          ageMonths += today.getMonth();
                          if (today.getDate() < birthDate.getDate())
                            ageMonths--;

                          return (
                            <button
                              key={anak.id}
                              onClick={() => {
                                handleAnakChange(anak.id);
                                setShowAnakDropdown(false);
                              }}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all mb-1 ${
                                isSelected
                                  ? "bg-sigizi-green/10 border border-sigizi-green/20"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                  isSelected ? "bg-sigizi-green" : "bg-gray-400"
                                }`}
                              >
                                {anak.nama_anak?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-semibold text-gray-800">
                                  {anak.nama_anak}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-xs mt-0.5">
                                  <span className="text-gray-500">
                                    {ageMonths > 0
                                      ? `${ageMonths} bulan`
                                      : "< 1 bulan"}
                                  </span>
                                  {lastMeasurement && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span
                                        className={`${statusColor} font-medium px-1.5 py-0.5 rounded ${statusBg}`}
                                      >
                                        {lastMeasurement.status_gizi}
                                      </span>
                                      <span className="text-gray-300">•</span>
                                      <span className="text-gray-500">
                                        {lastMeasurement.tinggi_badan} cm |{" "}
                                        {lastMeasurement.berat_badan} kg
                                      </span>
                                    </>
                                  )}
                                </div>
                                {lastMeasurement && lastMeasurement.z_score && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Z-Score: {lastMeasurement.z_score}
                                  </div>
                                )}
                              </div>
                              {isSelected && (
                                <FontAwesomeIcon
                                  icon={fas.faCheckCircle}
                                  className="text-sigizi-green text-sm"
                                />
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
                <FontAwesomeIcon
                  icon={fas.faUserShield}
                  className="text-blue-600 text-xl"
                />
                <div>
                  <p className="text-sm text-blue-800">Mode Super Admin</p>
                  <p className="font-semibold text-blue-900">
                    Menampilkan data untuk: {selectedOrangTua.nama_lengkap}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pesan jika tidak ada data */}
          {anakList.length === 0 && (
            <div className="bg-yellow-50 rounded-xl p-8 text-center mb-6">
              <FontAwesomeIcon
                icon={fas.faBaby}
                className="text-4xl text-yellow-500 mb-3"
              />
              <p className="text-gray-600 font-medium">
                Belum ada data anak untuk orang tua ini
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Silakan tambah data anak terlebih dahulu
              </p>
            </div>
          )}

          {selectedAnak && zScoreData ? (
            <>
              {/* Ringkasan Anak */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedAnak.nama_anak}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Lahir: {selectedAnak.tanggal_lahir} | Usia:{" "}
                      {zScoreData.months} bulan | Jenis Kelamin:{" "}
                      {selectedAnak.jenis_kelamin === "L"
                        ? "Laki-laki"
                        : "Perempuan"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Status Gizi Terkini</p>
                    <p
                      className={`text-xl font-bold ${getStatusTextColor(zScoreData.lastStatus)}`}
                    >
                      {zScoreData.lastStatus}
                    </p>
                    {zScoreData.zScore && (
                      <p className="text-sm text-gray-500">
                        Z-Score: {zScoreData.zScore}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Kartu TB/U dan BB/U */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div
                  className={`rounded-xl p-6 border-l-8 ${getStatusColor(zScoreData.tbUStatus)} shadow-sm`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon
                          icon={fas.faRuler}
                          className="text-gray-500 text-xl"
                        />
                        <h3 className="font-semibold text-gray-700 text-lg">
                          TB/U (Tinggi Badan per Umur)
                        </h3>
                      </div>
                      <div className="mb-3">
                        <p className="text-3xl font-bold text-gray-800">
                          {zScoreData.height} cm
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Pengukuran terakhir
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          Interpretasi:
                        </p>
                        <p
                          className={`font-semibold text-base ${getStatusTextColor(zScoreData.tbUStatus)}`}
                        >
                          {zScoreData.tbUStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-xl p-6 border-l-8 ${getStatusColor(zScoreData.bbUStatus)} shadow-sm`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon
                          icon={fas.faWeightScale}
                          className="text-gray-500 text-xl"
                        />
                        <h3 className="font-semibold text-gray-700 text-lg">
                          BB/U (Berat Badan per Umur)
                        </h3>
                      </div>
                      <div className="mb-3">
                        <p className="text-3xl font-bold text-gray-800">
                          {zScoreData.weight} kg
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Berat ideal: ~{zScoreData.expectedWeight} kg
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          Interpretasi:
                        </p>
                        <p
                          className={`font-semibold text-base ${getStatusTextColor(zScoreData.bbUStatus)}`}
                        >
                          {zScoreData.bbUStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grafik Pertumbuhan */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={fas.faChartLine} /> Grafik Pertumbuhan
                  Anak
                </h3>
                {growthData.length > 0 ? (
                  <div style={{ height: "400px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={growthData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
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
                          label={{
                            value: "Tinggi (cm)",
                            angle: -90,
                            position: "insideLeft",
                            style: { textAnchor: "middle" },
                          }}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          label={{
                            value: "Berat (kg)",
                            angle: 90,
                            position: "insideRight",
                            style: { textAnchor: "middle" },
                          }}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                          }}
                          labelStyle={{ fontWeight: "bold", color: "#285A48" }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="tinggi"
                          stroke="#285A48"
                          strokeWidth={3}
                          name="Tinggi Badan"
                          dot={{ fill: "#285A48", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="berat"
                          stroke="#E74C3C"
                          strokeWidth={3}
                          name="Berat Badan"
                          dot={{ fill: "#E74C3C", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FontAwesomeIcon
                      icon={fas.faChartLine}
                      className="text-4xl mb-3 opacity-30"
                    />
                    <p>Belum ada data pengukuran untuk anak ini</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            anakList.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                <FontAwesomeIcon
                  icon={fas.faAppleAlt}
                  className="text-4xl text-yellow-500 mb-3"
                />
                <p className="text-gray-600 font-medium">
                  Belum ada data pengukuran untuk ditampilkan
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Silakan tambahkan data anak dan lakukan pengukuran terlebih
                  dahulu
                </p>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
