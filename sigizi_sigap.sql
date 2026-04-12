-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 10, 2026 at 07:09 AM
-- Server version: 8.0.42
-- PHP Version: 8.3.22

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
(4, 2, 'Yusuf Al-Hafiz', '2025-04-02', 'L', 1, '2026-04-02 07:00:34', '2026-04-07 16:57:37', 'Disetujui');

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
  `tipe_konten` enum('Video_YouTube','Artikel') NOT NULL,
  `url_konten` text NOT NULL,
  `target_status_gizi` enum('Normal','Pra-stunting','Stunting','Wasting','Semua') DEFAULT 'Semua',
  `rekomendasi_usia_min_bulan` int DEFAULT '0',
  `rekomendasi_usia_max_bulan` int DEFAULT '60',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `z_score` decimal(5,2) DEFAULT NULL,
  `status_gizi` enum('Normal','Pra-stunting','Stunting','Wasting','Gizi Lebih') DEFAULT NULL,
  `diinput_oleh` int NOT NULL,
  `sumber_data` enum('Aplikasi_Mobile','Web_Dinkes','Offline_Sync') DEFAULT 'Aplikasi_Mobile',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pengukuran`
--

INSERT INTO `pengukuran` (`id`, `anak_id`, `tanggal_pengukuran`, `tinggi_badan`, `berat_badan`, `z_score`, `status_gizi`, `diinput_oleh`, `sumber_data`, `created_at`) VALUES
(1, 4, '2026-04-02', '80.00', '8.00', '1.00', 'Normal', 2, 'Aplikasi_Mobile', '2026-04-02 07:00:34');

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
(3, 'Joko Ui', 'jokoui@gmail.com', '$2y$10$TH8VgqPhN71iIzdb3JjCxuXCqza28e6ZRokt1oM9V2O6VxsnzHUqe', 'orang_tua', NULL, 1, '2026-04-07 17:53:07', '2026-04-07 17:53:07');

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
-- AUTO_INCREMENT for table `anak`
--
ALTER TABLE `anak`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `dataset_kerentanan`
--
ALTER TABLE `dataset_kerentanan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `edukasi`
--
ALTER TABLE `edukasi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pengukuran`
--
ALTER TABLE `pengukuran`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
