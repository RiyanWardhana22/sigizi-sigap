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
  FaInfoCircle,
  FaHourglassHalf,
  FaUserFriends,
} from "react-icons/fa";

export default function VerifikasiData() {
  const navigate = useNavigate();
  const [dataAnak, setDataAnak] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

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
      if (data.status === "success") {
        setDataAnak(data.data);
      }
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
      if (data.status === "success") {
        fetchDataAnak();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Gagal verifikasi:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sigizi-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">
            Sinkronisasi Data Antrean...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b px-8 py-5 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Verifikasi & Validasi Data
            </h1>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
                <FaUserFriends />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Total Pendaftar
                </p>
                <h3 className="text-2xl font-black text-gray-800">
                  {stats.total}
                </h3>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center text-xl">
                <FaHourglassHalf />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Menunggu
                </p>
                <h3 className="text-2xl font-black text-gray-800">
                  {stats.pending}
                </h3>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl">
                <FaCheck />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Telah Disetujui
                </p>
                <h3 className="text-2xl font-black text-gray-800">
                  {stats.approved}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama anak atau orang tua..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sigizi-green transition-all"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 w-full md:w-auto">
                <FaFilter className="text-gray-400 text-xs" />
                <select
                  className="bg-transparent text-sm font-bold text-gray-600 outline-none cursor-pointer w-full"
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
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-black tracking-widest border-b">
                    <th className="p-5">No</th>
                    <th className="p-5">Informasi Anak</th>
                    <th className="p-5">Orang Tua</th>
                    <th className="p-5 text-center">Status</th>
                    <th className="p-5 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentItems.length > 0 ? (
                    currentItems.map((anak, index) => (
                      <tr
                        key={anak.id}
                        className="hover:bg-gray-50/80 transition"
                      >
                        <td className="p-5 text-sm font-bold text-gray-400">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="p-5">
                          <div className="text-sm font-bold text-gray-500">
                            {anak.nama_anak}
                          </div>
                          <div className="text-[10px] font-bold text-blue-500 uppercase">
                            {anak.jenis_kelamin === "L"
                              ? "Laki-laki"
                              : "Perempuan"}
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                            {anak.nama_orang_tua}
                          </div>
                        </td>
                        <td className="p-5">
                          <span
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                              anak.status_verifikasi === "Disetujui"
                                ? "bg-green-100 text-green-700"
                                : anak.status_verifikasi === "Ditolak"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {anak.status_verifikasi}
                          </span>
                        </td>

                        {/* PERUBAHAN 2: Menghapus class hover (opacity) agar tombol selalu terlihat */}
                        <td className="p-5">
                          <div className="flex justify-center gap-2">
                            {anak.status_verifikasi === "Menunggu" ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleVerifikasi(anak.id, "Disetujui")
                                  }
                                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition shadow-md shadow-green-200 text-[10px] font-bold uppercase"
                                >
                                  <FaCheck /> Setujui
                                </button>
                                <button
                                  onClick={() =>
                                    handleVerifikasi(anak.id, "Ditolak")
                                  }
                                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition shadow-md shadow-red-200 text-[10px] font-bold uppercase"
                                >
                                  <FaTimes /> Tolak
                                </button>
                              </>
                            ) : (
                              <div className="text-[10px] font-bold text-gray-300 italic flex items-center gap-1">
                                <FaInfoCircle /> Selesai Diproses
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-20 text-center flex flex-col items-center justify-center gap-3"
                      >
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 text-3xl">
                          <FaClipboardCheck />
                        </div>
                        <p className="text-gray-400 font-bold text-sm italic tracking-tight">
                          Data tidak ditemukan dalam antrean.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredData.length > itemsPerPage && (
              <div className="bg-gray-50/50 p-5 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400">
                  Menampilkan{" "}
                  <span className="text-gray-700">{indexOfFirstItem + 1}</span>{" "}
                  hingga{" "}
                  <span className="text-gray-700">
                    {Math.min(indexOfLastItem, filteredData.length)}
                  </span>{" "}
                  dari{" "}
                  <span className="text-gray-700">{filteredData.length}</span>{" "}
                  data
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className={`p-2 rounded-lg border transition ${currentPage === 1 ? "text-gray-300 bg-gray-50" : "text-gray-600 bg-white hover:bg-gray-100 shadow-sm"}`}
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <div className="flex gap-1 flex-wrap justify-center">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition ${currentPage === i + 1 ? "bg-sigizi-green text-white shadow-md shadow-green-200" : "bg-white text-gray-400 hover:bg-gray-50 border"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className={`p-2 rounded-lg border transition ${currentPage === totalPages ? "text-gray-300 bg-gray-50" : "text-gray-600 bg-white hover:bg-gray-100 shadow-sm"}`}
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
