import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FaFilePdf, FaChartPie, FaBuilding } from "react-icons/fa";
export default function LaporanPemangku() {
  const navigate = useNavigate();
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(userData);
      if (
        parsedUser.role !== "pemangku_kepentingan" &&
        parsedUser.role !== "super_admin"
      ) {
        alert("Akses Ditolak! Halaman khusus Pemangku Kepentingan.");
        navigate("/dashboard");
      } else {
        fetchLaporan();
      }
    }
  }, [navigate]);

  const fetchLaporan = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_laporan.php`,
      );
      const data = await response.json();
      if (data.status === "success") {
        setLaporan(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const tanggalCetak = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-sigizi-bg print:bg-white">
      <div className="print:hidden">
        <Sidebar handleLogout={handleLogout} />
      </div>

      <div className="flex-1 flex flex-col relative print:block">
        <header className="bg-white shadow px-8 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <FaChartPie className="text-2xl text-sigizi-green" />
            <h1 className="text-xl font-bold text-gray-800">
              Analitik Kebijakan & Laporan
            </h1>
          </div>
          <button
            onClick={handlePrint}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition flex items-center gap-2"
          >
            <FaFilePdf /> Cetak Laporan (PDF)
          </button>
        </header>

        {/* Area Utama. Hilangkan padding saat print agar rapi */}
        <main className="p-8 overflow-y-auto flex justify-center print:p-0 print:overflow-visible">
          <div
            className="bg-white shadow-lg p-10 w-full max-w-4xl min-h-[1056px] border border-gray-200 print:shadow-none print:border-none print:p-0 print:w-full print:max-w-none"
            style={{ color: "black" }}
          >
            <div className="text-center border-b-4 border-sigizi-green pb-6 mb-6">
              <h1 className="text-3xl font-black text-sigizi-green tracking-wide">
                SI-GIZI SIGAP
              </h1>
              <p className="text-gray-600 font-medium mt-1">
                Sistem Deteksi Dini & Pemetaan Kerentanan Gizi Anak
              </p>
              <p className="text-gray-500 text-sm">Provinsi Sumatera Utara</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 uppercase text-center mb-2">
                Laporan Rekapitulasi Kerentanan Gizi Wilayah
              </h2>
              <p className="text-center text-sm text-gray-600">
                Tanggal Cetak: {tanggalCetak}
              </p>
            </div>

            {loading ? (
              <p className="text-center text-gray-500 print:hidden">
                Menyusun Laporan...
              </p>
            ) : (
              <>
                <table className="w-full text-left border-collapse border border-gray-300 mb-8">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800 text-sm">
                      <th className="p-3 border border-gray-300 font-bold">
                        No
                      </th>
                      <th className="p-3 border border-gray-300 font-bold">
                        Kabupaten / Kota
                      </th>
                      <th className="p-3 border border-gray-300 font-bold text-center">
                        Total Anak Terdata
                      </th>
                      <th className="p-3 border border-gray-300 font-bold text-center text-green-700">
                        Gizi Normal
                      </th>
                      <th className="p-3 border border-gray-300 font-bold text-center text-red-600">
                        Terindikasi Stunting
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {laporan.map((row, index) => (
                      <tr key={index} className="text-sm">
                        <td className="p-3 border border-gray-300 text-center">
                          {index + 1}
                        </td>
                        <td className="p-3 border border-gray-300 font-medium flex items-center gap-2">
                          {row.nama_kabupaten}
                        </td>
                        <td className="p-3 border border-gray-300 text-center font-bold">
                          {row.total_anak}
                        </td>
                        <td className="p-3 border border-gray-300 text-center">
                          {row.total_normal || 0}
                        </td>
                        <td className="p-3 border border-gray-300 text-center font-bold text-red-600">
                          {row.total_stunting || 0}
                        </td>
                      </tr>
                    ))}
                    {laporan.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-4 text-center text-gray-500"
                        >
                          Belum ada data wilayah.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Rekomendasi Kebijakan */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">
                    Rekomendasi Kebijakan Berbasis Bukti:
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-blue-900 space-y-1">
                    <li>
                      Prioritaskan distribusi logistik pangan dan perbaikan
                      sanitasi air bersih pada wilayah dengan angka stunting
                      tertinggi di atas.
                    </li>
                    <li>
                      Gencarkan program edukasi MPASI di wilayah dengan klaster
                      kerentanan menengah.
                    </li>
                    <li>
                      Aktifkan kembali Posyandu Keliling pada daerah terdampak
                      pascabencana.
                    </li>
                  </ul>
                </div>

                <div className="mt-16 flex justify-end">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-16">Mengetahui,</p>
                    <p className="font-bold text-gray-800 border-b border-gray-800 pb-1">
                      Tim Analis SI-GIZI SIGAP
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Pemerintah Provinsi Sumatera Utara
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
