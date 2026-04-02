<?php
require_once 'config.php';

try {
            $query = "
        SELECT 
            a.id, a.nama_anak, a.tanggal_lahir, a.jenis_kelamin, 
            u.nama_lengkap AS nama_orang_tua,
            (SELECT status_gizi FROM pengukuran p WHERE p.anak_id = a.id ORDER BY tanggal_pengukuran DESC LIMIT 1) AS status_gizi_terakhir,
            (SELECT tinggi_badan FROM pengukuran p WHERE p.anak_id = a.id ORDER BY tanggal_pengukuran DESC LIMIT 1) AS tinggi_terakhir,
            (SELECT berat_badan FROM pengukuran p WHERE p.anak_id = a.id ORDER BY tanggal_pengukuran DESC LIMIT 1) AS berat_terakhir
        FROM anak a
        JOIN users u ON a.orang_tua_id = u.id
        ORDER BY a.created_at DESC
    ";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $data]);
} catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Kesalahan Sistem: " . $e->getMessage()]);
}
