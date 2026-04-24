<?php
require_once 'config.php';
require_once 'zscore_calculator.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->orang_tua_id) && !empty($data->nama_anak) && !empty($data->tanggal_lahir) && 
    !empty($data->tinggi_badan) && !empty($data->berat_badan) && !empty($data->jenis_kelamin)) {
    
    try {
        $conn->beginTransaction();
        
        // Insert data anak
        $query_anak = "INSERT INTO anak (orang_tua_id, nama_anak, tanggal_lahir, jenis_kelamin, wilayah_id) 
                       VALUES (:orang_tua_id, :nama, :tgl_lahir, :jk, 1)";
        $stmt_anak = $conn->prepare($query_anak);
        $stmt_anak->bindParam(":orang_tua_id", $data->orang_tua_id);
        $stmt_anak->bindParam(":nama", $data->nama_anak);
        $stmt_anak->bindParam(":tgl_lahir", $data->tanggal_lahir);
        $stmt_anak->bindParam(":jk", $data->jenis_kelamin);
        $stmt_anak->execute();
        $anak_id = $conn->lastInsertId();
        
        // Analisis gizi menggunakan standar WHO
        $analisis = ZScoreCalculator::analisisLengkap(
            $data->tanggal_lahir,
            $data->jenis_kelamin,
            (float)$data->tinggi_badan,
            (float)$data->berat_badan
        );
        
        $tgl_pengukuran = date('Y-m-d');
        $lingkar_kepala = isset($data->lingkar_kepala) && !empty($data->lingkar_kepala) ? $data->lingkar_kepala : null;
        
        // Insert data pengukuran
        $query_ukur = "INSERT INTO pengukuran (anak_id, tanggal_pengukuran, tinggi_badan, berat_badan, lingkar_kepala, 
                       z_score, status_gizi, diinput_oleh, sumber_data) 
                       VALUES (:anak_id, :tgl, :tinggi, :berat, :lingkar_kepala, :zscore, :status, :user_id, 'Aplikasi_Mobile')";
        
        $stmt_ukur = $conn->prepare($query_ukur);
        $stmt_ukur->bindParam(":anak_id", $anak_id);
        $stmt_ukur->bindParam(":tgl", $tgl_pengukuran);
        $stmt_ukur->bindParam(":tinggi", $data->tinggi_badan);
        $stmt_ukur->bindParam(":berat", $data->berat_badan);
        $stmt_ukur->bindParam(":lingkar_kepala", $lingkar_kepala);
        $stmt_ukur->bindParam(":zscore", $analisis['z_score_utama']);
        $stmt_ukur->bindParam(":status", $analisis['simplified_status']);
        $stmt_ukur->bindParam(":user_id", $data->orang_tua_id);
        $stmt_ukur->execute();
        
        $conn->commit();
        
        echo json_encode([
            "status" => "success",
            "message" => "Data anak berhasil disimpan!",
            "hasil" => [
                "umur_bulan" => $analisis['umur_bulan'],
                "z_score" => $analisis['z_score_utama'],
                "status_gizi" => $analisis['simplified_status'],
                "detail" => [
                    "tb_u" => [
                        "z_score" => $analisis['tb_u']['z_score'],
                        "status" => $analisis['tb_u']['status']
                    ],
                    "bb_u" => [
                        "z_score" => $analisis['bb_u']['z_score'],
                        "status" => $analisis['bb_u']['status']
                    ]
                ]
            ]
        ]);
        
    } catch (PDOException $e) {
        $conn->rollBack();
        echo json_encode(["status" => "error", "message" => "Kesalahan Sistem: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Mohon lengkapi semua data anak!"]);
}
?>
