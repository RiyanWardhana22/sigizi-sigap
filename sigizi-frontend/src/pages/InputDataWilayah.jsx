import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar";
import {
  FaDatabase,
  FaCalculator,
  FaFileExcel,
  FaFileUpload,
  FaTrash,
  FaCheckCircle,
  FaKeyboard,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";

const DAFTAR_WILAYAH_SUMUT = [
  "Nias",
  "Mandailing Natal",
  "Tapanuli Selatan",
  "Tapanuli Tengah",
  "Tapanuli Utara",
  "Toba",
  "Labuhanbatu",
  "Asahan",
  "Simalungun",
  "Dairi",
  "Karo",
  "Deli Serdang",
  "Langkat",
  "Nias Selatan",
  "Humbang Hasundutan",
  "Pakpak Bharat",
  "Samosir",
  "Serdang Bedagai",
  "Batu Bara",
  "Padang Lawas Utara",
  "Padang Lawas",
  "Labuhanbatu Selatan",
  "Labuhanbatu Utara",
  "Nias Utara",
  "Nias Barat",
  "Kota Sibolga",
  "Kota Tanjung Balai",
  "Kota Pematangsiantar",
  "Kota Tebing Tinggi",
  "Kota Medan",
  "Kota Binjai",
  "Kota Padang Sidempuan",
  "Kota Gunungsitoli",
];

const API_URL = "http://localhost/sigizi-sigap/sigizi-backend";

export default function InputDataWilayah() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("manual");
  const [isProcessing, setIsProcessing] = useState(false);

  const [raw, setRaw] = useState({
    kab_kota: "",
    total_bayi: "",
    bayi_bblr: "",
    total_balita: "",
    balita_gizi_buruk: "",
    total_kk: "",
    kk_sanitasi: "",
    kk_air: "",
    total_ibu: "",
    ibu_smp_kebawah: "",
    penghasilan: "",
    total_anak_imunisasi: "",
    anak_terima_imunisasi: "",
  });

  const [importData, setImportData] = useState([]);

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
      Persentase_BBLR:
        (Number(raw.bayi_bblr) / (Number(raw.total_bayi) || 1)) * 100,
      Persentase_Gizi_Buruk:
        (Number(raw.balita_gizi_buruk) / (Number(raw.total_balita) || 1)) * 100,
      Sanitasi_dan_Kebersihan_Lingkungan_mean:
        (Number(raw.kk_sanitasi) / (Number(raw.total_kk) || 1)) * 100,
      Ketersediaan_Air_Bersih_mean:
        (Number(raw.kk_air) / (Number(raw.total_kk) || 1)) * 100,
      "Pendidikan_Ibu_SMP/MTs_mean":
        (Number(raw.ibu_smp_kebawah) / (Number(raw.total_ibu) || 1)) * 100,
      Penghasilan_keluarga_mean: Number(raw.penghasilan),
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
        setRaw({
          kab_kota: "",
          total_bayi: "",
          bayi_bblr: "",
          total_balita: "",
          balita_gizi_buruk: "",
          total_kk: "",
          kk_sanitasi: "",
          kk_air: "",
          total_ibu: "",
          ibu_smp_kebawah: "",
          penghasilan: "",
          total_anak_imunisasi: "",
          anak_terima_imunisasi: "",
        });
      } else {
        alert("Gagal: " + data.message);
        console.error("Log Python:", data.python_log);
      }
    } catch (error) {
      console.error("Error Koneksi:", error);
      alert(
        "Gagal terhubung ke Server PHP! Pastikan XAMPP/Laragon menyala dan URL API benar.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ================= LOGIKA EXCEL (API FETCH ASLI) =================
  const handleExportTemplate = () => {
    const header = [
      [
        "KABUPATEN_KOTA",
        "TOTAL_BAYI_LAHIR",
        "JUMLAH_BBLR",
        "TOTAL_BALITA_TERUKUR",
        "BALITA_GIZI_BURUK",
        "TOTAL_KK",
        "KK_SANITASI_LAYAK",
        "KK_AIR_BERSIH",
        "TOTAL_IBU_TERDATA",
        "IBU_PENDIDIKAN_SMP_KEBAWAH",
        "RATA_PENGHASILAN_WILAYAH",
        "TOTAL_ANAK_IMUNISASI",
        "ANAK_TERIMA_IMUNISASI",
      ],
    ];
    const rows = DAFTAR_WILAYAH_SUMUT.map((w) => [
      w,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ]);
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

      const parsed = data.map((row) => ({
        kab_kota: row.KABUPATEN_KOTA,
        Persentase_BBLR:
          (Number(row.JUMLAH_BBLR) / (Number(row.TOTAL_BAYI_LAHIR) || 1)) * 100,
        Persentase_Gizi_Buruk:
          (Number(row.BALITA_GIZI_BURUK) /
            (Number(row.TOTAL_BALITA_TERUKUR) || 1)) *
          100,
        Sanitasi_dan_Kebersihan_Lingkungan_mean:
          (Number(row.KK_SANITASI_LAYAK) / (Number(row.TOTAL_KK) || 1)) * 100,
        Ketersediaan_Air_Bersih_mean:
          (Number(row.KK_AIR_BERSIH) / (Number(row.TOTAL_KK) || 1)) * 100,
        "Pendidikan_Ibu_SMP/MTs_mean":
          (Number(row.IBU_PENDIDIKAN_SMP_KEBAWAH) /
            (Number(row.TOTAL_IBU) || 1)) *
          100,
        Penghasilan_keluarga_mean: Number(row.RATA_PENGHASILAN_WILAYAH),
        Persentase_Imunisasi:
          (Number(row.ANAK_TERIMA_IMUNISASI) /
            (Number(row.TOTAL_ANAK_IMUNISASI) || 1)) *
          100,
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
      alert(
        "Gagal terhubung ke Server PHP! Pastikan XAMPP/Laragon menyala dan URL API benar.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Utility class untuk input agar konsisten dan rapi
  const inputBaseClass =
    "w-full mt-1.5 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 shadow-sm";

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans text-slate-800">
      <Sidebar
        handleLogout={() => {
          localStorage.removeItem("user");
          navigate("/");
        }}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {t("inputWilayah.title")}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t("inputWilayah.subtitle")}
            </p>
          </div>
        </header>

        <main className="p-6 sm:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl mb-8 border border-slate-200 shadow-inner">
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === "manual"
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {t("inputWilayah.inputManual")}
            </button>
            <button
              onClick={() => setActiveTab("import")}
              className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === "import"
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {t("inputWilayah.unggahExcel")}
            </button>
          </div>

          {/* ================= TAB MANUAL ================= */}
          {activeTab === "manual" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-8 border-b border-slate-100 pb-5">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {t("inputWilayah.formLaporanTunggal")}
                </h2>
                <p className="text-sm text-slate-500 mt-1.5">
                  {t("inputWilayah.deskripsiManual")}
                </p>
              </div>

              <form onSubmit={handleSubmitManual} className="space-y-8">
                {/* Pemilihan Wilayah */}
                <div className="max-w-md">
                  <label className="block text-sm font-semibold text-slate-700">
                    {t("inputWilayah.pilihKabupatenKota")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="kab_kota"
                    value={raw.kab_kota}
                    onChange={handleChangeManual}
                    required
                    className={`${inputBaseClass} cursor-pointer`}
                  >
                    <option value="">{t("inputWilayah.pilihWilayahAdministrasi")}</option>
                    {DAFTAR_WILAYAH_SUMUT.map((wilayah, index) => (
                      <option key={index} value={wilayah}>
                        {wilayah}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                  {/* Card 1: Bayi & Balita */}
                  <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/50 hover:border-blue-200 transition-colors">
                    <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-3 mb-5 flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        1
                      </span>
                      {t("inputWilayah.dataBayiBalita")}
                    </h3>
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600">
                            {t("inputWilayah.totalBayiLahir")}
                          </label>
                          <input
                            type="number"
                            name="total_bayi"
                            value={raw.total_bayi}
                            onChange={handleChangeManual}
                            required
                            min="0"
                            className={inputBaseClass}
                            placeholder={t("inputWilayah.holderTotalLahirBayi")}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-red-600">
                            {t("inputWilayah.jumlahBayiBblr")}
                          </label>
                          <input
                            type="number"
                            name="bayi_bblr"
                            value={raw.bayi_bblr}
                            onChange={handleChangeManual}
                            required
                            min="0"
                            className={`${inputBaseClass} !border-red-200 !bg-red-50/50 focus:!border-red-500 focus:!ring-red-500/20`}
                            placeholder={t("inputWilayah.holderAngkaRill")}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600">
                            {t("inputWilayah.totalBalitaTerukur")}
                          </label>
                          <input
                            type="number"
                            name="total_balita"
                            value={raw.total_balita}
                            onChange={handleChangeManual}
                            required
                            min="0"
                            className={inputBaseClass}
                            placeholder={t("inputWilayah.holderTotalBalitaUkur")}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-red-600">
                            {t("inputWilayah.balitaGiziBuruk")}
                          </label>
                          <input
                            type="number"
                            name="balita_gizi_buruk"
                            value={raw.balita_gizi_buruk}
                            onChange={handleChangeManual}
                            required
                            min="0"
                            className={`${inputBaseClass} !border-red-200 !bg-red-50/50 focus:!border-red-500 focus:!ring-red-500/20`}
                            placeholder={t("inputWilayah.holderAngkaRill")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Sanitasi & Air Bersih */}
                  <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/50 hover:border-emerald-200 transition-colors">
                    <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-3 mb-5 flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        2
                      </span>
                      {t("inputWilayah.sanitasiAirBersih")}
                    </h3>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600">
                          {t("inputWilayah.totalKepalaKeluarga")}
                        </label>
                        <input
                          type="number"
                          name="total_kk"
                          value={raw.total_kk}
                          onChange={handleChangeManual}
                          required
                          min="0"
                          className={inputBaseClass}
                          placeholder={t("inputWilayah.holderTotalKepalaKeluarga")}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-semibold text-emerald-600">
                            {t("inputWilayah.kkJambanSehat")}
                          </label>
                          <input
                            type="number"
                            name="kk_sanitasi"
                            value={raw.kk_sanitasi}
                            onChange={handleChangeManual}
                            required
                            min="0"
                            className={`${inputBaseClass} !border-emerald-200 !bg-emerald-50/50 focus:!border-emerald-500 focus:!ring-emerald-500/20`}
                            placeholder={t("inputWilayah.holderAngkaRill")}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-emerald-600">
                            {t("inputWilayah.kkAirBersih")}
                          </label>
                          <input
                            type="number"
                            name="kk_air"
                            value={raw.kk_air}
                            onChange={handleChangeManual}
                            required
                            min="0"
                            className={`${inputBaseClass} !border-emerald-200 !bg-emerald-50/50 focus:!border-emerald-500 focus:!ring-emerald-500/20`}
                            placeholder={t("inputWilayah.holderAngkaRill")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Kondisi Sosial Ekonomi */}
                  <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/50 hover:border-orange-200 transition-colors xl:col-span-2">
                    <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-3 mb-5 flex items-center gap-2">
                      <span className="bg-orange-100 text-orange-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        3
                      </span>
                      {t("inputWilayah.kondisiSosialEkonomi")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600">
                          {t("inputWilayah.totalIbuTerdata")}
                        </label>
                        <input
                          type="number"
                          name="total_ibu"
                          value={raw.total_ibu}
                          onChange={handleChangeManual}
                          required
                          min="0"
                          className={inputBaseClass}
                          placeholder={t("inputWilayah.holderTotalIbu")}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-orange-600">
                          {t("inputWilayah.ibuLulusanSmpKebawah")}
                        </label>
                        <input
                          type="number"
                          name="ibu_smp_kebawah"
                          value={raw.ibu_smp_kebawah}
                          onChange={handleChangeManual}
                          required
                          min="0"
                          className={`${inputBaseClass} !border-orange-200 !bg-orange-50/50 focus:!border-orange-500 focus:!ring-orange-500/20`}
                          placeholder={t("inputWilayah.holderAngkaRill")}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600">
                          {t("inputWilayah.rataPenghasilan")}
                        </label>
                        <div className="relative mt-1.5">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-semibold">
                            Rp
                          </span>
                          <input
                            type="number"
                            name="penghasilan"
                            value={raw.penghasilan}
                            onChange={handleChangeManual}
                            required
                            min="0"
                            className={`${inputBaseClass} !mt-0 pl-9`}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Imunisasi (Dummy - Tidak dikirim ke ML) */}
                  <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/50 hover:border-purple-200 transition-colors">
                    <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-3 mb-5 flex items-center gap-2">
                      <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        4
                      </span>
                      {t("inputWilayah.imunisasi")}
                    </h3>
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600">
                            {t("inputWilayah.totalAnak")}
                          </label>
                          <input
                            type="number"
                            name="total_anak_imunisasi"
                            value={raw.total_anak_imunisasi}
                            onChange={handleChangeManual}
                            min="0"
                            className={inputBaseClass}
                            placeholder={t("inputWilayah.holderTotalAnak")}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-purple-600">
                            {t("inputWilayah.anakTerimaImunisasi")}
                          </label>
                          <input
                            type="number"
                            name="anak_terima_imunisasi"
                            value={raw.anak_terima_imunisasi}
                            onChange={handleChangeManual}
                            min="0"
                            className={`${inputBaseClass} !border-purple-200 !bg-purple-50/50 focus:!border-purple-500 focus:!ring-purple-500/20`}
                            placeholder={t("inputWilayah.holderAngkaRill")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] ${
                      isProcessing
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        {t("inputWilayah.menyimpan")}
                      </>
                    ) : (
                      <>{t("inputWilayah.kalkulasiSimpan")}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB UPLOAD EXCEL ================= */}
          {activeTab === "import" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleExportTemplate}
                  className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-green-300 hover:bg-green-50 text-slate-700 hover:text-green-700 px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-all"
                >
                  <FaFileExcel className="text-green-600 text-lg" /> {t("inputWilayah.unduhFormatTemplate")}
                </button>
                <label className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]">
                  <FaFileUpload className="text-lg" /> {t("inputWilayah.unggahFileExcel")}
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleImportXLSX}
                    className="hidden"
                  />
                </label>
              </div>

              {importData.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-50/50">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        {t("inputWilayah.pratinjauDataKalkulasi")}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">
                        {importData.length} {t("inputWilayah.wilayahSiapKirim")}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setImportData([])}
                        className="bg-white border border-slate-200 text-red-600 hover:border-red-200 hover:bg-red-50 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                      >
                        <FaTrash /> {t("inputWilayah.batalkan")}
                      </button>
                      <button
                        onClick={handleSaveAllExcel}
                        disabled={isProcessing}
                        className={`text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all ${
                          isProcessing
                            ? "bg-slate-400 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-0.5 active:scale-[0.98]"
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            {t("inputWilayah.memproses")}
                          </>
                        ) : (
                          <>
                            <FaCheckCircle /> {t("inputWilayah.simpanSemua")}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                          <th className="p-4 pl-6">Kabupaten/Kota</th>
                          <th className="p-4">BBLR</th>
                          <th className="p-4">Gizi Buruk</th>
                          <th className="p-4">Sanitasi</th>
                          <th className="p-4">Air Bersih</th>
                          <th className="p-4">Pnd. Ibu</th>
                          <th className="p-4 text-right">Penghasilan (Rp)</th>
                          <th className="p-4 pr-6 text-right">Imunisasi</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {importData.map((d, i) => (
                          <tr
                            key={i}
                            className="border-b border-slate-100 last:border-0 hover:bg-blue-50/50 transition-colors"
                          >
                            <td className="p-4 pl-6 font-bold text-slate-700">
                              {d.kab_kota}
                            </td>
                            <td className="p-4 text-red-600 font-medium">
                              {d.Persentase_BBLR.toFixed(1)}%
                            </td>
                            <td className="p-4 text-red-600 font-medium">
                              {d.Persentase_Gizi_Buruk.toFixed(1)}%
                            </td>
                            <td className="p-4 text-emerald-600 font-medium">
                              {d.Sanitasi_dan_Kebersihan_Lingkungan_mean.toFixed(
                                1,
                              )}
                              %
                            </td>
                            <td className="p-4 text-emerald-600 font-medium">
                              {d.Ketersediaan_Air_Bersih_mean.toFixed(1)}%
                            </td>
                            <td className="p-4 text-orange-600 font-medium">
                              {d["Pendidikan_Ibu_SMP/MTs_mean"].toFixed(1)}%
                            </td>
                            <td className="p-4 text-slate-600 font-mono text-right">
                              {d.Penghasilan_keluarga_mean.toLocaleString(
                                "id-ID",
                              )}
                            </td>
                            <td className="p-4 pr-6 text-purple-600 font-medium text-right">
                              {d.Persentase_Imunisasi.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-slate-300 rounded-2xl bg-white p-12 text-center transition-all hover:border-blue-400 hover:bg-slate-50/50">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5 shadow-inner">
                    <FaFileUpload className="text-3xl text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {t("inputWilayah.pFileKosong")}
                  </h3>
                  <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm leading-relaxed">
                    {t("inputWilayah.pUploadFile")}
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
