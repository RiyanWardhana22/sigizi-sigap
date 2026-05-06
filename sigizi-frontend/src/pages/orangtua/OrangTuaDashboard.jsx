// sigizi-frontend/src/pages/orangtua/OrangTuaDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnak } from "../../contexts/AnakContext";
import Sidebar from "../../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";

// ─────────────────────────────────────────────
// DATA EDUKASI BERDASARKAN STATUS GIZI
// ─────────────────────────────────────────────
const EDUKASI_DATA = {
  Normal: {
    label: "Normal",
    color: "green",
    icon: fas.faCheckCircle,
    headerBg: "from-green-500 to-emerald-600",
    pesan: "Status gizi anak Anda normal. Pertahankan pola makan sehat dan terus pantau tumbuh kembangnya!",
    artikel: [
      {
        id: "a1",
        judul: "Pentingnya Protein Hewani untuk Pertumbuhan Anak",
        deskripsi: "Protein hewani seperti telur, ikan, dan daging mengandung asam amino esensial yang krusial untuk perkembangan otak dan otot balita.",
        gambar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiWRAPiyjG2dHX2svTrREBb8Jm41_DQZYgpw&s",
        tag: "Nutrisi", waktu: "5 menit baca",
        url: "https://www.kemkes.go.id/id/protein-hewani-efektif-cegah-anak-alami-stunting",
      },
      {
        id: "a2",
        judul: "Jadwal Makan Ideal untuk Balita",
        deskripsi: "Atur jadwal makan 3x utama dan 2x selingan sehari agar kebutuhan energi dan nutrisi balita terpenuhi secara optimal.",
        gambar: "https://d1bpj0tv6vfxyp.cloudfront.net/articles/116293_2-3-2021_13-44-49.png",
        tag: "Pola Makan", waktu: "4 menit baca",
        url: "https://www.halodoc.com/artikel/pentingnya-jadwal-makan-agar-balita-makan-teratur",
      },
      {
        id: "a3",
        judul: "Tips Mengatasi Anak Pilih-Pilih Makanan (Picky Eater)",
        deskripsi: "Strategi praktis agar anak mau makan beragam makanan bergizi, dari cara penyajian hingga pelibatan anak dalam memasak.",
        gambar: "https://foto.kontan.co.id/Bn7PY6Cvt67Y2II_GTfMy37cpS0=/smart/filters:format(webp)/2024/09/24/864598847.jpg",
        tag: "Parenting", waktu: "6 menit baca",
        url: "https://www.halodoc.com/artikel/7-tips-agar-anak-tidak-pilih-pilih-makanan",
      },
      {
        id: "a4",
        judul: "Pentingnya Imunisasi dan Vitamin A untuk Anak",
        deskripsi: "Imunisasi dasar lengkap dan suplementasi vitamin A melindungi anak dari penyakit serta mendukung pertumbuhan yang optimal.",
        gambar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm6uJmUCYudvjgtFXWeHxTrTEd3aZY4HVE2w&s",
        tag: "Kesehatan", waktu: "5 menit baca",
        url: "https://ayosehat.kemkes.go.id/vitamin-a-untuk-anak",
      },
    ],
    video: [
      { id: "v1", judul: "Cara Membuat Bekal Sehat dan Menarik untuk Anak", channel: "tri pujis", thumbnail: "https://i.ytimg.com/vi/S5FDTRx32wk/hqdefault.jpg", url: "https://youtu.be/S5FDTRx32wk?si=TbeSzpQL1uOYNq_x", durasi: "9:04", tag: "Bekal Sehat" },
      { id: "v2", judul: "Resep MPASI Bergizi Tinggi untuk Bayi 6 Bulan", channel: "Marina Anggraeni", thumbnail: "https://i.ytimg.com/vi/J04JGL5sTfU/hq720.jpg", url: "https://youtu.be/J04JGL5sTfU?si=KEE6EZw2Kcv2hItC", durasi: "4:53", tag: "MPASI" },
      { id: "v3", judul: "Edukasi Parenting: Tumbuh Kembang Anak 0-5 Tahun", channel: "Pusat Terapi Bermain", thumbnail: "https://i.ytimg.com/vi/77Tx7enc5EM/hq720.jpg", url: "https://youtu.be/77Tx7enc5EM?si=P_WeXyZNE9LHYaJ4", durasi: "2:25", tag: "Tumbuh Kembang" },
    ],
  },
  "Pra-stunting": {
    label: "Pra-Stunting",
    color: "yellow",
    icon: fas.faExclamationTriangle,
    headerBg: "from-yellow-400 to-amber-500",
    pesan: "Anak Anda berisiko stunting. Segera tingkatkan asupan gizi dan konsultasikan ke tenaga kesehatan terdekat.",
    artikel: [
      { id: "a1", judul: "Tanda Awal Anak Berisiko Stunting yang Wajib Diketahui", deskripsi: "Kenali tanda-tanda dini risiko stunting seperti berat badan tidak naik, tinggi badan di bawah grafik, dan sering sakit.", gambar: "https://d1vbn70lmn1nqe.cloudfront.net/prod/wp-content/uploads/2023/01/05124136/Ibu-Harus-Tahu-Ini-Ciri-Ciri-Stunting-pada-Anak-1.jpg.webp", tag: "Deteksi Dini", waktu: "4 menit baca", url: "https://www.halodoc.com/artikel/gejala-stunting" },
      { id: "a2", judul: "Cara Efektif Meningkatkan Nafsu Makan Anak", deskripsi: "Berbagai trik terbukti untuk membangkitkan selera makan anak yang susah makan agar kebutuhan kalori hariannya terpenuhi.", gambar: "https://d1vbn70lmn1nqe.cloudfront.net/prod/wp-content/uploads/2026/04/14025908/cara-mengajarkan-anak-membaca-6.jpg.webp", tag: "Nafsu Makan", waktu: "6 menit baca", url: "https://www.halodoc.com/artikel/anak-susah-makan-ini-cara-menambah-nafsu-makan-anak" },
      { id: "a3", judul: "Makanan Penambah Berat Badan Anak", deskripsi: "Daftar makanan padat gizi seperti alpukat, kacang-kacangan, dan ubi jalar yang efektif mendukung peningkatan berat badan.", gambar: "https://d1vbn70lmn1nqe.cloudfront.net/prod/wp-content/uploads/2026/03/02045826/makanan-penambah-berat-badan-anak.jpg", tag: "Nutrisi", waktu: "5 menit baca", url: "https://www.halodoc.com/artikel/booster-makanan-penambah-berat-badan-anak-sehat" },
      { id: "a4", judul: "Protein Hewani Efektif Cegah Anak Alami Stunting", deskripsi: "Protein hewani berkualitas tinggi dari empat sumber utama ini adalah kunci mencegah stunting dan mendukung perkembangan kognitif anak.", gambar: "https://healtheroes.id/wp-content/uploads/2024/07/65543891a68e71511231700018321.png", tag: "Protein Hewani", waktu: "6 menit baca", url: "https://kemkes.go.id/eng/protein-hewani-efektif-cegah-anak-alami-stunting" },
    ],
    video: [
      { id: "v1", judul: "Berbagai Makanan untuk Mencegah STUNTING", channel: "Dokter Raissa Djuanda", thumbnail: "https://i.ytimg.com/vi/CqJTLTjuxSs/hq720.jpg", url: "https://youtu.be/CqJTLTjuxSs?si=dfAme44dQHZUXy1u", durasi: "4:14", tag: "Menu Bergizi" },
      { id: "v2", judul: "Pencegahan Stunting Sejak Dini", channel: "UNICEF Indonesia", thumbnail: "https://i.ytimg.com/vi/qGaOBnI91vo/hq720.jpg", url: "https://youtu.be/qGaOBnI91vo?si=kKNp3Q6xeh2vDFci", durasi: "2:18", tag: "Pencegahan" },
      { id: "v3", judul: "Cara Masak Makanan Bergizi dengan Anggaran Terbatas", channel: "The Cooking Doc", thumbnail: "https://i.ytimg.com/vi/wPJjCE3OZ3U/hq720.jpg", url: "https://youtu.be/wPJjCE3OZ3U?si=qB0KB9dPjDR8fhPf", durasi: "7:14", tag: "Tips Masak" },
    ],
  },
  Stunting: {
    label: "Stunting",
    color: "red",
    icon: fas.faHeartPulse,
    headerBg: "from-red-500 to-rose-600",
    pesan: "Anak Anda terindikasi stunting. Segera konsultasikan ke puskesmas dan ikuti panduan gizi dari tenaga kesehatan.",
    artikel: [
      { id: "a1", judul: "Apa Itu Stunting dan Dampak Jangka Panjangnya", deskripsi: "Pahami definisi, penyebab, dan dampak stunting terhadap kecerdasan, produktivitas, dan kesehatan anak hingga dewasa.", gambar: "https://keslan.kemkes.go.id/img/bg-img/gambarartikel_1661498786_242330.jpg", tag: "Pengetahuan Dasar", waktu: "8 menit baca", url: "https://keslan.kemkes.go.id/view_artikel/1388/mengenal-apa-itu-stunting" },
      { id: "a2", judul: "Strategi Mengejar Pertumbuhan (Catch-up Growth) Anak Stunting", deskripsi: "Langkah-langkah intervensi gizi intensif untuk membantu anak stunting mengejar ketertinggalan pertumbuhan tinggi dan berat badan.", gambar: "https://asset.kompas.com/crops/EXWfPHxFfzRxk4mJvoypjSyDlaE=/0x0:1999x1333/660x440/data/photo/2022/07/15/62d0fd0e72bbb.jpg", tag: "Intervensi Gizi", waktu: "5 menit baca", url: "https://genbest.kompas.com/read/2022/07/16/110700220/catch-up-growth-ini-jadi-cara-perbaiki-tumbuh-kembang-anak-stunting" },
      { id: "a3", judul: "Makanan Tinggi Protein untuk Pemulihan Stunting", deskripsi: "Panduan menu harian padat protein dan mikronutrien seperti zinc, zat besi, dan kalsium yang diperlukan untuk catch-up growth optimal.", gambar: "https://www.family.abbott/content/dam/an/familyabbott/id-id/pediasure/tools-and-resources/infos-about-child-growth/nutrition/makanan-tinggi-protein-untuk-anak-stunting/daftar-makanan-bergizi-makanan-tinggi-protein-untuk-anak-stunting.jpg", tag: "Pemulihan Gizi", waktu: "6 menit baca", url: "https://www.family.abbott/id-id/pediasure/tools-and-resources/infos-about-child-growth/nutrition/makanan-tinggi-protein-untuk-anak-stunting.html" },
      { id: "a4", judul: "Pentingnya Pemeriksaan Rutin ke Posyandu", deskripsi: "Pemantauan pertumbuhan berkala di posyandu sangat penting untuk evaluasi perkembangan penanganan stunting.", gambar: "https://ayosehat.kemkes.go.id/imagex/content/0903e09c088d985da9b8fbb90797197a.webp", tag: "Layanan Kesehatan", waktu: "2 menit baca", url: "https://ayosehat.kemkes.go.id/pentingnya-mengukur-status-gizi-anak-secara-rutin" },
    ],
    video: [
      { id: "v1", judul: "Penanganan Stunting – Penjelasan Dokter Spesialis Anak", channel: "Mayapada Hospital", thumbnail: "https://i.ytimg.com/vi/w8b6ipQvv9w/hq720.jpg", url: "https://youtu.be/w8b6ipQvv9w?si=bc2unECUDSwHMmQB", durasi: "15:56", tag: "Penanganan Medis" },
      { id: "v2", judul: "Menu Pemulihan Gizi Anak Stunting – Resep Praktis", channel: "Yanti Louis", thumbnail: "https://i.ytimg.com/vi/TN51O9kbAq4/hq720.jpg", url: "https://youtu.be/TN51O9kbAq4?si=lglekQidQYB3v7mU", durasi: "11:42", tag: "Resep Pemulihan" },
      { id: "v3", judul: "Edukasi Resmi Kemenkes: Cegah dan Atasi Stunting", channel: "Kementrian Kesehatan RI", thumbnail: "https://i.ytimg.com/vi/C5GW-uLfzTA/hq720.jpg", url: "https://youtu.be/C5GW-uLfzTA?si=WEth9At5Pg_x1Zt-", durasi: "25:25", tag: "Edukasi Resmi" },
    ],
  },
};

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
    green: { tabActive: "bg-green-600 text-white", tabInactive: "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600", headerGrad: "from-green-500 to-emerald-600", badge: "bg-green-100 text-green-700", cardBorder: "border-green-200 hover:border-green-400", link: "text-green-600 hover:text-green-800", alertBg: "bg-green-50 border-green-300 text-green-800", alertIcon: "text-green-500" },
    yellow: { tabActive: "bg-amber-500 text-white", tabInactive: "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600", headerGrad: "from-yellow-400 to-amber-500", badge: "bg-yellow-100 text-yellow-700", cardBorder: "border-yellow-200 hover:border-yellow-400", link: "text-amber-600 hover:text-amber-800", alertBg: "bg-amber-50 border-amber-300 text-amber-800", alertIcon: "text-amber-500" },
    red: { tabActive: "bg-red-600 text-white", tabInactive: "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600", headerGrad: "from-red-500 to-rose-600", badge: "bg-red-100 text-red-700", cardBorder: "border-red-200 hover:border-red-400", link: "text-red-600 hover:text-red-800", alertBg: "bg-red-50 border-red-300 text-red-800", alertIcon: "text-red-500" },
  };
  const c = colorMap[edukasi.color];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
      <div className={`bg-gradient-to-r ${c.headerGrad} p-5 text-white`}>
        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-2.5 rounded-lg mt-0.5">
            <FontAwesomeIcon icon={fas.faGraduationCap} className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Edukasi Gizi untuk Orang Tua</h3>
            <p className="text-sm opacity-90 mt-0.5">
              Konten disesuaikan dengan status gizi anak:{" "}
              <span className="font-semibold bg-white/20 px-2 py-0.5 rounded-full">{edukasi.label}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className={`flex items-start gap-3 p-4 rounded-lg border mb-5 ${c.alertBg}`}>
          <FontAwesomeIcon icon={edukasi.icon} className={`${c.alertIcon} text-xl mt-0.5 flex-shrink-0`} />
          <p className="text-sm font-medium">{edukasi.pesan}</p>
        </div>

        <div className="flex gap-2 mb-5">
          <button onClick={() => setActiveTab("artikel")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "artikel" ? c.tabActive : c.tabInactive}`}>
            <FontAwesomeIcon icon={fas.faNewspaper} /> Artikel
          </button>
          <button onClick={() => setActiveTab("video")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "video" ? c.tabActive : c.tabInactive}`}>
            <FontAwesomeIcon icon={fas.faPlayCircle} /> Video
          </button>
        </div>

        {activeTab === "artikel" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {edukasi.artikel.map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className={`group flex flex-col rounded-xl border-2 overflow-hidden transition-all duration-200 ${c.cardBorder} hover:shadow-md`}>
                <div className="relative overflow-hidden h-36 bg-gray-100">
                  <img src={item.gambar} alt={item.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.style.display = "none"; }} />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm ${c.badge}`}>{item.tag}</span>
                </div>
                <div className="flex flex-col gap-2 p-3 flex-1">
                  <p className="font-semibold text-gray-800 text-sm leading-snug group-hover:underline line-clamp-2">{item.judul}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 flex-1">{item.deskripsi}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-auto">
                    <span className={`text-xs font-medium flex items-center gap-1 ${c.link}`}>
                      <FontAwesomeIcon icon={fas.faArrowUpRightFromSquare} className="text-xs" /> Baca Artikel
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <FontAwesomeIcon icon={fas.faClock} /> {item.waktu}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {activeTab === "video" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {edukasi.video.map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className={`group flex flex-col rounded-xl border-2 overflow-hidden transition-all duration-200 ${c.cardBorder} hover:shadow-md`}>
                <div className="relative overflow-hidden">
                  <img src={item.thumbnail} alt={item.judul} className="w-full object-cover aspect-video bg-gray-200 group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 rounded-full w-12 h-12 flex items-center justify-center">
                      <FontAwesomeIcon icon={fas.faPlay} className="text-gray-800 text-lg ml-1" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">{item.durasi}</span>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  <p className="text-sm font-semibold text-gray-800 leading-snug group-hover:underline line-clamp-2">{item.judul}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>{item.tag}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FontAwesomeIcon icon={fas.faYoutube} className="text-red-500" /> YouTube
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
// KOMPONEN: KARTU DATA DIRI ORANG TUA
// ─────────────────────────────────────────────
function DataDiriOrangTua({ user, profilData, navigate }) {
  // Fungsi untuk menghitung usia dari tanggal lahir
  const calculateAge = (tanggalLahir) => {
    if (!tanggalLahir) return null;
    const birth = new Date(tanggalLahir);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      years--;
    }
    return years;
  };

  // Format tanggal ke format Indonesia
  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    const date = new Date(tanggal);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FontAwesomeIcon icon={fas.faUser} className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Data Diri Orang Tua</h2>
              <p className="text-xs opacity-80">Informasi identitas dan sosial ekonomi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body - Layout 2 Kolom */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kolom Kiri - Identitas */}
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2 pb-2 border-b border-gray-100">
              <FontAwesomeIcon icon={fas.faIdCard} className="text-blue-500" />
              Identitas Diri
            </h3>
            
            <div className="space-y-1">
              {/* Nama */}
              <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-blue-50/50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <FontAwesomeIcon icon={fas.faUser} className="text-blue-600 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">Nama Lengkap</p>
                  <p className="font-semibold text-gray-800 text-sm truncate">{user.nama_lengkap}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-blue-50/50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <FontAwesomeIcon icon={fas.faEnvelope} className="text-gray-500 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="font-semibold text-gray-800 text-sm truncate">{user.email}</p>
                </div>
              </div>

              {/* Tanggal Lahir */}
              <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-green-50/50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <FontAwesomeIcon icon={fas.faCalendar} className="text-green-600 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">Tanggal Lahir</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 text-sm">
                      {profilData?.tanggal_lahir ? formatTanggal(profilData.tanggal_lahir) : "-"}
                    </p>
                    {profilData?.tanggal_lahir && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {calculateAge(profilData.tanggal_lahir)} tahun
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Domisili */}
              <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-orange-50/50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <FontAwesomeIcon icon={fas.faLocationDot} className="text-orange-600 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">Domisili</p>
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {profilData?.nama_kabupaten || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan - Sosial Ekonomi */}
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2 pb-2 border-b border-gray-100">
              <FontAwesomeIcon icon={fas.faChartPie} className="text-teal-500" />
              Sosial Ekonomi
            </h3>
            
            {profilData && profilData.profil_lengkap ? (
              <div className="space-y-1">
                {/* Penghasilan */}
                <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-emerald-50/50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <FontAwesomeIcon icon={fas.faMoneyBillWave} className="text-emerald-600 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Penghasilan per Bulan</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      Rp {profilData.penghasilan_range}
                    </p>
                  </div>
                </div>

                {/* Pendidikan Ibu */}
                <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-indigo-50/50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <FontAwesomeIcon icon={fas.faGraduationCap} className="text-indigo-600 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Pendidikan Terakhir Ibu</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {profilData.pendidikan_ibu || "-"}
                    </p>
                  </div>
                </div>

                {/* Sanitasi */}
                <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50/50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <FontAwesomeIcon icon={fas.faToilet} className="text-gray-600 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Kondisi Sanitasi</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        profilData.sanitasi === "Baik" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        <FontAwesomeIcon 
                          icon={profilData.sanitasi === "Baik" ? fas.faCheckCircle : fas.faExclamationCircle} 
                          className="text-xs" 
                        />
                        {profilData.sanitasi}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kualitas Air */}
                <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-cyan-50/50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                    <FontAwesomeIcon icon={fas.faDroplet} className="text-cyan-600 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Kualitas Air</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        profilData.kualitas_air === "Bersih" 
                          ? "bg-cyan-100 text-cyan-700" 
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        <FontAwesomeIcon 
                          icon={profilData.kualitas_air === "Bersih" ? fas.faCheckCircle : fas.faExclamationCircle} 
                          className="text-xs" 
                        />
                        {profilData.kualitas_air}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Akses Kesehatan */}
                <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-purple-50/50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <FontAwesomeIcon icon={fas.faHospital} className="text-purple-600 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Akses Layanan Kesehatan</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        profilData.akses_kesehatan === "Mudah" 
                          ? "bg-purple-100 text-purple-700" 
                          : "bg-rose-100 text-rose-700"
                      }`}>
                        <FontAwesomeIcon 
                          icon={profilData.akses_kesehatan === "Mudah" ? fas.faCheckCircle : fas.faExclamationCircle} 
                          className="text-xs" 
                        />
                        {profilData.akses_kesehatan}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <FontAwesomeIcon icon={fas.faCircleExclamation} className="text-amber-500 text-lg mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 text-sm">Data sosial ekonomi belum lengkap</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Silakan lengkapi data diri Anda di menu{" "}
                    <button
                      onClick={() => navigate("/orangtua/data-anak")}
                      className="underline font-medium hover:text-amber-900"
                    >
                      Data Anak
                    </button>
                    {" "}untuk mendapatkan analisis yang lebih akurat.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
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
    resetForSuperAdmin,
  } = useAnak();

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAnakDropdown, setShowAnakDropdown] = useState(false);
  const [stats, setStats] = useState({ totalAnak: 0, normal: 0, stunting: 0, giziKurang: 0 });
  const [latestMeasurement, setLatestMeasurement] = useState(null);

  // Profil orang tua
  const [profilData, setProfilData] = useState(null);
  const [superAdminProfilData, setSuperAdminProfilData] = useState(null);

  // Super Admin
  const [orangTuaList, setOrangTuaList] = useState([]);
  const [selectedOrangTuaId, setSelectedOrangTuaId] = useState(null);
  const [superAdminSelectedAnak, setSuperAdminSelectedAnak] = useState(null);
  const [superAdminAnakList, setAnakListForSuperAdmin] = useState([]);
  const [superAdminShowAnakDropdown, setSuperAdminShowAnakDropdown] = useState(false);

  const getStatusBadgeClass = (status) => {
    const statusBadgeClass = {
      Normal: "bg-green-100 text-green-800",
      Stunting: "bg-red-100 text-red-800",
      "Pra-stunting": "bg-yellow-100 text-yellow-800",
      Wasting: "bg-orange-100 text-orange-800",
      "Gizi Lebih": "bg-blue-100 text-blue-800",
      "Gizi Berlebih": "bg-purple-100 text-purple-800",
    };
    return statusBadgeClass[status] || "bg-gray-100 text-gray-700";
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { navigate("/"); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "orang_tua" && parsedUser.role !== "super_admin") { navigate("/dashboard"); return; }
    setUser(parsedUser);
    setUserRole(parsedUser.role);

    if (parsedUser.role === "super_admin") {
      resetForSuperAdmin();
      fetchOrangTuaList();
    } else {
      fetchProfil(parsedUser.id);
      fetchData(parsedUser.id, parsedUser.role);
    }
  }, [navigate]);

  useEffect(() => {
    const anakData = userRole === "orang_tua" ? selectedAnakData : superAdminSelectedAnak;
    if (anakData?.riwayat?.length > 0) {
      setLatestMeasurement(anakData.riwayat[anakData.riwayat.length - 1]);
    } else {
      setLatestMeasurement(null);
    }
  }, [selectedAnakData, superAdminSelectedAnak, userRole]);

  // ── API: Ambil profil orang tua ─────────────────────────────
  const fetchProfil = async (userId, role = "orang_tua") => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profil_orangtua.php?user_id=${userId}`);
      const data = await res.json();
      if (data.status === "success") {
        if (role === "super_admin") setSuperAdminProfilData(data.data);
        else setProfilData(data.data);
      } else {
        if (role === "super_admin") setSuperAdminProfilData(null);
      }
    } catch (e) {
      console.error("Gagal memuat profil:", e);
      if (role === "super_admin") setSuperAdminProfilData(null);
    }
  };

  const fetchOrangTuaList = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_users.php?role=orang_tua`);
      const data = await response.json();
      if (data.status === "success") {
        const orangTua = data.data.filter((u) => u.role === "orang_tua");
        setOrangTuaList(orangTua);
        if (orangTua.length > 0) {
          setSelectedOrangTuaId(orangTua[0].id);
          await fetchProfil(orangTua[0].id, "super_admin");
          await fetchData(orangTua[0].id, "super_admin");
        } else setLoading(false);
      }
    } catch (error) { console.error(error); setLoading(false); }
  };

  const fetchData = async (userId, role) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_riwayat_anak.php?user_id=${userId}`);
      const data = await response.json();

      if (data.status === "success") {
        const processedAnakList = data.data.map((anak) => ({
          ...anak,
          id: Number(anak.id),
          riwayat: (anak.riwayat || []).map((r) => ({
            ...r,
            tinggi_badan: Number(r.tinggi_badan),
            berat_badan: Number(r.berat_badan),
            z_score: r.z_score ? Number(r.z_score) : null,
            status_gizi: r.status_gizi,
          })),
        }));

        if (role === "orang_tua") {
          updateAnakList(processedAnakList, userId, role);
        } else {
          setAnakListForSuperAdmin(processedAnakList);
          if (processedAnakList.length > 0 && !superAdminSelectedAnak) setSuperAdminSelectedAnak(processedAnakList[0]);
        }

        setStats({
          totalAnak: processedAnakList.length,
          normal: processedAnakList.filter((a) => a.riwayat?.slice(-1)[0]?.status_gizi === "Normal").length,
          stunting: processedAnakList.filter((a) => a.riwayat?.slice(-1)[0]?.status_gizi === "Stunting").length,
          giziKurang: processedAnakList.filter((a) => ["Pra-stunting", "Wasting"].includes(a.riwayat?.slice(-1)[0]?.status_gizi)).length,
        });
      } else if (data.status === "empty") {
        if (role === "orang_tua") updateAnakList([], userId, role);
        else { setAnakListForSuperAdmin([]); setSuperAdminSelectedAnak(null); }
        setStats({ totalAnak: 0, normal: 0, stunting: 0, giziKurang: 0 });
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleOrangTuaChange = async (userId) => {
    setSelectedOrangTuaId(userId);
    setSuperAdminSelectedAnak(null);
    setSuperAdminProfilData(null);
    await fetchProfil(userId, "super_admin");
    await fetchData(userId, "super_admin");
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

  const selectedOrangTua = orangTuaList.find((o) => o.id === selectedOrangTuaId);
  const displayAnakData = userRole === "orang_tua" ? selectedAnakData : superAdminSelectedAnak;
  const displayAnakList = userRole === "orang_tua" ? anakList : superAdminAnakList;
  const currentStatusGizi = latestMeasurement?.status_gizi || null;

  const statusBadgeClass = {
    Normal: "bg-green-100 text-green-800",
    Stunting: "bg-red-100 text-red-800",
    "Pra-stunting": "bg-yellow-100 text-yellow-800",
    Wasting: "bg-orange-100 text-orange-800",
    "Gizi Lebih": "bg-blue-100 text-blue-800",
    "Gizi Berlebih": "bg-purple-100 text-purple-800",
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={fas.faHouse} className="text-2xl text-sigizi-green" />
            <h1 className="text-xl font-bold text-gray-800">Dashboard Orang Tua</h1>
          </div>
        </header>

        <main className="p-6 overflow-y-auto">
          {/* SUPER ADMIN: Info + Dropdown Orang Tua */}
          {userRole === "super_admin" && orangTuaList.length > 0 && (
            <div className="mb-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <FontAwesomeIcon icon={fas.faUsers} className="text-blue-600" />
                <h3 className="font-semibold text-blue-800">Mode Super Admin</h3>
              </div>
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Dropdown Orang Tua */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-blue-700 mb-1">
                    <FontAwesomeIcon icon={fas.faUser} className="mr-1" /> Pilih Orang Tua
                  </label>
                  <select
                    value={selectedOrangTuaId || ""}
                    onChange={(e) => handleOrangTuaChange(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {orangTuaList.map((ot) => (
                      <option key={ot.id} value={ot.id}>
                        {ot.nama_lengkap} - {ot.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dropdown Anak (Super Admin) */}
                {superAdminAnakList.length > 0 && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      <FontAwesomeIcon icon={fas.faBaby} className="mr-1" /> Pilih Anak
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setSuperAdminShowAnakDropdown(!superAdminShowAnakDropdown)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-blue-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      >
                        <div className="flex items-center gap-3">
                          {superAdminSelectedAnak ? (
                            <>
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sigizi-green to-sigizi-light-green flex items-center justify-center text-white font-bold text-sm">
                                {superAdminSelectedAnak.nama_anak?.charAt(0).toUpperCase()}
                              </div>
                              <div className="text-left">
                                <p className="font-semibold text-gray-800">{superAdminSelectedAnak.nama_anak}</p>
                                <p className="text-xs text-gray-500">Lahir: {superAdminSelectedAnak.tanggal_lahir}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={fas.faBaby} className="text-sigizi-green text-xl" />
                              <span className="text-gray-700">Pilih Anak</span>
                            </>
                          )}
                        </div>
                        <FontAwesomeIcon icon={fas.faChevronDown} className="text-gray-400" />
                      </button>

                      {superAdminShowAnakDropdown && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setSuperAdminShowAnakDropdown(false)}></div>
                          <div className="absolute left-0 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                            <div className="p-2 max-h-96 overflow-y-auto">
                              {superAdminAnakList.map((anak) => {
                                const isSelected = superAdminSelectedAnak?.id === anak.id;
                                const lastStatus = anak.riwayat?.slice(-1)[0]?.status_gizi;
                                const badgeCls = getStatusBadgeClass(lastStatus);
                                return (
                                  <button
                                    key={anak.id}
                                    onClick={() => handleSuperAdminAnakChange(anak)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all mb-1 ${isSelected ? "bg-sigizi-green/10 border border-sigizi-green/20" : "hover:bg-gray-50"}`}
                                  >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${isSelected ? "bg-sigizi-green" : "bg-gray-400"}`}>
                                      {anak.nama_anak?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 text-left">
                                      <p className="font-semibold text-gray-800">{anak.nama_anak}</p>
                                      <div className="flex items-center gap-2 text-xs mt-0.5">
                                        <span className="text-gray-500">{anak.tanggal_lahir}</span>
                                        {lastStatus && (<span className={`font-medium px-1.5 py-0.5 rounded ${badgeCls}`}>{lastStatus}</span>)}
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
                  </div>
                )}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                <FontAwesomeIcon icon={fas.faInfoCircle} className="mr-1" />
                Pemilihan anak hanya untuk tampilan saat ini, tidak tersimpan antar menu
              </p>
            </div>
          )}

          {/* ORANG TUA: Dropdown Anak */}
          {userRole === "orang_tua" && displayAnakList.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Anak</label>
              <div className="relative">
                <button
                  onClick={() => setShowAnakDropdown(!showAnakDropdown)}
                  className="w-full md:w-80 flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sigizi-green transition"
                >
                  <div className="flex items-center gap-3">
                    {displayAnakData ? (
                      <>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sigizi-green to-sigizi-light-green flex items-center justify-center text-white font-bold text-sm">
                          {displayAnakData.nama_anak?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-800">{displayAnakData.nama_anak}</p>
                          <p className="text-xs text-gray-500">Lahir: {displayAnakData.tanggal_lahir}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={fas.faBaby} className="text-sigizi-green text-xl" />
                        <span className="text-gray-700">Pilih Anak</span>
                      </>
                    )}
                  </div>
                  <FontAwesomeIcon icon={fas.faChevronDown} className="text-gray-400" />
                </button>

                {showAnakDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowAnakDropdown(false)}></div>
                    <div className="absolute left-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                      <div className="p-2 max-h-96 overflow-y-auto">
                        {displayAnakList.map((anak) => {
                          const isSelected = selectedAnakId === anak.id;
                          const lastStatus = anak.riwayat?.slice(-1)[0]?.status_gizi;
                          const badgeCls = getStatusBadgeClass(lastStatus);
                          return (
                            <button
                              key={anak.id}
                              onClick={() => { updateSelectedAnak(anak.id, anak, currentUserId); setShowAnakDropdown(false); }}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all mb-1 ${isSelected ? "bg-sigizi-green/10 border border-sigizi-green/20" : "hover:bg-gray-50"}`}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${isSelected ? "bg-sigizi-green" : "bg-gray-400"}`}>
                                {anak.nama_anak?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-semibold text-gray-800">{anak.nama_anak}</p>
                                <div className="flex items-center gap-2 text-xs mt-0.5">
                                  <span className="text-gray-500">{anak.tanggal_lahir}</span>
                                  {lastStatus && (<span className={`font-medium px-1.5 py-0.5 rounded ${badgeCls}`}>{lastStatus}</span>)}
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
            </div>
          )}

          {/* Info Super Admin (selected user) */}
          {userRole === "super_admin" && selectedOrangTua && (
            <div className="mb-6">
              <p className="text-sm text-blue-600 mb-2">
                Menampilkan data untuk: <strong>{selectedOrangTua.nama_lengkap}</strong>
              </p>
            </div>
          )}

          {/* Statistik Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-sigizi-green">
              <div className="flex items-center justify-between">
                <div><p className="text-gray-500 text-sm">Total Anak</p><p className="text-2xl font-bold">{stats.totalAnak}</p></div>
                <FontAwesomeIcon icon={fas.faBaby} className="text-3xl text-sigizi-green opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div><p className="text-gray-500 text-sm">Status Normal</p><p className="text-2xl font-bold text-green-600">{stats.normal}</p></div>
                <FontAwesomeIcon icon={fas.faCheckCircle} className="text-3xl text-green-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div><p className="text-gray-500 text-sm">Gizi Kurang</p><p className="text-2xl font-bold text-yellow-600">{stats.giziKurang}</p></div>
                <FontAwesomeIcon icon={fas.faExclamationTriangle} className="text-3xl text-yellow-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div><p className="text-gray-500 text-sm">Stunting</p><p className="text-2xl font-bold text-red-600">{stats.stunting}</p></div>
                <FontAwesomeIcon icon={fas.faChild} className="text-3xl text-red-500 opacity-50" />
              </div>
            </div>
          </div>

          {/* Pesan kosong */}
          {displayAnakList.length === 0 && (
            <div className="bg-yellow-50 rounded-xl p-8 text-center mb-6">
              <FontAwesomeIcon icon={fas.faBaby} className="text-4xl text-yellow-500 mb-3" />
              <p className="text-gray-600 font-medium">Belum ada data anak</p>
              <p className="text-gray-500 text-sm mt-1">Silakan tambah data anak di menu Data Anak</p>
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
                    Verifikasi: {displayAnakData.status_verifikasi || "Menunggu"}
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
                      <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold ${
                        latestMeasurement.status_gizi === "Normal"
                          ? "bg-green-500 text-white"
                          : latestMeasurement.status_gizi === "Stunting"
                          ? "bg-red-500 text-white"
                          : latestMeasurement.status_gizi === "Pra-stunting" || latestMeasurement.status_gizi === "Pra-Stunting" || latestMeasurement.status_gizi === "Gizi Berlebih"
                          ? "bg-yellow-400 text-yellow-900"
                          : "bg-white/20 text-white"
                      }`}>
                        <FontAwesomeIcon icon={fas.faChartLine} />
                        <span>{latestMeasurement.status_gizi}</span>
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

          {/* KARTU DATA DIRI ORANG TUA */}
          {userRole === "orang_tua" && user && (
            <DataDiriOrangTua 
              user={user} 
              profilData={profilData} 
              navigate={navigate} 
            />
          )}

          {/* KARTU DATA DIRI ORANG TUA - MODE SUPER ADMIN */}
          {userRole === "super_admin" && selectedOrangTua && (
            <DataDiriOrangTua 
              user={selectedOrangTua} 
              profilData={superAdminProfilData} 
              navigate={navigate} 
            />
          )}

          {/* Edukasi */}
          <EdukasiSection status={currentStatusGizi} />
        </main>
      </div>
    </div>
  );
}