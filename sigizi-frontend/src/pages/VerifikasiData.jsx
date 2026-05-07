import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaClipboardCheck,
  FaCheck,
  FaTimes,
  FaUserAlt,
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaHourglassHalf,
  FaBaby,
  FaNotesMedical,
  FaHouseUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaWallet,
  FaTint,
  FaToilet,
  FaHospitalSymbol,
} from "react-icons/fa";

export default function VerifikasiData() {
  const navigate = useNavigate();
  const [dataAnak, setDataAnak] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnak, setSelectedAnak] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(userData);
      if (
        parsedUser.role !== "dinas_kesehatan" &&
        parsedUser.role !== "super_admin"
      ) {
        navigate("/dashboard");
      } else {
        fetchDataAnak();
      }
    }
  }, [navigate]);

  const fetchDataAnak = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_semua_anak.php`,
      );
      const data = await response.json();
      if (data.status === "success") setDataAnak(data.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifikasi = async (id, status) => {
    const actionText = status === "Disetujui" ? "menyetujui" : "menolak";
    if (!window.confirm(`Apakah Anda yakin ingin ${actionText} data ini?`))
      return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/verifikasi_anak.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        },
      );
      const data = await response.json();
      if (data.status === "success") fetchDataAnak();
      else alert(data.message);
    } catch (error) {
      console.error("Gagal verifikasi:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleCekData = (anak) => {
    setSelectedAnak(anak);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedAnak(null), 300);
  };

  const hitungUmurBulan = (tanggalLahir) => {
    if (!tanggalLahir) return "-";
    const lahir = new Date(tanggalLahir);
    const sekarang = new Date();
    let bulan = (sekarang.getFullYear() - lahir.getFullYear()) * 12;
    bulan -= lahir.getMonth();
    bulan += sekarang.getMonth();
    return bulan > 0 ? `${bulan} Bulan` : "0 Bulan";
  };

  const filteredData = dataAnak.filter((item) => {
    const matchSearch =
      item.nama_anak.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama_orang_tua.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === "Semua" || item.status_verifikasi === filterStatus;
    return matchSearch && matchStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const stats = {
    total: dataAnak.length,
    pending: dataAnak.filter((a) => a.status_verifikasi === "Menunggu").length,
    approved: dataAnak.filter((a) => a.status_verifikasi === "Disetujui")
      .length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar handleLogout={handleLogout} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Verifikasi Data
              </h1>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
                Dinas Kesehatan Portal
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                label: "Total Pendaftar",
                value: stats.total,
                icon: <FaUsers />,
                color: "blue",
              },
              {
                label: "Menunggu",
                value: stats.pending,
                icon: <FaHourglassHalf />,
                color: "amber",
              },
              {
                label: "Disetujui",
                value: stats.approved,
                icon: <FaCheck />,
                color: "emerald",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-500 rounded-xl flex items-center justify-center text-xl mb-4`}
                >
                  {stat.icon}
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">
                  {stat.value}
                </h3>
              </div>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama anak atau orang tua..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 min-w-[180px]">
              <FaFilter className="text-slate-400 text-xs" />
              <select
                className="bg-transparent text-sm font-semibold text-slate-600 outline-none w-full cursor-pointer"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="Semua">Semua Status</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      No
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Nama anak
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Nama Orang Tua
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentItems.length > 0 ? (
                    currentItems.map((anak, index) => (
                      <tr
                        key={anak.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="p-5 text-sm font-bold text-gray-400">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-700">
                            {anak.nama_anak}
                          </div>
                          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                            {anak.jenis_kelamin === "L"
                              ? "Laki-laki"
                              : "Perempuan"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                          {anak.nama_orang_tua}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                              anak.status_verifikasi === "Disetujui"
                                ? "bg-emerald-100 text-emerald-700"
                                : anak.status_verifikasi === "Ditolak"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {anak.status_verifikasi}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleCekData(anak)}
                              className="px-4 py-2 bg-slate-800 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-slate-700 transition"
                            >
                              Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-20 text-center text-slate-400 font-medium text-sm"
                      >
                        Data tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Simple Pagination */}
            {filteredData.length > itemsPerPage && (
              <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-50"
                >
                  <FaChevronLeft size={12} />
                </button>
                <span className="text-xs font-bold text-slate-500">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-50"
                >
                  <FaChevronRight size={12} />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- REDESIGNED MODAL --- */}
      {isModalOpen && selectedAnak && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={closeModal}
          ></div>
          <div className="relative bg-white rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
            <div className="w-full md:w-[35%] bg-slate-900 p-8 text-white flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1 leading-tight">
                  {selectedAnak.nama_anak}
                </h2>
                <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-6">
                  {selectedAnak.jenis_kelamin === "L"
                    ? "Laki-laki"
                    : "Perempuan"}{" "}
                  •{" "}
                  {selectedAnak.umur_bulan ||
                    hitungUmurBulan(selectedAnak.tanggal_lahir)}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <FaEnvelope className="text-emerald-500" />
                    <span className="text-sm truncate">
                      {selectedAnak.email_orang_tua || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <FaMapMarkerAlt className="text-emerald-500" />
                    <span className="text-sm">
                      {selectedAnak.nama_kabupaten || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Status Verifikasi
                </p>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase ${
                    selectedAnak.status_verifikasi === "Disetujui"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : selectedAnak.status_verifikasi === "Ditolak"
                        ? "bg-rose-500/10 text-rose-400"
                        : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      selectedAnak.status_verifikasi === "Disetujui"
                        ? "bg-emerald-400"
                        : selectedAnak.status_verifikasi === "Ditolak"
                          ? "bg-rose-400"
                          : "bg-amber-400"
                    }`}
                  ></span>
                  {selectedAnak.status_verifikasi}
                </div>
              </div>
            </div>

            {/* Right Panel: Scrollable Details */}
            <div className="flex-1 flex flex-col bg-[#FDFDFD]">
              <div className="p-4 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                <div className="mb-10">
                  <h3 className="flex items-center gap-2 uppercase text-slate-800 font-bold mb-6">
                    Data Pengukuran Fisik
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "Tinggi",
                        val: selectedAnak.tinggi_badan,
                        unit: "cm",
                        icon: <FaTint className="text-blue-500" />,
                        bg: "bg-blue-50",
                      },
                      {
                        label: "Berat",
                        val: selectedAnak.berat_badan,
                        unit: "kg",
                        icon: <FaUsers className="text-emerald-500" />,
                        bg: "bg-emerald-50",
                      },
                      {
                        label: "L. Kepala",
                        val: selectedAnak.lingkar_kepala,
                        unit: "cm",
                        icon: <FaBaby className="text-purple-500" />,
                        bg: "bg-purple-50",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`${item.bg} p-4 rounded-2xl border border-white shadow-sm`}
                      >
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                          {item.label}
                        </p>
                        <p className="text-lg font-bold text-slate-800">
                          {item.val || "-"}{" "}
                          <span className="text-[10px] font-medium opacity-60">
                            {item.unit}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* WHO Status Card */}
                  <div className="mt-4 bg-slate-900 rounded-2xl p-5 flex items-center justify-between text-white shadow-xl shadow-slate-200">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Status Gizi (WHO)
                      </p>
                      <p className="font-bold text-lg text-emerald-400">
                        {selectedAnak.status_gizi || "Belum Dianalisis"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Z-Score
                      </p>
                      <p className="font-mono text-xl font-bold">
                        {selectedAnak.z_score || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section: Sosio-Ekonomi */}
                <div>
                  <h3 className="flex items-center gap-2 uppercase text-slate-800 font-bold mb-6">
                    Profil Penanggung Jawab
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        label: "Nama Orang Tua",
                        val: selectedAnak.nama_orang_tua,
                        icon: <FaUserAlt />,
                      },
                      {
                        label: "Pendidikan Ibu",
                        val: selectedAnak.pendidikan_ibu,
                        icon: <FaGraduationCap />,
                      },
                      {
                        label: "Penghasilan",
                        val: selectedAnak.penghasilan_keluarga,
                        icon: <FaWallet />,
                        color: "text-emerald-600",
                      },
                      {
                        label: "Sumber Air",
                        val: selectedAnak.sumber_air_bersih,
                        icon: <FaTint />,
                      },
                      {
                        label: "Sanitasi",
                        val: selectedAnak.fasilitas_sanitasi,
                        icon: <FaToilet />,
                      },
                      {
                        label: "Akses Kesehatan",
                        val: selectedAnak.akses_kesehatan,
                        icon: <FaHospitalSymbol />,
                      },
                    ].map((detail, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm"
                      >
                        <div className="text-slate-400">{detail.icon}</div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                            {detail.label}
                          </p>
                          <p
                            className={`text-sm font-bold text-slate-700 ${detail.color || ""}`}
                          >
                            {detail.val || "-"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 text-xs font-bold text-slate-500 uppercase hover:bg-slate-50 rounded-xl transition"
                >
                  Tutup
                </button>
                {selectedAnak.status_verifikasi === "Menunggu" && (
                  <>
                    <button
                      onClick={() => {
                        handleVerifikasi(selectedAnak.id, "Ditolak");
                        closeModal();
                      }}
                      className="px-6 py-3 bg-rose-50 text-rose-600 text-xs font-bold uppercase rounded-xl hover:bg-rose-600 hover:text-white transition"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => {
                        handleVerifikasi(selectedAnak.id, "Disetujui");
                        closeModal();
                      }}
                      className="px-6 py-3 bg-emerald-500 text-white text-xs font-bold uppercase rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition"
                    >
                      Validasi & Setujui
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
