import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar";
import { 
  FaDatabase, FaCalculator, FaFileExcel, 
  FaFileUpload, FaTrash, FaCheckCircle, 
  FaKeyboard 
} from "react-icons/fa";

const DAFTAR_WILAYAH_SUMUT = [
  "Nias", "Mandailing Natal", "Tapanuli Selatan", "Tapanuli Tengah", "Tapanuli Utara", "Toba", "Labuhanbatu", "Asahan", "Simalungun", "Dairi", "Karo", "Deli Serdang", "Langkat", "Nias Selatan", "Humbang Hasundutan", "Pakpak Bharat", "Samosir", "Serdang Bedagai", "Batu Bara", "Padang Lawas Utara", "Padang Lawas", "Labuhanbatu Selatan", "Labuhanbatu Utara", "Nias Utara", "Nias Barat", "Kota Sibolga", "Kota Tanjung Balai", "Kota Pematangsiantar", "Kota Tebing Tinggi", "Kota Medan", "Kota Binjai", "Kota Padang Sidempuan", "Kota Gunungsitoli"
];

// GANTI URL INI JIKA FOLDER BACKEND TEMAN ANDA BERBEDA
// Misalnya: "http://localhost:8000" atau "http://localhost/sigizi-backend"
const API_URL = "http://localhost/sigizi-sigap/sigizi-backend"; 

