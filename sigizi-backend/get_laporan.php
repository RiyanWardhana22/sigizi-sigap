<?php
require_once 'config.php';
$bulan = isset($_GET['bulan']) ? $_GET['bulan'] : 'semua';
$tahun = isset($_GET['tahun']) ? $_GET['tahun'] : 'semua';
$filter_sql = "";
if ($bulan !== 'semua' && $tahun !== 'semua') {
    $b = intval($bulan);
    $t = intval($tahun);
    $filter_sql = " AND MONTH(p.tanggal_pengukuran) = $b AND YEAR(p.tanggal_pengukuran) = $t ";
} elseif ($tahun !== 'semua') {
    $t = intval($tahun);
    $filter_sql = " AND YEAR(p.tanggal_pengukuran) = $t ";
} elseif ($bulan !== 'semua') {
    $b = intval($bulan);
    $filter_sql = " AND MONTH(p.tanggal_pengukuran) = $b ";
}

try {
    $query = "
        SELECT 
            w.nama_kabupaten,
            COUNT(CASE WHEN (SELECT id FROM pengukuran p WHERE p.anak_id = a.id $filter_sql LIMIT 1) IS NOT NULL THEN 1 END) as total_anak,
            SUM(CASE WHEN (SELECT status_gizi FROM pengukuran p WHERE p.anak_id = a.id $filter_sql ORDER BY tanggal_pengukuran DESC LIMIT 1) = 'Stunting' THEN 1 ELSE 0 END) as total_stunting,
            SUM(CASE WHEN (SELECT status_gizi FROM pengukuran p WHERE p.anak_id = a.id $filter_sql ORDER BY tanggal_pengukuran DESC LIMIT 1) = 'Pra-stunting' THEN 1 ELSE 0 END) as total_prastunting,
            SUM(CASE WHEN (SELECT status_gizi FROM pengukuran p WHERE p.anak_id = a.id $filter_sql ORDER BY tanggal_pengukuran DESC LIMIT 1) = 'Normal' THEN 1 ELSE 0 END) as total_normal
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
