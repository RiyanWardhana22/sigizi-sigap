// sigizi-frontend/src/pages/orangtua/OrangTuaDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnak } from "../../contexts/AnakContext";
import Sidebar from "../../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// ─────────────────────────────────────────────
// DATA EDUKASI BERDASARKAN STATUS GIZI
// ─────────────────────────────────────────────
const EDUKASI_DATA = {
  Normal: {
    label: "Normal",
    color: "green",
    icon: fas.faCheckCircle,
    headerBg: "from-green-500 to-emerald-600",
    badgeBg: "bg-green-100 text-green-800 border-green-300",
    accentColor: "text-green-600",
    borderColor: "border-green-500",
    ringColor: "ring-green-400",
    tagBg: "bg-green-50 text-green-700",
    pesan: "Status gizi anak Anda normal. Pertahankan pola makan sehat dan terus pantau tumbuh kembangnya!",
    artikel: [
      {
        id: "a1",
        judul: "Pentingnya Protein Hewani untuk Pertumbuhan Anak",
        deskripsi: "Protein hewani seperti telur, ikan, dan daging mengandung asam amino esensial yang krusial untuk perkembangan otak dan otot balita.",
        gambar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiWRAPiyjG2dHX2svTrREBb8Jm41_DQZYgpw&s",
        tag: "Nutrisi",
        waktu: "5 menit baca",
        url: "https://www.kemkes.go.id/id/protein-hewani-efektif-cegah-anak-alami-stunting",
      },
      {
        id: "a2",
        judul: "Jadwal Makan Ideal untuk Balita",
        deskripsi: "Atur jadwal makan 3x utama dan 2x selingan sehari agar kebutuhan energi dan nutrisi balita terpenuhi secara optimal.",
        gambar: "https://d1bpj0tv6vfxyp.cloudfront.net/articles/116293_2-3-2021_13-44-49.png",
        tag: "Pola Makan",
        waktu: "4 menit baca",
        url: "https://www.halodoc.com/artikel/pentingnya-jadwal-makan-agar-balita-makan-teratur",
      },
      {
        id: "a3",
        judul: "Tips Mengatasi Anak Pilih-Pilih Makanan (Picky Eater)",
        deskripsi: "Strategi praktis agar anak mau makan beragam makanan bergizi, dari cara penyajian hingga pelibatan anak dalam memasak.",
        gambar: "https://foto.kontan.co.id/Bn7PY6Cvt67Y2II_GTfMy37cpS0=/smart/filters:format(webp)/2024/09/24/864598847.jpg",
        tag: "Parenting",
        waktu: "6 menit baca",
        url: "https://www.halodoc.com/artikel/7-tips-agar-anak-tidak-pilih-pilih-makanan",
      },
      {
        id: "a4",
        judul: "Pentingnya Imunisasi dan Vitamin A untuk Anak",
        deskripsi: "Imunisasi dasar lengkap dan suplementasi vitamin A melindungi anak dari penyakit serta mendukung pertumbuhan yang optimal.",
        gambar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm6uJmUCYudvjgtFXWeHxTrTEd3aZY4HVE2w&s",
        tag: "Kesehatan",
        waktu: "5 menit baca",
        url: "https://ayosehat.kemkes.go.id/vitamin-a-untuk-anak",
      },
    ],
    video: [
      {
        id: "v1",
        judul: "Cara Membuat Bekal Sehat dan Menarik untuk Anak",
        channel: "tri pujis",
        thumbnail: "https://i.ytimg.com/vi/S5FDTRx32wk/hqdefault.jpg",
        url: "https://youtu.be/S5FDTRx32wk?si=TbeSzpQL1uOYNq_x",
        durasi: "9:04",
        tag: "Bekal Sehat",
      },
      {
        id: "v2",
        judul: "Resep MPASI Bergizi Tinggi untuk Bayi 6 Bulan",
        channel: "Marina Anggraeni",
        thumbnail: "https://i.ytimg.com/vi/J04JGL5sTfU/hq720.jpg",
        url: "https://youtu.be/J04JGL5sTfU?si=KEE6EZw2Kcv2hItC",
        durasi: "4:53",
        tag: "MPASI",
      },
      {
        id: "v3",
        judul: "Edukasi Parenting: Tumbuh Kembang Anak 0-5 Tahun",
        channel: "Pusat Terapi Bermain",
        thumbnail: "https://i.ytimg.com/vi/77Tx7enc5EM/hq720.jpg",
        url: "https://youtu.be/77Tx7enc5EM?si=P_WeXyZNE9LHYaJ4",
        durasi: "2:25",
        tag: "Tumbuh Kembang",
      },
    ],
  },
  "Pra-stunting": {
    label: "Pra-Stunting",
    color: "yellow",
    icon: fas.faExclamationTriangle,
    headerBg: "from-yellow-400 to-amber-500",
    badgeBg: "bg-yellow-100 text-yellow-800 border-yellow-300",
    accentColor: "text-yellow-600",
    borderColor: "border-yellow-500",
    ringColor: "ring-yellow-400",
    tagBg: "bg-yellow-50 text-yellow-700",
    pesan: "Anak Anda berisiko stunting. Segera tingkatkan asupan gizi dan konsultasikan ke tenaga kesehatan terdekat.",
    artikel: [
      {
        id: "a1",
        judul: "Tanda Awal Anak Berisiko Stunting yang Wajib Diketahui",
        deskripsi: "Kenali tanda-tanda dini risiko stunting seperti berat badan tidak naik, tinggi badan di bawah grafik, dan sering sakit.",
        gambar: "https://d1vbn70lmn1nqe.cloudfront.net/prod/wp-content/uploads/2023/01/05124136/Ibu-Harus-Tahu-Ini-Ciri-Ciri-Stunting-pada-Anak-1.jpg.webp",
        tag: "Deteksi Dini",
        waktu: "4 menit baca",
        url: "https://www.halodoc.com/artikel/gejala-stunting",
      },
      {
        id: "a2",
        judul: "Cara Efektif Meningkatkan Nafsu Makan Anak",
        deskripsi: "Berbagai trik terbukti untuk membangkitkan selera makan anak yang susah makan agar kebutuhan kalori hariannya terpenuhi.",
        gambar: "https://d1vbn70lmn1nqe.cloudfront.net/prod/wp-content/uploads/2026/04/14025908/cara-mengajarkan-anak-membaca-6.jpg.webp",
        tag: "Nafsu Makan",
        waktu: "6 menit baca",
        url: "https://www.halodoc.com/artikel/anak-susah-makan-ini-cara-menambah-nafsu-makan-anak",
      },
      {
        id: "a3",
        judul: "Makanan Penambah Berat Badan Anak",
        deskripsi: "Daftar makanan padat gizi seperti alpukat, kacang-kacangan, dan ubi jalar yang efektif mendukung peningkatan berat badan.",
        gambar: "https://d1vbn70lmn1nqe.cloudfront.net/prod/wp-content/uploads/2026/03/02045826/makanan-penambah-berat-badan-anak.jpg",
        tag: "Nutrisi",
        waktu: "5 menit baca",
        url: "https://www.halodoc.com/artikel/booster-makanan-penambah-berat-badan-anak-sehat",
      },
      {
        id: "a4",
        judul: "Protein Hewani Efektif Cegah Anak Alami Stunting",
        deskripsi: "Protein hewani berkualitas tinggi dari empat sumber utama ini adalah kunci mencegah stunting dan mendukung perkembangan kognitif anak.",
        gambar: "https://healtheroes.id/wp-content/uploads/2024/07/65543891a68e71511231700018321.png",
        tag: "Protein Hewani",
        waktu: "6 menit baca",
        url: "https://kemkes.go.id/eng/protein-hewani-efektif-cegah-anak-alami-stunting",
      },
    ],
    video: [
      {
        id: "v1",
        judul: "Berbagai Makanan untuk Mencegah STUNTING",
        channel: "Dokter Raissa Djuanda",
        thumbnail: "https://i.ytimg.com/vi/CqJTLTjuxSs/hq720.jpg",
        url: "https://youtu.be/CqJTLTjuxSs?si=dfAme44dQHZUXy1u",
        durasi: "4:14",
        tag: "Menu Bergizi",
      },
      {
        id: "v2",
        judul: "Pencegahan Stunting Sejak Dini",
        channel: "UNICEF Indonesia",
        thumbnail: "https://i.ytimg.com/vi/qGaOBnI91vo/hq720.jpg",
        url: "https://youtu.be/qGaOBnI91vo?si=kKNp3Q6xeh2vDFci",
        durasi: "2:18",
        tag: "Pencegahan",
      },
      {
        id: "v3",
        judul: "Cara Masak Makanan Bergizi dengan Anggaran Terbatas",
        channel: "The Cooking Doc",
        thumbnail: "https://i.ytimg.com/vi/wPJjCE3OZ3U/hq720.jpg",
        url: "https://youtu.be/wPJjCE3OZ3U?si=qB0KB9dPjDR8fhPf",
        durasi: "7:14",
        tag: "Tips Masak",
      },
    ],
  },
  Stunting: {
    label: "Stunting",
    color: "red",
    icon: fas.faHeartPulse,
    headerBg: "from-red-500 to-rose-600",
    badgeBg: "bg-red-100 text-red-800 border-red-300",
    accentColor: "text-red-600",
    borderColor: "border-red-500",
    ringColor: "ring-red-400",
    tagBg: "bg-red-50 text-red-700",
    pesan: "Anak Anda terindikasi stunting. Segera konsultasikan ke puskesmas dan ikuti panduan gizi dari tenaga kesehatan.",
    artikel: [
      {
        id: "a1",
        judul: "Apa Itu Stunting dan Dampak Jangka Panjangnya",
        deskripsi: "Pahami definisi, penyebab, dan dampak stunting terhadap kecerdasan, produktivitas, dan kesehatan anak hingga dewasa.",
        gambar: "https://keslan.kemkes.go.id/img/bg-img/gambarartikel_1661498786_242330.jpg",
        tag: "Pengetahuan Dasar",
        waktu: "8 menit baca",
        url: "https://keslan.kemkes.go.id/view_artikel/1388/mengenal-apa-itu-stunting",
      },
      {
        id: "a2",
        judul: "Strategi Mengejar Pertumbuhan (Catch-up Growth) Anak Stunting",
        deskripsi: "Langkah-langkah intervensi gizi intensif untuk membantu anak stunting mengejar ketertinggalan pertumbuhan tinggi dan berat badan.",
        gambar: "https://asset.kompas.com/crops/EXWfPHxFfzRxk4mJvoypjSyDlaE=/0x0:1999x1333/660x440/data/photo/2022/07/15/62d0fd0e72bbb.jpg",
        tag: "Intervensi Gizi",
        waktu: "5 menit baca",
        url: "https://genbest.kompas.com/read/2022/07/16/110700220/catch-up-growth-ini-jadi-cara-perbaiki-tumbuh-kembang-anak-stunting",
      },
      {
        id: "a3",
        judul: "Makanan Tinggi Protein untuk Pemulihan Stunting",
        deskripsi: "Panduan menu harian padat protein dan mikronutrien seperti zinc, zat besi, dan kalsium yang diperlukan untuk catch-up growth optimal.",
        gambar: "https://www.family.abbott/content/dam/an/familyabbott/id-id/pediasure/tools-and-resources/infos-about-child-growth/nutrition/makanan-tinggi-protein-untuk-anak-stunting/daftar-makanan-bergizi-makanan-tinggi-protein-untuk-anak-stunting.jpg",
        tag: "Pemulihan Gizi",
        waktu: "6 menit baca",
        url: "https://www.family.abbott/id-id/pediasure/tools-and-resources/infos-about-child-growth/nutrition/makanan-tinggi-protein-untuk-anak-stunting.html",
      },
      {
        id: "a4",
        judul: "Pentingnya Pemeriksaan Rutin ke Posyandu",
        deskripsi: "Pemantauan pertumbuhan berkala di posyandu sangat penting untuk evaluasi perkembangan penanganan stunting.",
        gambar: "https://ayosehat.kemkes.go.id/imagex/content/0903e09c088d985da9b8fbb90797197a.webp",
        tag: "Layanan Kesehatan",
        waktu: "2 menit baca",
        url: "https://ayosehat.kemkes.go.id/pentingnya-mengukur-status-gizi-anak-secara-rutin?utm_source=chatgpt.com",
      },
    ],
    video: [
      {
        id: "v1",
        judul: "Penanganan Stunting – Penjelasan Dokter Spesialis Anak",
        channel: "Mayapada Hospital",
        thumbnail: "https://i.ytimg.com/vi/w8b6ipQvv9w/hq720.jpg",
        url: "https://youtu.be/w8b6ipQvv9w?si=bc2unECUDSwHMmQB",
        durasi: "15:56",
        tag: "Penanganan Medis",
      },
      {
        id: "v2",
        judul: "Menu Pemulihan Gizi Anak Stunting – Resep Praktis",
        channel: "Yanti Louis",
        thumbnail: "https://i.ytimg.com/vi/TN51O9kbAq4/hq720.jpg",
        url: "https://youtu.be/TN51O9kbAq4?si=lglekQidQYB3v7mU",
        durasi: "11:42",
        tag: "Resep Pemulihan",
      },
      {
        id: "v3",
        judul: "Edukasi Resmi Kemenkes: Cegah dan Atasi Stunting",
        channel: "Kementrian Kesehatan RI",
        thumbnail: "https://i.ytimg.com/vi/C5GW-uLfzTA/hq720.jpg",
        url: "https://youtu.be/C5GW-uLfzTA?si=WEth9At5Pg_x1Zt-",
        durasi: "25:25",
        tag: "Edukasi Resmi",
      },
    ],
  },
};

