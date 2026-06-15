import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import HomepageNavbar from "./HomepageNavbar";
import { useLanguage } from "../contexts/LanguageContext";

// Data Artikel dengan key terjemahan
const SEMUA_ARTIKEL = [
  {
    id: "n1",
    judulKey: "homepage.artikel.normal.judul1",
    deskripsiKey: "homepage.artikel.normal.deskripsi1",
    gambar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiWRAPiyjG2dHX2svTrREBb8Jm41_DQZYgpw&s",
    tagKey: "homepage.artikel.normal.tag1",
    waktuKey: "homepage.artikel.normal.waktu1",
    url: "https://www.kemkes.go.id/id/protein-hewani-efektif-cegah-anak-alami-stunting",
    status: "Normal",
  },
  {
    id: "n2",
    judulKey: "homepage.artikel.normal.judul2",
    deskripsiKey: "homepage.artikel.normal.deskripsi2",
    gambar: "https://d1bpj0tv6vfxyp.cloudfront.net/articles/116293_2-3-2021_13-44-49.png",
    tagKey: "homepage.artikel.normal.tag2",
    waktuKey: "homepage.artikel.normal.waktu2",
    url: "https://www.halodoc.com/artikel/pentingnya-jadwal-makan-agar-balita-makan-teratur",
    status: "Normal",
  },
  {
    id: "n3",
    judulKey: "homepage.artikel.normal.judul3",
    deskripsiKey: "homepage.artikel.normal.deskripsi3",
    gambar: "https://foto.kontan.co.id/Bn7PY6Cvt67Y2II_GTfMy37cpS0=/smart/filters:format(webp)/2024/09/24/864598847.jpg",
    tagKey: "homepage.artikel.normal.tag3",
    waktuKey: "homepage.artikel.normal.waktu3",
    url: "https://www.halodoc.com/artikel/7-tips-agar-anak-tidak-pilih-pilih-makanan",
    status: "Normal",
  },
  {
    id: "r1",
    judulKey: "homepage.artikel.risiko.judul1",
    deskripsiKey: "homepage.artikel.risiko.deskripsi1",
    gambar: "https://d1vbn70lmn1nqe.cloudfront.net/prod/wp-content/uploads/2023/01/05124136/Ibu-Harus-Tahu-Ini-Ciri-Ciri-Stunting-pada-Anak-1.jpg.webp",
    tagKey: "homepage.artikel.risiko.tag1",
    waktuKey: "homepage.artikel.risiko.waktu1",
    url: "https://www.halodoc.com/artikel/gejala-stunting",
    status: "Berisiko Stunting",
  },
  {
    id: "r2",
    judulKey: "homepage.artikel.risiko.judul2",
    deskripsiKey: "homepage.artikel.risiko.deskripsi2",
    gambar: "https://healtheroes.id/wp-content/uploads/2024/07/65543891a68e71511231700018321.png",
    tagKey: "homepage.artikel.risiko.tag2",
    waktuKey: "homepage.artikel.risiko.waktu2",
    url: "https://kemkes.go.id/eng/protein-hewani-efektif-cegah-anak-alami-stunting",
    status: "Berisiko Stunting",
  },
  {
    id: "r3",
    judulKey: "homepage.artikel.risiko.judul3",
    deskripsiKey: "homepage.artikel.risiko.deskripsi3",
    gambar: "https://asset.kompas.com/crops/EXWfPHxFfzRxk4mJvoypjSyDlaE=/0x0:1999x1333/660x440/data/photo/2022/07/15/62d0fd0e72bbb.jpg",
    tagKey: "homepage.artikel.risiko.tag3",
    waktuKey: "homepage.artikel.risiko.waktu3",
    url: "https://genbest.kompas.com/read/2022/07/16/110700220/catch-up-growth-ini-jadi-cara-perbaiki-tumbuh-kembang-anak-stunting",
    status: "Berisiko Stunting",
  },
  {
    id: "r4",
    judulKey: "homepage.artikel.risiko.judul4",
    deskripsiKey: "homepage.artikel.risiko.deskripsi4",
    gambar: "https://www.family.abbott/content/dam/an/familyabbott/id-id/pediasure/tools-and-resources/infos-about-child-growth/nutrition/makanan-tinggi-protein-untuk-anak-stunting/daftar-makanan-bergizi-makanan-tinggi-protein-untuk-anak-stunting.jpg",
    tagKey: "homepage.artikel.risiko.tag4",
    waktuKey: "homepage.artikel.risiko.waktu4",
    url: "https://www.family.abbott/id-id/pediasure/tools-and-resources/infos-about-child-growth/nutrition/makanan-tinggi-protein-untuk-anak-stunting.html",
    status: "Berisiko Stunting",
  },
  {
    id: "r5",
    judulKey: "homepage.artikel.risiko.judul5",
    deskripsiKey: "homepage.artikel.risiko.deskripsi5",
    gambar: "https://ayosehat.kemkes.go.id/imagex/content/0903e09c088d985da9b8fbb90797197a.webp",
    tagKey: "homepage.artikel.risiko.tag5",
    waktuKey: "homepage.artikel.risiko.waktu5",
    url: "https://ayosehat.kemkes.go.id/pentingnya-mengukur-status-gizi-anak-secara-rutin",
    status: "Berisiko Stunting",
  },
  {
    id: "n4",
    judulKey: "homepage.artikel.normal.judul4",
    deskripsiKey: "homepage.artikel.normal.deskripsi4",
    gambar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm6uJmUCYudvjgtFXWeHxTrTEd3aZY4HVE2w&s",
    tagKey: "homepage.artikel.normal.tag4",
    waktuKey: "homepage.artikel.normal.waktu4",
    url: "https://ayosehat.kemkes.go.id/vitamin-a-untuk-anak",
    status: "Normal",
  },
];

