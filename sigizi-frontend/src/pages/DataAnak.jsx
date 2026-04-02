import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaBaby,
  FaWeight,
  FaRulerVertical,
  FaCalendarAlt,
  FaCheckCircle,
  FaChartLine,
  FaYoutube,
} from "react-icons/fa";
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
  const [dataAnak, setDataAnak] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    nama_anak: "",
    tanggal_lahir: "",
    jenis_kelamin: "L",
    tinggi_badan: "",
    berat_badan: "",
  });
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (
        parsedUser.role !== "orang_tua" &&
        parsedUser.role !== "super_admin"
      ) {
        alert("Akses Ditolak! Halaman khusus Orang Tua.");
        navigate("/dashboard");
      } else {
        fetchRiwayatAnak(parsedUser.id);
      }
    }
  }, [navigate]);

  const fetchRiwayatAnak = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost/sigizi-sigap/sigizi-backend/get_riwayat_anak.php?user_id=${userId}`,
      );
      const data = await response.json();
      if (data.status === "success") {
        setDataAnak(data.anak);
        setRiwayat(data.riwayat);
      }
    } catch (error) {
      console.error("Gagal mengambil riwayat:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, orang_tua_id: user.id };

    try {
      const response = await fetch(
        "http://localhost/sigizi-backend/add_anak.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      if (data.status === "success") {
        alert(data.message);
        fetchRiwayatAnak(user.id);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    }
  };

  const getEdukasiContent = (status) => {
    if (status === "Stunting" || status === "Pra-stunting") {
      return {
        judul: "Pemberian MPASI Tinggi Protein Hewani untuk Cegah Stunting",
        videoId: "lD8J0Ew1f1Q",
        desc: "Anak Anda terindikasi kerentanan gizi. Fokuskan pada protein hewani seperti telur, ikan, dan hati ayam.",
      };
    }
    return {
      judul: "Stimulasi Tumbuh Kembang Anak Normal",
      videoId: "O16M4WWeTcw",
      desc: "Gizi anak Anda terpantau normal. Lanjutkan pemberian makan bergizi seimbang dan rutin ke Posyandu.",
    };
  };

  if (!user || loadingData)
    return <div className="p-8 text-center">Memuat data...</div>;

  const statusTerakhir =
    riwayat.length > 0 ? riwayat[riwayat.length - 1].status_gizi : null;
  const edukasi = statusTerakhir ? getEdukasiContent(statusTerakhir) : null;

  return (
    <div className="flex min-h-screen bg-sigizi-bg">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-8 py-4 flex items-center gap-4">
          <FaBaby className="text-2xl text-sigizi-green" />
          <h1 className="text-xl font-bold text-gray-800">
            Pemantauan Gizi Anak
          </h1>
        </header>

        <main className="p-8 overflow-y-auto">
          {!dataAnak ? (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-3 mb-6">
                Daftarkan Anak Anda Pertama Kali
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap Anak
                  </label>
                  <input
                    type="text"
                    name="nama_anak"
                    value={formData.nama_anak}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      name="tanggal_lahir"
                      value={formData.tanggal_lahir}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Kelamin
                    </label>
                    <select
                      name="jenis_kelamin"
                      value={formData.jenis_kelamin}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tinggi Badan Saat Ini (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="tinggi_badan"
                      value={formData.tinggi_badan}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Berat Badan Saat Ini (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="berat_badan"
                      value={formData.berat_badan}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 bg-sigizi-green hover:bg-sigizi-light-green text-white font-bold py-3 rounded-lg shadow-md transition"
                >
                  Simpan Data Anak
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Info Singkat Anak */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center border-l-4 border-sigizi-green">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {dataAnak.nama_anak}
                  </h2>
                  <p className="text-gray-500">
                    Lahir: {dataAnak.tanggal_lahir} | L/P:{" "}
                    {dataAnak.jenis_kelamin}
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-full font-bold text-sm ${statusTerakhir === "Normal" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  Status Terakhir: {statusTerakhir}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel Kiri: Grafik Pertumbuhan */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                    <FaChartLine /> Grafik Pertumbuhan (Tinggi Badan)
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={riwayat}
                        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                      >
                        <Line
                          type="monotone"
                          dataKey="tinggi_badan"
                          stroke="#285A48"
                          strokeWidth={3}
                          dot={{ r: 5 }}
                          activeDot={{ r: 8 }}
                        />
                        <CartesianGrid
                          stroke="#ccc"
                          strokeDasharray="5 5"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="tanggal_pengukuran"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <button className="w-full mt-4 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2 rounded-lg border border-blue-200 transition">
                    + Catat Pengukuran Bulan Ini
                  </button>
                </div>

                {/* Panel Kanan: SIGAP Edukasi Personalisasi */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                    <FaYoutube className="text-red-500" /> SIGAP Edukasi
                    (Personalisasi)
                  </h3>

                  {edukasi && (
                    <div className="space-y-4">
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
                        {/* Embed Video Youtube Secara Dinamis */}
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${edukasi.videoId}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">
                          {edukasi.judul}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {edukasi.desc}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
