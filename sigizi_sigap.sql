-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 28, 2026 at 09:21 AM
-- Server version: 8.0.30
-- PHP Version: 8.3.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sigizi_sigap`
--

-- --------------------------------------------------------

--
-- Table structure for table `agregat_wilayah`
--

CREATE TABLE `agregat_wilayah` (
  `id` int NOT NULL,
  `kabupaten_kota` varchar(100) NOT NULL,
  `p_bblr` decimal(6,2) DEFAULT NULL,
  `p_gizi_buruk` decimal(6,2) DEFAULT NULL,
  `p_sanitasi` decimal(6,2) DEFAULT NULL,
  `p_air` decimal(6,2) DEFAULT NULL,
  `p_ibu` decimal(6,2) DEFAULT NULL,
  `penghasilan` decimal(15,2) DEFAULT NULL,
  `tingkat_kerentanan` varchar(50) DEFAULT NULL,
  `tanggal_input` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `agregat_wilayah`
--

INSERT INTO `agregat_wilayah` (`id`, `kabupaten_kota`, `p_bblr`, `p_gizi_buruk`, `p_sanitasi`, `p_air`, `p_ibu`, `penghasilan`, `tingkat_kerentanan`, `tanggal_input`) VALUES
(1, 'Nias', '50.00', '50.00', '70.00', '80.00', '35.00', '1500000.00', 'Tinggi', '2026-04-18 12:11:39');

-- --------------------------------------------------------

--
-- Table structure for table `anak`
--

CREATE TABLE `anak` (
  `id` int NOT NULL,
  `orang_tua_id` int NOT NULL,
  `nama_anak` varchar(150) NOT NULL,
  `tanggal_lahir` date NOT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `wilayah_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status_verifikasi` enum('Menunggu','Disetujui') DEFAULT 'Menunggu'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `anak`
--

INSERT INTO `anak` (`id`, `orang_tua_id`, `nama_anak`, `tanggal_lahir`, `jenis_kelamin`, `wilayah_id`, `created_at`, `updated_at`, `status_verifikasi`) VALUES
(4, 2, 'Yusuf Al-Hafiz', '2025-04-02', 'L', 1, '2026-04-02 07:00:34', '2026-04-07 16:57:37', 'Disetujui'),
(5, 6, 'riski', '2023-02-08', 'L', 1, '2026-04-18 09:21:54', '2026-04-18 09:21:54', 'Menunggu'),
(11, 6, 'Rafa Pratama', '2020-04-27', 'L', 30, '2026-04-27 11:50:40', '2026-04-27 11:50:40', 'Disetujui'),
(19, 6, 'zee', '2026-03-01', 'L', 1, '2026-04-28 03:49:57', '2026-04-28 03:49:57', 'Menunggu');

-- --------------------------------------------------------

--
-- Table structure for table `dataset_kerentanan`
--

CREATE TABLE `dataset_kerentanan` (
  `id` int NOT NULL,
  `wilayah_id` int NOT NULL,
  `tahun` year NOT NULL,
  `rata_penghasilan_keluarga` decimal(5,3) DEFAULT NULL,
  `sanitasi_buruk` decimal(5,3) DEFAULT NULL,
  `air_bersih` decimal(5,3) DEFAULT NULL,
  `akses_layanan_kesehatan` decimal(5,3) DEFAULT NULL,
  `klaster` int DEFAULT NULL,
  `kategori_risiko` enum('rendah','sedang','tinggi','sangat tinggi') DEFAULT NULL,
  `pred_random_forest` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `edukasi`
--

CREATE TABLE `edukasi` (
  `id` int NOT NULL,
  `judul` varchar(200) NOT NULL,
  `deskripsi` text,
  `gambar_url` text,
  `tag` varchar(100) DEFAULT NULL,
  `waktu_baca` varchar(50) DEFAULT NULL,
  `channel` varchar(150) DEFAULT NULL,
  `thumbnail_url` text,
  `durasi` varchar(20) DEFAULT NULL,
  `tipe_konten` enum('Video_YouTube','Artikel') NOT NULL,
  `url_konten` text NOT NULL,
  `target_status_gizi` enum('Normal','Pra-stunting','Stunting','Wasting','Semua') DEFAULT 'Semua',
  `rekomendasi_usia_min_bulan` int DEFAULT '0',
  `rekomendasi_usia_max_bulan` int DEFAULT '60',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `edukasi`
--

INSERT INTO `edukasi` (`id`, `judul`, `deskripsi`, `gambar_url`, `tag`, `waktu_baca`, `channel`, `thumbnail_url`, `durasi`, `tipe_konten`, `url_konten`, `target_status_gizi`, `rekomendasi_usia_min_bulan`, `rekomendasi_usia_max_bulan`, `created_at`) VALUES
(1, 'Pentingnya Protein Hewani untuk Pertumbuhan Anak', 'Protein hewani seperti telur, ikan, dan daging mengandung asam amino esensial yang krusial untuk perkembangan otak dan otot balita.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiWRAPiyjG2dHX2svTrREBb8Jm41_DQZYgpw&s', 'Nutrisi', '5 menit baca', NULL, NULL, NULL, 'Artikel', 'https://www.kemkes.go.id/id/protein-hewani-efektif-cegah-anak-alami-stunting', 'Normal', 0, 60, '2026-04-28 05:20:34'),
(2, 'Jadwal Makan Ideal untuk Balita', 'Atur jadwal makan 3x utama dan 2x selingan sehari agar kebutuhan energi dan nutrisi balita terpenuhi secara optimal.', 'https://d1bpj0tv6vfxyp.cloudfront.net/articles/116293_2-3-2021_13-44-49.png', 'Pola Makan', '4 menit baca', NULL, NULL, NULL, 'Artikel', 'https://www.halodoc.com/artikel/pentingnya-jadwal-makan-agar-balita-makan-teratur', 'Normal', 0, 60, '2026-04-28 05:20:34'),
(3, 'Tips Mengatasi Anak Pilih-Pilih Makanan (Picky Eater)', 'Strategi praktis agar anak mau makan beragam makanan bergizi, dari cara penyajian hingga pelibatan anak dalam memasak.', 'https://foto.kontan.co.id/Bn7PY6Cvt67Y2II_GTfMy37cpS0=/smart/filters:format(webp)/2024/09/24/864598847.jpg', 'Parenting', '6 menit baca', NULL, NULL, NULL, 'Artikel', 'https://www.halodoc.com/artikel/7-tips-agar-anak-tidak-pilih-pilih-makanan', 'Normal', 0, 60, '2026-04-28 05:20:34'),
(4, 'Pentingnya Imunisasi dan Vitamin A untuk Anak', 'Imunisasi dasar lengkap dan suplementasi vitamin A melindungi anak dari penyakit serta mendukung pertumbuhan yang optimal.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm6uJmUCYudvjgtFXWeHxTrTEd3aZY4HVE2w&s', 'Kesehatan', '5 menit baca', NULL, NULL, NULL, 'Artikel', 'https://ayosehat.kemkes.go.id/vitamin-a-untuk-anak', 'Normal', 0, 60, '2026-04-28 05:20:34'),
(5, 'Cara Membuat Bekal Sehat dan Menarik untuk Anak', NULL, NULL, 'Bekal Sehat', NULL, 'tri pujis', 'https://i.ytimg.com/vi/S5FDTRx32wk/hqdefault.jpg', '9:04', 'Video_YouTube', 'https://youtu.be/S5FDTRx32wk?si=TbeSzpQL1uOYNq_x', 'Normal', 0, 60, '2026-04-28 05:20:34'),
(6, 'Resep MPASI Bergizi Tinggi untuk Bayi 6 Bulan', NULL, NULL, 'MPASI', NULL, 'Marina Anggraeni', 'https://i.ytimg.com/vi/J04JGL5sTfU/hq720.jpg', '4:53', 'Video_YouTube', 'https://youtu.be/J04JGL5sTfU?si=KEE6EZw2Kcv2hItC', 'Normal', 0, 60, '2026-04-28 05:20:34'),
(7, 'Edukasi Parenting: Tumbuh Kembang Anak 0-5 Tahun', NULL, NULL, 'Tumbuh Kembang', NULL, 'Pusat Terapi Bermain', 'https://i.ytimg.com/vi/77Tx7enc5EM/hq720.jpg', '2:25', 'Video_YouTube', 'https://youtu.be/77Tx7enc5EM?si=P_WeXyZNE9LHYaJ4', 'Normal', 0, 60, '2026-04-28 05:20:34'),
(8, 'Tanda Awal Anak Berisiko Stunting yang Wajib Diketahui', 'Kenali tanda-tanda dini risiko stunting seperti berat badan tidak naik, tinggi badan di bawah grafik, dan sering sakit.', 'https://d1vbn70lmn1nqe.cloudfront.net/prod/wp-content/uploads/2023/01/05124136/Ibu-Harus-Tahu-Ini-Ciri-Ciri-Stunting-pada-Anak-1.jpg.webp', 'Deteksi Dini', '4 menit baca', NULL, NULL, NULL, 'Artikel', 'https://www.halodoc.com/artikel/gejala-stunting', 'Pra-stunting', 0, 60, '2026-04-28 05:20:34'),
(9, 'Cara Efektif Meningkatkan Nafsu Makan Anak', 'Berbagai trik terbukti untuk membangkitkan selera makan anak yang susah makan agar kebutuhan kalori hariannya terpenuhi.', 'https://d1vbn70lmn1nqe.cloudfront.net/prod/wp-content/uploads/2026/04/14025908/cara-mengajarkan-anak-membaca-6.jpg.webp', 'Nafsu Makan', '6 menit baca', NULL, NULL, NULL, 'Artikel', 'https://www.halodoc.com/artikel/anak-susah-makan-ini-cara-menambah-nafsu-makan-anak', 'Pra-stunting', 0, 60, '2026-04-28 05:20:34'),
(10, 'Makanan Penambah Berat Badan Anak', 'Daftar makanan padat gizi seperti alpukat, kacang-kacangan, dan ubi jalar yang efektif mendukung peningkatan berat badan.', 'https://d1vbn70lmn1nqe.cloudfront.net/prod/wp-content/uploads/2026/03/02045826/makanan-penambah-berat-badan-anak.jpg', 'Nutrisi', '5 menit baca', NULL, NULL, NULL, 'Artikel', 'https://www.halodoc.com/artikel/booster-makanan-penambah-berat-badan-anak-sehat', 'Pra-stunting', 0, 60, '2026-04-28 05:20:34'),
(11, 'Protein Hewani Efektif Cegah Anak Alami Stunting', 'Protein hewani berkualitas tinggi dari empat sumber utama ini adalah kunci mencegah stunting dan mendukung perkembangan kognitif anak.', 'https://healtheroes.id/wp-content/uploads/2024/07/65543891a68e71511231700018321.png', 'Protein Hewani', '6 menit baca', NULL, NULL, NULL, 'Artikel', 'https://kemkes.go.id/eng/protein-hewani-efektif-cegah-anak-alami-stunting', 'Pra-stunting', 0, 60, '2026-04-28 05:20:34'),
(12, 'Berbagai Makanan untuk Mencegah STUNTING', NULL, NULL, 'Menu Bergizi', NULL, 'Dokter Raissa Djuanda', 'https://i.ytimg.com/vi/CqJTLTjuxSs/hq720.jpg', '4:14', 'Video_YouTube', 'https://youtu.be/CqJTLTjuxSs?si=dfAme44dQHZUXy1u', 'Pra-stunting', 0, 60, '2026-04-28 05:20:34'),
(13, 'Pencegahan Stunting Sejak Dini', NULL, NULL, 'Pencegahan', NULL, 'UNICEF Indonesia', 'https://i.ytimg.com/vi/qGaOBnI91vo/hq720.jpg', '2:18', 'Video_YouTube', 'https://youtu.be/qGaOBnI91vo?si=kKNp3Q6xeh2vDFci', 'Pra-stunting', 0, 60, '2026-04-28 05:20:34'),
(14, 'Cara Masak Makanan Bergizi dengan Anggaran Terbatas', NULL, NULL, 'Tips Masak', NULL, 'The Cooking Doc', 'https://i.ytimg.com/vi/wPJjCE3OZ3U/hq720.jpg', '7:14', 'Video_YouTube', 'https://youtu.be/wPJjCE3OZ3U?si=qB0KB9dPjDR8fhPf', 'Pra-stunting', 0, 60, '2026-04-28 05:20:34'),
(15, 'Apa Itu Stunting dan Dampak Jangka Panjangnya', 'Pahami definisi, penyebab, dan dampak stunting terhadap kecerdasan, produktivitas, dan kesehatan anak hingga dewasa.', 'https://keslan.kemkes.go.id/img/bg-img/gambarartikel_1661498786_242330.jpg', 'Pengetahuan Dasar', '8 menit baca', NULL, NULL, NULL, 'Artikel', 'https://keslan.kemkes.go.id/view_artikel/1388/mengenal-apa-itu-stunting', 'Stunting', 0, 60, '2026-04-28 05:20:34'),
(16, 'Strategi Mengejar Pertumbuhan (Catch-up Growth) Anak Stunting', 'Langkah-langkah intervensi gizi intensif untuk membantu anak stunting mengejar ketertinggalan pertumbuhan tinggi dan berat badan.', 'https://asset.kompas.com/crops/EXWfPHxFfzRxk4mJvoypjSyDlaE=/0x0:1999x1333/660x440/data/photo/2022/07/15/62d0fd0e72bbb.jpg', 'Intervensi Gizi', '5 menit baca', NULL, NULL, NULL, 'Artikel', 'https://genbest.kompas.com/read/2022/07/16/110700220/catch-up-growth-ini-jadi-cara-perbaiki-tumbuh-kembang-anak-stunting', 'Stunting', 0, 60, '2026-04-28 05:20:34'),
(17, 'Makanan Tinggi Protein untuk Pemulihan Stunting', 'Panduan menu harian padat protein dan mikronutrien seperti zinc, zat besi, dan kalsium yang diperlukan untuk catch-up growth optimal.', 'https://www.family.abbott/content/dam/an/familyabbott/id-id/pediasure/tools-and-resources/infos-about-child-growth/nutrition/makanan-tinggi-protein-untuk-anak-stunting/daftar-makanan-bergizi-makanan-tinggi-protein-untuk-anak-stunting.jpg', 'Pemulihan Gizi', '6 menit baca', NULL, NULL, NULL, 'Artikel', 'https://www.family.abbott/id-id/pediasure/tools-and-resources/infos-about-child-growth/nutrition/makanan-tinggi-protein-untuk-anak-stunting.html', 'Stunting', 0, 60, '2026-04-28 05:20:34'),
(18, 'Pentingnya Pemeriksaan Rutin ke Posyandu', 'Pemantauan pertumbuhan berkala di posyandu sangat penting untuk evaluasi perkembangan penanganan stunting.', 'https://ayosehat.kemkes.go.id/imagex/content/0903e09c088d985da9b8fbb90797197a.webp', 'Layanan Kesehatan', '2 menit baca', NULL, NULL, NULL, 'Artikel', 'https://ayosehat.kemkes.go.id/pentingnya-mengukur-status-gizi-anak-secara-rutin', 'Stunting', 0, 60, '2026-04-28 05:20:34'),
(19, 'Penanganan Stunting – Penjelasan Dokter Spesialis Anak', NULL, NULL, 'Penanganan Medis', NULL, 'Mayapada Hospital', 'https://i.ytimg.com/vi/w8b6ipQvv9w/hq720.jpg', '15:56', 'Video_YouTube', 'https://youtu.be/w8b6ipQvv9w?si=bc2unECUDSwHMmQB', 'Stunting', 0, 60, '2026-04-28 05:20:34'),
(20, 'Menu Pemulihan Gizi Anak Stunting – Resep Praktis', NULL, NULL, 'Resep Pemulihan', NULL, 'Yanti Louis', 'https://i.ytimg.com/vi/TN51O9kbAq4/hq720.jpg', '11:42', 'Video_YouTube', 'https://youtu.be/TN51O9kbAq4?si=lglekQidQYB3v7mU', 'Stunting', 0, 60, '2026-04-28 05:20:34'),
(21, 'Edukasi Resmi Kemenkes: Cegah dan Atasi Stunting', NULL, NULL, 'Edukasi Resmi', NULL, 'Kementrian Kesehatan RI', 'https://i.ytimg.com/vi/C5GW-uLfzTA/hq720.jpg', '25:25', 'Video_YouTube', 'https://youtu.be/C5GW-uLfzTA?si=WEth9At5Pg_x1Zt-', 'Stunting', 0, 60, '2026-04-28 05:20:34');

-- --------------------------------------------------------

--
-- Table structure for table `pengukuran`
--

CREATE TABLE `pengukuran` (
  `id` int NOT NULL,
  `anak_id` int NOT NULL,
  `tanggal_pengukuran` date NOT NULL,
  `tinggi_badan` decimal(5,2) NOT NULL,
  `berat_badan` decimal(5,2) NOT NULL,
  `lingkar_kepala` decimal(5,2) DEFAULT NULL,
  `z_score` decimal(5,2) DEFAULT NULL,
  `status_gizi` enum('Normal','Pra-stunting','Stunting','Wasting','Gizi Lebih') DEFAULT NULL,
  `diinput_oleh` int NOT NULL,
  `sumber_data` enum('Aplikasi_Mobile','Web_Dinkes','Offline_Sync') DEFAULT 'Aplikasi_Mobile',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pengukuran`
