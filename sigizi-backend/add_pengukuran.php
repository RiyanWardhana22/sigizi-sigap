// sigizi-backend/add_pengukuran.php
<?php
// Hapus komentar di baris pertama atau pindahkan ke bawah
require_once 'config.php';

// Ambil input JSON
$input = file_get_contents("php://input");
$data = json_decode($input);

// Log untuk debugging (opsional, bisa dihapus setelah testing)
error_log("Received data: " . $input);

if (!empty($data->anak_id) && !empty($data->tinggi_badan) && !empty($data->berat_badan) && !empty($data->orang_tua_id)) {
    try {
        $conn->beginTransaction();
        
        // Get anak data to calculate umur
        $query_anak = "SELECT tanggal_lahir FROM anak WHERE id = :anak_id";
        $stmt_anak = $conn->prepare($query_anak);
        $stmt_anak->bindParam(":anak_id", $data->anak_id);
        $stmt_anak->execute();
        $anak = $stmt_anak->fetch(PDO::FETCH_ASSOC);
        
        if (!$anak) {
            echo json_encode(["status" => "error", "message" => "Data anak tidak ditemukan!"]);
            exit();
        }
        
        $tgl_lahir = new DateTime($anak['tanggal_lahir']);
        $hari_ini = new DateTime();
        $selisih = $hari_ini->diff($tgl_lahir);
        $umur_bulan = ($selisih->y * 12) + $selisih->m;
        
        // Calculate status gizi
        $status_gizi = 'Normal';
        $z_score = 0;
        
        if ($umur_bulan > 0) {
            $rasio = $data->tinggi_badan / $umur_bulan;
            if ($rasio < 2.5) {
                $status_gizi = 'Stunting';
                $z_score = -3.5;
            } elseif ($rasio >= 2.5 && $rasio < 3.5) {
                $status_gizi = 'Pra-stunting';
                $z_score = -2.5;
            } else {
                $status_gizi = 'Normal';
                $z_score = 1.0;
            }
        }
        
        $tgl_pengukuran = isset($data->tanggal_pengukuran) ? $data->tanggal_pengukuran : date('Y-m-d');
        
        // Cek apakah kolom lingkar_kepala ada di request
        $lingkar_kepala = isset($data->lingkar_kepala) && !empty($data->lingkar_kepala) ? $data->lingkar_kepala : null;
        
        // Query dengan atau tanpa lingkar_kepala tergantung struktur tabel
        // Jika tabel belum punya kolom lingkar_kepala, gunakan query tanpa lingkar_kepala
        $query_ukur = "INSERT INTO pengukuran (anak_id, tanggal_pengukuran, tinggi_badan, berat_badan, z_score, status_gizi, diinput_oleh, sumber_data) 
                       VALUES (:anak_id, :tgl, :tinggi, :berat, :zscore, :status, :user_id, 'Aplikasi_Mobile')";
        
        $stmt_ukur = $conn->prepare($query_ukur);
        $stmt_ukur->bindParam(":anak_id", $data->anak_id);
        $stmt_ukur->bindParam(":tgl", $tgl_pengukuran);
        $stmt_ukur->bindParam(":tinggi", $data->tinggi_badan);
        $stmt_ukur->bindParam(":berat", $data->berat_badan);
        $stmt_ukur->bindParam(":zscore", $z_score);
        $stmt_ukur->bindParam(":status", $status_gizi);
        $stmt_ukur->bindParam(":user_id", $data->orang_tua_id);
        $stmt_ukur->execute();
        
        $conn->commit();
        
        // Kirim response JSON yang valid
        $response = [
            "status" => "success",
            "message" => "Data pertumbuhan berhasil disimpan!",
            "hasil" => [
                "umur_bulan" => $umur_bulan,
                "z_score" => $z_score,
                "status_gizi" => $status_gizi
            ]
        ];
        
        echo json_encode($response);
        
    } catch (PDOException $e) {
        $conn->rollBack();
        echo json_encode(["status" => "error", "message" => "Kesalahan Sistem: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap!"]);
}
?>