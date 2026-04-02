import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaClipboardCheck,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function VerifikasiData() {
  const navigate = useNavigate();
  const [dataAnak, setDataAnak] = useState([]);
  const [loading, setLoading] = useState(true);

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
        alert("Akses Ditolak! Halaman khusus Dinas Kesehatan.");
        navigate("/dashboard");
      } else {
        fetchDataAnak();
      }
    }
  }, [navigate]);

  const fetchDataAnak = async () => {
    try {
      const response = await fetch(
        "http://localhost/sigizi-sigap/sigizi-backend/get_semua_anak.php",
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleVerifikasi = (nama) => {
    alert(`Data anak bernama ${nama} berhasil diverifikasi dan disetujui!`);
  };

  return (
    <div className="flex min-h-screen bg-sigizi-bg">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-8 py-4 flex items-center gap-4">
          <FaClipboardCheck className="text-2xl text-sigizi-green" />
          <h1 className="text-xl font-bold text-gray-800">
            Verifikasi Data Lapangan
          </h1>
        </header>

        <main className="p-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">
                Daftar Input Data Orang Tua
              </h2>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                Menunggu Verifikasi: {dataAnak.length} Anak
              </span>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  Memuat data lapangan...
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-gray-500 text-sm border-b">
                      <th className="p-4 font-medium">Nama Anak</th>
                      <th className="p-4 font-medium">Nama Orang Tua</th>
                      <th className="p-4 font-medium">
                        Pengukuran Terakhir (TB / BB)
                      </th>
                      <th className="p-4 font-medium">Status Gizi</th>
                      <th className="p-4 font-medium text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataAnak.map((anak) => (
                      <tr
                        key={anak.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="p-4 font-bold text-gray-800">
                          {anak.nama_anak}
                        </td>
                        <td className="p-4 text-gray-600">
                          {anak.nama_orang_tua}
                        </td>
                        <td className="p-4 text-gray-600">
                          {anak.tinggi_terakhir} cm / {anak.berat_terakhir} kg
                        </td>
                        <td className="p-4">
                          {anak.status_gizi_terakhir === "Normal" ? (
                            <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                              Normal
                            </span>
                          ) : (
                            <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded flex items-center w-max gap-1">
                              <FaExclamationTriangle className="text-xs" />{" "}
                              {anak.status_gizi_terakhir}
                            </span>
                          )}
                        </td>
                        <td className="p-4 flex justify-center gap-2">
                          <button
                            onClick={() => handleVerifikasi(anak.nama_anak)}
                            className="bg-sigizi-green hover:bg-sigizi-light-green text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
                          >
                            <FaCheck /> Verifikasi
                          </button>
                        </td>
                      </tr>
                    ))}
                    {dataAnak.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-8 text-center text-gray-500"
                        >
                          Belum ada data anak yang masuk.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