--

INSERT INTO `pengukuran` (`id`, `anak_id`, `tanggal_pengukuran`, `tinggi_badan`, `berat_badan`, `lingkar_kepala`, `z_score`, `status_gizi`, `diinput_oleh`, `sumber_data`, `created_at`) VALUES
(1, 4, '2026-04-02', '80.00', '8.00', NULL, '1.00', 'Normal', 2, 'Aplikasi_Mobile', '2026-04-02 07:00:34'),
(2, 5, '2026-04-18', '118.00', '26.30', NULL, '-2.50', 'Pra-stunting', 6, 'Aplikasi_Mobile', '2026-04-18 09:21:54'),
(4, 5, '2026-04-18', '120.00', '55.00', NULL, '-2.50', 'Pra-stunting', 6, 'Aplikasi_Mobile', '2026-04-18 12:30:41'),
(17, 11, '2020-05-27', '52.00', '3.80', '36.00', '0.10', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(18, 11, '2020-06-27', '54.00', '4.50', '37.50', '0.12', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(19, 11, '2020-07-27', '56.00', '5.10', '39.00', '0.15', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(20, 11, '2020-08-27', '58.00', '5.80', '40.00', '0.18', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(21, 11, '2020-09-27', '60.00', '6.40', '41.00', '0.20', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(22, 11, '2020-10-27', '62.00', '7.00', '42.00', '0.22', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(23, 11, '2020-11-27', '64.00', '7.50', '43.00', '0.25', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(24, 11, '2020-12-27', '66.00', '8.00', '44.00', '0.28', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(25, 11, '2021-01-27', '68.00', '8.40', '45.00', '0.30', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(26, 11, '2021-02-27', '70.00', '8.80', '45.50', '0.32', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(27, 11, '2021-03-27', '71.50', '9.20', '46.00', '0.35', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(28, 11, '2021-04-27', '73.00', '9.60', '46.50', '0.38', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(29, 11, '2021-05-27', '74.00', '9.90', '47.00', '0.40', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(30, 11, '2021-06-27', '75.00', '10.20', '47.30', '0.42', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(31, 11, '2021-07-27', '76.00', '10.50', '47.60', '0.44', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(32, 11, '2021-08-27', '77.00', '10.80', '47.90', '0.45', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(33, 11, '2021-09-27', '78.00', '11.10', '48.10', '0.46', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(34, 11, '2021-10-27', '79.00', '11.40', '48.30', '0.47', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(35, 11, '2021-11-27', '80.00', '11.70', '48.50', '0.48', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(36, 11, '2021-12-27', '81.00', '12.00', '48.70', '0.49', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(37, 11, '2022-01-27', '82.00', '12.20', '48.90', '0.50', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(38, 11, '2022-02-27', '83.00', '12.40', '49.10', '0.51', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(39, 11, '2022-03-27', '84.00', '12.60', '49.30', '0.52', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(40, 11, '2022-04-27', '85.00', '12.80', '49.50', '0.53', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(41, 11, '2022-05-27', '86.00', '13.00', NULL, '0.54', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(42, 11, '2022-06-27', '87.00', '13.20', NULL, '0.55', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(43, 11, '2022-07-27', '88.00', '13.40', NULL, '0.56', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(44, 11, '2022-08-27', '89.00', '13.60', NULL, '0.57', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(45, 11, '2022-09-27', '90.00', '13.80', NULL, '0.58', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(46, 11, '2022-10-27', '91.00', '14.00', NULL, '0.59', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(47, 11, '2022-11-27', '92.00', '14.20', NULL, '0.60', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(48, 11, '2022-12-27', '93.00', '14.40', NULL, '0.61', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(49, 11, '2023-01-27', '94.00', '14.60', NULL, '0.62', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(50, 11, '2023-02-27', '95.00', '14.80', NULL, '0.63', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(51, 11, '2023-03-27', '96.00', '15.00', NULL, '0.64', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(52, 11, '2023-04-27', '97.00', '15.20', NULL, '0.65', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(53, 11, '2023-05-27', '98.00', '15.40', NULL, '0.66', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(54, 11, '2023-06-27', '99.00', '15.60', NULL, '0.67', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(55, 11, '2023-07-27', '100.00', '15.80', NULL, '0.68', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(56, 11, '2023-08-27', '101.00', '16.00', NULL, '0.69', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(57, 11, '2023-09-27', '102.00', '16.20', NULL, '0.70', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(58, 11, '2023-10-27', '103.00', '16.40', NULL, '0.71', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(59, 11, '2023-11-27', '104.00', '16.60', NULL, '0.72', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(60, 11, '2023-12-27', '105.00', '16.80', NULL, '0.73', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(61, 11, '2024-01-27', '106.00', '17.00', NULL, '0.74', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(62, 11, '2024-02-27', '107.00', '17.20', NULL, '0.75', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(63, 11, '2024-03-27', '108.00', '17.40', NULL, '0.76', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(64, 11, '2024-04-27', '109.00', '17.60', NULL, '0.77', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(65, 11, '2024-05-27', '110.00', '17.80', NULL, '0.78', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(66, 11, '2024-06-27', '111.00', '18.00', NULL, '0.79', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(67, 11, '2024-07-27', '112.00', '18.20', NULL, '0.80', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(68, 11, '2024-08-27', '113.00', '18.40', NULL, '0.81', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(69, 11, '2024-09-27', '114.00', '18.60', NULL, '0.82', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(70, 11, '2024-10-27', '115.00', '18.80', NULL, '0.83', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(71, 11, '2024-11-27', '116.00', '19.00', NULL, '0.84', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(72, 11, '2024-12-27', '117.00', '19.20', NULL, '0.85', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(73, 11, '2025-01-27', '118.00', '19.40', NULL, '0.86', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(74, 11, '2025-02-27', '119.00', '19.60', NULL, '0.87', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(75, 11, '2025-03-27', '120.00', '19.80', NULL, '0.88', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(76, 11, '2025-04-27', '121.00', '20.00', NULL, '0.89', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(77, 11, '2025-05-27', '121.50', '20.20', NULL, '0.90', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(78, 11, '2025-06-27', '122.00', '20.40', NULL, '0.91', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(79, 11, '2025-07-27', '122.50', '20.60', NULL, '0.92', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(80, 11, '2025-08-27', '123.00', '20.80', NULL, '0.93', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(81, 11, '2025-09-27', '123.50', '21.00', NULL, '0.94', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(82, 11, '2025-10-27', '124.00', '21.20', NULL, '0.95', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(83, 11, '2025-11-27', '124.50', '21.40', NULL, '0.96', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(84, 11, '2025-12-27', '125.00', '21.60', NULL, '0.97', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(85, 11, '2026-01-27', '125.50', '21.80', NULL, '0.98', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(86, 11, '2026-02-27', '126.00', '22.00', NULL, '0.99', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(87, 11, '2026-03-27', '126.50', '22.20', NULL, '1.00', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(88, 11, '2026-04-27', '127.00', '22.50', NULL, '1.00', 'Normal', 6, 'Aplikasi_Mobile', '2026-04-27 11:50:40'),
(91, 19, '2026-04-28', '35.00', '5.00', '12.00', '-16.39', 'Stunting', 6, 'Aplikasi_Mobile', '2026-04-28 03:49:57');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `nama_lengkap` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','orang_tua','dinas_kesehatan','pemangku_kepentingan') DEFAULT 'orang_tua',
  `wilayah_id` int DEFAULT NULL,
  `status_aktif` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama_lengkap`, `email`, `password`, `role`, `wilayah_id`, `status_aktif`, `created_at`, `updated_at`) VALUES
(1, 'Administrator', 'admin@sigizi.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', NULL, 1, '2026-04-01 17:12:26', '2026-04-01 17:12:26'),
(2, 'Riyan Wardhana', 'riyanwardhana2@gmail.com', '$2y$10$MYOxExrT1YM2r822.Q1d6uXbvggT/tUT8PBIjKmBSf9/YHZnG3RJu', 'orang_tua', NULL, 1, '2026-04-01 17:59:08', '2026-04-01 17:59:08'),
(3, 'Joko Ui', 'jokoui@gmail.com', '$2y$10$TH8VgqPhN71iIzdb3JjCxuXCqza28e6ZRokt1oM9V2O6VxsnzHUqe', 'orang_tua', NULL, 1, '2026-04-07 17:53:07', '2026-04-07 17:53:07'),
(4, 'parent', 'parent@gmail.com', '$2y$10$y0Kl7jA/U5Avm/szI6.yXeaFcHJySxJnk/Lf313M9b.tubn8na3ve', 'orang_tua', NULL, 1, '2026-04-12 17:03:51', '2026-04-12 17:03:51'),
(5, 'Ki Prana Lewu', 'pranalewu@gmail.com', '$2y$10$gnmgWgIU3M11KVr0YB9mR.tapJBcIsuHJh2r7nlNnqgu8L6T55.AC', 'dinas_kesehatan', NULL, 1, '2026-04-17 14:46:38', '2026-04-17 14:46:38'),
(6, 'coba1', 'tes@gmail.com', '$2y$10$88PlaVf47Aw4M7dT2i5nWucUrunXPupkf8j.ur62rxli125N5S5cC', 'orang_tua', NULL, 1, '2026-04-18 09:18:11', '2026-04-18 17:29:22'),
(7, 'tes2', 'tes2@gmail.com', '$2y$10$DiZBP3vONqoKVww0KQLXXuxu6r2lUK5hzsWfEJoHfY5mbI2S2csFW', 'orang_tua', NULL, 1, '2026-04-18 10:24:45', '2026-04-18 10:24:45');

-- --------------------------------------------------------

--
-- Table structure for table `wilayah`
--

CREATE TABLE `wilayah` (
  `id` int NOT NULL,
  `nama_kabupaten` varchar(100) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `geojson` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `wilayah`
--

INSERT INTO `wilayah` (`id`, `nama_kabupaten`, `latitude`, `longitude`, `geojson`, `created_at`, `updated_at`) VALUES
(1, 'Nias', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(2, 'Mandailing Natal', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(3, 'Tapanuli Selatan', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(4, 'Tapanuli Tengah', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(5, 'Tapanuli Utara', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(6, 'Toba', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(7, 'Labuhanbatu', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(8, 'Asahan', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(9, 'Simalungun', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(10, 'Dairi', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(11, 'Karo', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(12, 'Deli Serdang', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(13, 'Langkat', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(14, 'Nias Selatan', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(15, 'Humbang Hasundutan', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(16, 'Pakpak Bharat', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(17, 'Samosir', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(18, 'Serdang Bedagai', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(19, 'Batu Bara', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(20, 'Padang Lawas Utara', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(21, 'Padang Lawas', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(22, 'Labuhanbatu Selatan', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(23, 'Labuhanbatu Utara', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(24, 'Nias Utara', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(25, 'Nias Barat', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(26, 'Kota Sibolga', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(27, 'Kota Tanjung Balai', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(28, 'Kota Pematangsiantar', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(29, 'Kota Tebing Tinggi', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(30, 'Kota Medan', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(31, 'Kota Binjai', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(32, 'Kota PadangSidempuan', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33'),
(33, 'Kota Gunungsitoli', NULL, NULL, NULL, '2026-04-02 06:59:33', '2026-04-02 06:59:33');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agregat_wilayah`
--
ALTER TABLE `agregat_wilayah`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_wilayah` (`kabupaten_kota`);

--
-- Indexes for table `anak`
--
ALTER TABLE `anak`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orang_tua_id` (`orang_tua_id`),
  ADD KEY `wilayah_id` (`wilayah_id`);

--
-- Indexes for table `dataset_kerentanan`
--
ALTER TABLE `dataset_kerentanan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wilayah_id` (`wilayah_id`);

--
-- Indexes for table `edukasi`
--
ALTER TABLE `edukasi`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pengukuran`
--
ALTER TABLE `pengukuran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `anak_id` (`anak_id`),
  ADD KEY `diinput_oleh` (`diinput_oleh`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `wilayah_id` (`wilayah_id`);

--
-- Indexes for table `wilayah`
--
ALTER TABLE `wilayah`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `agregat_wilayah`
--
ALTER TABLE `agregat_wilayah`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `anak`
--
ALTER TABLE `anak`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `dataset_kerentanan`
--
ALTER TABLE `dataset_kerentanan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `edukasi`
--
ALTER TABLE `edukasi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `pengukuran`
--
ALTER TABLE `pengukuran`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `wilayah`
--
ALTER TABLE `wilayah`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `anak`
--
ALTER TABLE `anak`
  ADD CONSTRAINT `anak_ibfk_1` FOREIGN KEY (`orang_tua_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `anak_ibfk_2` FOREIGN KEY (`wilayah_id`) REFERENCES `wilayah` (`id`);

--
-- Constraints for table `dataset_kerentanan`
--
ALTER TABLE `dataset_kerentanan`
  ADD CONSTRAINT `dataset_kerentanan_ibfk_1` FOREIGN KEY (`wilayah_id`) REFERENCES `wilayah` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pengukuran`
--
ALTER TABLE `pengukuran`
  ADD CONSTRAINT `pengukuran_ibfk_1` FOREIGN KEY (`anak_id`) REFERENCES `anak` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pengukuran_ibfk_2` FOREIGN KEY (`diinput_oleh`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`wilayah_id`) REFERENCES `wilayah` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