// Data Berita dengan key terjemahan
const BERITA_DATA_KEYS = [
  {
    id: "b1",
    judulKey: "homepage.berita.items.b1.judul",
    ringkasanKey: "homepage.berita.items.b1.ringkasan",
    gambar: "https://akcdn.detik.net.id/community/media/visual/2026/06/11/kepala-dinkes-mataram-emirald-isfihan-1781179033177_169.jpeg?w=500&q=90",
    sumberKey: "homepage.berita.items.b1.sumber",
    tanggal: "11 Juni 2026",
    url: "https://www.detik.com/bali/nusra/d-8528247/1-000-anak-di-mataram-masih-stunting",
    kategoriKey: "homepage.berita.items.b1.kategori",
  },
  {
    id: "b2",
    judulKey: "homepage.berita.items.b2.judul",
    ringkasanKey: "homepage.berita.items.b2.ringkasan",
    gambar: "https://miniox.brin.go.id/website//uploads/images/posts//2025/05/1747119997-40444420.webp",
    sumberKey: "homepage.berita.items.b2.sumber",
    tanggal: "13 Mei 2025",
    url: "https://brin.go.id/news/123007/peneliti-brin-riset-pangan-lokal-untuk-cegah-stunting-di-gunungkidul-begini-hasilnya",
    kategoriKey: "homepage.berita.items.b2.kategori",
  },
  {
    id: "b3",
    judulKey: "homepage.berita.items.b3.judul",
    ringkasanKey: "homepage.berita.items.b3.ringkasan",
    gambar: "https://kemkes.go.id/app_asset/image_content/175440085368920855d9fd59.34952739.jpg",
    sumberKey: "homepage.berita.items.b3.sumber",
    tanggal: "4 Agustus 2025",
    url: "https://kemkes.go.id/id/program-cek-kesehatan-gratis-sekolah-dimulai-sasar-53-juta-pelajar-di-indonesia",
    kategoriKey: "homepage.berita.items.b3.kategori",
  },
  {
    id: "b4",
    judulKey: "homepage.berita.items.b4.judul",
    ringkasanKey: "homepage.berita.items.b4.ringkasan",
    gambar: "https://www.unicef.org/indonesia/sites/unicef.org.indonesia/files/styles/press_release_feature/public/MAC_0728_0.webp",
    sumberKey: "homepage.berita.items.b4.sumber",
    tanggal: "5 Maret 2026",
    url: "https://www.unicef.org/indonesia/id/gizi/siaran-pers/pemerintah-indonesia-dan-unicef-luncurkan-program-strategis-untuk-mempercepat",
    kategoriKey: "homepage.berita.items.b4.kategori",
  },
  {
    id: "b5",
    judulKey: "homepage.berita.items.b5.judul",
    ringkasanKey: "homepage.berita.items.b5.ringkasan",
    gambar: "https://tangerangkab.go.id/images/berita-c91f37e3-857d-4108-907b-2840656f77e1.jpeg",
    sumberKey: "homepage.berita.items.b5.sumber",
    tanggal: "18 Juli 2025",
    url: "https://tangerangkab.go.id/detail-berita/petasan-emas-inovasi-periksa-kualitas-air-dan-edukasi-masyarakat-untuk-atasi-stunting-di-kabupaten-tangerang",
    kategoriKey: "homepage.berita.items.b5.kategori",
  },
  {
    id: "b6",
    judulKey: "homepage.berita.items.b6.judul",
    ringkasanKey: "homepage.berita.items.b6.ringkasan",
    gambar: "https://img.antaranews.com/cache/1200x800/2026/03/23/IMG_20260323_161405-2.jpg",
    sumberKey: "homepage.berita.items.b6.sumber",
    tanggal: "26 Maret 2024",
    url: "https://megapolitan.antaranews.com/berita/516350/ratusan-balita-di-denpasar-ikuti-cek-kesehatan-gratis-tekan-stunting",
    kategoriKey: "homepage.berita.items.b6.kategori",
  },
];

