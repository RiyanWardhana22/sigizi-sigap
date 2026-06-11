// sigizi-frontend/src/pages/orangtua/OrangTuaPemantauanGizi.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnak } from "../../contexts/AnakContext";
import Sidebar from "../../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from "recharts";
import {
  whoGrowthData,
  cdcGrowthData,
  whoWFHData,
  calculatePercentile,
  calculateZScore,
} from "./growthReferences";
import { useLanguage } from "../../contexts/LanguageContext";

// ─────────────────────────────────────────────
// KOMPONEN: MODAL PENJELASAN GRAFIK
// ─────────────────────────────────────────────
function PenjelasanGrafikModal({
  isOpen,
  onClose,
  activeMainMenu,
  activeSubMenu,
  ageRange,
}) {
  if (!isOpen) return null;

  const getPenjelasanContent = () => {
    if (activeMainMenu === "berat") {
      if (activeSubMenu === "bb_u") {
        return {
          judul: "Grafik Berat Badan menurut Usia (BB/U)",
          deskripsi:
            "Grafik ini menunjukkan apakah berat badan anak Anda sudah sesuai dengan usianya.",
          caraBaca: [
            {
              langkah: "1. Lihat Garis Biru",
              detail:
                "Garis biru dengan titik-titik menunjukkan pertumbuhan berat badan anak Anda dari waktu ke waktu.",
            },
            {
              langkah: "2. Perhatikan Zona Warna",
              detail:
                "Zona hijau berarti berat badan normal. Zona kuning berarti perlu perhatian lebih. Di luar zona berarti perlu konsultasi dokter.",
            },
            {
              langkah: "3. Bandingkan dengan Garis Tengah",
              detail:
                "Garis hijau tebal adalah berat badan rata-rata anak seusianya. Semakin dekat ke garis ini, semakin ideal.",
            },
          ],
          tips: "TIPS: Timbang anak secara rutin setiap bulan di Posyandu atau Puskesmas terdekat untuk memantau pertumbuhannya.",
          warna: "emerald",
          kondisi: [
            {
              status: "Normal",
              arti: "Berat badan anak Anda ideal, pertahankan pola makan sehat!",
              warna: "bg-emerald-100 text-emerald-700 border-emerald-200",
            },
            {
              status: "Kurang",
              arti: "Berat badan anak di bawah rata-rata, tingkatkan asupan gizi seimbang.",
              warna: "bg-amber-100 text-amber-700 border-amber-200",
            },
            {
              status: "Berlebih",
              arti: "Berat badan anak di atas rata-rata, kurangi makanan tinggi gula dan lemak.",
              warna: "bg-red-100 text-red-700 border-red-200",
            },
          ],
        };
      } else if (activeSubMenu === "bb_tb") {
        return {
          judul: "Grafik Berat Badan menurut Tinggi Badan (BB/TB)",
          deskripsi:
            "Grafik ini menunjukkan apakah berat badan anak Anda sudah proporsional dengan tinggi badannya.",
          caraBaca: [
            {
              langkah: "1. Lihat Garis Biru",
              detail:
                "Garis biru dengan titik-titik menunjukkan data berat dan tinggi anak Anda dari waktu ke waktu.",
            },
            {
              langkah: "2. Perhatikan Zona Warna",
              detail:
                "Zona hijau berarti berat badan proporsional dengan tinggi. Zona kuning berarti perlu perhatian. Di luar zona berarti perlu konsultasi dokter.",
            },
            {
              langkah: "3. Bandingkan dengan Garis Tengah",
              detail:
                "Garis hijau tebal adalah berat badan rata-rata untuk tinggi tersebut. Semakin dekat, semakin proporsional.",
            },
          ],
          tips: "TIPS: Pastikan anak mendapatkan makanan bergizi seimbang dengan porsi yang sesuai, tidak kurang dan tidak berlebihan.",
          warna: "emerald",
          kondisi: [
            {
              status: "Normal",
              arti: "Berat badan proporsional dengan tinggi badan, pertahankan!",
              warna: "bg-emerald-100 text-emerald-700 border-emerald-200",
            },
            {
              status: "Kurus",
              arti: "Berat badan kurang untuk tinggi badannya, tingkatkan asupan protein dan kalori sehat.",
              warna: "bg-amber-100 text-amber-700 border-amber-200",
            },
            {
              status: "Gemuk",
              arti: "Berat badan berlebih untuk tinggi badannya, atur pola makan dan aktivitas fisik.",
              warna: "bg-red-100 text-red-700 border-red-200",
            },
          ],
        };
      } else if (activeSubMenu === "imt_u") {
        return {
          judul: "Grafik Indeks Massa Tubuh menurut Usia (IMT/U)",
          deskripsi:
            "Grafik ini menunjukkan status gizi anak secara keseluruhan berdasarkan perbandingan berat dan tinggi badan.",
          caraBaca: [
            {
              langkah: "1. Lihat Garis Biru",
              detail:
                "Garis biru menunjukkan nilai IMT anak Anda. IMT dihitung dari berat badan dibagi tinggi badan.",
            },
            {
              langkah: "2. Perhatikan Zona Warna",
              detail:
                "Zona hijau berarti status gizi normal. Zona kuning berarti perlu perhatian. Di luar zona berarti perlu tindakan segera.",
            },
            {
              langkah: "3. Pahami Arti Status Gizi",
              detail:
                "IMT/U adalah indikator paling lengkap untuk menilai status gizi anak secara keseluruhan.",
            },
          ],
          tips: "TIPS: Status gizi anak dipengaruhi oleh banyak faktor: asupan makanan, aktivitas fisik, kebersihan lingkungan, dan akses layanan kesehatan.",
          warna: "emerald",
          kondisi: [
            {
              status: "Gizi Baik",
              arti: "Status gizi anak normal, pertahankan pola hidup sehat!",
              warna: "bg-emerald-100 text-emerald-700 border-emerald-200",
            },
            {
              status: "Gizi Kurang",
              arti: "Anak perlu perbaikan gizi, konsultasikan ke petugas kesehatan.",
              warna: "bg-amber-100 text-amber-700 border-amber-200",
            },
            {
              status: "Gizi Lebih",
              arti: "Anak kelebihan gizi, atur pola makan dan tingkatkan aktivitas fisik.",
              warna: "bg-red-100 text-red-700 border-red-200",
            },
          ],
        };
      }
    } else if (activeMainMenu === "tinggi") {
      return {
        judul: "Grafik Tinggi Badan menurut Usia (TB/U)",
        deskripsi:
          "Grafik ini menunjukkan apakah tinggi badan anak Anda sudah sesuai dengan usianya. Tinggi badan yang tidak sesuai bisa menjadi tanda stunting.",
        caraBaca: [
          {
            langkah: "1. Lihat Garis Biru",
            detail:
              "Garis biru dengan titik-titik menunjukkan pertumbuhan tinggi badan anak Anda dari waktu ke waktu.",
          },
          {
            langkah: "2. Perhatikan Zona Warna",
            detail:
              "Zona hijau berarti tinggi badan normal. Zona kuning berarti perlu perhatian lebih karena berisiko stunting.",
          },
          {
            langkah: "3. Waspadai Stunting",
            detail:
              "Jika tinggi anak berada di zona kuning atau di bawahnya, segera konsultasikan ke Puskesmas. Stunting harus dicegah sejak dini!",
          },
        ],
        tips: "TIPS: Stunting adalah kondisi gagal tumbuh akibat kekurangan gizi kronis. Cegah dengan memberikan ASI eksklusif 6 bulan, MPASI bergizi, dan rutin ke Posyandu.",
        warna: "blue",
        kondisi: [
          {
            status: "Normal",
            arti: "Tinggi badan anak sesuai dengan usianya, pertumbuhan baik!",
            warna: "bg-emerald-100 text-emerald-700 border-emerald-200",
          },
          {
            status: "Pendek",
            arti: "Tinggi badan di bawah rata-rata, waspadai risiko stunting. Perbaiki asupan gizi.",
            warna: "bg-amber-100 text-amber-700 border-amber-200",
          },
          {
            status: "Sangat Pendek",
            arti: "Anak berisiko tinggi stunting. SEGERA konsultasikan ke dokter atau Puskesmas!",
            warna: "bg-red-100 text-red-700 border-red-200",
          },
        ],
      };
    } else if (activeMainMenu === "lingkar_kepala") {
      return {
        judul: "Grafik Lingkar Kepala menurut Usia (LK/U)",
        deskripsi:
          "Grafik ini menunjukkan apakah ukuran lingkar kepala anak Anda sesuai dengan usianya. Lingkar kepala berkaitan dengan perkembangan otak anak.",
        caraBaca: [
          {
            langkah: "1. Lihat Garis Biru",
            detail:
              "Garis biru menunjukkan ukuran lingkar kepala anak Anda dari waktu ke waktu.",
          },
          {
            langkah: "2. Perhatikan Zona Warna",
            detail:
              "Zona hijau berarti lingkar kepala normal. Zona kuning berarti perlu pemantauan lebih lanjut.",
          },
          {
            langkah: "3. Pentingnya Pemantauan",
            detail:
              "Lingkar kepala yang tidak normal bisa menjadi tanda masalah perkembangan otak. Rutin ukur di Posyandu!",
          },
        ],
        tips: "TIPS: Ukur lingkar kepala anak setiap bulan di tahun pertama, lalu setiap 3 bulan hingga usia 2 tahun. Gunakan pita ukur yang sama setiap kali mengukur.",
        warna: "purple",
        kondisi: [
          {
            status: "Normal",
            arti: "Lingkar kepala sesuai usia, perkembangan otak berjalan baik!",
            warna: "bg-emerald-100 text-emerald-700 border-emerald-200",
          },
          {
            status: "Kecil",
            arti: "Lingkar kepala di bawah rata-rata, konsultasikan ke dokter untuk evaluasi.",
            warna: "bg-amber-100 text-amber-700 border-amber-200",
          },
          {
            status: "Besar",
            arti: "Lingkar kepala di atas rata-rata, perlu pemeriksaan lebih lanjut oleh dokter.",
            warna: "bg-red-100 text-red-700 border-red-200",
          },
        ],
      };
    }
    return null;
  };

  const content = getPenjelasanContent();
  if (!content) return null;

  const headerColors = {
    emerald: "from-emerald-500 to-emerald-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div
          className={`bg-gradient-to-r ${headerColors[content.warna] || headerColors.emerald} px-6 py-5 text-white`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{content.judul}</h3>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition"
            >
              <FontAwesomeIcon icon={fas.faTimes} className="text-white" />
            </button>
          </div>
          <p className="text-sm text-white/80 mt-2">{content.deskripsi}</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2 mb-4">
              <span className="bg-blue-100 p-2 rounded-lg">
                <FontAwesomeIcon icon={fas.faEye} className="text-blue-600" />
              </span>
              Cara Membaca Grafik Ini
            </h4>
            <div className="space-y-3">
              {content.caraBaca.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{item.langkah}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2 mb-4">
              <span className="bg-amber-100 p-2 rounded-lg">
                <FontAwesomeIcon
                  icon={fas.faPalette}
                  className="text-amber-600"
                />
              </span>
              Arti Status Gizi pada Grafik
            </h4>
            <div className="space-y-3">
              {content.kondisi.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${item.warna}`}
                >
                  <p className="font-bold">{item.status}</p>
                  <p className="text-sm mt-1">{item.arti}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200">
            <p className="text-sm text-gray-700">{content.tips}</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2 mb-4">
              <span className="bg-emerald-100 p-2 rounded-lg">
                <FontAwesomeIcon
                  icon={fas.faChartPie}
                  className="text-emerald-600"
                />
              </span>
              Arti Zona Warna
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div
                  className="w-full h-8 rounded-md mb-2"
                  style={{
                    backgroundColor: "#bbf7d0",
                    border: "1px solid #22c55e",
                  }}
                ></div>
                <p className="font-bold text-emerald-700 text-sm">Zona Hijau</p>
                <p className="text-xs text-gray-500 mt-1">Pertumbuhan Normal</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div
                  className="w-full h-8 rounded-md mb-2"
                  style={{
                    backgroundColor: "#fef3c7",
                    border: "1px solid #f59e0b",
                  }}
                ></div>
                <p className="font-bold text-amber-700 text-sm">Zona Kuning</p>
                <p className="text-xs text-gray-500 mt-1">Perlu Perhatian</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div
                  className="w-full h-8 rounded-md mb-2"
                  style={{
                    backgroundColor: "#e5e7eb",
                    border: "1px solid #9ca3af",
                  }}
                ></div>
                <p className="font-bold text-gray-600 text-sm">Di Luar Zona</p>
                <p className="text-xs text-gray-500 mt-1">Segera Konsultasi</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon
                icon={fas.faInfoCircle}
                className="text-blue-500 text-lg mt-0.5"
              />
              <div>
                <p className="font-bold text-blue-800 text-sm">
                  Penting untuk Diingat!
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Grafik ini menggunakan standar WHO (Organisasi Kesehatan
                  Dunia) untuk anak 0-5 tahun dan standar CDC untuk anak 5-18
                  tahun. Setiap anak memiliki pola pertumbuhan yang berbeda.
                  Konsultasikan dengan tenaga kesehatan untuk evaluasi lebih
                  lanjut.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition shadow-md"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HELPER: Format Usia (Tahun Bulan Hari)
// ─────────────────────────────────────────────
const formatUsiaDetail = (usiaBulan) => {
  if (usiaBulan === undefined || usiaBulan === null) return "-";
  // Konversi bulan ke total hari (rata-rata 1 bulan = 30.4375 hari)
  const totalHari = Math.round(usiaBulan * 30.4375);
  const tahun = Math.floor(totalHari / 365);
  const sisaHari = totalHari - tahun * 365;
  const bulan = Math.floor(sisaHari / 30);
  const hari = sisaHari - bulan * 30;

  return `${tahun} Tahun ${bulan} Bulan ${hari} Hari`;
};

// ─────────────────────────────────────────────
// HELPER: Hitung Z-Score dari data referensi WHO
// ─────────────────────────────────────────────
const getZScoreFromReference = (value, usiaBulan, jenisKelamin, indicator) => {
  const data = whoGrowthData[indicator];
  if (!data) return null;
  const genderData = jenisKelamin === "L" ? data.laki : data.perempuan;
  if (!genderData) return null;
  const ages = Object.keys(genderData)
    .map(Number)
    .sort((a, b) => a - b);
  let closestAge = ages[0];
  for (const age of ages) {
    if (Math.abs(age - usiaBulan) < Math.abs(closestAge - usiaBulan)) {
      closestAge = age;
    }
  }
  const refData = genderData[closestAge];
  if (!refData) return null;
  const median = refData["0sd"];
  const sdNeg2 = refData["-2sd"];
  const sdPos2 = refData["2sd"];
  const estimatedSDNeg = (median - sdNeg2) / 2;
  const estimatedSDPos = (sdPos2 - median) / 2;
  if (value < median) {
    return (value - median) / estimatedSDNeg;
  } else {
    return (value - median) / estimatedSDPos;
  }
};

// ─────────────────────────────────────────────
// HELPER: Konversi Persentil → Z-Score (Inverse Normal CDF)
// Menggunakan tabel lookup dengan interpolasi linear
// ─────────────────────────────────────────────
const percentileToZScore = (p) => {
  // [persentil, z-score] — berdasarkan distribusi normal standar
  const table = [
    [0.5, -2.576], [1, -2.326], [2, -2.054], [3, -1.881],
    [5, -1.645], [10, -1.282], [15, -1.036], [20, -0.842],
    [25, -0.674], [30, -0.524], [35, -0.385], [40, -0.253],
    [45, -0.126], [50, 0.0],   [55, 0.126],  [60, 0.253],
    [65, 0.385],  [70, 0.524], [75, 0.674],  [80, 0.842],
    [85, 1.036],  [90, 1.282], [95, 1.645],  [97, 1.881],
    [98, 2.054],  [99, 2.326], [99.5, 2.576],
  ];
  if (p <= table[0][0]) return table[0][1];
  if (p >= table[table.length - 1][0]) return table[table.length - 1][1];
  for (let i = 0; i < table.length - 1; i++) {
    if (p >= table[i][0] && p <= table[i + 1][0]) {
      const t = (p - table[i][0]) / (table[i + 1][0] - table[i][0]);
      return table[i][1] + t * (table[i + 1][1] - table[i][1]);
    }
  }
  return 0;
};

// ─────────────────────────────────────────────
// HELPER: Hitung Persentil CDC secara kontinu (interpolasi antar titik referensi)
// Mengembalikan nilai persentil 0–100 (bukan kategorikal)
// ─────────────────────────────────────────────
const calculateCDCPercentileContinuous = (value, usiaBulan, jenisKelamin, indicator) => {
  const data = cdcGrowthData[indicator];
  if (!data) return null;
  const genderData = jenisKelamin === "L" ? data.laki : data.perempuan;
  if (!genderData) return null;

  const ageInYears = usiaBulan / 12;
  const ages = Object.keys(genderData).map(Number).sort((a, b) => a - b);

  // Cari dua usia referensi terdekat untuk interpolasi
  let lowerAge = ages[0];
  for (const age of ages) {
    if (age <= ageInYears) lowerAge = age;
    else break;
  }
  const lowerIdx = ages.indexOf(lowerAge);
  const upperAge = lowerIdx + 1 < ages.length ? ages[lowerIdx + 1] : lowerAge;

  const getRefVals = (ageKey) => {
    const ref = genderData[ageKey];
    if (!ref) return null;
    return [
      { p: 3,  v: ref.p3  },
      { p: 5,  v: ref.p5  },
      { p: 50, v: ref.p50 },
      { p: 85, v: ref.p85 },
      { p: 90, v: ref.p90 },
      { p: 95, v: ref.p95 },
    ];
  };

  const lowerRefs = getRefVals(lowerAge);
  const upperRefs = getRefVals(upperAge);
  if (!lowerRefs || !upperRefs) return null;

  // Interpolasi nilai referensi antar dua usia
  const t = lowerAge === upperAge ? 0 : (ageInYears - lowerAge) / (upperAge - lowerAge);
  const refs = lowerRefs.map((ref, i) => ({
    p: ref.p,
    v: ref.v + t * (upperRefs[i].v - ref.v),
  }));

  // Temukan posisi nilai anak di antara titik persentil
  if (value <= refs[0].v) {
    // Di bawah P3: ekstrapolasi ke bawah
    return Math.max(0.5, 3 * (value / refs[0].v));
  }
  for (let i = 0; i < refs.length - 1; i++) {
    if (value >= refs[i].v && value <= refs[i + 1].v) {
      const frac = (value - refs[i].v) / (refs[i + 1].v - refs[i].v);
      return refs[i].p + frac * (refs[i + 1].p - refs[i].p);
    }
  }
  // Di atas P95: ekstrapolasi ke atas
  return Math.min(99.5, 95 + (value - refs[refs.length - 1].v) / refs[refs.length - 1].v * 4);
};

// ─────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────
export default function OrangTuaPemantauanGizi() {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
  const [loading, setLoading] = useState(true);

  const [activeMainMenu, setActiveMainMenu] = useState("berat");
  const [activeSubMenu, setActiveSubMenu] = useState("bb_u");
  const [ageRange, setAgeRange] = useState("0-60");
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);

  const [showPenjelasanGrafik, setShowPenjelasanGrafik] = useState(false);

  const [orangTuaList, setOrangTuaList] = useState([]);
  const [selectedOrangTuaId, setSelectedOrangTuaId] = useState(null);
  const [superAdminAnakList, setSuperAdminAnakList] = useState([]);
  const [superAdminSelectedAnak, setSuperAdminSelectedAnak] = useState(null);
  const [superAdminShowAnakDropdown, setSuperAdminShowAnakDropdown] =
    useState(false);
  const [growthData, setGrowthData] = useState([]);
  const [superAdminGrowthData, setSuperAdminGrowthData] = useState([]);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const MAX_VALID_WEIGHT = 150;
  const MAX_VALID_HEIGHT = 200;
  const MAX_VALID_IMT = 50;
  const MAX_VALID_LK = 70;

  const ageRangeConfig = {
    "0-2": {
      min: 0, max: 2, label: "Grafik 0 - 2 Bulan", shortLabel: "0-2 bln",
      isWHO: true, icon: "faBaby", step: 0.25,
      yDomain: { bb_u: [2, 8], tb_u: [45, 65], imt_u: [10, 20] },
    },
    "0-12": {
      min: 0, max: 12, label: "Grafik 0 - 12 Bulan", shortLabel: "0-12 bln",
      isWHO: true, icon: "faBabyCarriage", step: 0.5,
      yDomain: { bb_u: [3, 12], tb_u: [48, 78], imt_u: [12, 24] },
    },
    "0-60": {
      min: 0, max: 60, label: "Grafik 0 - 5 Tahun", shortLabel: "0-5 thn",
      isWHO: true, icon: "faChild", step: 1,
      yDomain: { bb_u: [5, 22], tb_u: [60, 120], imt_u: [12, 28] },
    },
    "60-216": {
      min: 60, max: 216, label: "Grafik 5 - 18 Tahun", shortLabel: "5-18 thn",
      isWHO: false, icon: "faUserGraduate", step: 1,
      yDomain: { bb_u: [15, 100], tb_u: [110, 190], imt_u: [13, 35] },
    },
  };

  const lkAgeRangeConfig = {
    "0-2": {
      min: 0, max: 2, label: "Grafik 0 - 2 Bulan", shortLabel: "0-2 bln",
      isWHO: true, icon: "faBaby", step: 0.25, yDomain: [31, 38],
    },
    "0-12": {
      min: 0, max: 12, label: "Grafik 0 - 12 Bulan", shortLabel: "0-12 bln",
      isWHO: true, icon: "faBabyCarriage", step: 0.5, yDomain: [33, 48],
    },
    "0-60": {
      min: 0, max: 60, label: "Grafik 0 - 5 Tahun", shortLabel: "0-5 thn",
      isWHO: true, icon: "faChild", step: 1, yDomain: [40, 56],
    },
  };

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
      fetchData(parsedUser.id, "orang_tua");
    }
  }, [navigate]);

  useEffect(() => {
    if (userRole === "orang_tua" && selectedAnakData) {
      generateGrowthData(selectedAnakData, setGrowthData);
    }
  }, [selectedAnakData, userRole]);

  useEffect(() => {
    if (userRole === "super_admin" && superAdminSelectedAnak) {
      generateGrowthData(superAdminSelectedAnak, setSuperAdminGrowthData);
    }
  }, [superAdminSelectedAnak, userRole]);

  useEffect(() => {
    if (activeMainMenu === "lingkar_kepala") {
      const validLKRanges = ["0-2", "0-12", "0-60"];
      if (!validLKRanges.includes(ageRange)) {
        setAgeRange("0-60");
      }
    }
  }, [activeMainMenu, ageRange]);

  const calculateAgeInMonths = (birthDate, measurementDate) => {
    let months = (measurementDate.getFullYear() - birthDate.getFullYear()) * 12;
    months -= birthDate.getMonth();
    months += measurementDate.getMonth();
    if (measurementDate.getDate() < birthDate.getDate()) months--;
    return Math.max(0, months);
  };

  const fetchOrangTuaList = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/get_users.php`);
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
      }
    } catch (error) {
      console.error("Error fetching orang tua list:", error);
      setLoading(false);
    }
  };

  const fetchData = async (userId, role) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/get_riwayat_anak.php?user_id=${userId}`,
      );
      const data = await response.json();
      if (data.status === "success") {
        const processedAnakList = data.data.map((anak) => ({
          ...anak,
          id: Number(anak.id),
          riwayat: (anak.riwayat || [])
            .map((r) => ({
              ...r,
              tanggal_pengukuran: r.tanggal_pengukuran,
              tinggi_badan: Number(r.tinggi_badan),
              berat_badan: Number(r.berat_badan),
              lingkar_kepala: r.lingkar_kepala
                ? Number(r.lingkar_kepala)
                : null,
              z_score: r.z_score ? Number(r.z_score) : null,
              status_gizi: r.status_gizi,
            }))
            .sort(
              (a, b) =>
                new Date(a.tanggal_pengukuran) - new Date(b.tanggal_pengukuran),
            ),
        }));
        if (role === "orang_tua") {
          updateAnakList(processedAnakList, userId, role);
        } else {
          setSuperAdminAnakList(processedAnakList);
          if (processedAnakList.length > 0 && !superAdminSelectedAnak) {
            setSuperAdminSelectedAnak(processedAnakList[0]);
            generateGrowthData(processedAnakList[0], setSuperAdminGrowthData);
          }
        }
      } else if (data.status === "empty") {
        if (role === "orang_tua") {
          updateAnakList([], userId, role);
        } else {
          setSuperAdminAnakList([]);
          setSuperAdminSelectedAnak(null);
          setSuperAdminGrowthData([]);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateGrowthData = (anak, setData) => {
    if (!anak || !anak.riwayat || anak.riwayat.length === 0) {
      setData([]);
      return;
    }
    const birthDate = new Date(anak.tanggal_lahir);
    const formattedData = anak.riwayat
      .filter((r) => {
        const isValidWeight =
          r.berat_badan > 0 && r.berat_badan < MAX_VALID_WEIGHT;
        const isValidHeight =
          r.tinggi_badan > 0 && r.tinggi_badan < MAX_VALID_HEIGHT;
        const isValidLK =
          !r.lingkar_kepala ||
          (r.lingkar_kepala > 0 && r.lingkar_kepala < MAX_VALID_LK);
        return isValidWeight && isValidHeight && isValidLK;
      })
      .map((r) => {
        const measurementDate = new Date(r.tanggal_pengukuran);
        const ageInMonths = calculateAgeInMonths(birthDate, measurementDate);
        const imt =
          r.tinggi_badan > 0
            ? r.berat_badan / Math.pow(r.tinggi_badan / 100, 2)
            : null;
        return {
          tanggal: r.tanggal_pengukuran,
          usiaBulan: ageInMonths,
          usiaTahun: ageInMonths / 12,
          tinggi: r.tinggi_badan,
          berat: r.berat_badan,
          imt: imt,
          lingkar_kepala: r.lingkar_kepala,
          status_gizi: r.status_gizi,
          z_score: r.z_score,
        };
      });
    setData(formattedData);
  };

  const handleOrangTuaChange = async (userId) => {
    setSelectedOrangTuaId(userId);
    setSuperAdminSelectedAnak(null);
    setSuperAdminGrowthData([]);
    await fetchData(userId, "super_admin");
  };

  const handleAnakChange = (anakId) => {
    const anak = anakList.find((a) => a.id === anakId);
    if (anak) {
      updateSelectedAnak(anakId, anak, currentUserId);
    }
    setShowAnakDropdown(false);
  };

  const handleSuperAdminAnakChange = (anak) => {
    setSuperAdminSelectedAnak(anak);
    setSuperAdminShowAnakDropdown(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("selectedAnakId");
    localStorage.removeItem("currentUserId");
    navigate("/");
  };

  const getReferenceValue = (
    usiaBulan,
    jenisKelamin,
    indicator,
    percentileKey,
  ) => {
    const isMale = jenisKelamin === "L";
    const isWHO = ageRangeConfig[ageRange]?.isWHO !== false;
    if (isWHO) {
      const data = whoGrowthData[indicator];
      if (!data) return null;
      const genderData = isMale ? data.laki : data.perempuan;
      if (!genderData) return null;
      const ages = Object.keys(genderData)
        .map(Number)
        .sort((a, b) => a - b);
      const lower = ages.filter((a) => a <= usiaBulan).at(-1);
      const upper = ages.find((a) => a > usiaBulan);
      if (lower === undefined) return genderData[ages[0]]?.[percentileKey];
      if (upper === undefined) return genderData[ages.at(-1)]?.[percentileKey];
      const v1 = genderData[lower]?.[percentileKey];
      const v2 = genderData[upper]?.[percentileKey];
      if (v1 == null || v2 == null) return v1 ?? v2;
      return v1 + ((v2 - v1) * (usiaBulan - lower)) / (upper - lower);
    } else {
      const data = cdcGrowthData[indicator];
      if (!data) return null;
      const genderData = isMale ? data.laki : data.perempuan;
      if (!genderData) return null;
      const ageInYears = usiaBulan / 12;
      const ages = Object.keys(genderData)
        .map(Number)
        .sort((a, b) => a - b);
      const lower = ages.filter((a) => a <= ageInYears).at(-1);
      const upper = ages.find((a) => a > ageInYears);
      if (lower === undefined) return genderData[ages[0]]?.[percentileKey];
      if (upper === undefined) return genderData[ages.at(-1)]?.[percentileKey];
      const v1 = genderData[lower]?.[percentileKey];
      const v2 = genderData[upper]?.[percentileKey];
      if (v1 == null || v2 == null) return v1 ?? v2;
      return v1 + ((v2 - v1) * (ageInYears - lower)) / (upper - lower);
    }
  };

  // ─────────────────────────────────────────────
  // HELPER: Weighted moving-average smoothing
  // Menghilangkan artefak pembulatan 1 desimal pada tabel WHO/CDC
  // (nilai 3sd/2sd kadang turun sesaat di bulan 36, 42, 48, 54, 60)
  // Rumus kernel: [1, 2, 1] / 4 → centre mendapat bobot 2×, diulang 2 pass
  // ─────────────────────────────────────────────
  const applySmoothing = (data, keys, passes = 2) => {
    const result = data.map(d => ({ ...d }));
    for (let p = 0; p < passes; p++) {
      for (let i = 1; i < result.length - 1; i++) {
        keys.forEach(key => {
          const prev = result[i - 1][key];
          const curr = result[i][key];
          const next = result[i + 1][key];
          if (prev != null && curr != null && next != null) {
            result[i][key] = (prev + 2 * curr + next) / 4;
          }
        });
      }
    }
    return result;
  };

  const generateFullReferenceData = (jenisKelamin, indicator) => {
    const isWHO = ageRangeConfig[ageRange]?.isWHO !== false;
    let config;
    if (activeMainMenu === "lingkar_kepala") {
      config = lkAgeRangeConfig[ageRange];
    } else {
      config = ageRangeConfig[ageRange];
    }
    if (!config) return [];

    const referenceAges = [];
    const step = config.step;
    for (let age = config.min; age <= config.max + 0.01; age += step) {
      referenceAges.push(Math.round(age * 10) / 10);
    }
    if (referenceAges[referenceAges.length - 1] !== config.max) {
      referenceAges.push(config.max);
    }

    // ── Pass 1: kumpulkan nilai absolut SD/persentil dulu, belum hitung diff ──
    const referenceData = [];
    for (const usia of referenceAges) {
      const dataPoint = { usiaBulan: usia, usiaTahun: usia / 12 };
      if (isWHO) {
        const whoIndicator =
          indicator === "berat"
            ? "bb_u"
            : indicator === "tinggi"
              ? "tb_u"
              : indicator === "imt"
                ? "imt_u"
                : indicator;
        const sdNeg3 = getReferenceValue(usia, jenisKelamin, whoIndicator, "-3sd");
        const sdNeg2 = getReferenceValue(usia, jenisKelamin, whoIndicator, "-2sd");
        const sd0 = getReferenceValue(usia, jenisKelamin, whoIndicator, "0sd");
        const sd2 = getReferenceValue(usia, jenisKelamin, whoIndicator, "2sd");
        const sd3 = getReferenceValue(usia, jenisKelamin, whoIndicator, "3sd");
        if (sdNeg3 != null) dataPoint.sdNeg3 = sdNeg3;
        if (sdNeg2 != null) dataPoint.sdNeg2 = sdNeg2;
        if (sd0 != null) dataPoint.sd0 = sd0;
        if (sd2 != null) dataPoint.sd2 = sd2;
        if (sd3 != null) dataPoint.sd3 = sd3;
      } else {
        const cdcIndicator =
          indicator === "berat"
            ? "bb_u"
            : indicator === "tinggi"
              ? "tb_u"
              : "imt_u";
        const p3 = getReferenceValue(usia, jenisKelamin, cdcIndicator, "p3");
        const p5 = getReferenceValue(usia, jenisKelamin, cdcIndicator, "p5");
        const p50 = getReferenceValue(usia, jenisKelamin, cdcIndicator, "p50");
        const p85 = getReferenceValue(usia, jenisKelamin, cdcIndicator, "p85");
        const p90 = getReferenceValue(usia, jenisKelamin, cdcIndicator, "p90");
        const p95 = getReferenceValue(usia, jenisKelamin, cdcIndicator, "p95");
        if (p3 != null) dataPoint.baseP3 = p3;
        if (p5 != null) dataPoint.baseP5 = p5;
        if (p50 != null) dataPoint.baseP50 = p50;
        if (p85 != null) dataPoint.baseP85 = p85;
        if (p90 != null) dataPoint.baseP90 = p90;
        if (p95 != null) dataPoint.baseP95 = p95;
      }
      referenceData.push(dataPoint);
    }

    // ── Pass 2: haluskan nilai absolut → hilangkan artefak pembulatan WHO/CDC ──
    const whoKeys = ["sdNeg3", "sdNeg2", "sd0", "sd2", "sd3"];
    const cdcKeys = ["baseP3", "baseP5", "baseP50", "baseP85", "baseP90", "baseP95"];
    const smoothed = applySmoothing(referenceData, isWHO ? whoKeys : cdcKeys);

    // ── Pass 3: hitung diff dari nilai yang sudah dihaluskan ──
    smoothed.forEach(dp => {
      if (isWHO) {
        if (dp.sdNeg3 != null && dp.sdNeg2 != null) {
          dp.zonaMerahBawahDiff = Math.max(0, dp.sdNeg2 - dp.sdNeg3);
        }
        if (dp.sdNeg2 != null && dp.sd2 != null) {
          dp.zonaHijauDiff = Math.max(0, dp.sd2 - dp.sdNeg2);
        }
        if (dp.sd2 != null && dp.sd3 != null) {
          dp.zonaMerahAtasDiff = Math.max(0, dp.sd3 - dp.sd2);
        }
      } else {
        if (indicator === "berat") {
          if (dp.baseP3 != null && dp.baseP5 != null) {
            dp.zonaKuningBawahDiff = Math.max(0, dp.baseP5 - dp.baseP3);
          }
          if (dp.baseP5 != null && dp.baseP90 != null) {
            dp.zonaHijauDiff = Math.max(0, dp.baseP90 - dp.baseP5);
          }
          if (dp.baseP90 != null && dp.baseP95 != null) {
            dp.zonaKuningAtasDiff = Math.max(0, dp.baseP95 - dp.baseP90);
          }
        } else if (indicator === "imt") {
          if (dp.baseP3 != null && dp.baseP5 != null) {
            dp.zonaKuningBawahDiff = Math.max(0, dp.baseP5 - dp.baseP3);
          }
          if (dp.baseP5 != null && dp.baseP85 != null) {
            dp.zonaHijauDiff = Math.max(0, dp.baseP85 - dp.baseP5);
          }
          if (dp.baseP85 != null && dp.baseP95 != null) {
            dp.zonaKuningAtasDiff = Math.max(0, dp.baseP95 - dp.baseP85);
          }
        } else {
          if (dp.baseP3 != null && dp.baseP95 != null) {
            dp.zonaHijauDiff = Math.max(0, dp.baseP95 - dp.baseP3);
          }
        }
      }
    });

    return smoothed;
  };

  // ─────────────────────────────────────────────
  // CUSTOM TOOLTIP - BB/U (WHO & CDC)
  // ─────────────────────────────────────────────
  const CustomTooltip = ({
    active,
    payload,
    label,
    unit,
    indicator,
    jenisKelamin,
  }) => {
    if (!active || !payload || !payload.length) return null;

    const isWHO = ageRangeConfig[ageRange]?.isWHO !== false;
    const usiaBulan = label;

    const childData = payload.find(
      (p) => p.dataKey === "nilai" || p.name === "Data Anak" || p.name === "Pertumbuhan Si Kecil"
    );
    const childValue = childData?.value;

    if (!childValue || childValue >= 1000) return null;

    let zScoreValue = null;
    let persentilValue = null;
    let labelZScore = "";

    if (jenisKelamin) {
      if (indicator === "berat") {
        if (isWHO) {
          zScoreValue = getZScoreFromReference(childValue, usiaBulan, jenisKelamin, "bb_u");
          labelZScore = zScoreValue !== null ? `Z-Score: ${zScoreValue.toFixed(2)}` : "Z-Score: -";
        } else {
          const contP = calculateCDCPercentileContinuous(childValue, usiaBulan, jenisKelamin, "bb_u");
          const cdcZ  = contP !== null ? percentileToZScore(contP) : null;
          persentilValue = calculatePercentile(childValue, usiaBulan, jenisKelamin, "bb_u");
          labelZScore = cdcZ !== null
            ? `Z-Score: ${cdcZ.toFixed(2)} (P${persentilValue})`
            : `Persentil: P${persentilValue}`;
        }
      } else if (indicator === "tinggi") {
        if (isWHO) {
          zScoreValue = getZScoreFromReference(childValue, usiaBulan, jenisKelamin, "tb_u");
          labelZScore = zScoreValue !== null ? `Z-Score: ${zScoreValue.toFixed(2)}` : "Z-Score: -";
        } else {
          const contP = calculateCDCPercentileContinuous(childValue, usiaBulan, jenisKelamin, "tb_u");
          const cdcZ  = contP !== null ? percentileToZScore(contP) : null;
          persentilValue = calculatePercentile(childValue, usiaBulan, jenisKelamin, "tb_u");
          labelZScore = cdcZ !== null
            ? `Z-Score: ${cdcZ.toFixed(2)} (P${persentilValue})`
            : `Persentil: P${persentilValue}`;
        }
      } else if (indicator === "imt") {
        if (isWHO) {
          zScoreValue = getZScoreFromReference(childValue, usiaBulan, jenisKelamin, "imt_u");
          labelZScore = zScoreValue !== null ? `Z-Score: ${zScoreValue.toFixed(2)}` : "Z-Score: -";
        } else {
          const contP = calculateCDCPercentileContinuous(childValue, usiaBulan, jenisKelamin, "imt_u");
          const cdcZ  = contP !== null ? percentileToZScore(contP) : null;
          persentilValue = calculatePercentile(childValue, usiaBulan, jenisKelamin, "imt_u");
          labelZScore = cdcZ !== null
            ? `Z-Score: ${cdcZ.toFixed(2)} (P${persentilValue})`
            : `Persentil: P${persentilValue}`;
        }
      }
    }

    const getIndicatorLabel = () => {
      if (indicator === "berat") return "Berat Badan";
      if (indicator === "tinggi") return "Tinggi Badan";
      if (indicator === "imt") return "Indeks Massa Tubuh";
      return "";
    };

    const getIndicatorShort = () => {
      if (indicator === "berat") return "BB";
      if (indicator === "tinggi") return "TB";
      if (indicator === "imt") return "IMT";
      return "";
    };

    // Warna badge berdasarkan zona z-score / persentil
    const getBadgeStyle = () => {
      if (isWHO) {
        if (zScoreValue === null) return "bg-gray-50 text-gray-500 border-gray-200";
        if (zScoreValue >= -2 && zScoreValue <= 2) return "bg-emerald-50 text-emerald-700 border-emerald-200";
        if ((zScoreValue >= -3 && zScoreValue < -2) || (zScoreValue > 2 && zScoreValue <= 3))
          return "bg-amber-50 text-amber-700 border-amber-200";
        return "bg-red-50 text-red-700 border-red-200";
      } else {
        if (persentilValue === null) return "bg-gray-50 text-gray-500 border-gray-200";
        const isNormal =
          indicator === "tinggi" ? persentilValue >= 3 && persentilValue <= 95
          : indicator === "imt"  ? persentilValue >= 5 && persentilValue <= 85
          :                        persentilValue >= 5 && persentilValue <= 90;
        const isWarning =
          !isNormal && (
            indicator === "tinggi" ? true
            : indicator === "imt"  ? (persentilValue >= 3 && persentilValue < 5) || (persentilValue > 85 && persentilValue <= 95)
            :                        (persentilValue >= 3 && persentilValue < 5) || (persentilValue > 90 && persentilValue <= 95)
          );
        if (isNormal)  return "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (isWarning) return "bg-amber-50 text-amber-700 border-amber-200";
        return "bg-red-50 text-red-700 border-red-200";
      }
    };

    const accentColor = isWHO ? "#15803d" : "#2563eb";

    return (
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ border: "1px solid #e5e7eb", minWidth: "240px", maxWidth: "290px" }}
      >
        {/* Accent bar */}
        <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />

        {/* Age row */}
        <div className="px-4 pt-3 pb-2.5 border-b border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
            Usia
          </p>
          <p className="text-sm font-semibold text-gray-700">
            {formatUsiaDetail(usiaBulan)}
          </p>
        </div>

        {/* Main metric */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            {getIndicatorLabel()} ({getIndicatorShort()})
          </p>
          <p className="text-3xl font-black text-gray-900 leading-none tracking-tight">
            {childValue.toFixed(1)}
            <span className="text-base font-medium text-gray-400 ml-1">{unit}</span>
          </p>
        </div>

        {/* Z-Score / Percentile badge */}
        <div className="px-4 pb-4 pt-1">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border ${getBadgeStyle()}`}
          >
            {labelZScore}
          </span>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // CUSTOM TOOLTIP - BB/TB (WHO)
  // ─────────────────────────────────────────────
  const BBTBTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const childEntry = payload.find(
      (p) => (p.dataKey === "berat" || p.name === "Data Anak") && p.value != null
    );
    const sd0Entry = payload.find((p) => p.dataKey === "sd0");

    if (!childEntry?.value) return null;

    const tinggiCm = label;
    const beratKg = childEntry.value;

    let zScoreBBTB = null;
    const sdNeg2 = payload.find((p) => p.dataKey === "sdNeg2")?.value;
    const sd0 = sd0Entry?.value;

    if (sdNeg2 != null && sd0 != null) {
      const sd = (sd0 - sdNeg2) / 2;
      if (sd !== 0) {
        zScoreBBTB = ((beratKg - sd0) / sd).toFixed(2);
      }
    }

    const anakData = payload.find((p) => p.payload?.tanggal);
    const usiaBulan = anakData?.payload?.usiaBulan;

    // Badge warna berdasarkan z-score BB/TB
    const getBBTBBadgeStyle = () => {
      if (!zScoreBBTB) return "bg-gray-50 text-gray-500 border-gray-200";
      const z = parseFloat(zScoreBBTB);
      if (z >= -2 && z <= 2) return "bg-emerald-50 text-emerald-700 border-emerald-200";
      if ((z >= -3 && z < -2) || (z > 2 && z <= 3)) return "bg-amber-50 text-amber-700 border-amber-200";
      return "bg-red-50 text-red-700 border-red-200";
    };

    return (
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ border: "1px solid #e5e7eb", minWidth: "240px", maxWidth: "290px" }}
      >
        {/* Accent bar */}
        <div className="h-1 w-full bg-emerald-600" />

        {/* Age row */}
        {usiaBulan !== undefined && usiaBulan !== null && (
          <div className="px-4 pt-3 pb-2.5 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              Usia
            </p>
            <p className="text-sm font-semibold text-gray-700">
              {formatUsiaDetail(usiaBulan)}
            </p>
          </div>
        )}

        {/* Height row */}
        <div className="px-4 pt-3 pb-1 border-b border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
            Tinggi Badan (TB)
          </p>
          <p className="text-lg font-bold text-gray-700">
            {tinggiCm} <span className="text-sm font-medium text-gray-400">cm</span>
          </p>
        </div>

        {/* Weight main metric */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Berat Badan (BB)
          </p>
          <p className="text-3xl font-black text-gray-900 leading-none tracking-tight">
            {beratKg.toFixed(1)}
            <span className="text-base font-medium text-gray-400 ml-1">kg</span>
          </p>
        </div>

        {/* Z-Score badge */}
        {zScoreBBTB && (
          <div className="px-4 pb-4 pt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border ${getBBTBBadgeStyle()}`}
            >
              Z-Score: {zScoreBBTB}
            </span>
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // CUSTOM TOOLTIP - LK/U (WHO)
  // ─────────────────────────────────────────────
  const LKUTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const displayGrowthData =
      userRole === "orang_tua" ? growthData : superAdminGrowthData;
    const anak =
      userRole === "orang_tua" ? selectedAnakData : superAdminSelectedAnak;

    const childData = payload.find(
      (p) => p.dataKey === "nilai" || p.name === "Pertumbuhan Si Kecil"
    );
    const childValue = childData?.value;

    if (!childValue || childValue >= 1000) return null;

    const jenisKelamin = anak?.jenis_kelamin;
    const zScoreLK = jenisKelamin 
      ? getZScoreFromReference(childValue, label, jenisKelamin, "lk_u") 
      : null;

    // Badge warna berdasarkan z-score LK/U
    const getLKBadgeStyle = () => {
      if (zScoreLK === null) return "bg-gray-50 text-gray-500 border-gray-200";
      if (zScoreLK >= -2 && zScoreLK <= 2) return "bg-emerald-50 text-emerald-700 border-emerald-200";
      if ((zScoreLK >= -3 && zScoreLK < -2) || (zScoreLK > 2 && zScoreLK <= 3))
        return "bg-amber-50 text-amber-700 border-amber-200";
      return "bg-red-50 text-red-700 border-red-200";
    };

    return (
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ border: "1px solid #e5e7eb", minWidth: "240px", maxWidth: "290px" }}
      >
        {/* Accent bar */}
        <div className="h-1 w-full bg-purple-600" />

        {/* Age row */}
        <div className="px-4 pt-3 pb-2.5 border-b border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
            Usia
          </p>
          <p className="text-sm font-semibold text-gray-700">
            {formatUsiaDetail(label)}
          </p>
        </div>

        {/* Main metric */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Lingkar Kepala (LK)
          </p>
          <p className="text-3xl font-black text-gray-900 leading-none tracking-tight">
            {childValue.toFixed(1)}
            <span className="text-base font-medium text-gray-400 ml-1">cm</span>
          </p>
        </div>

        {/* Z-Score badge */}
        <div className="px-4 pb-4 pt-1">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border ${getLKBadgeStyle()}`}
          >
            Z-Score: {zScoreLK !== null ? zScoreLK.toFixed(2) : "−"}
          </span>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // RENDER GROWTH CHART (BB/U, TB/U, IMT/U)
  // ─────────────────────────────────────────────
  const renderGrowthChart = (indicator, yAxisLabel, unit) => {
    const displayGrowthData =
      userRole === "orang_tua" ? growthData : superAdminGrowthData;
    const anak =
      userRole === "orang_tua" ? selectedAnakData : superAdminSelectedAnak;

    if (!anak) {
      return (
        <div className="text-center py-16">
          <div className="bg-gray-100 p-6 rounded-full inline-flex mb-4">
            <FontAwesomeIcon
              icon={fas.faChartLine}
              className="text-5xl text-gray-400"
            />
          </div>
          <p className="text-gray-500 font-medium">
            Pilih anak terlebih dahulu
          </p>
        </div>
      );
    }

    const jenisKelamin = anak.jenis_kelamin;
    const isWHO = ageRangeConfig[ageRange]?.isWHO !== false;
    const config =
      activeMainMenu === "lingkar_kepala"
        ? lkAgeRangeConfig[ageRange]
        : ageRangeConfig[ageRange];

    if (!config) {
      return (
        <div className="text-center py-16">
          <div className="bg-amber-100 p-6 rounded-full inline-flex mb-4">
            <FontAwesomeIcon
              icon={fas.faExclamationTriangle}
              className="text-5xl text-amber-400"
            />
          </div>
          <p className="text-amber-600 font-medium">
            Konfigurasi grafik tidak tersedia
          </p>
        </div>
      );
    }

    const referenceData = generateFullReferenceData(jenisKelamin, indicator);
    const childPoints = displayGrowthData
      .filter((point) => {
        const value = point[indicator];
        if (value === null || value === undefined) return false;
        if (indicator === "berat") return value > 0 && value < MAX_VALID_WEIGHT;
        if (indicator === "tinggi")
          return value > 0 && value < MAX_VALID_HEIGHT;
        if (indicator === "imt") return value > 0 && value < MAX_VALID_IMT;
        return true;
      })
      .map((point) => ({
        usiaBulan: point.usiaBulan,
        nilai: point[indicator],
        tanggal: point.tanggal,
      }));

    const latestChildPoint = childPoints.slice(-1)[0];
    const mergedData = referenceData.map((refPoint) => {
      const exactMatch = childPoints.find(
        (cp) => cp.usiaBulan === refPoint.usiaBulan,
      );
      return exactMatch
        ? { ...refPoint, nilai: exactMatch.nilai }
        : { ...refPoint, nilai: null };
    });

    let yDomain;
    if (indicator === "berat") {
      yDomain = [...config.yDomain.bb_u];
      yDomain[1] = Math.min(yDomain[1], MAX_VALID_WEIGHT);
    } else if (indicator === "tinggi") {
      yDomain = [...config.yDomain.tb_u];
      yDomain[1] = Math.min(yDomain[1], MAX_VALID_HEIGHT);
    } else if (indicator === "imt") {
      yDomain = [...config.yDomain.imt_u];
      yDomain[1] = Math.min(yDomain[1], MAX_VALID_IMT);
    } else {
      yDomain = [0, 100];
    }

    if (childPoints.length > 0) {
      const validValues = childPoints
        .map((p) => p.nilai)
        .filter(
          (v) =>
            v <
            (indicator === "berat"
              ? MAX_VALID_WEIGHT
              : indicator === "tinggi"
                ? MAX_VALID_HEIGHT
                : MAX_VALID_IMT),
        );
      if (validValues.length > 0) {
        const minChildValue = Math.min(...validValues);
        const maxChildValue = Math.max(...validValues);
        if (
          minChildValue < yDomain[0] &&
          minChildValue <
            (indicator === "berat" ? MAX_VALID_WEIGHT : MAX_VALID_HEIGHT)
        )
          yDomain[0] = Math.max(0, minChildValue - 2);
        if (
          maxChildValue > yDomain[1] &&
          maxChildValue <
            (indicator === "berat" ? MAX_VALID_WEIGHT : MAX_VALID_HEIGHT)
        )
          yDomain[1] = Math.min(
            indicator === "berat" ? MAX_VALID_WEIGHT : MAX_VALID_HEIGHT,
            maxChildValue + 5,
          );
      }
    }
    yDomain[0] = Math.max(0, yDomain[0]);
    yDomain[1] = Math.min(
      indicator === "berat"
        ? MAX_VALID_WEIGHT
        : indicator === "tinggi"
          ? MAX_VALID_HEIGHT
          : MAX_VALID_IMT,
      yDomain[1],
    );
    if (
      yDomain[0] >= yDomain[1] ||
      yDomain[1] > (indicator === "berat" ? MAX_VALID_WEIGHT : MAX_VALID_HEIGHT)
    ) {
      if (indicator === "berat") yDomain = [0, 30];
      else if (indicator === "tinggi") yDomain = [50, 140];
      else yDomain = [10, 25];
    }

    return (
      <div>
        {/* ── Stat Card ── */}
        <div className="mb-8 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className={`h-1 w-full ${isWHO ? "bg-emerald-500" : "bg-blue-500"}`} />
          <div className="bg-white px-6 py-5">
            <div className="flex flex-wrap justify-between items-center gap-6">

              {/* Left: latest value */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  {indicator === "berat"
                    ? t("ortu.pemantauanGizi.beratBadan")
                    : indicator === "tinggi"
                      ? t("ortu.pemantauanGizi.tinggiBadan")
                      : t("ortu.pemantauanGizi.imt")} — {t("ortu.pemantauanGizi.dataTerbaru")}
                </p>
                <p className="text-4xl font-black text-gray-900 leading-none tracking-tight">
                  {latestChildPoint && latestChildPoint.nilai < MAX_VALID_WEIGHT
                    ? latestChildPoint.nilai.toFixed(1)
                    : "−"}{" "}
                  <span className="text-xl font-medium text-gray-400">{unit}</span>
                </p>
                {latestChildPoint && latestChildPoint.nilai < MAX_VALID_WEIGHT && (
                  <p className="text-sm text-gray-400 mt-2 font-medium">
                    {formatUsiaDetail(latestChildPoint.usiaBulan)}
                  </p>
                )}
              </div>

              {/* Right: reference badge + help */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    {t("ortu.pemantauanGizi.standarReferensi")}
                  </p>
                  <span
                    className={`inline-block px-4 py-2 rounded-xl text-sm font-bold border ${
                      isWHO
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {isWHO ? "WHO" : "CDC"} —{" "}
                    {indicator === "berat" ? t("ortu.pemantauanGizi.bbU") : indicator === "tinggi" ? t("ortu.pemantauanGizi.tbU") : t("ortu.pemantauanGizi.imtU")}
                  </span>
                </div>
                <button
                  onClick={() => setShowPenjelasanGrafik(true)}
                  className="bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-400 hover:text-blue-600 w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm font-bold text-base"
                  title="Klik untuk melihat penjelasan grafik"
                >
                  ?
                </button>
              </div>

            </div>
          </div>
        </div>

        <div style={{ height: "520px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={mergedData}
              margin={{ top: 16, right: 32, left: 16, bottom: 36 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#f0f0f0"
                strokeDasharray="4 4"
              />
              <XAxis
                type="number"
                dataKey="usiaBulan"
                scale="linear"
                domain={[config.min, config.max]}
                allowDataOverflow={false}
                tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 500 }}
                tickFormatter={(v) =>
                  ageRange === "60-216" ? `${Math.round(v / 12)}` : `${v}`
                }
                label={{
                  value: ageRange === "60-216" ? "Usia (tahun)" : "Usia (bulan)",
                  position: "insideBottom",
                  offset: -20,
                  fontSize: 11,
                  fill: "#9ca3af",
                  fontWeight: 600,
                }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
              />
              <YAxis
                domain={yDomain}
                label={{
                  value: yAxisLabel,
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                  fill: "#9ca3af",
                  fontWeight: 600,
                  dx: -4,
                }}
                tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => {
                  if (value > 1000) return "?";
                  if (value > 100) return Math.round(value).toString();
                  return value.toFixed(1);
                }}
              />
              <Tooltip
                content={(props) => (
                  <CustomTooltip
                    {...props}
                    unit={unit}
                    indicator={indicator}
                    jenisKelamin={jenisKelamin}
                  />
                )}
                cursor={{
                  stroke: "#d1d5db",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", paddingBottom: "8px", color: "#6b7280", fontWeight: 600 }}
              />

              {isWHO && (
                <>
                  <Area
                    type="monotone"
                    dataKey="sdNeg3"
                    stackId="who_stack"
                    stroke="none"
                    fill="transparent"
                    legendType="none"
                    isAnimationActive={false}
                    dot={false}
                    activeDot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="zonaMerahBawahDiff"
                    stackId="who_stack"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    fill="#fef3c7"
                    fillOpacity={0.85}
                    name="Zona Perhatian (-3SD s.d -2SD)"
                    legendType="square"
                    isAnimationActive={false}
                    dot={false}
                    activeDot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="zonaHijauDiff"
                    stackId="who_stack"
                    stroke="#22c55e"
                    strokeWidth={1}
                    fill="#bbf7d0"
                    fillOpacity={0.85}
                    name="Zona Normal (-2SD s.d +2SD)"
                    legendType="square"
                    isAnimationActive={false}
                    dot={false}
                    activeDot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="zonaMerahAtasDiff"
                    stackId="who_stack"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    fill="#fef3c7"
                    fillOpacity={0.85}
                    name="Zona Perhatian (+2SD s.d +3SD)"
                    legendType="none"
                    isAnimationActive={false}
                    dot={false}
                    activeDot={false}
                  />
                </>
              )}

              {!isWHO && (
                <>
                  <Area
                    type="monotone"
                    dataKey="baseP3"
                    stackId="cdc_stack"
                    stroke="none"
                    fill="transparent"
                    legendType="none"
                    isAnimationActive={false}
                    dot={false}
                    activeDot={false}
                  />
                  {indicator !== "tinggi" && (
                    <Area
                      type="monotone"
                      dataKey="zonaKuningBawahDiff"
                      stackId="cdc_stack"
                      stroke="#f59e0b"
                      strokeWidth={1}
                      fill="#fef3c7"
                      fillOpacity={0.85}
                      name="Zona Perhatian (p3–p5)"
                      legendType="square"
                      isAnimationActive={false}
                      dot={false}
                      activeDot={false}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="zonaHijauDiff"
                    stackId="cdc_stack"
                    stroke="#22c55e"
                    strokeWidth={1}
                    fill="#bbf7d0"
                    fillOpacity={0.85}
                    name={
                      indicator === "berat"
                        ? "Zona Normal (P5–P90)"
                        : indicator === "imt"
                          ? "Zona Normal (P5–P85)"
                          : "Zona Normal (P3–P95)"
                    }
                    legendType="square"
                    isAnimationActive={false}
                    dot={false}
                    activeDot={false}
                  />
                  {indicator !== "tinggi" && (
                    <Area
                      type="monotone"
                      dataKey="zonaKuningAtasDiff"
                      stackId="cdc_stack"
                      stroke="#f59e0b"
                      strokeWidth={1}
                      fill="#fef3c7"
                      fillOpacity={0.85}
                      name={
                        indicator === "berat"
                          ? "Zona Perhatian (P90–P95)"
                          : "Zona Perhatian (P85–P95)"
                      }
                      legendType="square"
                      isAnimationActive={false}
                      dot={false}
                      activeDot={false}
                    />
                  )}
                </>
              )}

              {isWHO && (
                <>
                  <Line
                    type="monotone"
                    dataKey="sdNeg3"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    strokeDasharray="4 3"
                    name="-3 SD"
                    dot={false}
                    activeDot={false}
                    legendType="none"
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="sdNeg2"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    strokeDasharray="4 3"
                    name="-2 SD"
                    dot={false}
                    activeDot={false}
                    legendType="none"
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="sd2"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    strokeDasharray="4 3"
                    name="+2 SD"
                    dot={false}
                    activeDot={false}
                    legendType="none"
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="sd3"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    strokeDasharray="4 3"
                    name="+3 SD"
                    dot={false}
                    activeDot={false}
                    legendType="none"
                    isAnimationActive={false}
                  />
                </>
              )}

              {!isWHO && (
                <>
                  <Line
                    type="monotone"
                    dataKey="baseP3"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    strokeDasharray="4 3"
                    name="P3"
                    dot={false}
                    activeDot={false}
                    legendType="none"
                    isAnimationActive={false}
                  />
                  {indicator !== "tinggi" && (
                    <Line
                      type="monotone"
                      dataKey="baseP5"
                      stroke="#f59e0b"
                      strokeWidth={1}
                      strokeDasharray="4 3"
                      name="P5"
                      dot={false}
                      activeDot={false}
                      legendType="none"
                      isAnimationActive={false}
                    />
                  )}
                  {indicator === "berat" && (
                    <Line
                      type="monotone"
                      dataKey="baseP90"
                      stroke="#f59e0b"
                      strokeWidth={1}
                      strokeDasharray="4 3"
                      name="P90"
                      dot={false}
                      activeDot={false}
                      legendType="none"
                      isAnimationActive={false}
                    />
                  )}
                  {indicator === "imt" && (
                    <Line
                      type="monotone"
                      dataKey="baseP85"
                      stroke="#f59e0b"
                      strokeWidth={1}
                      strokeDasharray="4 3"
                      name="P85"
                      dot={false}
                      activeDot={false}
                      legendType="none"
                      isAnimationActive={false}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="baseP95"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    strokeDasharray="4 3"
                    name="P95"
                    dot={false}
                    activeDot={false}
                    legendType="none"
                    isAnimationActive={false}
                  />
                </>
              )}

              <Line
                type="monotone"
                dataKey={isWHO ? "sd0" : "baseP50"}
                stroke={isWHO ? "#15803d" : "#2563eb"}
                strokeWidth={2}
                strokeDasharray={isWHO ? "0" : "6 4"}
                name={isWHO ? "Median (0 SD)" : "P50 (Median CDC)"}
                dot={false}
                activeDot={false}
                legendType="line"
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="nilai"
                stroke="#1d4ed8"
                strokeWidth={2.5}
                name="Pertumbuhan Si Kecil"
                dot={(props) => {
                  const { cx, cy, value } = props;
                  if (value == null) return null;
                  return (
                    <circle
                      key={`dot-${cx}-${cy}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#1d4ed8"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{
                  r: 7,
                  fill: "#1d4ed8",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
                connectNulls
                legendType="circle"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* ── Legend Bawah ── */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-3">
            {t("ortu.pemantauanGizi.keteranganGrafik")}
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2.5">
            {/* Zona Normal */}
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded flex-shrink-0"
                style={{ backgroundColor: "#bbf7d0", border: "1.5px solid #22c55e" }}
              />
              <span className="text-xs text-gray-600 font-semibold">
                {isWHO
                  ? t("ortu.pemantauanGizi.zonaNormal") + "(−2SD s.d +2SD)"
                  : indicator === "tinggi" ? t("ortu.pemantauanGizi.zonaNormal") + "(P3–P95)"
                  : indicator === "imt"    ? t("ortu.pemantauanGizi.zonaNormal") + "(P5–P85)"
                  :                          t("ortu.pemantauanGizi.zonaNormal") + "(P5–P90)"}
              </span>
            </div>
            {/* Zona Perhatian */}
            {(isWHO || indicator !== "tinggi") && (
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded flex-shrink-0"
                  style={{ backgroundColor: "#fef3c7", border: "1.5px solid #f59e0b" }}
                />
                <span className="text-xs text-gray-600 font-semibold">
                  {isWHO
                    ? "Perhatian (−3SD / +3SD)"
                    : indicator === "berat" ? "Perhatian (P3–P5 / P90–P95)"
                    :                         "Perhatian (P3–P5 / P85–P95)"}
                </span>
              </div>
            )}
            {/* Garis Median */}
            <div className="flex items-center gap-2">
              <div
                className="w-7 flex-shrink-0"
                style={{
                  height: "2.5px",
                  borderRadius: "2px",
                  background: isWHO
                    ? "#15803d"
                    : "repeating-linear-gradient(to right, #2563eb 0, #2563eb 5px, transparent 5px, transparent 9px)",
                }}
              />
              <span className="text-xs text-gray-600 font-semibold">
                {isWHO ? "Median (0 SD)" : "Median (P50)"}
              </span>
            </div>
            {/* Batas Zona */}
            <div className="flex items-center gap-2">
              <div
                className="w-7 flex-shrink-0"
                style={{
                  height: "2px",
                  background: "repeating-linear-gradient(to right, #f59e0b 0, #f59e0b 4px, transparent 4px, transparent 7px)",
                }}
              />
              <span className="text-xs text-gray-600 font-semibold">Batas Zona</span>
            </div>
            {/* Data Anak */}
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: "#1d4ed8", border: "2.5px solid #fff", boxShadow: "0 0 0 1.5px #1d4ed8" }}
              />
              <span className="text-xs text-gray-600 font-semibold">
                Pertumbuhan Si Kecil
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBBUChart = () =>
    renderGrowthChart("berat", "Berat Badan (kg)", "kg");
  const renderIMTUChart = () =>
    renderGrowthChart("imt", "IMT (kg/m²)", "kg/m²");
  const renderTBUChart = () =>
    renderGrowthChart("tinggi", "Tinggi Badan (cm)", "cm");

  const getWFHReferenceValue = (heightCm, jenisKelamin, key) => {
    const genderData =
      jenisKelamin === "L" ? whoWFHData.laki : whoWFHData.perempuan;
    if (!genderData) return null;
    const heights = Object.keys(genderData)
      .map(Number)
      .sort((a, b) => a - b);
    const lower = heights.filter((h) => h <= heightCm).at(-1);
    const upper = heights.find((h) => h > heightCm);
    if (lower === undefined) return genderData[heights[0]]?.[key];
    if (upper === undefined) return genderData[heights.at(-1)]?.[key];
    const v1 = genderData[lower]?.[key];
    const v2 = genderData[upper]?.[key];
    if (v1 == null || v2 == null) return v1 ?? v2;
    return v1 + ((v2 - v1) * (heightCm - lower)) / (upper - lower);
  };

  const renderBBTBChart = () => {
    const displayGrowthData =
      userRole === "orang_tua" ? growthData : superAdminGrowthData;
    const anak =
      userRole === "orang_tua" ? selectedAnakData : superAdminSelectedAnak;
    if (!anak) {
      return (
        <div className="text-center py-16">
          <div className="bg-gray-100 p-6 rounded-full inline-flex mb-4">
            <FontAwesomeIcon
              icon={fas.faChartLine}
              className="text-5xl text-gray-400"
            />
          </div>
          <p className="text-gray-500 font-medium">
            Pilih anak terlebih dahulu
          </p>
        </div>
      );
    }

    const jenisKelamin = anak.jenis_kelamin;
    const childPoints = displayGrowthData
      .filter(
        (p) =>
          p.tinggi > 0 &&
          p.tinggi < MAX_VALID_HEIGHT &&
          p.berat > 0 &&
          p.berat < MAX_VALID_WEIGHT,
      )
      .map((p) => ({
        tinggi: p.tinggi,
        berat: p.berat,
        tanggal: p.tanggal,
        usiaBulan: p.usiaBulan,
      }));
    const latestData = childPoints[childPoints.length - 1];
    const allHeights = childPoints.map((p) => p.tinggi);
    const minHeight =
      allHeights.length > 0
        ? Math.max(45, Math.floor(Math.min(...allHeights)) - 2)
        : 45;
    const maxHeight =
      allHeights.length > 0
        ? Math.min(120, Math.ceil(Math.max(...allHeights)) + 2)
        : 120;
    const refHeights = [];
    for (let h = minHeight; h <= maxHeight; h++) refHeights.push(h);

    const referenceData = refHeights.map((h) => {
      const sdNeg3 = getWFHReferenceValue(h, jenisKelamin, "-3sd");
      const sdNeg2 = getWFHReferenceValue(h, jenisKelamin, "-2sd");
      const sd0 = getWFHReferenceValue(h, jenisKelamin, "0sd");
      const sd2 = getWFHReferenceValue(h, jenisKelamin, "2sd");
      const sd3 = getWFHReferenceValue(h, jenisKelamin, "3sd");
      const dp = { tinggi: h, sdNeg3, sdNeg2, sd0, sd2, sd3 };
      if (sdNeg3 != null && sdNeg2 != null)
        dp.zonaKuningBawahDiff = sdNeg2 - sdNeg3;
      if (sdNeg2 != null && sd2 != null) dp.zonaHijauDiff = sd2 - sdNeg2;
      if (sd2 != null && sd3 != null) dp.zonaKuningAtasDiff = sd3 - sd2;
      const match = childPoints.find((cp) => Math.abs(cp.tinggi - h) < 0.5);
      dp.berat = match ? match.berat : null;
      dp.tanggal = match ? match.tanggal : null;
      dp.usiaBulan = match ? match.usiaBulan : null;
      return dp;
    });

    const mergedData = [...referenceData];
    childPoints.forEach((cp) => {
      const alreadyIn = mergedData.some((d) => d.tinggi === cp.tinggi);
      if (!alreadyIn) {
        const sdNeg3 = getWFHReferenceValue(cp.tinggi, jenisKelamin, "-3sd");
        const sdNeg2 = getWFHReferenceValue(cp.tinggi, jenisKelamin, "-2sd");
        const sd0 = getWFHReferenceValue(cp.tinggi, jenisKelamin, "0sd");
        const sd2 = getWFHReferenceValue(cp.tinggi, jenisKelamin, "2sd");
        const sd3 = getWFHReferenceValue(cp.tinggi, jenisKelamin, "3sd");
        mergedData.push({
          tinggi: cp.tinggi,
          berat: cp.berat,
          tanggal: cp.tanggal,
          usiaBulan: cp.usiaBulan,
          sdNeg3, sdNeg2, sd0, sd2, sd3,
          zonaKuningBawahDiff:
            sdNeg3 != null && sdNeg2 != null ? sdNeg2 - sdNeg3 : null,
          zonaHijauDiff: sdNeg2 != null && sd2 != null ? sd2 - sdNeg2 : null,
          zonaKuningAtasDiff: sd2 != null && sd3 != null ? sd3 - sd2 : null,
        });
      }
    });
    mergedData.sort((a, b) => a.tinggi - b.tinggi);

    const allSd3 = mergedData.map((d) => d.sd3).filter(Boolean);
    const allSdNeg3 = mergedData.map((d) => d.sdNeg3).filter(Boolean);
    const allBerats = childPoints.map((p) => p.berat);
    const yMin = Math.max(
      0,
      Math.floor(Math.min(...allSdNeg3, ...allBerats)) - 1,
    );
    const yMax = Math.ceil(Math.max(...allSd3, ...allBerats)) + 2;

    return (
      <div>
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex flex-wrap justify-between items-center gap-6">
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                Data Terbaru
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {latestData?.tinggi?.toFixed(1) || "-"} cm /{" "}
                {latestData?.berat?.toFixed(1) || "-"} kg
              </p>
              {latestData && (
                <p className="text-sm text-gray-400 mt-1 font-medium">
                  Usia: {Math.floor(latestData.usiaBulan / 12)} Tahun{" "}
                  {latestData.usiaBulan % 12} Bulan
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                  Standar Referensi
                </p>
                <span className="inline-block mt-2 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  WHO - BB/TB
                </span>
              </div>
              <button
                onClick={() => setShowPenjelasanGrafik(true)}
                className="bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm font-bold text-lg"
                title="Klik untuk melihat penjelasan grafik"
              >
                ?
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5 p-4 bg-blue-50 rounded-2xl text-sm text-gray-600 flex items-center gap-3 border border-blue-100">
          <FontAwesomeIcon
            icon={fas.faInfoCircle}
            className="text-blue-500 text-lg"
          />
          Grafik Berat Badan vs Tinggi Badan - Membandingkan berat dengan tinggi
          aktual anak
        </div>

        <div style={{ height: "520px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={mergedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#e5e7eb"
                strokeDasharray="3 3"
              />
              <XAxis
                type="number"
                dataKey="tinggi"
                scale="linear"
                domain={[minHeight, maxHeight]}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                label={{
                  value: "Tinggi Badan (cm)",
                  position: "insideBottom",
                  offset: -15,
                  fontSize: 11,
                  fill: "#6b7280",
                }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                label={{
                  value: "Berat Badan (kg)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                  fill: "#6b7280",
                }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <Tooltip
                content={<BBTBTooltip />}
                cursor={{
                  stroke: "#9ca3af",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
              />
              <Legend
                verticalAlign="top"
                height={40}
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
              />

              <Area
                type="monotone"
                dataKey="sdNeg3"
                stackId="wfh_stack"
                stroke="none"
                fill="transparent"
                legendType="none"
                isAnimationActive={false}
                dot={false}
                activeDot={false}
              />
              <Area
                type="monotone"
                dataKey="zonaKuningBawahDiff"
                stackId="wfh_stack"
                stroke="#f59e0b"
                strokeWidth={1}
                fill="#fef3c7"
                fillOpacity={0.85}
                name="Zona Perhatian (-3SD s.d -2SD)"
                legendType="square"
                isAnimationActive={false}
                dot={false}
                activeDot={false}
              />
              <Area
                type="monotone"
                dataKey="zonaHijauDiff"
                stackId="wfh_stack"
                stroke="#22c55e"
                strokeWidth={1}
                fill="#bbf7d0"
                fillOpacity={0.85}
                name="Zona Normal (-2SD s.d +2SD)"
                legendType="square"
                isAnimationActive={false}
                dot={false}
                activeDot={false}
              />
              <Area
                type="monotone"
                dataKey="zonaKuningAtasDiff"
                stackId="wfh_stack"
                stroke="#f59e0b"
                strokeWidth={1}
                fill="#fef3c7"
                fillOpacity={0.85}
                name="Zona Perhatian (+2SD s.d +3SD)"
                legendType="none"
                isAnimationActive={false}
                dot={false}
                activeDot={false}
              />

              <Line
                type="monotone"
                dataKey="sdNeg3"
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="4 3"
                name="-3 SD"
                dot={false}
                activeDot={false}
                legendType="none"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="sdNeg2"
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="4 3"
                name="-2 SD"
                dot={false}
                activeDot={false}
                legendType="none"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="sd2"
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="4 3"
                name="+2 SD"
                dot={false}
                activeDot={false}
                legendType="none"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="sd3"
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="4 3"
                name="+3 SD"
                dot={false}
                activeDot={false}
                legendType="none"
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="sd0"
                stroke="#15803d"
                strokeWidth={2}
                name="Median (0 SD)"
                dot={false}
                activeDot={false}
                legendType="line"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="berat"
                stroke="#1d4ed8"
                strokeWidth={2.5}
                name="Data Anak"
                dot={(props) => {
                  const { cx, cy, value } = props;
                  if (value == null) return null;
                  return (
                    <circle
                      key={`bbtb-${cx}-${cy}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#1d4ed8"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{
                  r: 7,
                  fill: "#1d4ed8",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
                connectNulls
                legendType="circle"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md border border-emerald-400"
              style={{ backgroundColor: "#bbf7d0" }}
            ></div>
            <span className="text-xs text-gray-600 font-bold">
              Normal (-2SD s.d +2SD)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md border border-amber-400"
              style={{ backgroundColor: "#fef3c7" }}
            ></div>
            <span className="text-xs text-gray-600 font-bold">
              Perhatian (-3SD s.d -2SD / +2SD s.d +3SD)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-0.5 rounded"
              style={{ backgroundColor: "#15803d" }}
            ></div>
            <span className="text-xs text-gray-600 font-bold">
              Median (0 SD)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-0.5"
              style={{ borderTop: "2px dashed #f59e0b" }}
            ></div>
            <span className="text-xs text-gray-600 font-bold">Batas Zona</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: "#1d4ed8" }}
            ></div>
            <span className="text-xs text-gray-600 font-bold">Data Anak</span>
          </div>
        </div>
      </div>
    );
  };

  const renderLKUChart = () => {
    const displayGrowthData =
      userRole === "orang_tua" ? growthData : superAdminGrowthData;
    const anak =
      userRole === "orang_tua" ? selectedAnakData : superAdminSelectedAnak;
    if (!anak) {
      return (
        <div className="text-center py-16">
          <div className="bg-gray-100 p-6 rounded-full inline-flex mb-4">
            <FontAwesomeIcon
              icon={fas.faChartLine}
              className="text-5xl text-gray-400"
            />
          </div>
          <p className="text-gray-500 font-medium">
            Pilih anak terlebih dahulu
          </p>
        </div>
      );
    }

    const config = lkAgeRangeConfig[ageRange];
    if (!config) {
      return (
        <div className="text-center py-16">
          <div className="bg-amber-100 p-6 rounded-full inline-flex mb-4">
            <FontAwesomeIcon
              icon={fas.faExclamationTriangle}
              className="text-5xl text-amber-400"
            />
          </div>
          <p className="text-amber-600 font-medium">Memuat ulang grafik...</p>
        </div>
      );
    }

    const jenisKelamin = anak.jenis_kelamin;
    const referenceAges = [];
    for (let age = config.min; age <= config.max + 0.01; age += config.step) {
      referenceAges.push(Math.round(age * 10) / 10);
    }
    if (referenceAges[referenceAges.length - 1] !== config.max)
      referenceAges.push(config.max);

    const referenceData = [];
    for (const usia of referenceAges) {
      const dataPoint = { usiaBulan: usia };
      const sdNeg3 = getReferenceValue(usia, jenisKelamin, "lk_u", "-3sd");
      const sdNeg2 = getReferenceValue(usia, jenisKelamin, "lk_u", "-2sd");
      const sd0 = getReferenceValue(usia, jenisKelamin, "lk_u", "0sd");
      const sd2 = getReferenceValue(usia, jenisKelamin, "lk_u", "2sd");
      const sd3 = getReferenceValue(usia, jenisKelamin, "lk_u", "3sd");
      if (sdNeg3 != null) dataPoint.sdNeg3 = sdNeg3;
      if (sdNeg2 != null) dataPoint.sdNeg2 = sdNeg2;
      if (sd0 != null) dataPoint.sd0 = sd0;
      if (sd2 != null) dataPoint.sd2 = sd2;
      if (sd3 != null) dataPoint.sd3 = sd3;
      if (sdNeg3 != null && sdNeg2 != null) {
        dataPoint.zonaKuningBawahDiff = sdNeg2 - sdNeg3;
      }
      if (sdNeg2 != null && sd2 != null) {
        dataPoint.zonaHijauDiff = sd2 - sdNeg2;
      }
      if (sd2 != null && sd3 != null) {
        dataPoint.zonaKuningAtasDiff = sd3 - sd2;
      }
      referenceData.push(dataPoint);
    }

    const childPoints = displayGrowthData
      .filter(
        (point) =>
          point.lingkar_kepala !== null &&
          point.lingkar_kepala > 0 &&
          point.lingkar_kepala < MAX_VALID_LK,
      )
      .map((point) => ({
        usiaBulan: point.usiaBulan,
        nilai: point.lingkar_kepala,
        tanggal: point.tanggal,
      }));

    const mergedData = referenceData.map((refPoint) => {
      const exactMatch = childPoints.find(
        (cp) => cp.usiaBulan === refPoint.usiaBulan,
      );
      return exactMatch
        ? { ...refPoint, nilai: exactMatch.nilai }
        : { ...refPoint, nilai: null };
    });

    const latestChildPoint = childPoints.slice(-1)[0];
    let yDomain = [...config.yDomain];
    if (childPoints.length > 0) {
      const minValue = Math.min(...childPoints.map((p) => p.nilai));
      const maxValue = Math.max(...childPoints.map((p) => p.nilai));
      if (minValue < yDomain[0]) yDomain[0] = Math.max(0, minValue - 2);
      if (maxValue > yDomain[1]) yDomain[1] = maxValue + 2;
    }
    yDomain[1] = Math.min(yDomain[1], MAX_VALID_LK);

    return (
      <div>
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex flex-wrap justify-between items-center gap-6">
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                Lingkar Kepala Terakhir
              </p>
              <p className="text-4xl font-bold text-gray-800 mt-2">
                {latestChildPoint?.nilai?.toFixed(1) || "-"}{" "}
                <span className="text-xl font-normal text-gray-500">cm</span>
              </p>
              {latestChildPoint && (
                <p className="text-sm text-gray-400 mt-1 font-medium">
                  Usia: {Math.floor(latestChildPoint.usiaBulan / 12)} Tahun{" "}
                  {latestChildPoint.usiaBulan % 12} Bulan
                </p>
              )}
            </div>
            <button
              onClick={() => setShowPenjelasanGrafik(true)}
              className="bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm font-bold text-lg"
              title="Klik untuk melihat penjelasan grafik"
            >
              ?
            </button>
          </div>
        </div>

        <div style={{ height: "450px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={mergedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#e5e7eb"
                strokeDasharray="3 3"
              />
              <XAxis
                type="number"
                dataKey="usiaBulan"
                scale="linear"
                domain={[config.min, config.max]}
                allowDataOverflow={false}
                tick={{ fontSize: 11 }}
                label={{
                  value: "Usia (bulan)",
                  position: "insideBottom",
                  offset: -15,
                  fontSize: 11,
                }}
              />
              <YAxis
                domain={yDomain}
                label={{
                  value: "Lingkar Kepala (cm)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                content={<LKUTooltip />}
                cursor={{
                  stroke: "#9ca3af",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
              />
              <Legend verticalAlign="top" height={36} />

              <Area
                type="monotone"
                dataKey="sdNeg3"
                stackId="lk_stack"
                stroke="none"
                fill="transparent"
                legendType="none"
                isAnimationActive={false}
                dot={false}
                activeDot={false}
              />
              <Area
                type="monotone"
                dataKey="zonaKuningBawahDiff"
                stackId="lk_stack"
                stroke="#f59e0b"
                strokeWidth={1}
                fill="#fef3c7"
                fillOpacity={0.85}
                name="Zona Perhatian (-3SD s.d -2SD)"
                legendType="square"
                isAnimationActive={false}
                dot={false}
                activeDot={false}
              />
              <Area
                type="monotone"
                dataKey="zonaHijauDiff"
                stackId="lk_stack"
                stroke="#22c55e"
                strokeWidth={1}
                fill="#bbf7d0"
                fillOpacity={0.85}
                name="Zona Normal (-2SD s.d +2SD)"
                legendType="square"
                isAnimationActive={false}
                dot={false}
                activeDot={false}
              />
              <Area
                type="monotone"
                dataKey="zonaKuningAtasDiff"
                stackId="lk_stack"
                stroke="#f59e0b"
                strokeWidth={1}
                fill="#fef3c7"
                fillOpacity={0.85}
                name="Zona Perhatian (+2SD s.d +3SD)"
                legendType="none"
                isAnimationActive={false}
                dot={false}
                activeDot={false}
              />

              <Line
                type="monotone"
                dataKey="sdNeg3"
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="4 3"
                dot={false}
                activeDot={false}
                legendType="none"
                isAnimationActive={false}
                name="-3 SD"
              />
              <Line
                type="monotone"
                dataKey="sdNeg2"
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="4 3"
                dot={false}
                activeDot={false}
                legendType="none"
                isAnimationActive={false}
                name="-2 SD"
              />
              <Line
                type="monotone"
                dataKey="sd2"
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="4 3"
                dot={false}
                activeDot={false}
                legendType="none"
                isAnimationActive={false}
                name="+2 SD"
              />
              <Line
                type="monotone"
                dataKey="sd3"
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="4 3"
                dot={false}
                activeDot={false}
                legendType="none"
                isAnimationActive={false}
                name="+3 SD"
              />

              <Line
                type="monotone"
                dataKey="sd0"
                stroke="#15803d"
                strokeWidth={2}
                name="Median (0 SD)"
                dot={false}
                activeDot={false}
                legendType="line"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="nilai"
                stroke="#1d4ed8"
                strokeWidth={2.5}
                name="Pertumbuhan Si Kecil"
                dot={(props) => {
                  const { cx, cy, value } = props;
                  if (value == null) return null;
                  return (
                    <circle
                      key={`dot-lk-${cx}-${cy}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#1d4ed8"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{
                  r: 7,
                  fill: "#1d4ed8",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
                connectNulls
                legendType="circle"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderActiveChart = () => {
    if (activeMainMenu === "berat") {
      switch (activeSubMenu) {
        case "bb_u":
          return renderBBUChart();
        case "bb_tb":
          return renderBBTBChart();
        case "imt_u":
          return renderIMTUChart();
        default:
          return renderBBUChart();
      }
    } else if (activeMainMenu === "tinggi") {
      return renderTBUChart();
    } else {
      return renderLKUChart();
    }
  };

  const calculateAgeDetail = (birthDate) => {
    if (!birthDate) return { years: 0, months: 0, days: 0 };
    const today = new Date();
    const birth = new Date(birthDate);
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years, months, days };
  };

  const formatAge = (age) => {
    if (!age) return "-";
    const parts = [];
    if (age.years > 0) parts.push(`${age.years} Thn`);
    if (age.months > 0) parts.push(`${age.months} Bln`);
    if (age.days > 0) parts.push(`${age.days} Hr`);
    return parts.length === 0 ? "< 1 Hari" : parts.join(" ");
  };

  const getAvailableAgeRanges = () => {
    if (activeMainMenu === "lingkar_kepala") return ["0-2", "0-12", "0-60"];
    else if (activeSubMenu === "bb_tb") return [];
    else return ["0-2", "0-12", "0-60", "60-216"];
  };

  const getCurrentConfig = () => {
    if (activeMainMenu === "lingkar_kepala") return lkAgeRangeConfig[ageRange];
    return ageRangeConfig[ageRange];
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
        <Sidebar handleLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
              <FontAwesomeIcon
                icon={fas.faChartLine}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600 text-xl"
              />
            </div>
            <p className="mt-6 text-gray-600 font-medium">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  const displayAnakData =
    userRole === "orang_tua" ? selectedAnakData : superAdminSelectedAnak;
  const displayAnakList =
    userRole === "orang_tua" ? anakList : superAdminAnakList;
  const displaySelectedAnakId =
    userRole === "orang_tua" ? selectedAnakId : superAdminSelectedAnak?.id;
  const ageDetail = displayAnakData
    ? calculateAgeDetail(displayAnakData.tanggal_lahir)
    : null;
  const formattedAge = ageDetail ? formatAge(ageDetail) : "-";
  const availableRanges = getAvailableAgeRanges();
  const showAgeDropdownMenu =
    availableRanges.length > 0 && activeSubMenu !== "bb_tb";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-emerald-100 px-8 py-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {t("ortu.pemantauanGizi.title")}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {t("ortu.pemantauanGizi.subtitle")}
              </p>
            </div>
          </div>
        </header>

        <main className="p-8 overflow-y-auto">
          {/* Super Admin Mode */}
          {userRole === "super_admin" && orangTuaList.length > 0 && (
            <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <FontAwesomeIcon
                    icon={fas.faUsers}
                    className="text-blue-600 text-lg"
                  />
                </div>
                <h3 className="font-bold text-blue-800 text-lg">
                  {t("ortu.pemantauanGizi.modeSuperAdmin")}
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
            </div>
          )}

          {/* Child Selection */}
          {displayAnakList.length > 0 ? (
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t("ortu.pemantauanGizi.pilihAnak")}
              </label>
              <div className="relative w-full md:w-96">
                <button
                  onClick={() => {
                    if (userRole === "orang_tua")
                      setShowAnakDropdown(!showAnakDropdown);
                    else
                      setSuperAdminShowAnakDropdown(
                        !superAdminShowAnakDropdown,
                      );
                  }}
                  className="w-full flex items-center justify-between px-5 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                      {displayAnakData?.nama_anak?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">
                        {displayAnakData?.nama_anak || t("ortu.pemantauanGizi.pilihAnak")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formattedAge} •{" "}
                        {displayAnakData?.jenis_kelamin === "L"
                          ? "Laki-laki"
                          : "Perempuan"}
                      </p>
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={fas.faChevronDown}
                    className="text-gray-400"
                  />
                </button>

                {(userRole === "orang_tua" && showAnakDropdown) ||
                (userRole === "super_admin" && superAdminShowAnakDropdown) ? (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => {
                        if (userRole === "orang_tua")
                          setShowAnakDropdown(false);
                        else setSuperAdminShowAnakDropdown(false);
                      }}
                    ></div>
                    <div className="absolute left-0 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                      <div className="p-2 max-h-96 overflow-y-auto">
                        {displayAnakList.map((anak) => {
                          const isSelected = displaySelectedAnakId === anak.id;
                          return (
                            <button
                              key={anak.id}
                              onClick={() => {
                                if (userRole === "orang_tua")
                                  handleAnakChange(anak.id);
                                else handleSuperAdminAnakChange(anak);
                              }}
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
                                <p className="text-xs text-gray-400">
                                  Lahir: {anak.tanggal_lahir}
                                </p>
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
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mb-8 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 text-center border border-amber-200">
              <p className="text-gray-600 font-medium">
                {t("ortu.pemantauanGizi.belumAdaDataAnak")}
              </p>
            </div>
          )}

          {/* Main Navigation Tabs */}
          {displayAnakData && (
            <div className="mb-8">
              <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
                <button
                  onClick={() => {
                    setActiveMainMenu("berat");
                    setActiveSubMenu("bb_u");
                  }}
                  className={`flex-1 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeMainMenu === "berat" ? "bg-white text-emerald-600 shadow-md" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <FontAwesomeIcon icon={fas.faWeightScale} /> {t("ortu.pemantauanGizi.berat")}
                </button>
                <button
                  onClick={() => setActiveMainMenu("tinggi")}
                  className={`flex-1 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeMainMenu === "tinggi" ? "bg-white text-emerald-600 shadow-md" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <FontAwesomeIcon icon={fas.faRuler} /> {t("ortu.pemantauanGizi.tinggi")}
                </button>
                <button
                  onClick={() => setActiveMainMenu("lingkar_kepala")}
                  className={`flex-1 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeMainMenu === "lingkar_kepala" ? "bg-white text-emerald-600 shadow-md" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <FontAwesomeIcon icon={fas.faBrain} /> {t("ortu.pemantauanGizi.lingkarKepala")}
                </button>
              </div>
            </div>
          )}

          {/* Sub Menu untuk Berat */}
          {displayAnakData && activeMainMenu === "berat" && (
            <div className="mb-6">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setActiveSubMenu("bb_u")}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition border ${activeSubMenu === "bb_u" ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                  {t("ortu.pemantauanGizi.bbU")}
                </button>
                <button
                  onClick={() => setActiveSubMenu("bb_tb")}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition border ${activeSubMenu === "bb_tb" ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                  {t("ortu.pemantauanGizi.bbTb")}
                </button>
                <button
                  onClick={() => setActiveSubMenu("imt_u")}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition border ${activeSubMenu === "imt_u" ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                  {t("ortu.pemantauanGizi.imtU")}
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2 font-medium">
                {activeSubMenu === "bb_u" && t("ortu.pemantauanGizi.beratBadanSesuaiUsia")}
                {activeSubMenu === "bb_tb" && t("ortu.pemantauanGizi.beratBadanVsTinggi")}
                {activeSubMenu === "imt_u" && t("ortu.pemantauanGizi.indeksMassaTubuh")}
              </p>
            </div>
          )}

          {/* Dropdown Rentang Umur */}
          {displayAnakData && showAgeDropdownMenu && (
            <div className="mb-6">
              <div className="relative">
                <button
                  onClick={() => setShowAgeDropdown(!showAgeDropdown)}
                  className="w-full flex items-center justify-between px-5 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-xl">
                      <FontAwesomeIcon
                        icon={fas.faCalendarAlt}
                        className="text-emerald-600"
                      />
                    </div>
                    <span className="font-bold text-gray-700">
                      {getCurrentConfig()?.label || "Pilih Rentang Usia"}
                    </span>
                  </div>
                  <FontAwesomeIcon
                    icon={fas.faChevronDown}
                    className={`text-gray-400 transition-transform ${showAgeDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showAgeDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowAgeDropdown(false)}
                    ></div>
                    <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                      {availableRanges.map((range) => {
                        const config =
                          activeMainMenu === "lingkar_kepala"
                            ? lkAgeRangeConfig[range]
                            : ageRangeConfig[range];
                        if (!config) return null;
                        return (
                          <button
                            key={range}
                            onClick={() => {
                              setAgeRange(range);
                              setShowAgeDropdown(false);
                            }}
                            className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition border-b border-gray-100 last:border-0 ${ageRange === range ? "bg-emerald-50" : ""}`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={fas[config.icon] || fas.faChild}
                                className="text-emerald-600"
                              />
                            </div>
                            <div className="flex-1 text-left">
                              <p
                                className={`font-bold ${ageRange === range ? "text-emerald-600" : "text-gray-700"}`}
                              >
                                {config.label}
                              </p>
                              <p className="text-xs text-gray-400">
                                {range === "60-216"
                                  ? "Kurva CDC (Persentil)"
                                  : "Kurva WHO (Z-Score)"}
                              </p>
                            </div>
                            {ageRange === range && (
                              <FontAwesomeIcon
                                icon={fas.faCheckCircle}
                                className="text-emerald-600"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Chart Container */}
          {displayAnakData && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
              {renderActiveChart()}
            </div>
          )}

          {!displayAnakData && displayAnakList.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 text-center border border-blue-200">
              <div className="bg-blue-100 p-6 rounded-full inline-flex mb-4">
                <FontAwesomeIcon
                  icon={fas.faChartLine}
                  className="text-5xl text-blue-400"
                />
              </div>
              <p className="text-gray-600 font-bold text-lg">
                {t("ortu.pemantauanGizi.pilihAnakTerlebihDahulu")}
              </p>
              <p className="text-gray-500 mt-1">
                {t("ortu.pemantauanGizi.grafikMenampilkanStandar")}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* MODAL PENJELASAN GRAFIK */}
      <PenjelasanGrafikModal
        isOpen={showPenjelasanGrafik}
        onClose={() => setShowPenjelasanGrafik(false)}
        activeMainMenu={activeMainMenu}
        activeSubMenu={activeSubMenu}
        ageRange={ageRange}
      />
    </div>
  );
}