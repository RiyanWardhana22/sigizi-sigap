<?php
require_once 'config.php';
try {
    $query = "
        SELECT 
            w.nama_kabupaten,
            COUNT(a.id) as total_anak,
            SUM(CASE WHEN (SELECT status_gizi FROM pengukuran p WHERE p.anak_id = a.id ORDER BY tanggal_pengukuran DESC LIMIT 1) = 'Stunting' THEN 1 ELSE 0 END) as total_stunting,
            SUM(CASE WHEN (SELECT status_gizi FROM pengukuran p WHERE p.anak_id = a.id ORDER BY tanggal_pengukuran DESC LIMIT 1) = 'Pra-stunting' THEN 1 ELSE 0 END) as total_prastunting,
            SUM(CASE WHEN (SELECT status_gizi FROM pengukuran p WHERE p.anak_id = a.id ORDER BY tanggal_pengukuran DESC LIMIT 1) = 'Normal' THEN 1 ELSE 0 END) as total_normal
        FROM wilayah w
        LEFT JOIN anak a ON w.id = a.wilayah_id
        GROUP BY w.id, w.nama_kabupaten
        ORDER BY total_stunting DESC, total_prastunting DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute();

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $data]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Kesalahan Sistem: " . $e->getMessage()]);
}
