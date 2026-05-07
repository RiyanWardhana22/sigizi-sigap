<?php
require_once 'config.php';
try {
    $query = "
        SELECT 
            a.id, a.nama_anak, a.tanggal_lahir, a.jenis_kelamin, a.status_verifikasi, a.created_at,
            u.nama_lengkap AS nama_orang_tua,
            u.email AS email_orang_tua,
            u.tanggal_lahir AS tanggal_lahir_ortu,
            u.pendidikan_ibu,
            u.penghasilan_range AS penghasilan_keluarga,
            u.kualitas_air AS sumber_air_bersih,
            u.sanitasi AS fasilitas_sanitasi,
            u.akses_kesehatan,
            w.nama_kabupaten,
            (SELECT status_gizi FROM pengukuran p WHERE p.anak_id = a.id ORDER BY tanggal_pengukuran DESC LIMIT 1) AS status_gizi,
            (SELECT tinggi_badan FROM pengukuran p WHERE p.anak_id = a.id ORDER BY tanggal_pengukuran DESC LIMIT 1) AS tinggi_badan,
            (SELECT berat_badan FROM pengukuran p WHERE p.anak_id = a.id ORDER BY tanggal_pengukuran DESC LIMIT 1) AS berat_badan,
            (SELECT lingkar_kepala FROM pengukuran p WHERE p.anak_id = a.id ORDER BY tanggal_pengukuran DESC LIMIT 1) AS lingkar_kepala,
            (SELECT z_score FROM pengukuran p WHERE p.anak_id = a.id ORDER BY tanggal_pengukuran DESC LIMIT 1) AS z_score
        FROM anak a
        JOIN users u ON a.orang_tua_id = u.id
        LEFT JOIN wilayah w ON a.wilayah_id = w.id
        ORDER BY a.created_at DESC
    ";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["status" => "success", "data" => $data]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Kesalahan Sistem: " . $e->getMessage()]);
}
