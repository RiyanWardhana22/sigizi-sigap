<?php
require_once 'config.php';

try {
            $bulan_ini = date('m');
            $tahun_ini = date('Y');

            $bulan_lalu = date('m', strtotime('-1 month'));
            $tahun_lalu = date('Y', strtotime('-1 month'));
            $query = "
        SELECT 
            w.nama_kabupaten as name,
            SUM(CASE WHEN MONTH(p.tanggal_pengukuran) = :b_ini AND YEAR(p.tanggal_pengukuran) = :t_ini AND p.status_gizi = 'Stunting' THEN 1 ELSE 0 END) as stunting_ini,
            SUM(CASE WHEN MONTH(p.tanggal_pengukuran) = :b_lalu AND YEAR(p.tanggal_pengukuran) = :t_lalu AND p.status_gizi = 'Stunting' THEN 1 ELSE 0 END) as stunting_lalu,
            SUM(CASE WHEN MONTH(p.tanggal_pengukuran) = :b_ini AND YEAR(p.tanggal_pengukuran) = :t_ini AND p.status_gizi = 'Pra-stunting' THEN 1 ELSE 0 END) as pra_ini,
            SUM(CASE WHEN MONTH(p.tanggal_pengukuran) = :b_lalu AND YEAR(p.tanggal_pengukuran) = :t_lalu AND p.status_gizi = 'Pra-stunting' THEN 1 ELSE 0 END) as pra_lalu
        FROM wilayah w
        LEFT JOIN anak a ON w.id = a.wilayah_id
        LEFT JOIN pengukuran p ON a.id = p.anak_id
        GROUP BY w.id, w.nama_kabupaten
    ";

            $stmt = $conn->prepare($query);
            $stmt->bindParam(':b_ini', $bulan_ini);
            $stmt->bindParam(':t_ini', $tahun_ini);
            $stmt->bindParam(':b_lalu', $bulan_lalu);
            $stmt->bindParam(':t_lalu', $tahun_lalu);
            $stmt->execute();

            $raw_data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $alerts = [];
            $prestasi = [];

            foreach ($raw_data as $row) {
                        $nama = str_replace(['Kabupaten ', 'Kota '], '', $row['name']);
                        $selisih_stunting = $row['stunting_ini'] - $row['stunting_lalu'];
                        $selisih_pra = $row['pra_ini'] - $row['pra_lalu'];
                        if ($selisih_stunting > 0 || $selisih_pra > 0) {
                                    $alerts[] = [
                                                "wilayah" => $nama,
                                                "pesan" => ($selisih_stunting > 0 ? "Stunting naik $selisih_stunting kasus. " : "") . ($selisih_pra > 0 ? "Pra-stunting naik $selisih_pra kasus." : ""),
                                                "tingkat" => $selisih_stunting > 0 ? "Bahaya" : "Waspada"
                                    ];
                        }
                        if ($selisih_stunting < 0 || $selisih_pra < 0) {
                                    $total_turun = abs($selisih_stunting) + abs($selisih_pra);
                                    $prestasi[] = [
                                                "wilayah" => $nama,
                                                "skor" => $total_turun,
                                                "pesan" => "Berhasil menurunkan total $total_turun kasus kerentanan bulan ini."
                                    ];
                        }
            }
            usort($prestasi, function ($a, $b) {
                        return $b['skor'] <=> $a['skor'];
            });

            echo json_encode([
                        "status" => "success",
                        "data" => [
                                    "peringatan" => $alerts,
                                    "prestasi" => array_slice($prestasi, 0, 5)
                        ]
            ]);
} catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