// Helper untuk warna
const getWarnaStyle = (warna) => {
  const map = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    teal: "bg-teal-50 text-teal-600",
  };
  return map[warna] || "bg-gray-50 text-gray-600";
};

export default function Homepage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [filterTab, setFilterTab] = useState("Semua");
  const [expandedArtikelId, setExpandedArtikelId] = useState(null);
  const [expandedBeritaId, setExpandedBeritaId] = useState(null);

  // Render artikel dengan terjemahan dinamis
  const artikelTampil = SEMUA_ARTIKEL.filter(
    (a) => filterTab === "Semua" || a.status === filterTab
  ).slice(0, 6).map(artikel => ({
    ...artikel,
    judul: t(artikel.judulKey),
    deskripsi: t(artikel.deskripsiKey),
    tag: t(artikel.tagKey),
    waktu: t(artikel.waktuKey),
  }));

  // Render berita dengan terjemahan dinamis
  const beritaTampil = BERITA_DATA_KEYS.map(berita => ({
    ...berita,
    judul: t(berita.judulKey),
    ringkasan: t(berita.ringkasanKey),
    sumber: t(berita.sumberKey),
    kategori: t(berita.kategoriKey),
  }));

  // Statistik cards data dengan terjemahan
  const statistikData = [
    { angka: "21,5%", labelKey: "homepage.statistik.prevalensi", icon: fas.faChartBar },
    { angka: "8,5 Juta", labelKey: "homepage.statistik.anakTerpapar", icon: fas.faChildren },
    { angka: "3x Lebih", labelKey: "homepage.statistik.risikoKomorbiditas", icon: fas.faHeartPulse },
    { angka: "2045", labelKey: "homepage.statistik.targetBebasStunting", icon: fas.faFlagCheckered },
  ];

  // Data Fitur dengan terjemahan dinamis
  const fiturData = [
    {
      icon: fas.faChartLine,
      warna: "emerald",
      judul: t("homepage.fitur.pemantauanZscore"),
      deskripsi: t("homepage.fitur.pemantauanZscoreDesc"),
    },
    {
      icon: fas.faBrain,
      warna: "blue",
      judul: t("homepage.fitur.prediksiHotspot"),
      deskripsi: t("homepage.fitur.prediksiHotspotDesc"),
    },
    {
      icon: fas.faMapLocation,
      warna: "purple",
      judul: t("homepage.fitur.petaSpasial"),
      deskripsi: t("homepage.fitur.petaSpasialDesc"),
    },
    {
      icon: fas.faGraduationCap,
      warna: "amber",
      judul: t("homepage.fitur.edukasiGizi"),
      deskripsi: t("homepage.fitur.edukasiGiziDesc"),
    },
    {
      icon: fas.faFileLines,
      warna: "rose",
      judul: t("homepage.fitur.laporanAnalisis"),
      deskripsi: t("homepage.fitur.laporanAnalisisDesc"),
    },
    {
      icon: fas.faShieldHeart,
      warna: "teal",
      judul: t("homepage.fitur.dataAman"),
      deskripsi: t("homepage.fitur.dataAmanDesc"),
    },
  ];

  const toggleArtikel = (id) => {
    setExpandedArtikelId((prev) => (prev === id ? null : id));
  };
  const toggleBerita = (id) => {
    setExpandedBeritaId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="scroll-smooth">
      <HomepageNavbar />

      {/* SECTION 1: HERO */}
      <section
        id="beranda"
        className="relative min-h-screen pt-20 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #047857 25%, #059669 50%, #10b981 75%, #34d399 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-400 rounded-full blur-3xl"></div>
        </div>
        
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 2px, transparent 2px)",
            backgroundSize: "30px 30px",
          }}
        ></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="lg:grid lg:grid-cols-2 lg:items-center gap-12">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                {t("homepage.hero.title")} <br />
                <span className="text-emerald-200">{t("homepage.hero.titleHighlight")}</span>
              </h1>
              <p className="text-emerald-100 text-lg mt-4 mb-8 leading-relaxed">
                {t("homepage.hero.description")}
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-white text-emerald-700 font-bold px-8 py-3.5 rounded-xl hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2 group"
                >
                  <FontAwesomeIcon icon={fas.faArrowRightToBracket} className="group-hover:translate-x-1 transition-transform" /> {t("homepage.hero.login")}
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold px-8 py-3.5 rounded-xl border-2 border-white/30 hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg group"
                >
                  <FontAwesomeIcon icon={fas.faUserPlus} /> {t("homepage.hero.register")}
                  <FontAwesomeIcon icon={fas.faArrowRight} className="group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0" />
                </button>
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 bg-emerald-800/40 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full border border-emerald-500/30">
                  <FontAwesomeIcon icon={fas.faChild} className="text-emerald-300" />
                  <span>{t("homepage.hero.badgeAnakTerpantau")}</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-800/40 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full border border-emerald-500/30">
                  <FontAwesomeIcon icon={fas.faChartLine} className="text-emerald-300" />
                  <span>{t("homepage.hero.badgeAkurasi")}</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-800/40 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full border border-emerald-500/30">
                  <FontAwesomeIcon icon={fas.faClock} className="text-emerald-300" />
                  <span>{t("homepage.hero.badgeAkses")}</span>
                </div>
              </div>
            </div>

            <div className="relative mt-12 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-800 rounded-3xl shadow-2xl p-6 border border-emerald-500/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="font-bold text-white">{t("homepage.hero.cardTitle")}</span>
                  </div>
                  <div className="bg-emerald-500/30 backdrop-blur-sm text-emerald-200 text-xs font-bold px-2 py-1 rounded-full border border-emerald-400/50">
                    {t("homepage.hero.cardBadge")}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-emerald-200 font-medium">{t("homepage.hero.statusNormal")}</span>
                      <span className="text-emerald-300 font-bold">65%</span>
                    </div>
                    <div className="w-full bg-emerald-900/50 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-emerald-400 to-emerald-300 h-2.5 rounded-full w-[65%] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-emerald-200 font-medium">{t("homepage.hero.statusPraStunting")}</span>
                      <span className="text-amber-300 font-bold">25%</span>
                    </div>
                    <div className="w-full bg-emerald-900/50 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-2.5 rounded-full w-[25%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-emerald-200 font-medium">{t("homepage.hero.statusStunting")}</span>
                      <span className="text-red-300 font-bold">10%</span>
                    </div>
                    <div className="w-full bg-emerald-900/50 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-red-400 to-red-500 h-2.5 rounded-full w-[10%]"></div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-emerald-600/50">
                  <div className="bg-emerald-800/50 backdrop-blur-sm rounded-xl p-3 text-center border border-emerald-600/50">
                    <p className="text-xs text-emerald-300 font-medium">{t("homepage.hero.rataBB")}</p>
                    <p className="font-bold text-white text-lg">12.4 kg</p>
                  </div>
                  <div className="bg-emerald-800/50 backdrop-blur-sm rounded-xl p-3 text-center border border-emerald-600/50">
                    <p className="text-xs text-emerald-300 font-medium">{t("homepage.hero.rataTB")}</p>
                    <p className="font-bold text-white text-lg">87 cm</p>
                  </div>
                </div>

                <div className="absolute -top-3 -right-3 w-16 h-16 bg-emerald-400 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-emerald-300 rounded-full opacity-20 blur-xl"></div>
              </div>

              <div className="absolute -top-4 -left-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce border border-white/30">
                <FontAwesomeIcon icon={fas.faCheckCircle} className="text-white" /> {t("homepage.hero.verifiedBadge")}
              </div>
              <div className="absolute -bottom-4 -right-4 bg-emerald-800/95 backdrop-blur-sm text-emerald-200 text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-emerald-500/50">
                <FontAwesomeIcon icon={fas.faBell} className="text-emerald-400 animate-pulse" /> {t("homepage.hero.realtimeBadge")}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-12 lg:h-16"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill="#f9fafb"
              opacity="1"
            ></path>
          </svg>
        </div>
      </section>

      {/* SECTION 2: FITUR UTAMA */}
      <section id="fitur" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-2 rounded-full mb-4">
              <FontAwesomeIcon icon={fas.faRocket} /> {t("homepage.fitur.badge")}
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t("homepage.fitur.title")}
            </h2>
            <p className="text-gray-600 text-lg">
              {t("homepage.fitur.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fiturData.map((fitur, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${getWarnaStyle(
                    fitur.warna
                  )} flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <FontAwesomeIcon icon={fitur.icon} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {fitur.judul}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {fitur.deskripsi}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: STATISTIK NASIONAL */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-emerald-600 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
            <circle cx="200" cy="200" r="150" fill="white" />
            <circle cx="800" cy="800" r="200" fill="white" />
            <circle cx="500" cy="500" r="100" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-full mb-4">
              <FontAwesomeIcon icon={fas.faChartSimple} /> {t("homepage.statistik.badge")}
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              {t("homepage.statistik.title")}
            </h2>
            <p className="text-emerald-100 text-lg">
              {t("homepage.statistik.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {statistikData.map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur rounded-2xl p-6 text-white text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
                <FontAwesomeIcon icon={stat.icon} className="text-3xl mb-3 text-emerald-300" />
                <p className="text-3xl font-bold">{stat.angka}</p>
                <p className="text-sm text-emerald-100 mt-1">{t(stat.labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: ARTIKEL EDUKASI */}
      <section id="artikel" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                <FontAwesomeIcon icon={fas.faBookOpen} /> {t("homepage.artikel.badge")}
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {t("homepage.artikel.title")}
              </h2>
              <p className="text-gray-500 mt-2 text-base max-w-xl">
                {t("homepage.artikel.subtitle")}
              </p>
            </div>
            <div className="flex gap-0 border-b border-gray-200 self-end">
              {[
                { key: "Semua", label: t("homepage.artikel.tabSemua") },
                { key: "Normal", label: t("homepage.artikel.tabNormal") },
                { key: "Berisiko Stunting", label: t("homepage.artikel.tabBerisiko") }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterTab(tab.key)}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    filterTab === tab.key
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured Article */}
            {artikelTampil[0] && (
              <div
                onClick={() => toggleArtikel(artikelTampil[0].id)}
                className={`group lg:row-span-2 bg-white rounded-2xl border overflow-hidden shadow-sm cursor-pointer transition-all duration-300
                  ${expandedArtikelId === artikelTampil[0].id
                    ? 'border-emerald-400 shadow-emerald-100 shadow-lg ring-2 ring-emerald-200'
                    : 'border-gray-100 hover:shadow-lg hover:border-emerald-200'
                  } flex flex-col`}
              >
                <div className="relative overflow-hidden h-52">
                  <img
                    src={artikelTampil[0].gambar}
                    alt={artikelTampil[0].judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {artikelTampil[0].tag}
                  </span>
                  <div className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300
                    ${expandedArtikelId === artikelTampil[0].id
                      ? 'bg-emerald-600 text-white rotate-180'
                      : 'bg-white/80 text-gray-500'
                    }`}>
                    <FontAwesomeIcon icon={fas.faChevronDown} className="text-xs" />
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className={`font-extrabold text-xl leading-snug transition-colors mb-2 text-justify
                    ${expandedArtikelId === artikelTampil[0].id ? 'text-emerald-700' : 'text-gray-900 group-hover:text-emerald-700'}`}>
                    {artikelTampil[0].judul}
                  </h3>
                  
                  <div className={`card-expansion-panel ${expandedArtikelId === artikelTampil[0].id ? 'expanded' : 'collapsed'}`}>
                    <div className="animate-expandIn pt-0">
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 text-justify">
                        {artikelTampil[0].deskripsi}
                      </p>
                      <a
                        href={artikelTampil[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {t("homepage.artikel.readFull")}
                        <FontAwesomeIcon icon={fas.faArrowUpRightFromSquare} className="text-xs" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className={`text-sm font-bold flex items-center gap-1.5 transition-all
                      ${expandedArtikelId === artikelTampil[0].id ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'}`}>
                      {expandedArtikelId === artikelTampil[0].id ? t("homepage.artikel.close") : t("homepage.artikel.readMore")}
                      <FontAwesomeIcon icon={expandedArtikelId === artikelTampil[0].id ? fas.faChevronUp : fas.faChevronDown} className="text-xs" />
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FontAwesomeIcon icon={fas.faClock} /> {artikelTampil[0].waktu}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Articles */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {artikelTampil.slice(1).map((artikel) => (
                <div
                  key={artikel.id}
                  onClick={() => toggleArtikel(artikel.id)}
                  className={`group flex flex-col bg-white rounded-xl border shadow-sm cursor-pointer transition-all duration-300
                    ${expandedArtikelId === artikel.id
                      ? 'border-emerald-400 shadow-emerald-100 shadow-md ring-2 ring-emerald-100'
                      : 'border-gray-100 hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5'
                    }`}
                >
                  <div className="flex gap-4 p-4">
                    <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden">
                      <img
                        src={artikel.gambar}
                        alt={artikel.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    </div>
                    <div className="flex flex-col justify-between min-w-0 flex-1">
                      <div>
                        <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded mb-1.5">
                          {artikel.tag}
                        </span>
                        <h3 className={`font-bold text-sm leading-snug transition-colors
                          ${expandedArtikelId === artikel.id ? 'text-emerald-700' : 'text-gray-800 group-hover:text-emerald-700'}`}>
                          {artikel.judul}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FontAwesomeIcon icon={fas.faClock} /> {artikel.waktu}
                        </span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                          ${expandedArtikelId === artikel.id
                            ? 'bg-emerald-600 text-white rotate-180'
                            : 'bg-gray-100 text-gray-400'
                          }`}>
                          <FontAwesomeIcon icon={fas.faChevronDown} className="text-xs" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`card-expansion-panel ${expandedArtikelId === artikel.id ? 'expanded' : 'collapsed'}`}>
                    <div className="animate-expandIn px-4 pb-4 pt-0">
                      <p className="text-gray-600 text-sm leading-relaxed mb-3 text-justify">
                        {artikel.deskripsi}
                      </p>
                      <a
                        href={artikel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {t("homepage.artikel.readArticle")} <FontAwesomeIcon icon={fas.faArrowUpRightFromSquare} className="text-xs" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: BERITA KESEHATAN ANAK */}
      <section id="berita" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                <FontAwesomeIcon icon={fas.faNewspaper} /> {t("homepage.berita.badge")}
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {t("homepage.berita.title")}
              </h2>
              <p className="text-gray-500 mt-2 text-base max-w-xl">
                {t("homepage.berita.subtitle")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Featured Berita */}
              {beritaTampil[0] && (
                <div
                  onClick={() => toggleBerita(beritaTampil[0].id)}
                  className={`group lg:col-span-2 bg-white rounded-2xl border overflow-hidden shadow-sm cursor-pointer transition-all duration-300 flex flex-col
                    ${expandedBeritaId === beritaTampil[0].id
                      ? 'border-emerald-400 shadow-lg shadow-emerald-100 ring-2 ring-emerald-200'
                      : 'border-gray-100 hover:shadow-lg hover:border-emerald-100'
                    }`}
                >
                  <div className="relative overflow-hidden h-52">
                    <img
                      src={beritaTampil[0].gambar}
                      alt={beritaTampil[0].judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                    <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {beritaTampil[0].kategori}
                    </span>
                    <div className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300
                      ${expandedBeritaId === beritaTampil[0].id
                        ? 'bg-emerald-600 text-white rotate-180'
                        : 'bg-white/80 text-gray-500'
                      }`}>
                      <FontAwesomeIcon icon={fas.faChevronDown} className="text-xs" />
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                        {beritaTampil[0].sumber}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FontAwesomeIcon icon={fas.faCalendar} className="text-gray-300" />
                        {beritaTampil[0].tanggal}
                      </span>
                    </div>
                    <h3 className={`font-bold text-lg leading-snug transition-colors mb-2
                      ${expandedBeritaId === beritaTampil[0].id ? 'text-emerald-700' : 'text-gray-900 group-hover:text-emerald-700'}`}>
                      {beritaTampil[0].judul}
                    </h3>
                    
                    <div className={`card-expansion-panel ${expandedBeritaId === beritaTampil[0].id ? 'expanded' : 'collapsed'}`}>
                      <div className="animate-expandIn pt-2">
                        <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3 mb-3 text-justify">
                          {beritaTampil[0].ringkasan}
                        </p>
                        <a
                          href={beritaTampil[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          {t("homepage.berita.readNews")} <FontAwesomeIcon icon={fas.faArrowUpRightFromSquare} className="text-xs" />
                        </a>
                      </div>
                    </div>
                    
                    <span className={`text-sm font-semibold flex items-center gap-1.5 mt-auto pt-3 transition-colors
                      ${expandedBeritaId === beritaTampil[0].id ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'}`}>
                      {expandedBeritaId === beritaTampil[0].id ? t("homepage.artikel.close") : t("homepage.berita.readSummary")}
                      <FontAwesomeIcon icon={expandedBeritaId === beritaTampil[0].id ? fas.faChevronUp : fas.faChevronDown} className="text-xs" />
                    </span>
                  </div>
                </div>
              )}

              {/* Grid 2x2 Berita */}
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {beritaTampil.slice(1, 5).map((berita) => (
                  <div
                    key={berita.id}
                    onClick={() => toggleBerita(berita.id)}
                    className={`group flex flex-col bg-white rounded-xl border shadow-sm cursor-pointer transition-all duration-300
                      ${expandedBeritaId === berita.id
                        ? 'border-emerald-400 shadow-emerald-100 shadow-md ring-1 ring-emerald-200'
                        : 'border-gray-100 hover:shadow-md hover:border-emerald-100'
                      }`}
                  >
                    <div className="flex gap-3 p-4">
                      <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden">
                        <img
                          src={berita.gambar}
                          alt={berita.judul}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      </div>
                      <div className="flex flex-col justify-between min-w-0 flex-1">
                        <div>
                          <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded mb-1">
                            {berita.kategori}
                          </span>
                          <span className="bg-gray-100 text-gray-500 text-xs px-1 py-0.5 rounded mb-1 m-1.5">
                            {berita.sumber}
                          </span>
                          <h3 className={`font-bold text-sm leading-snug transition-colors
                            ${expandedBeritaId === berita.id ? 'text-emerald-700' : 'text-gray-800 group-hover:text-emerald-700'}`}>
                            {berita.judul}
                          </h3>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <FontAwesomeIcon icon={fas.faCalendar} className="text-gray-300" />
                            {berita.tanggal}
                          </span>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300
                            ${expandedBeritaId === berita.id
                              ? 'bg-emerald-600 text-white rotate-180'
                              : 'bg-gray-100 text-gray-400'
                            }`}>
                            <FontAwesomeIcon icon={fas.faChevronDown} className="text-[10px]" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`card-expansion-panel ${expandedBeritaId === berita.id ? 'expanded' : 'collapsed'}`}>
                      <div className="animate-expandIn px-4 pb-4 pt-0">
                        <p className="text-gray-600 text-xs leading-relaxed mb-3 text-justify">{berita.ringkasan}</p>
                        <a
                          href={berita.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                        >
                          {t("homepage.berita.readNews")} <FontAwesomeIcon icon={fas.faArrowUpRightFromSquare} className="text-[10px]" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Berita ke-6 Full-width */}
            {beritaTampil[5] && (
              <div
                onClick={() => toggleBerita(beritaTampil[5].id)}
                className={`group flex flex-col bg-white rounded-2xl border overflow-hidden shadow-sm cursor-pointer transition-all duration-300
                  ${expandedBeritaId === beritaTampil[5].id
                    ? 'border-emerald-400 shadow-emerald-100 shadow-md ring-2 ring-emerald-200'
                    : 'border-gray-100 hover:shadow-md hover:border-emerald-100'
                  }`}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-48 h-40 sm:h-auto shrink-0 overflow-hidden">
                    <img
                      src={beritaTampil[5].gambar}
                      alt={beritaTampil[5].judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded">
                          {beritaTampil[5].kategori}
                        </span>
                        <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">
                          {beritaTampil[5].sumber}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FontAwesomeIcon icon={fas.faCalendar} className="text-gray-300" />
                          {beritaTampil[5].tanggal}
                        </span>
                      </div>
                      <h3 className={`font-bold text-base leading-snug transition-colors
                        ${expandedBeritaId === beritaTampil[5].id ? 'text-emerald-700' : 'text-gray-900 group-hover:text-emerald-700'}`}>
                        {beritaTampil[5].judul}
                      </h3>
                      
                      <div className={`card-expansion-panel ${expandedBeritaId === beritaTampil[5].id ? 'expanded' : 'collapsed'}`}>
                        <div className="animate-expandIn pt-0">
                          <p className="text-gray-600 text-sm leading-relaxed mt-2 mb-3 text-justify">
                            {beritaTampil[5].ringkasan}
                          </p>
                          <a
                            href={beritaTampil[5].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200"
                          >
                            {t("homepage.berita.readNews")} <FontAwesomeIcon icon={fas.faArrowUpRightFromSquare} className="text-xs" />
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                      ${expandedBeritaId === beritaTampil[5].id
                        ? 'bg-emerald-600 text-white rotate-180'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                      }`}>
                      <FontAwesomeIcon icon={fas.faChevronDown} className="text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 6: CTA */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-emerald-600 to-emerald-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
            <circle cx="100" cy="100" r="80" fill="white" />
            <circle cx="900" cy="900" r="120" fill="white" />
            <circle cx="500" cy="500" r="60" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {t("homepage.cta.title")}
          </h2>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-8">
            {t("homepage.cta.description")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate("/register")} className="bg-white text-emerald-700 font-bold px-8 py-3.5 rounded-xl hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              {t("homepage.hero.register")}
            </button>
            <button onClick={() => navigate("/login")} className="bg-emerald-500 text-white font-bold px-8 py-3.5 rounded-xl border-2 border-white/30 hover:bg-emerald-400 transition-all transform hover:-translate-y-0.5">
              {t("homepage.hero.login")}
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/logo_footer.png" 
                  alt="SI-GIZI SIGAP Logo" 
                  className="h-14 w-auto object-contain brightness-40 invert"
                />
                <span className="text-white font-bold text-xl">{t("homepage.footer.brand")}</span>
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {t("homepage.footer.description")}
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all duration-300">
                  <FontAwesomeIcon icon={fab.faLinkedin} />
                </a>
                <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all duration-300">
                  <FontAwesomeIcon icon={fab.faInstagram} />
                </a>
                <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all duration-300">
                  <FontAwesomeIcon icon={fab.faTwitter} />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4 text-lg">{t("homepage.footer.navigation")}</h3>
              <ul className="space-y-3">
                {[
                  { key: "beranda", label: t("homepage.nav.beranda"), href: "#beranda" },
                  { key: "fitur", label: t("homepage.nav.fitur"), href: "#fitur" },
                  { key: "artikel", label: t("homepage.nav.artikel"), href: "#artikel" },
                  { key: "berita", label: t("homepage.nav.berita"), href: "#berita" }
                ].map((item) => (
                  <li key={item.key}>
                    <a href={item.href} className="text-gray-400 hover:text-emerald-400 transition text-sm flex items-center gap-2">
                      <FontAwesomeIcon icon={fas.faChevronRight} className="text-emerald-500 text-xs" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4 text-lg">{t("homepage.footer.services")}</h3>
              <ul className="space-y-3">
                <li className="text-gray-400 text-sm flex items-center gap-2">
                  <FontAwesomeIcon icon={fas.faChartLine} className="text-emerald-500 text-xs" />
                  {t("homepage.fitur.pemantauanZscore")}
                </li>
                <li className="text-gray-400 text-sm flex items-center gap-2">
                  <FontAwesomeIcon icon={fas.faBrain} className="text-emerald-500 text-xs" />
                  {t("homepage.fitur.prediksiHotspot")}
                </li>
                <li className="text-gray-400 text-sm flex items-center gap-2">
                  <FontAwesomeIcon icon={fas.faMapLocation} className="text-emerald-500 text-xs" />
                  {t("homepage.fitur.petaSpasial")}
                </li>
                <li className="text-gray-400 text-sm flex items-center gap-2">
                  <FontAwesomeIcon icon={fas.faFileLines} className="text-emerald-500 text-xs" />
                  {t("homepage.fitur.laporanAnalisis")}
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4 text-lg">{t("homepage.footer.contact")}</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center gap-3">
                  <FontAwesomeIcon icon={fas.faEnvelope} className="text-emerald-500" />
                  sigizisigap@gmail.com
                </li>
                <li className="flex items-center gap-3">
                  <FontAwesomeIcon icon={fas.faPhone} className="text-emerald-500" />
                  (061) 123-4567
                </li>
                <li className="flex items-center gap-3">
                  <FontAwesomeIcon icon={fas.faLocationDot} className="text-emerald-500" />
                  {t("homepage.footer.address")}
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">© 2025 SI-GIZI SIGAP. {t("homepage.footer.copyright")}</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 2s infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce { animation: bounce 2s ease-in-out infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes expandIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-expandIn {
          animation: expandIn 0.25s ease-out forwards;
        }
        .card-expansion-panel {
          overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.3s ease;
        }
        .card-expansion-panel.expanded {
          max-height: 300px;
          opacity: 1;
        }
        .card-expansion-panel.collapsed {
          max-height: 0;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}