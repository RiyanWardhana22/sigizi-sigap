// sigizi-frontend/src/pages/orangtua/OrangTuaDataAnak.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnak } from "../../contexts/AnakContext";
import Sidebar from "../../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";

const PENGHASILAN_OPTIONS = [
  "0 - 1.000.000",
  "1.000.000 - 2.000.000",
  "2.000.000 - 3.000.000",
  "3.000.000 - 4.000.000",
  "4.000.000 - 5.000.000",
  "5.000.000 - 6.000.000",
  "6.000.000 - 7.000.000",
  "7.000.000 - 8.000.000",
  "8.000.000 - 9.000.000",
  "9.000.000 - 10.000.000",
  ">10.000.000",
];

const PENDIDIKAN_OPTIONS = [
  "Tidak Sekolah",
  "SD",
  "SMP",
  "SMA",
  "SMK",
  "D1",
  "D2",
  "D3",
  "D4",
  "S1",
  "S2",
  "S3",
  "Spesialis",
];

export default function OrangTuaDataAnak() {
  const navigate = useNavigate();
  const {
    selectedAnakId,
    selectedAnakData,
    anakList,
    updateSelectedAnak,
    updateAnakList,
    currentUserId,
    currentUserRole,
  } = useAnak();

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [showAnakDropdown, setShowAnakDropdown] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [profilLengkap, setProfilLengkap] = useState(null);
  const [profilData, setProfilData] = useState(null);
  const [showProfilForm, setShowProfilForm] = useState(false);
  const [wilayahList, setWilayahList] = useState([]);
  const [profilForm, setProfilForm] = useState({
    tanggal_lahir: "",
    wilayah_id: "",
    penghasilan_range: "",
    pendidikan_ibu: "",
    sanitasi: "",
    kualitas_air: "",
    akses_kesehatan: "",
  });
  const [profilSaving, setProfilSaving] = useState(false);
  const [profilMessage, setProfilMessage] = useState({ type: "", text: "" });

  const [orangTuaList, setOrangTuaList] = useState([]);
  const [selectedOrangTuaId, setSelectedOrangTuaId] = useState(null);
  const [superAdminAnakList, setSuperAdminAnakList] = useState([]);
  const [superAdminSelectedAnak, setSuperAdminSelectedAnak] = useState(null);
  const [superAdminShowAnakDropdown, setSuperAdminShowAnakDropdown] =
    useState(false);

  const [formData, setFormData] = useState({
    nama_anak: "",
    tanggal_lahir: "",
    jenis_kelamin: "L",
    tinggi_badan: "",
    berat_badan: "",
    lingkar_kepala: "",
  });

  const [updateData, setUpdateData] = useState({
    tinggi_badan: "",
    berat_badan: "",
    lingkar_kepala: "",
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
    setUser(parsedUser);
    setUserRole(parsedUser.role);

    if (parsedUser.role === "super_admin") {
      fetchOrangTuaList();
    } else if (parsedUser.role === "orang_tua") {
      fetchProfil(parsedUser.id);
      fetchWilayah();
      fetchData(parsedUser.id, "orang_tua");
    } else {
      navigate("/dashboard");
    }
  }, [navigate]);

  const fetchWilayah = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_wilayah.php`,
      );
      const data = await res.json();
      if (data.status === "success") setWilayahList(data.data);
    } catch (e) {
      console.error("Gagal memuat wilayah:", e);
    }
  };

  const fetchProfil = async (userId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/profil_orangtua.php?user_id=${userId}`,
      );
      const data = await res.json();
      if (data.status === "success") {
        setProfilData(data.data);
        setProfilLengkap(data.data.profil_lengkap);
        if (!data.data.profil_lengkap) setShowProfilForm(true);
        setProfilForm({
          tanggal_lahir: data.data.tanggal_lahir || "",
          wilayah_id: data.data.wilayah_id || "",
          penghasilan_range: data.data.penghasilan_range || "",
          pendidikan_ibu: data.data.pendidikan_ibu || "",
          sanitasi: data.data.sanitasi || "",
          kualitas_air: data.data.kualitas_air || "",
          akses_kesehatan: data.data.akses_kesehatan || "",
        });
      } else {
        setProfilLengkap(false);
        setShowProfilForm(true);
      }
    } catch (e) {
      console.error("Gagal memuat profil:", e);
      setProfilLengkap(false);
    }
  };

  const handleSimpanProfil = async (e) => {
    e.preventDefault();
    setProfilSaving(true);
    setProfilMessage({ type: "", text: "" });
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/profil_orangtua.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id, ...profilForm }),
        },
      );
      const data = await res.json();
      if (data.status === "success") {
        setProfilMessage({
          type: "success",
          text: "Data diri berhasil disimpan!",
        });
        setProfilLengkap(true);
        const wilayah = wilayahList.find((w) => w.id == profilForm.wilayah_id);
        setProfilData((prev) => ({
          ...prev,
          ...profilForm,
          nama_kabupaten: wilayah?.nama_kabupaten || "",
          profil_lengkap: true,
        }));
        setTimeout(() => {
          setShowProfilForm(false);
          setProfilMessage({ type: "", text: "" });
        }, 1500);
      } else {
        setProfilMessage({ type: "error", text: data.message });
      }
    } catch (e) {
      setProfilMessage({ type: "error", text: "Terjadi kesalahan sistem" });
    } finally {
      setProfilSaving(false);
    }
  };

  const fetchOrangTuaList = async () => {
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
          await fetchData(orangTua[0].id, "super_admin");
        } else {
          setLoading(false);
        }
      } else {
        setError("Gagal memuat data orang tua");
        setLoading(false);
      }
    } catch (error) {
      setError("Gagal memuat data orang tua: " + error.message);
      setLoading(false);
    }
  };

  const fetchData = async (userId, role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_riwayat_anak.php?user_id=${userId}`,
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.status === "success") {
        const validAnakList = data.data.map((anak) => ({
          ...anak,
          id: Number(anak.id),
          riwayat: (anak.riwayat || []).map((r) => ({
            ...r,
            tanggal_pengukuran: r.tanggal_pengukuran,
            tinggi_badan: Number(r.tinggi_badan),
            berat_badan: Number(r.berat_badan),
            lingkar_kepala: r.lingkar_kepala ? Number(r.lingkar_kepala) : null,
            z_score: r.z_score ? Number(r.z_score) : null,
            status_gizi: r.status_gizi,
          })),
        }));

        if (role === "orang_tua") {
          updateAnakList(validAnakList, userId, role);
        } else {
          setSuperAdminAnakList(validAnakList);
          if (validAnakList.length > 0 && !superAdminSelectedAnak) {
            setSuperAdminSelectedAnak(validAnakList[0]);
          } else if (validAnakList.length === 0) {
            setSuperAdminSelectedAnak(null);
          }
        }
      } else if (data.status === "empty") {
        if (role === "orang_tua") updateAnakList([], userId, role);
        else {
          setSuperAdminAnakList([]);
          setSuperAdminSelectedAnak(null);
        }
      } else {
        setError(data.message || "Gagal memuat data anak");
        if (role === "orang_tua") updateAnakList([], userId, role);
        else {
          setSuperAdminAnakList([]);
          setSuperAdminSelectedAnak(null);
        }
      }
    } catch (error) {
      setError("Terjadi kesalahan saat memuat data: " + error.message);
      if (role === "orang_tua") updateAnakList([], userId, role);
      else {
        setSuperAdminAnakList([]);
        setSuperAdminSelectedAnak(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOrangTuaChange = async (userId) => {
    setSelectedOrangTuaId(userId);
    setSuperAdminSelectedAnak(null);
    await fetchData(userId, "super_admin");
  };

  const handleAnakChange = (anakId) => {
    const anak = anakList.find((a) => a.id === anakId);
    if (anak) updateSelectedAnak(anakId, anak, currentUserId);
    setShowAnakDropdown(false);
    setUpdateData({ tinggi_badan: "", berat_badan: "", lingkar_kepala: "" });
    setShowAnalysis(false);
    setAnalysisResult(null);
  };

  const handleSuperAdminAnakChange = (anak) => {
    setSuperAdminSelectedAnak(anak);
    setSuperAdminShowAnakDropdown(false);
    setUpdateData({ tinggi_badan: "", berat_badan: "", lingkar_kepala: "" });
    setShowAnalysis(false);
    setAnalysisResult(null);
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleUpdateChange = (e) =>
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });

  const handleClickTambahAnak = () => {
    if (userRole === "orang_tua" && !profilLengkap) {
      setShowProfilForm(true);
    } else {
      setShowAddForm(true);
    }
  };

  const handleAddAnak = async (e) => {
    e.preventDefault();
    const targetUserId =
      userRole === "super_admin" ? selectedOrangTuaId : user.id;
    const payload = {
      ...formData,
      orang_tua_id: targetUserId,
      lingkar_kepala:
        formData.lingkar_kepala && formData.lingkar_kepala.trim() !== ""
          ? formData.lingkar_kepala
          : null,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/add_anak.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.status === "success") {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Data anak berhasil ditambahkan!",
          showConfirmButton: false,
          timer: 1500,
        });
        setFormData({
          nama_anak: "",
          tanggal_lahir: "",
          jenis_kelamin: "L",
          tinggi_badan: "",
          berat_badan: "",
          lingkar_kepala: "",
        });
        setShowAddForm(false);
        await fetchData(
          targetUserId,
          userRole === "super_admin" ? "super_admin" : "orang_tua",
        );
      } else {
        alert(data.message || "Gagal menambahkan data anak");
      }
    } catch (error) {
      alert("Gagal menambahkan data anak: " + error.message);
    }
  };

  const handleUpdatePertumbuhan = async (e) => {
    e.preventDefault();
    const currentAnakId =
      userRole === "orang_tua" ? selectedAnakId : superAdminSelectedAnak?.id;
    if (!currentAnakId) return;
    const targetUserId =
      userRole === "super_admin" ? selectedOrangTuaId : user.id;

    const payload = {
      anak_id: currentAnakId,
      orang_tua_id: targetUserId,
      tinggi_badan: updateData.tinggi_badan,
      berat_badan: updateData.berat_badan,
      tanggal_pengukuran: new Date().toISOString().split("T")[0],
    };
    if (updateData.lingkar_kepala && updateData.lingkar_kepala.trim() !== "") {
      payload.lingkar_kepala = parseFloat(updateData.lingkar_kepala);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/add_pengukuran.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = JSON.parse(await response.text());

      if (data.status === "success") {
        setAnalysisResult(data.hasil);
        setShowAnalysis(true);
        setUpdateData({
          tinggi_badan: "",
          berat_badan: "",
          lingkar_kepala: "",
        });
        setShowUpdateForm(false);
        await fetchData(
          targetUserId,
          userRole === "super_admin" ? "super_admin" : "orang_tua",
        );
        setTimeout(() => setShowAnalysis(false), 5000);
      } else {
        alert(data.message || "Gagal mengupdate data pertumbuhan");
      }
    } catch (error) {
      alert("Terjadi kesalahan: " + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("selectedAnakId");
    localStorage.removeItem("currentUserId");
    navigate("/");
  };

  const calculateDetailedAge = (birthDate, measurementDate = null) => {
    if (!birthDate)
      return { years: 0, months: 0, days: 0, totalMonths: 0, totalDays: 0 };
    const birth = new Date(birthDate);
    const today = measurementDate ? new Date(measurementDate) : new Date();
    if (isNaN(birth.getTime()) || isNaN(today.getTime()))
      return { years: 0, months: 0, days: 0, totalMonths: 0, totalDays: 0 };
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return {
      years,
      months,
      days,
      totalMonths: years * 12 + months,
      totalDays: Math.floor((today - birth) / 86400000),
    };
  };

  const formatAge = (age) => {
    if (!age) return "-";
    const parts = [];
    if (age.years > 0) parts.push(`${age.years} thn`);
    if (age.months > 0) parts.push(`${age.months} bln`);
    if (age.days > 0) parts.push(`${age.days} hr`);
    return parts.length === 0 ? "< 1 hari" : parts.join(" ");
  };

  const calculateOrangTuaAge = (tanggalLahir) => {
    if (!tanggalLahir) return null;
    const birth = new Date(tanggalLahir);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
    return years;
  };

  const getStatusBadge = (status) => {
    const map = {
      Normal: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Stunting: "bg-red-100 text-red-700 border-red-200",
      "Pra-stunting": "bg-amber-100 text-amber-700 border-amber-200",
      Wasting: "bg-orange-100 text-orange-700 border-orange-200",
      "Gizi Lebih": "bg-blue-100 text-blue-700 border-blue-200",
    };
    return map[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const displayAnakData =
    userRole === "orang_tua" ? selectedAnakData : superAdminSelectedAnak;
  const displayAnakList =
    userRole === "orang_tua" ? anakList : superAdminAnakList;
  const displaySelectedAnakId =
    userRole === "orang_tua" ? selectedAnakId : superAdminSelectedAnak?.id;
  const ageDetail = displayAnakData
    ? calculateDetailedAge(displayAnakData.tanggal_lahir)
    : null;
  const formattedAge = ageDetail ? formatAge(ageDetail) : "-";
  const selectedOrangTua = orangTuaList.find(
    (o) => o.id === selectedOrangTuaId,
  );

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
        {/* Header Modern */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-emerald-100 px-8 py-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Data Anak</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Kelola data anak dan pantau pertumbuhannya
              </p>
            </div>
          </div>
        </header>

        <main className="p-8 overflow-y-auto">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-xl">
                <FontAwesomeIcon
                  icon={fas.faExclamationTriangle}
                  className="text-red-500"
                />
              </div>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Banner profil belum lengkap */}
          {userRole === "orang_tua" && profilLengkap === false && (
            <div className="mb-6 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-amber-100 p-2.5 rounded-xl">
                    <FontAwesomeIcon
                      icon={fas.faCircleExclamation}
                      className="text-amber-600 text-xl"
                    />
                  </div>
                  <h3 className="font-bold text-amber-800 text-lg">
                    Lengkapi Data Diri Terlebih Dahulu
                  </h3>
                </div>
                <p className="text-sm text-amber-700 ml-14">
                  Sebelum menambah data anak, Anda perlu melengkapi data diri
                  meliputi tanggal lahir, domisili, penghasilan, pendidikan ibu,
                  kondisi sanitasi, kualitas air, dan akses layanan kesehatan.
                </p>
              </div>
              <button
                onClick={() => setShowProfilForm(true)}
                className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-amber-200 hover:shadow-lg flex items-center gap-2"
              >
                <FontAwesomeIcon icon={fas.faUserEdit} /> Lengkapi Sekarang
              </button>
            </div>
          )}

          {/* Info profil sudah lengkap */}
          {userRole === "orang_tua" && profilLengkap === true && profilData && (
            <div className="mb-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-700 flex items-center gap-3 text-lg">
                  <div className="bg-emerald-100 p-2 rounded-xl">
                    <FontAwesomeIcon
                      icon={fas.faIdCard}
                      className="text-emerald-600"
                    />
                  </div>
                  Data Diri Orang Tua
                </h3>
                <button
                  onClick={() => setShowProfilForm(true)}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-all"
                >
                  <FontAwesomeIcon icon={fas.faEdit} className="mr-2" /> Edit
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                {[
                  {
                    label: "Tanggal Lahir",
                    value: profilData.tanggal_lahir || "-",
                    sub: profilData.tanggal_lahir
                      ? `${calculateOrangTuaAge(profilData.tanggal_lahir)} thn`
                      : null,
                    icon: fas.faCalendar,
                    color: "blue",
                  },
                  {
                    label: "Domisili",
                    value: profilData.nama_kabupaten || "-",
                    icon: fas.faLocationDot,
                    color: "emerald",
                  },
                  {
                    label: "Penghasilan/bln",
                    value: `Rp ${profilData.penghasilan_range || "-"}`,
                    icon: fas.faMoneyBillWave,
                    color: "emerald",
                  },
                  {
                    label: "Pendidikan Ibu",
                    value: profilData.pendidikan_ibu || "-",
                    icon: fas.faGraduationCap,
                    color: "indigo",
                  },
                  {
                    label: "Sanitasi",
                    value: profilData.sanitasi || "-",
                    icon: fas.faToilet,
                    color: "gray",
                  },
                  {
                    label: "Kualitas Air",
                    value: profilData.kualitas_air || "-",
                    icon: fas.faDroplet,
                    color: "cyan",
                  },
                  {
                    label: "Akses Kesehatan",
                    value: profilData.akses_kesehatan || "-",
                    icon: fas.faHospital,
                    color: "purple",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <p className="text-gray-400 text-xs flex items-center gap-1.5 mb-2 font-medium">
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={`text-${item.color}-500`}
                      />{" "}
                      {item.label}
                    </p>
                    <p className="font-bold text-gray-700 text-sm">
                      {item.value}
                    </p>
                    {item.sub && (
                      <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Super Admin: Pilih Orang Tua */}
          {userRole === "super_admin" && orangTuaList.length > 0 && (
            <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <FontAwesomeIcon
                    icon={fas.faUsers}
                    className="text-blue-600 text-lg"
                  />
                </div>
                <h3 className="font-bold text-blue-800 text-lg">
                  Mode Super Admin
                </h3>
              </div>
              <select
                value={selectedOrangTuaId || ""}
                onChange={(e) => handleOrangTuaChange(parseInt(e.target.value))}
                className="w-full px-5 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-medium"
              >
                {orangTuaList.map((ot) => (
                  <option key={ot.id} value={ot.id}>
                    {ot.nama_lengkap} - {ot.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-blue-500 mt-3 flex items-center gap-1.5">
                <FontAwesomeIcon icon={fas.faInfoCircle} />
                Pemilihan anak hanya untuk tampilan saat ini, tidak tersimpan
                antar menu
              </p>
            </div>
          )}

          {/* Hasil Analisis */}
          {showAnalysis && analysisResult && (
            <div className="mb-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200 animate-fadeIn">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 p-3 rounded-xl">
                    <FontAwesomeIcon
                      icon={fas.faChartBar}
                      className="text-emerald-600 text-xl"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      Hasil Analisis Gizi
                    </h3>
                    <div className="grid grid-cols-3 gap-6 mt-3">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Usia
                        </p>
                        <p className="font-bold text-gray-800">
                          {analysisResult.umur_bulan} bulan
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Z-Score
                        </p>
                        <p className="font-bold text-emerald-600">
                          {analysisResult.z_score}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Status Gizi
                        </p>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(analysisResult.status_gizi)}`}
                        >
                          {analysisResult.status_gizi}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-xl shadow-sm"
                >
                  <FontAwesomeIcon icon={fas.faTimes} />
                </button>
              </div>
            </div>
          )}

          {/* Dropdown Anak + Tombol Aksi */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-4 items-end justify-between">
              <div className="flex-1 min-w-[300px]">
                {displayAnakList.length > 0 && (
                  <>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Pilih Anak
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => {
                          if (userRole === "orang_tua")
                            setShowAnakDropdown(!showAnakDropdown);
                          else
                            setSuperAdminShowAnakDropdown(
                              !superAdminShowAnakDropdown,
                            );
                        }}
                        className="w-full flex items-center justify-between px-5 py-3.5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          {displayAnakData ? (
                            <>
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                                {displayAnakData.nama_anak
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-gray-800">
                                  {displayAnakData.nama_anak}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Lahir: {displayAnakData.tanggal_lahir}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={fas.faBaby}
                                className="text-emerald-600 text-2xl"
                              />
                              <span className="text-gray-700 font-medium">
                                Pilih Anak
                              </span>
                            </>
                          )}
                        </div>
                        <FontAwesomeIcon
                          icon={fas.faChevronDown}
                          className="text-gray-400"
                        />
                      </button>

                      {/* Dropdown orang_tua */}
                      {userRole === "orang_tua" && showAnakDropdown && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowAnakDropdown(false)}
                          ></div>
                          <div className="absolute left-0 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                            <div className="p-2 max-h-96 overflow-y-auto">
                              {displayAnakList.map((anak) => {
                                const isSelected =
                                  displaySelectedAnakId === anak.id;
                                const lastStatus =
                                  anak.riwayat?.slice(-1)[0]?.status_gizi;
                                const anakAge = calculateDetailedAge(
                                  anak.tanggal_lahir,
                                );
                                const badgeClass = getStatusBadge(lastStatus);
                                return (
                                  <button
                                    key={anak.id}
                                    onClick={() => handleAnakChange(anak.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 ${isSelected ? "bg-emerald-50 border border-emerald-200" : "hover:bg-gray-50"}`}
                                  >
                                    <div
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${isSelected ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gray-400"}`}
                                    >
                                      {anak.nama_anak?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 text-left">
                                      <p className="font-bold text-gray-800">
                                        {anak.nama_anak}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-2 text-xs mt-0.5">
                                        <span className="text-gray-500">
                                          {anak.tanggal_lahir}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-blue-600 font-bold">
                                          {formatAge(anakAge)}
                                        </span>
                                        {lastStatus && (
                                          <>
                                            <span className="text-gray-300">
                                              •
                                            </span>
                                            <span
                                              className={`font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}
                                            >
                                              {lastStatus}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                      {anak.riwayat &&
                                        anak.riwayat.length > 0 && (
                                          <div className="flex gap-4 text-xs text-gray-500 mt-1 font-medium">
                                            <span>
                                              T:{" "}
                                              {
                                                anak.riwayat[
                                                  anak.riwayat.length - 1
                                                ].tinggi_badan
                                              }{" "}
                                              cm
                                            </span>
                                            <span>
                                              B:{" "}
                                              {
                                                anak.riwayat[
                                                  anak.riwayat.length - 1
                                                ].berat_badan
                                              }{" "}
                                              kg
                                            </span>
                                          </div>
                                        )}
                                    </div>
                                    {isSelected && (
                                      <FontAwesomeIcon
                                        icon={fas.faCheckCircle}
                                        className="text-emerald-600"
                                      />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Dropdown super_admin */}
                      {userRole === "super_admin" &&
                        superAdminShowAnakDropdown && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() =>
                                setSuperAdminShowAnakDropdown(false)
                              }
                            ></div>
                            <div className="absolute left-0 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                              <div className="p-2 max-h-96 overflow-y-auto">
                                {displayAnakList.map((anak) => {
                                  const isSelected =
                                    displaySelectedAnakId === anak.id;
                                  const lastStatus =
                                    anak.riwayat?.slice(-1)[0]?.status_gizi;
                                  const anakAge = calculateDetailedAge(
                                    anak.tanggal_lahir,
                                  );
                                  const badgeClass = getStatusBadge(lastStatus);
                                  return (
                                    <button
                                      key={anak.id}
                                      onClick={() =>
                                        handleSuperAdminAnakChange(anak)
                                      }
                                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 ${isSelected ? "bg-emerald-50 border border-emerald-200" : "hover:bg-gray-50"}`}
                                    >
                                      <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${isSelected ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gray-400"}`}
                                      >
                                        {anak.nama_anak
                                          ?.charAt(0)
                                          .toUpperCase()}
                                      </div>
                                      <div className="flex-1 text-left">
                                        <p className="font-bold text-gray-800">
                                          {anak.nama_anak}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs mt-0.5">
                                          <span className="text-gray-500">
                                            {anak.tanggal_lahir}
                                          </span>
                                          <span className="text-gray-300">
                                            •
                                          </span>
                                          <span className="text-blue-600 font-bold">
                                            {formatAge(anakAge)}
                                          </span>
                                          {lastStatus && (
                                            <>
                                              <span className="text-gray-300">
                                                •
                                              </span>
                                              <span
                                                className={`font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}
                                              >
                                                {lastStatus}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <FontAwesomeIcon
                                          icon={fas.faCheckCircle}
                                          className="text-emerald-600"
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
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClickTambahAnak}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md shadow-emerald-200 hover:shadow-lg font-bold"
                >
                  <FontAwesomeIcon icon={fas.faPlus} /> Tambah Anak
                </button>
                {displayAnakData && (
                  <button
                    onClick={() => setShowUpdateForm(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md shadow-blue-200 hover:shadow-lg font-bold"
                  >
                    <FontAwesomeIcon icon={fas.faChartLine} /> Update
                    Pertumbuhan
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profil Anak */}
          {displayAnakData && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 mb-6">
              <div className="flex justify-between items-start flex-wrap gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    {displayAnakData.nama_anak}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
                      <p className="text-gray-500 text-sm flex items-center gap-2 mb-1">
                        <FontAwesomeIcon
                          icon={fas.faCalendar}
                          className="text-blue-400"
                        />{" "}
                        Tanggal Lahir
                      </p>
                      <p className="font-bold text-gray-800">
                        {displayAnakData.tanggal_lahir}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-4 border border-emerald-100">
                      <p className="text-gray-500 text-sm flex items-center gap-2 mb-1">
                        <FontAwesomeIcon
                          icon={fas.faClock}
                          className="text-emerald-400"
                        />{" "}
                        Usia Saat Ini
                      </p>
                      <p className="font-bold text-emerald-600 text-xl">
                        {formattedAge}
                      </p>
                      {ageDetail && ageDetail.totalMonths > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          ({ageDetail.totalMonths} bulan, {ageDetail.totalDays}{" "}
                          hari)
                        </p>
                      )}
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 border border-purple-100">
                      <p className="text-gray-500 text-sm flex items-center gap-2 mb-1">
                        <FontAwesomeIcon
                          icon={fas.faVenusMars}
                          className="text-purple-400"
                        />{" "}
                        Jenis Kelamin
                      </p>
                      <p className="font-bold text-gray-800">
                        {displayAnakData.jenis_kelamin === "L"
                          ? "Laki-laki"
                          : "Perempuan"}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-4 border border-amber-100">
                      <p className="text-gray-500 text-sm flex items-center gap-2 mb-1">
                        <FontAwesomeIcon
                          icon={fas.faCheckCircle}
                          className="text-amber-400"
                        />{" "}
                        Status Verifikasi
                      </p>
                      <p
                        className={`font-bold ${displayAnakData.status_verifikasi === "Disetujui" ? "text-emerald-600" : "text-amber-600"}`}
                      >
                        {displayAnakData.status_verifikasi || "Menunggu"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Riwayat Gizi */}
          {displayAnakData &&
            displayAnakData.riwayat &&
            displayAnakData.riwayat.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-emerald-100 p-2.5 rounded-xl">
                    <FontAwesomeIcon
                      icon={fas.faHistory}
                      className="text-emerald-600 text-lg"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Riwayat Gizi
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/80">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Usia saat Ukur
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Tinggi (cm)
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Berat (kg)
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          L. Kepala (cm)
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Status Gizi
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Z-Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {displayAnakData.riwayat.map((item, idx) => {
                        const ageAtMeasurement = calculateDetailedAge(
                          displayAnakData.tanggal_lahir,
                          item.tanggal_pengukuran,
                        );
                        return (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-5 py-4 text-sm font-medium text-gray-700">
                              {item.tanggal_pengukuran}
                            </td>
                            <td className="px-5 py-4 text-sm text-blue-600 font-bold">
                              {formatAge(ageAtMeasurement)}
                            </td>
                            <td className="px-5 py-4 text-sm font-medium text-gray-700">
                              {item.tinggi_badan}
                            </td>
                            <td className="px-5 py-4 text-sm font-medium text-gray-700">
                              {item.berat_badan}
                            </td>
                            <td className="px-5 py-4 text-sm font-medium text-gray-700">
                              {item.lingkar_kepala || "-"}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusBadge(item.status_gizi)}`}
                              >
                                {item.status_gizi}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm font-bold text-gray-700">
                              {item.z_score}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {displayAnakData &&
            (!displayAnakData.riwayat ||
              displayAnakData.riwayat.length === 0) && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-12 text-center border border-amber-200">
                <div className="bg-amber-100 p-6 rounded-full inline-flex mb-4">
                  <FontAwesomeIcon
                    icon={fas.faChartLine}
                    className="text-5xl text-amber-400"
                  />
                </div>
                <p className="text-gray-600 font-bold text-lg">
                  Belum ada data pengukuran untuk anak ini
                </p>
                <button
                  onClick={() => setShowUpdateForm(true)}
                  className="mt-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md font-bold"
                >
                  Tambah Pengukuran Pertama
                </button>
              </div>
            )}

          {displayAnakList.length === 0 && !error && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 text-center border border-blue-200">
              <div className="bg-blue-100 p-6 rounded-full inline-flex mb-4">
                <FontAwesomeIcon
                  icon={fas.faBaby}
                  className="text-5xl text-blue-400"
                />
              </div>
              <p className="text-gray-600 font-bold text-lg">
                Belum ada data anak
              </p>
              <p className="text-gray-500 mt-2">
                Silakan tambah data anak terlebih dahulu
              </p>
              <button
                onClick={handleClickTambahAnak}
                className="mt-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md font-bold"
              >
                <FontAwesomeIcon icon={fas.faPlus} className="mr-2" /> Tambah
                Anak
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: Form Kelengkapan Data Diri */}
      {showProfilForm && userRole === "orang_tua" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-7 py-5 text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <FontAwesomeIcon icon={fas.faUserEdit} className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Lengkapi Data Diri Orangtua
                  </h2>
                  <p className="text-sm text-emerald-100 mt-0.5">
                    Data ini diperlukan sebelum menambah data anak
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSimpanProfil}
              className="p-7 space-y-5 max-h-[70vh] overflow-y-auto"
            >
              {profilMessage.text && (
                <div
                  className={`p-4 rounded-xl text-sm flex items-center gap-3 font-medium ${profilMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}
                >
                  <FontAwesomeIcon
                    icon={
                      profilMessage.type === "success"
                        ? fas.faCheckCircle
                        : fas.faExclamationCircle
                    }
                    className="text-lg"
                  />
                  {profilMessage.text}
                </div>
              )}

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={fas.faCalendar}
                    className="text-emerald-500"
                  />{" "}
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={profilForm.tanggal_lahir}
                  onChange={(e) =>
                    setProfilForm({
                      ...profilForm,
                      tanggal_lahir: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Domisili */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={fas.faLocationDot}
                    className="text-emerald-500"
                  />{" "}
                  Domisili (Kabupaten/Kota)
                </label>
                <select
                  value={profilForm.wilayah_id}
                  onChange={(e) =>
                    setProfilForm({ ...profilForm, wilayah_id: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all"
                >
                  <option value="">-- Pilih Kabupaten/Kota --</option>
                  {wilayahList.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nama_kabupaten}
                    </option>
                  ))}
                </select>
              </div>

              {/* Penghasilan */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={fas.faMoneyBillWave}
                    className="text-emerald-500"
                  />{" "}
                  Penghasilan per Bulan
                </label>
                <select
                  value={profilForm.penghasilan_range}
                  onChange={(e) =>
                    setProfilForm({
                      ...profilForm,
                      penghasilan_range: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all"
                >
                  <option value="">-- Pilih Rentang Penghasilan --</option>
                  {PENGHASILAN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      Rp {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pendidikan Ibu */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={fas.faGraduationCap}
                    className="text-emerald-500"
                  />{" "}
                  Pendidikan Terakhir Ibu
                </label>
                <select
                  value={profilForm.pendidikan_ibu}
                  onChange={(e) =>
                    setProfilForm({
                      ...profilForm,
                      pendidikan_ibu: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all"
                >
                  <option value="">-- Pilih Pendidikan Terakhir --</option>
                  {PENDIDIKAN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sanitasi & Kualitas Air */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={fas.faToilet}
                      className="text-emerald-500"
                    />{" "}
                    Sanitasi
                  </label>
                  <select
                    value={profilForm.sanitasi}
                    onChange={(e) =>
                      setProfilForm({ ...profilForm, sanitasi: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all"
                  >
                    <option value="">-- Pilih --</option>
                    <option value="Baik">Baik</option>
                    <option value="Buruk">Buruk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={fas.faDroplet}
                      className="text-emerald-500"
                    />{" "}
                    Kualitas Air
                  </label>
                  <select
                    value={profilForm.kualitas_air}
                    onChange={(e) =>
                      setProfilForm({
                        ...profilForm,
                        kualitas_air: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all"
                  >
                    <option value="">-- Pilih --</option>
                    <option value="Bersih">Bersih</option>
                    <option value="Kotor">Kotor</option>
                  </select>
                </div>
              </div>

              {/* Akses Kesehatan */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={fas.faHospital}
                    className="text-emerald-500"
                  />{" "}
                  Akses Layanan Kesehatan
                </label>
                <div className="flex gap-3">
                  {["Mudah", "Sulit"].map((opt) => (
                    <label
                      key={opt}
                      className={`flex-1 flex items-center justify-center gap-2 py-3.5 border-2 rounded-xl cursor-pointer transition-all font-bold text-sm ${
                        profilForm.akses_kesehatan === opt
                          ? "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-md"
                          : "border-gray-200 text-gray-500 hover:border-emerald-200 hover:bg-emerald-50/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="akses_kesehatan"
                        value={opt}
                        checked={profilForm.akses_kesehatan === opt}
                        onChange={(e) =>
                          setProfilForm({
                            ...profilForm,
                            akses_kesehatan: e.target.value,
                          })
                        }
                        className="hidden"
                        required
                      />
                      <FontAwesomeIcon
                        icon={
                          opt === "Mudah" ? fas.faThumbsUp : fas.faThumbsDown
                        }
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* Tombol */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (profilLengkap) {
                      // Sudah pernah isi: cukup tutup modal
                      setShowProfilForm(false);
                    } else {
                      // Belum pernah isi: kembali ke dashboard
                      navigate("/orangtua/dashboard");
                    }
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={profilSaving}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {profilSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <FontAwesomeIcon icon={fas.faSave} />
                  )}
                  Simpan Data Diri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Anak */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scaleIn">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-7 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl">
                  <FontAwesomeIcon icon={fas.faPlus} className="text-xl" />
                </div>
                <h2 className="text-xl font-bold">Tambah Anak Baru</h2>
              </div>
            </div>
            <form
              onSubmit={handleAddAnak}
              className="p-7 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Nama Anak
                </label>
                <input
                  type="text"
                  name="nama_anak"
                  placeholder="Masukkan nama anak"
                  value={formData.nama_anak}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  name="tanggal_lahir"
                  value={formData.tanggal_lahir}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Jenis Kelamin
                </label>
                <select
                  name="jenis_kelamin"
                  value={formData.jenis_kelamin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Tinggi Badan (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="tinggi_badan"
                    placeholder="cm"
                    value={formData.tinggi_badan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="berat_badan"
                    placeholder="kg"
                    value={formData.berat_badan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Lingkar Kepala (cm) - Opsional
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="lingkar_kepala"
                  placeholder="Opsional"
                  value={formData.lingkar_kepala}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all"
                />
              </div>
              {userRole === "orang_tua" && profilData?.nama_kabupaten && (
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 flex items-center gap-3 border border-blue-200">
                  <FontAwesomeIcon
                    icon={fas.faLocationDot}
                    className="text-blue-500"
                  />
                  Wilayah anak: <strong>{profilData.nama_kabupaten}</strong>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all font-bold shadow-md"
                >
                  <FontAwesomeIcon icon={fas.faSave} className="mr-2" /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Update Pertumbuhan */}
      {showUpdateForm && displayAnakData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scaleIn">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-7 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl">
                  <FontAwesomeIcon icon={fas.faChartLine} className="text-xl" />
                </div>
                <h2 className="text-xl font-bold">
                  Update Pertumbuhan - {displayAnakData.nama_anak}
                </h2>
              </div>
            </div>
            <form
              onSubmit={handleUpdatePertumbuhan}
              className="p-7 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-gray-700 flex items-center gap-2 font-medium">
                  <FontAwesomeIcon
                    icon={fas.faInfoCircle}
                    className="text-blue-500"
                  />
                  Usia saat ini:{" "}
                  <strong className="text-blue-700">{formattedAge}</strong>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Tinggi Badan (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="tinggi_badan"
                    placeholder="cm"
                    value={updateData.tinggi_badan}
                    onChange={handleUpdateChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="berat_badan"
                    placeholder="kg"
                    value={updateData.berat_badan}
                    onChange={handleUpdateChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Lingkar Kepala (cm) - Opsional
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="lingkar_kepala"
                  placeholder="Opsional"
                  value={updateData.lingkar_kepala}
                  onChange={handleUpdateChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                />
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-sm text-amber-700 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={fas.faLightbulb}
                    className="text-amber-500"
                  />
                  Pengukuran dicatat dengan tanggal hari ini (
                  {new Date().toLocaleDateString("id-ID")})
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold shadow-md"
                >
                  <FontAwesomeIcon icon={fas.faSave} className="mr-2" /> Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