export default function InputDataWilayah() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("manual");
  const [isProcessing, setIsProcessing] = useState(false);

  const [raw, setRaw] = useState({
    kab_kota: "", total_bayi: "", bayi_bblr: "",
    total_balita: "", balita_gizi_buruk: "",
    total_kk: "", kk_sanitasi: "", kk_air: "",
    total_ibu: "", ibu_smp_kebawah: "", penghasilan: ""
  });

  const [importData, setImportData] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "dinas_kesehatan" && parsedUser.role !== "super_admin") {
        alert("Akses Ditolak!");
        navigate("/dashboard");
      }
    }
  }, [navigate]);

  const handleChangeManual = (e) => {
    setRaw({ ...raw, [e.target.name]: e.target.value });
  };

  // ================= LOGIKA MANUAL (API FETCH ASLI) =================
  const handleSubmitManual = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const payloadSistem = {
      kab_kota: raw.kab_kota,
      Persentase_BBLR: (Number(raw.bayi_bblr) / (Number(raw.total_bayi) || 1)) * 100,
      Persentase_Gizi_Buruk: (Number(raw.balita_gizi_buruk) / (Number(raw.total_balita) || 1)) * 100,
      Sanitasi_dan_Kebersihan_Lingkungan_mean: (Number(raw.kk_sanitasi) / (Number(raw.total_kk) || 1)) * 100,
      Ketersediaan_Air_Bersih_mean: (Number(raw.kk_air) / (Number(raw.total_kk) || 1)) * 100,
      "Pendidikan_Ibu_SMP/MTs_mean": (Number(raw.ibu_smp_kebawah) / (Number(raw.total_ibu) || 1)) * 100,
      Penghasilan_keluarga_mean: Number(raw.penghasilan)
    };

    try {
      const response = await fetch(`${API_URL}/save_agregat_wilayah.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([payloadSistem]), // Dikirim sebagai array
      });

      const data = await response.json();

      if (data.status === "success") {
        alert("Berhasil! " + data.message);
        setRaw({ kab_kota: "", total_bayi: "", bayi_bblr: "", total_balita: "", balita_gizi_buruk: "", total_kk: "", kk_sanitasi: "", kk_air: "", total_ibu: "", ibu_smp_kebawah: "", penghasilan: "" });
      } else {
        alert("Gagal: " + data.message);
        console.error("Log Python:", data.python_log);
      }
    } catch (error) {
      console.error("Error Koneksi:", error);
      alert("Gagal terhubung ke Server PHP! Pastikan XAMPP/Laragon menyala dan URL API benar.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ================= LOGIKA EXCEL (API FETCH ASLI) =================
  const handleExportTemplate = () => {
    const header = [["KABUPATEN_KOTA", "TOTAL_BAYI_LAHIR", "JUMLAH_BBLR", "TOTAL_BALITA_TERUKUR", "BALITA_GIZI_BURUK", "TOTAL_KK", "KK_SANITASI_LAYAK", "KK_AIR_BERSIH", "TOTAL_IBU_TERDATA", "IBU_PENDIDIKAN_SMP_KEBAWAH", "RATA_PENGHASILAN_WILAYAH"]];
    const rows = DAFTAR_WILAYAH_SUMUT.map(w => [w, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const worksheet = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Laporan");
    XLSX.writeFile(workbook, "Template_Laporan_Gizi_Sumut.xlsx");
  };

  const handleImportXLSX = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const parsed = data.map(row => ({
        kab_kota: row.KABUPATEN_KOTA,
        Persentase_BBLR: (Number(row.JUMLAH_BBLR) / (Number(row.TOTAL_BAYI_LAHIR) || 1)) * 100,
        Persentase_Gizi_Buruk: (Number(row.BALITA_GIZI_BURUK) / (Number(row.TOTAL_BALITA_TERUKUR) || 1)) * 100,
        Sanitasi_dan_Kebersihan_Lingkungan_mean: (Number(row.KK_SANITASI_LAYAK) / (Number(row.TOTAL_KK) || 1)) * 100,
        Ketersediaan_Air_Bersih_mean: (Number(row.KK_AIR_BERSIH) / (Number(row.TOTAL_KK) || 1)) * 100,
        "Pendidikan_Ibu_SMP/MTs_mean": (Number(row.IBU_PENDIDIKAN_SMP_KEBAWAH) / (Number(row.TOTAL_IBU) || 1)) * 100,
        Penghasilan_keluarga_mean: Number(row.RATA_PENGHASILAN_WILAYAH)
      }));

      setImportData(parsed);
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveAllExcel = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_URL}/save_agregat_wilayah.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(importData),
      });

      const data = await response.json();

      if (data.status === "success") {
        alert("Berhasil! " + data.message);
        setImportData([]);
      } else {
        alert("Gagal: " + data.message);
        console.error("Log Python:", data.python_log);
      }
    } catch (error) {
      console.error("Error Koneksi:", error);
      alert("Gagal terhubung ke Server PHP! Pastikan XAMPP/Laragon menyala dan URL API benar.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar handleLogout={() => { localStorage.removeItem("user"); navigate("/"); }} />

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <FaDatabase className="text-xl text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800 uppercase">Input Data Wilayah</h1>
          </div>
          
          <div className="flex bg-gray-100 p-1.5 rounded-lg border border-gray-200">
            <button 
              onClick={() => setActiveTab("manual")}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-md transition-all ${
                activeTab === "manual" ? "bg-white text-blue-700 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <FaKeyboard /> Input Manual
            </button>
            <button 
              onClick={() => setActiveTab("import")}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-md transition-all ${
                activeTab === "import" ? "bg-white text-blue-700 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <FaFileUpload /> Unggah Excel
            </button>
          </div>
        </header>

        <main className="p-8 overflow-y-auto">
          {activeTab === "manual" && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-5xl animate-fadeIn">
              <div className="mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-800">Formulir Laporan Tunggal</h2>
                <p className="text-sm text-gray-500 mt-1">Isi data riil untuk satu kabupaten. Sistem akan otomatis menghitung persentasenya.</p>
              </div>

              <form onSubmit={handleSubmitManual} className="space-y-8">
                <div className="max-w-md">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Kabupaten/Kota</label>
                  <select name="kab_kota" value={raw.kab_kota} onChange={handleChangeManual} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50">
                    <option value="">-- Pilih Wilayah Administrasi --</option>
                    {DAFTAR_WILAYAH_SUMUT.map((wilayah, index) => (
                      <option key={index} value={wilayah}>{wilayah}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-5 border border-gray-200 rounded-lg bg-gray-50/50">
                    <h3 className="font-bold text-blue-900 border-b border-gray-200 pb-2 mb-4">1. Bayi & Balita (Angka Riil)</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Total Bayi Lahir</label>
                          <input type="number" name="total_bayi" value={raw.total_bayi} onChange={handleChangeManual} required className="w-full p-2 border border-gray-300 rounded" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-red-600 mb-1">Jumlah Bayi BBLR</label>
                          <input type="number" name="bayi_bblr" value={raw.bayi_bblr} onChange={handleChangeManual} required className="w-full p-2 border border-red-300 bg-red-50 rounded" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Total Balita Terukur</label>
                          <input type="number" name="total_balita" value={raw.total_balita} onChange={handleChangeManual} required className="w-full p-2 border border-gray-300 rounded" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-red-600 mb-1">Balita Gizi Buruk</label>
                          <input type="number" name="balita_gizi_buruk" value={raw.balita_gizi_buruk} onChange={handleChangeManual} required className="w-full p-2 border border-red-300 bg-red-50 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border border-gray-200 rounded-lg bg-gray-50/50">
                    <h3 className="font-bold text-blue-900 border-b border-gray-200 pb-2 mb-4">2. Sanitasi & Air Bersih (KK)</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Total Kepala Keluarga (KK)</label>
                        <input type="number" name="total_kk" value={raw.total_kk} onChange={handleChangeManual} required className="w-full p-2 border border-gray-300 rounded" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-green-600 mb-1">KK dgn Jamban Sehat</label>
                          <input type="number" name="kk_sanitasi" value={raw.kk_sanitasi} onChange={handleChangeManual} required className="w-full p-2 border border-green-300 bg-green-50 rounded" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-green-600 mb-1">KK dgn Air Bersih</label>
                          <input type="number" name="kk_air" value={raw.kk_air} onChange={handleChangeManual} required className="w-full p-2 border border-green-300 bg-green-50 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border border-gray-200 rounded-lg bg-gray-50/50 md:col-span-2">
                    <h3 className="font-bold text-blue-900 border-b border-gray-200 pb-2 mb-4">3. Kondisi Sosial Ekonomi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Total Ibu Terdata</label>
                        <input type="number" name="total_ibu" value={raw.total_ibu} onChange={handleChangeManual} required className="w-full p-2 border border-gray-300 rounded" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-orange-600 mb-1">Ibu Lulusan SMP ke Bawah</label>
                        <input type="number" name="ibu_smp_kebawah" value={raw.ibu_smp_kebawah} onChange={handleChangeManual} required className="w-full p-2 border border-orange-300 bg-orange-50 rounded" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Rata-rata Penghasilan (Rp)</label>
                        <input type="number" name="penghasilan" value={raw.penghasilan} onChange={handleChangeManual} required className="w-full p-2 border border-gray-300 rounded" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button type="submit" disabled={isProcessing} className={`px-8 py-3 rounded-lg font-bold text-white flex items-center gap-2 transition ${isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
                    <FaCalculator /> {isProcessing ? "Menyimpan..." : "Kalkulasi & Simpan Data"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "import" && (
            <div className="animate-fadeIn">
              <div className="mb-6 flex gap-3">
                <button onClick={handleExportTemplate} className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-bold transition">
                  <FaFileExcel className="text-green-600 text-lg" /> Unduh Format Template
                </button>
                <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition">
                  <FaFileUpload className="text-lg" /> Unggah File .xlsx
                  <input type="file" accept=".xlsx, .xls" onChange={handleImportXLSX} className="hidden" />
                </label>
              </div>

              {importData.length > 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">Pratinjau Data Kalkulasi</h2>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">Siap dikirim ke Database</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setImportData([])} className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition">
                        <FaTrash /> Batalkan
                      </button>
                      <button onClick={handleSaveAllExcel} disabled={isProcessing} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-2 transition">
                        <FaCheckCircle /> {isProcessing ? "Memproses..." : "Simpan Semua"}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100/50 text-gray-600 text-[11px] uppercase tracking-wider font-bold border-b">
                          <th className="p-4">Kabupaten/Kota</th>
                          <th className="p-4">BBLR</th>
                          <th className="p-4">Gizi Buruk</th>
                          <th className="p-4">Sanitasi</th>
                          <th className="p-4">Air Bersih</th>
                          <th className="p-4">Pnd. Ibu</th>
                          <th className="p-4">Penghasilan</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {importData.map((d, i) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-blue-50/30 transition-colors">
                            <td className="p-4 font-bold text-gray-700">{d.kab_kota}</td>
                            <td className="p-4">{d.Persentase_BBLR.toFixed(1)}%</td>
                            <td className="p-4">{d.Persentase_Gizi_Buruk.toFixed(1)}%</td>
                            <td className="p-4">{d.Sanitasi_dan_Kebersihan_Lingkungan_mean.toFixed(1)}%</td>
                            <td className="p-4">{d.Ketersediaan_Air_Bersih_mean.toFixed(1)}%</td>
                            <td className="p-4">{d["Pendidikan_Ibu_SMP/MTs_mean"].toFixed(1)}%</td>
                            <td className="p-4 text-gray-500 font-mono">Rp{d.Penghasilan_keluarga_mean.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[350px] border-2 border-dashed border-gray-300 rounded-xl bg-white p-12 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <FaFileUpload className="text-2xl text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Laporan Massal Kosong</h3>
                  <p className="text-gray-500 mt-2 max-w-sm mx-auto text-sm">
                    Unduh format template, isi data wilayah, dan unggah kembali di sini untuk memproses puluhan wilayah sekaligus.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}