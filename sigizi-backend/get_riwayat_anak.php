<?php
require_once 'config.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : '';

if (!empty($user_id)) {
    try {
        // Ambil data anak dari tabel anak
        $query_anak = "SELECT id, nama_anak, tanggal_lahir, jenis_kelamin, status_verifikasi 
                       FROM anak WHERE orang_tua_id = :uid ORDER BY id ASC";
        $stmt_anak = $conn->prepare($query_anak);
        $stmt_anak->bindParam(":uid", $user_id);
        $stmt_anak->execute();
        $anak_list = $stmt_anak->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($anak_list) > 0) {
            foreach ($anak_list as $key => &$anak) {
                // Pastikan ID adalah integer
                $anak['id'] = (int)$anak['id'];
                
                // Ambil riwayat pengukuran dari tabel pengukuran untuk setiap anak
                $query_ukur = "SELECT tanggal_pengukuran, tinggi_badan, berat_badan, 
                                      lingkar_kepala, z_score, status_gizi 
                               FROM pengukuran 
                               WHERE anak_id = :aid 
                               ORDER BY tanggal_pengukuran ASC";
                $stmt_ukur = $conn->prepare($query_ukur);
                $stmt_ukur->bindParam(":aid", $anak['id']);
                $stmt_ukur->execute();
                $riwayat = $stmt_ukur->fetchAll(PDO::FETCH_ASSOC);
                
                // Konversi tipe data untuk riwayat
                foreach ($riwayat as &$r) {
                    $r['tinggi_badan'] = (float)$r['tinggi_badan'];
                    $r['berat_badan'] = (float)$r['berat_badan'];
                    $r['z_score'] = $r['z_score'] !== null ? (float)$r['z_score'] : null;
                    $r['lingkar_kepala'] = $r['lingkar_kepala'] !== null ? (float)$r['lingkar_kepala'] : null;
                }
                
                $anak['riwayat'] = $riwayat;
            }
            
            // Kirim response dengan CORS headers yang benar
            header('Content-Type: application/json');
            echo json_encode([
                "status" => "success",
                "data" => $anak_list
            ]);
        } else {
            header('Content-Type: application/json');
            echo json_encode([
                "status" => "empty", 
                "message" => "Belum ada data anak yang didaftarkan.",
                "data" => []
            ]);
        }
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode([
            "status" => "error", 
            "message" => "Kesalahan Sistem: " . $e->getMessage()
        ]);
    }
} else {
    header('Content-Type: application/json');
    echo json_encode([
        "status" => "error", 
        "message" => "ID Orang Tua tidak valid!"
    ]);
}
?>