// Fallback jika status tidak dikenali
const DEFAULT_EDUKASI = EDUKASI_DATA["Normal"];

function getEdukasiByStatus(status) {
  if (!status) return null;
  if (status === "Normal") return EDUKASI_DATA["Normal"];
  if (status === "Pra-stunting" || status === "Pra-Stunting") return EDUKASI_DATA["Pra-stunting"];
  if (status === "Stunting") return EDUKASI_DATA["Stunting"];
  return null;
}

// ─────────────────────────────────────────────
// KOMPONEN: SEKSI EDUKASI
// ─────────────────────────────────────────────
function EdukasiSection({ status }) {
  const [activeTab, setActiveTab] = useState("artikel");
  const edukasi = getEdukasiByStatus(status);

  if (!edukasi) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 mt-6">
        <FontAwesomeIcon icon={fas.faBookOpen} className="text-4xl mb-3 opacity-30" />
        <p className="font-medium">Pilih anak untuk melihat konten edukasi yang sesuai</p>
      </div>
    );
  }

  const colorMap = {
    green: {
      tabActive: "bg-green-600 text-white",
      tabInactive: "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600",
      headerGrad: "from-green-500 to-emerald-600",
      badge: "bg-green-100 text-green-700",
      cardBorder: "border-green-200 hover:border-green-400",
      cardIcon: "bg-green-100 text-green-600",
      link: "text-green-600 hover:text-green-800",
      alertBg: "bg-green-50 border-green-300 text-green-800",
      alertIcon: "text-green-500",
    },
    yellow: {
      tabActive: "bg-amber-500 text-white",
      tabInactive: "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600",
      headerGrad: "from-yellow-400 to-amber-500",
      badge: "bg-yellow-100 text-yellow-700",
      cardBorder: "border-yellow-200 hover:border-yellow-400",
      cardIcon: "bg-yellow-100 text-yellow-600",
      link: "text-amber-600 hover:text-amber-800",
      alertBg: "bg-amber-50 border-amber-300 text-amber-800",
      alertIcon: "text-amber-500",
    },
    red: {
      tabActive: "bg-red-600 text-white",
      tabInactive: "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600",
      headerGrad: "from-red-500 to-rose-600",
      badge: "bg-red-100 text-red-700",
      cardBorder: "border-red-200 hover:border-red-400",
      cardIcon: "bg-red-100 text-red-600",
      link: "text-red-600 hover:text-red-800",
      alertBg: "bg-red-50 border-red-300 text-red-800",
      alertIcon: "text-red-500",
    },
  };

  const c = colorMap[edukasi.color];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
      {/* Header */}
      <div className={`bg-gradient-to-r ${c.headerGrad} p-5 text-white`}>
        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-2.5 rounded-lg mt-0.5">
            <FontAwesomeIcon icon={fas.faGraduationCap} className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Edukasi Gizi untuk Orang Tua</h3>
            <p className="text-sm opacity-90 mt-0.5">
              Konten disesuaikan dengan status gizi anak:{" "}
              <span className="font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                {edukasi.label}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Pesan status */}
        <div className={`flex items-start gap-3 p-4 rounded-lg border mb-5 ${c.alertBg}`}>
          <FontAwesomeIcon icon={edukasi.icon} className={`${c.alertIcon} text-xl mt-0.5 flex-shrink-0`} />
          <p className="text-sm font-medium">{edukasi.pesan}</p>
        </div>

        {/* Tab navigasi */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab("artikel")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "artikel" ? c.tabActive : c.tabInactive
            }`}
          >
            <FontAwesomeIcon icon={fas.faNewspaper} />
            Artikel
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "video" ? c.tabActive : c.tabInactive
            }`}
          >
            <FontAwesomeIcon icon={fas.faPlayCircle} />
            Video
          </button>
        </div>

        {/* Konten Artikel */}
        {activeTab === "artikel" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {edukasi.artikel.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col rounded-xl border-2 overflow-hidden transition-all duration-200 ${c.cardBorder} hover:shadow-md`}
              >
                {/* Gambar thumbnail artikel */}
                <div className="relative overflow-hidden h-36 bg-gray-100">
                  <img
                    src={item.gambar}
                    alt={item.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentNode.style.background = "#f3f4f6";
                    }}
                  />
                  {/* Overlay tipis saat hover */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Badge tag di atas gambar */}
                  <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm ${c.badge}`}>
                    {item.tag}
                  </span>
                </div>
                {/* Konten teks */}
                <div className="flex flex-col gap-2 p-3 flex-1">
                  <p className="font-semibold text-gray-800 text-sm leading-snug group-hover:underline line-clamp-2">
                    {item.judul}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2 flex-1">{item.deskripsi}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-auto">
                    <span className={`text-xs font-medium flex items-center gap-1 ${c.link}`}>
                      <FontAwesomeIcon icon={fas.faArrowUpRightFromSquare} className="text-xs" />
                      Baca Artikel
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <FontAwesomeIcon icon={fas.faClock} />
                      {item.waktu}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Konten Video */}
        {activeTab === "video" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {edukasi.video.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col rounded-xl border-2 overflow-hidden transition-all duration-200 ${c.cardBorder} hover:shadow-md`}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.judul}
                    className="w-full object-cover aspect-video bg-gray-200 group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentNode.classList.add("bg-gray-200", "flex", "items-center", "justify-center", "h-32");
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 rounded-full w-12 h-12 flex items-center justify-center">
                      <FontAwesomeIcon icon={fas.faPlay} className="text-gray-800 text-lg ml-1" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                    {item.durasi}
                  </span>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  <p className="text-sm font-semibold text-gray-800 leading-snug group-hover:underline line-clamp-2">
                    {item.judul}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>
                      {item.tag}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FontAwesomeIcon icon={fas.faYoutube} className="text-red-500" />
                      YouTube
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{item.channel}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// KOMPONEN UTAMA DASHBOARD
// ─────────────────────────────────────────────
export default function OrangTuaDashboard() {
  const navigate = useNavigate();
  const { 
    selectedAnakId, 
    selectedAnakData, 
    anakList, 
    updateSelectedAnak, 
    updateAnakList,
    currentUserId,
    currentUserRole,
    resetForSuperAdmin
  } = useAnak();
  
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAnakDropdown, setShowAnakDropdown] = useState(false);
  const [stats, setStats] = useState({
    totalAnak: 0,
    normal: 0,
    stunting: 0,
    giziKurang: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [latestMeasurement, setLatestMeasurement] = useState(null);
  
  // State untuk Super Admin
  const [orangTuaList, setOrangTuaList] = useState([]);
  const [selectedOrangTuaId, setSelectedOrangTuaId] = useState(null);
  const [superAdminSelectedAnak, setSuperAdminSelectedAnak] = useState(null);

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
      resetForSuperAdmin();
      fetchOrangTuaList();
    } else {
      fetchData(parsedUser.id, parsedUser.role);
    }
  }, [navigate]);

  useEffect(() => {
    if (userRole === "orang_tua" && selectedAnakData) {
      generateGrowthData(selectedAnakData);
      if (selectedAnakData.riwayat && selectedAnakData.riwayat.length > 0) {
        setLatestMeasurement(selectedAnakData.riwayat[selectedAnakData.riwayat.length - 1]);
      } else {
        setLatestMeasurement(null);
      }
    }
  }, [selectedAnakData, userRole]);

  useEffect(() => {
    if (userRole === "super_admin" && superAdminSelectedAnak) {
      generateGrowthData(superAdminSelectedAnak);
      if (superAdminSelectedAnak.riwayat && superAdminSelectedAnak.riwayat.length > 0) {
        setLatestMeasurement(superAdminSelectedAnak.riwayat[superAdminSelectedAnak.riwayat.length - 1]);
      } else {
        setLatestMeasurement(null);
      }
    }
  }, [superAdminSelectedAnak, userRole]);

  const fetchOrangTuaList = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_users.php`);
      const data = await response.json();
      
      if (data.status === "success") {
        const orangTua = data.data.filter(u => u.role === "orang_tua");
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_riwayat_anak.php?user_id=${userId}`);
      const data = await response.json();

      if (data.status === "success") {
        const processedAnakList = data.data.map(anak => ({
          ...anak,
          id: Number(anak.id),
          riwayat: (anak.riwayat || []).map(r => ({
            ...r,
            tanggal_pengukuran: r.tanggal_pengukuran,
            tinggi_badan: Number(r.tinggi_badan),
            berat_badan: Number(r.berat_badan),
            z_score: r.z_score ? Number(r.z_score) : null,
            status_gizi: r.status_gizi
          }))
        }));
        
        if (role === "orang_tua") {
          updateAnakList(processedAnakList, userId, role);
        } else {
          setAnakListForSuperAdmin(processedAnakList);
          if (processedAnakList.length > 0 && !superAdminSelectedAnak) {
            setSuperAdminSelectedAnak(processedAnakList[0]);
          }
        }
        
        const statsData = {
          totalAnak: processedAnakList.length,
          normal: processedAnakList.filter(a => {
            const lastStatus = a.riwayat?.slice(-1)[0]?.status_gizi;
            return lastStatus === "Normal";
          }).length,
          stunting: processedAnakList.filter(a => {
            const lastStatus = a.riwayat?.slice(-1)[0]?.status_gizi;
            return lastStatus === "Stunting";
          }).length,
          giziKurang: processedAnakList.filter(a => {
            const lastStatus = a.riwayat?.slice(-1)[0]?.status_gizi;
            return lastStatus === "Pra-stunting" || lastStatus === "Wasting";
          }).length,
        };
        setStats(statsData);
        generateNotifications(processedAnakList);
      } else if (data.status === "empty") {
        if (role === "orang_tua") {
          updateAnakList([], userId, role);
        } else {
          setAnakListForSuperAdmin([]);
          setSuperAdminSelectedAnak(null);
        }
        setStats({ totalAnak: 0, normal: 0, stunting: 0, giziKurang: 0 });
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [superAdminAnakList, setAnakListForSuperAdmin] = useState([]);

  const generateGrowthData = (anak) => {
    if (!anak || !anak.riwayat || anak.riwayat.length === 0) {
      setGrowthData([]);
      return;
    }
    const formattedData = anak.riwayat.map(r => ({
      tanggal: r.tanggal_pengukuran,
      tinggi: parseFloat(r.tinggi_badan),
      berat: parseFloat(r.berat_badan),
    }));
    setGrowthData(formattedData);
  };

  const generateNotifications = (anakListData) => {
    const notif = [];
    
    anakListData.forEach(anak => {
      const lastMeasurement = anak.riwayat?.slice(-1)[0];
      const secondLast = anak.riwayat?.slice(-2, -1)[0];
      
      if (lastMeasurement) {
        if (lastMeasurement.status_gizi === "Stunting") {
          notif.push({
            id: `stunting-${anak.id}`,
            title: `PERHATIAN: ${anak.nama_anak}`,
            message: "Terindikasi stunting. Segera konsultasikan ke posyandu terdekat!",
            type: "danger",
          });
        } else if (lastMeasurement.status_gizi === "Pra-stunting") {
          notif.push({
            id: `pra-${anak.id}`,
            title: `${anak.nama_anak}`,
            message: "Berisiko stunting. Perbaiki asupan gizi segera!",
            type: "warning",
          });
        } else if (lastMeasurement.status_gizi === "Normal") {
          notif.push({
            id: `normal-${anak.id}`,
            title: `${anak.nama_anak}`,
            message: "Status gizi normal. Terus jaga pola makan sehat!",
            type: "success",
          });
        }
        
        if (secondLast && parseFloat(lastMeasurement.berat_badan) < parseFloat(secondLast.berat_badan)) {
          notif.push({
            id: `weight-${anak.id}`,
            title: `${anak.nama_anak}`,
            message: `Berat badan turun dari ${secondLast.berat_badan} kg menjadi ${lastMeasurement.berat_badan} kg`,
            type: "info",
          });
        }
      }
    });
    
    notif.push({
      id: "imunisasi",
      title: "JADWAL IMUNISASI",
      message: "Anak usia 0-12 bulan membutuhkan imunisasi dasar lengkap. Cek ke posyandu terdekat!",
      type: "info",
    });
    
    setNotifications(notif);
  };

  const handleOrangTuaChange = async (userId) => {
    setSelectedOrangTuaId(userId);
    setSuperAdminSelectedAnak(null);
    await fetchData(userId, "super_admin");
  };

  const handleSuperAdminAnakChange = (anak) => {
    setSuperAdminSelectedAnak(anak);
    setShowAnakDropdown(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("selectedAnakId");
    localStorage.removeItem("currentUserId");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar handleLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sigizi-green mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  const statusColor = latestMeasurement?.status_gizi === "Normal" ? "text-green-300" : 
                      latestMeasurement?.status_gizi === "Stunting" ? "text-red-600" : 
                      latestMeasurement?.status_gizi === "Pra-stunting" ? "text-yellow-300" : "text-gray-600";

  const selectedOrangTua = orangTuaList.find(o => o.id === selectedOrangTuaId);
  const displayAnakData = userRole === "orang_tua" ? selectedAnakData : superAdminSelectedAnak;
  const displayAnakList = userRole === "orang_tua" ? anakList : superAdminAnakList;
  const currentStatusGizi = latestMeasurement?.status_gizi || null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar handleLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={fas.faHouse} className="text-2xl text-sigizi-green" />
            <h1 className="text-xl font-bold text-gray-800">Dashboard Orang Tua</h1>
          </div>
          
          <div className="flex gap-3">
            {userRole === "super_admin" && orangTuaList.length > 0 && (
              <select
                value={selectedOrangTuaId || ""}
                onChange={(e) => handleOrangTuaChange(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sigizi-green bg-white"
              >
                {orangTuaList.map(ot => (
                  <option key={ot.id} value={ot.id}>
                    {ot.nama_lengkap} - {ot.email}
                  </option>
                ))}
              </select>
            )}
            
            {/* Dropdown Anak – orang_tua */}
            {userRole === "orang_tua" && displayAnakList.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowAnakDropdown(!showAnakDropdown)}
                  className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sigizi-green transition"
                >
                  {displayAnakData ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sigizi-green to-sigizi-light-green flex items-center justify-center text-white font-bold text-sm">
                        {displayAnakData.nama_anak?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-700">{displayAnakData.nama_anak}</span>
                      <FontAwesomeIcon icon={fas.faChevronDown} className="text-gray-400 text-sm ml-1" />
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={fas.faBaby} className="text-sigizi-green" />
                      <span className="text-gray-700">Pilih Anak</span>
                      <FontAwesomeIcon icon={fas.faChevronDown} className="text-gray-400 text-sm" />
                    </>
                  )}
                </button>
                
                {showAnakDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowAnakDropdown(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                      <div className="p-2 max-h-96 overflow-y-auto">
                        {displayAnakList.map(anak => {
                          const isSelected = selectedAnakId === anak.id;
                          const lastStatus = anak.riwayat?.slice(-1)[0]?.status_gizi;
                          let sColor = "", sBg = "";
                          if (lastStatus === "Normal") { sColor = "text-green-600"; sBg = "bg-green-50"; }
                          else if (lastStatus === "Stunting") { sColor = "text-red-600"; sBg = "bg-red-50"; }
                          else if (lastStatus === "Pra-stunting") { sColor = "text-yellow-600"; sBg = "bg-yellow-50"; }
                          
                          return (
                            <button
                              key={anak.id}
                              onClick={() => { updateSelectedAnak(anak.id, anak, currentUserId); setShowAnakDropdown(false); }}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all mb-1 ${isSelected ? 'bg-sigizi-green/10 border border-sigizi-green/20' : 'hover:bg-gray-50'}`}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${isSelected ? 'bg-sigizi-green' : 'bg-gray-400'}`}>
                                {anak.nama_anak?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-semibold text-gray-800">{anak.nama_anak}</p>
                                <div className="flex items-center gap-2 text-xs mt-0.5">
                                  <span className="text-gray-500">{anak.tanggal_lahir}</span>
                                  {lastStatus && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className={`${sColor} font-medium px-1.5 py-0.5 rounded ${sBg}`}>{lastStatus}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {isSelected && <FontAwesomeIcon icon={fas.faCheckCircle} className="text-sigizi-green text-sm" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Dropdown Anak – super admin */}
            {userRole === "super_admin" && superAdminAnakList.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowAnakDropdown(!showAnakDropdown)}
                  className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sigizi-green transition"
                >
                  {superAdminSelectedAnak ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sigizi-green to-sigizi-light-green flex items-center justify-center text-white font-bold text-sm">
                        {superAdminSelectedAnak.nama_anak?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-700">{superAdminSelectedAnak.nama_anak}</span>
                      <FontAwesomeIcon icon={fas.faChevronDown} className="text-gray-400 text-sm ml-1" />
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={fas.faBaby} className="text-sigizi-green" />
                      <span className="text-gray-700">Pilih Anak</span>
                      <FontAwesomeIcon icon={fas.faChevronDown} className="text-gray-400 text-sm" />
                    </>
                  )}
                </button>
                
                {showAnakDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowAnakDropdown(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                      <div className="p-2 max-h-96 overflow-y-auto">
                        {superAdminAnakList.map(anak => {
                          const isSelected = superAdminSelectedAnak?.id === anak.id;
                          const lastStatus = anak.riwayat?.slice(-1)[0]?.status_gizi;
                          let sColor = "", sBg = "";
                          if (lastStatus === "Normal") { sColor = "text-green-600"; sBg = "bg-green-50"; }
                          else if (lastStatus === "Stunting") { sColor = "text-red-600"; sBg = "bg-red-50"; }
                          else if (lastStatus === "Pra-stunting") { sColor = "text-yellow-600"; sBg = "bg-yellow-50"; }
                          
                          return (
                            <button
                              key={anak.id}
                              onClick={() => { handleSuperAdminAnakChange(anak); setShowAnakDropdown(false); }}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all mb-1 ${isSelected ? 'bg-sigizi-green/10 border border-sigizi-green/20' : 'hover:bg-gray-50'}`}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${isSelected ? 'bg-sigizi-green' : 'bg-gray-400'}`}>
                                {anak.nama_anak?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-semibold text-gray-800">{anak.nama_anak}</p>
                                <div className="flex items-center gap-2 text-xs mt-0.5">
                                  <span className="text-gray-500">{anak.tanggal_lahir}</span>
                                  {lastStatus && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className={`${sColor} font-medium px-1.5 py-0.5 rounded ${sBg}`}>{lastStatus}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {isSelected && <FontAwesomeIcon icon={fas.faCheckCircle} className="text-sigizi-green text-sm" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="p-6 overflow-y-auto">
          {/* Info Super Admin */}
          {userRole === "super_admin" && selectedOrangTua && (
            <div className="mb-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={fas.faUserShield} className="text-blue-600 text-xl" />
                <div>
                  <p className="text-sm text-blue-800">Mode Super Admin</p>
                  <p className="font-semibold text-blue-900">
                    Menampilkan data untuk: {selectedOrangTua.nama_lengkap}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    *Pemilihan anak hanya untuk tampilan saat ini, tidak tersimpan antar menu
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Statistik Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-sigizi-green">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Anak</p>
                  <p className="text-2xl font-bold">{stats.totalAnak}</p>
                </div>
                <FontAwesomeIcon icon={fas.faBaby} className="text-3xl text-sigizi-green opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Status Normal</p>
                  <p className="text-2xl font-bold text-green-600">{stats.normal}</p>
                </div>
                <FontAwesomeIcon icon={fas.faCheckCircle} className="text-3xl text-green-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Gizi Kurang</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.giziKurang}</p>
                </div>
                <FontAwesomeIcon icon={fas.faExclamationTriangle} className="text-3xl text-yellow-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Stunting</p>
                  <p className="text-2xl font-bold text-red-600">{stats.stunting}</p>
                </div>
                <FontAwesomeIcon icon={fas.faChild} className="text-3xl text-red-500 opacity-50" />
              </div>
            </div>
          </div>

          {/* Pesan jika tidak ada data */}
          {displayAnakList.length === 0 && (
            <div className="bg-yellow-50 rounded-xl p-8 text-center mb-6">
              <FontAwesomeIcon icon={fas.faBaby} className="text-4xl text-yellow-500 mb-3" />
              <p className="text-gray-600 font-medium">Belum ada data anak untuk orang tua ini</p>
              <p className="text-gray-500 text-sm mt-1">Silakan tambah data anak terlebih dahulu</p>
            </div>
          )}

          {/* Informasi Anak Terpilih */}
          {displayAnakData && (
            <div className="bg-gradient-to-r from-sigizi-green to-sigizi-light-green text-white rounded-xl p-6 mb-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{displayAnakData.nama_anak}</h2>
                  <p className="opacity-90 mt-1">
                    Lahir: {displayAnakData.tanggal_lahir} | 
                    JK: {displayAnakData.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} |
                    Status Verifikasi: {displayAnakData.status_verifikasi || "Menunggu"}
                  </p>
                  {latestMeasurement && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                        <FontAwesomeIcon icon={fas.faWeightScale} />
                        <span className="font-medium">{latestMeasurement.berat_badan} kg</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                        <FontAwesomeIcon icon={fas.faRuler} />
                        <span className="font-medium">{latestMeasurement.tinggi_badan} cm</span>
                      </div>
                      <div className={`flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5 ${statusColor}`}>
                        <FontAwesomeIcon icon={fas.faChartLine} />
                        <span className="font-medium">{latestMeasurement.status_gizi}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-75">Terakhir diupdate</p>
                  <p className="font-semibold">{latestMeasurement?.tanggal_pengukuran || "-"}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grafik Pertumbuhan */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={fas.faChartLine} /> Grafik Pertumbuhan {displayAnakData?.nama_anak || ""}
              </h3>
              {growthData.length > 0 ? (
                <div style={{ height: "350px", width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                      <YAxis yAxisId="left" label={{ value: 'Tinggi (cm)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Berat (kg)', angle: 90, position: 'insideRight', style: { fontSize: 11 } }} />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="tinggi" stroke="#285A48" strokeWidth={2} name="Tinggi Badan" />
                      <Line yAxisId="right" type="monotone" dataKey="berat" stroke="#E74C3C" strokeWidth={2} name="Berat Badan" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FontAwesomeIcon icon={fas.faChartLine} className="text-4xl mb-2 opacity-30" />
                  <p>Belum ada data pengukuran untuk {displayAnakData?.nama_anak || "anak ini"}</p>
                </div>
              )}
            </div>

            {/* Notifikasi */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={fas.faBell} /> Notifikasi Penting
              </h3>
              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div key={notif.id} className={`p-3 rounded-lg border-l-4 ${
                      notif.type === "danger" ? "border-red-500 bg-red-50" :
                      notif.type === "warning" ? "border-yellow-500 bg-yellow-50" :
                      notif.type === "success" ? "border-green-500 bg-green-50" :
                      "border-blue-500 bg-blue-50"
                    }`}>
                      <div className="flex items-start gap-3">
                        <FontAwesomeIcon 
                          icon={notif.type === "danger" ? fas.faExclamationCircle : fas.faInfoCircle} 
                          className={notif.type === "danger" ? "text-red-500 mt-0.5" : "text-blue-500 mt-0.5"}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm">{notif.title}</p>
                          <p className="text-sm text-gray-600">{notif.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FontAwesomeIcon icon={fas.faBell} className="text-4xl mb-2 opacity-30" />
                    <p>Tidak ada notifikasi baru</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── SEKSI EDUKASI ─── */}
          <EdukasiSection status={currentStatusGizi} />

        </main>
      </div>
    </div>
  );
}
