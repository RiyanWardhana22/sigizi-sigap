import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user)
    return <div className="p-8 text-center text-gray-600">Memuat data...</div>;
  return (
    <div className="min-h-screen bg-sigizi-bg">
      {/* Navbar Sederhana */}
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-sigizi-green">SI-GIZI SIGAP</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            Halo, <strong>{user.nama_lengkap}</strong>!
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Keluar
          </button>
        </div>
      </nav>

      {/* Konten Utama */}
      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-sigizi-green">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Selamat Datang di Dashboard
          </h2>
          <p className="text-gray-600 mb-4">
            Anda login sebagai:{" "}
            <span className="uppercase font-bold text-sigizi-light-green">
              {user.role.replace("_", " ")}
            </span>
          </p>

          <hr className="my-4" />

          {/* Menampilkan konten berbeda berdasarkan Role */}
          {user.role === "super_admin" && (
            <div className="bg-blue-50 p-4 rounded-lg text-blue-800">
              <p>
                Ini adalah tampilan khusus Super Admin. Anda dapat melihat peta
                utama, monitoring kasus stunting, dan menjalankan Machine
                Learning di sini.
              </p>
            </div>
          )}

          {user.role === "orang_tua" && (
            <div className="bg-green-50 p-4 rounded-lg text-green-800">
              <p>
                Ini adalah tampilan khusus Orang Tua. Anda dapat mendaftarkan
                anak, mencatat ukuran tinggi/berat badan, dan melihat grafik
                pertumbuhan serta video edukasi.
              </p>
            </div>
          )}

          {user.role === "dinas_kesehatan" && (
            <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800">
              <p>
                Ini adalah tampilan Dinas Kesehatan. Anda dapat melakukan input
                data massal lapangan dan melihat heatmap kasus aktif (mode
                offline didukung).
              </p>
            </div>
          )}

          {user.role === "pemangku_kepentingan" && (
            <div className="bg-purple-50 p-4 rounded-lg text-purple-800">
              <p>
                Ini adalah tampilan Pemangku Kepentingan. Anda memiliki akses ke
                peta spasial, ranking wilayah rawan, dan fitur cetak laporan
                PDF/Excel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
