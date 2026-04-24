<?php
require_once 'config.php';

try {
            $query = "
        SELECT 
            w.nama_kabupaten as name,
            COALESCE(aw.p_sanitasi, 0) as akses_sanitasi,
            COALESCE(aw.p_air, 0) as akses_air,
            COALESCE(aw.penghasilan, 0) as pendapatan,
            COUNT(DISTINCT CASE WHEN (SELECT status_gizi FROM pengukuran p WHERE p.anak_id = a.id ORDER BY tanggal_pengukuran DESC LIMIT 1) = 'Stunting' THEN a.id END) as total_stunting
        FROM wilayah w
        LEFT JOIN agregat_wilayah aw ON w.nama_kabupaten = aw.kabupaten_kota
        LEFT JOIN anak a ON w.id = a.wilayah_id
        GROUP BY w.id, w.nama_kabupaten, aw.p_sanitasi, aw.p_air, aw.penghasilan
        ORDER BY total_stunting DESC
        LIMIT 15 -- Kita ambil 15 daerah teratas agar grafik korelasi mudah dibaca
    ";

            $stmt = $conn->prepare($query);
            $stmt->execute();

            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["status" => "success", "data" => $data]);
} catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Kesalahan Sistem: " . $e->getMessage()]);
}
