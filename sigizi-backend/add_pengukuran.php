<?php
require_once 'config.php';
require_once 'zscore_calculator.php';

$input = file_get_contents("php://input");
$data = json_decode($input);

if (!empty($data->anak_id) && !empty($data->tinggi_badan) && !empty($data->berat_badan) && !empty($data->orang_tua_id)) {
    try {
        $conn->beginTransaction();
        
        // Get data anak
        $query_anak = "SELECT tanggal_lahir, jenis_kelamin FROM anak WHERE id = :anak_id";
        $stmt_anak = $conn->prepare($query_anak);
        $stmt_anak->bindParam(":anak_id", $data->anak_id);
        $stmt_anak->execute();
        $anak = $stmt_anak->fetch(PDO::FETCH_ASSOC);
        
        if (!$anak) {
            echo json_encode(["status" => "error", "message" => "Data anak tidak ditemukan!"]);
            exit();
        }
        
        // Analisis gizi menggunakan standar WHO
        $tgl_pengukuran = isset($data->tanggal_pengukuran) ? $data->tanggal_pengukuran : date('Y-m-d');
        
        $analisis = ZScoreCalculator::analisisLengkap(
            $anak['tanggal_lahir'],
            $anak['jenis_kelamin'],
            (float)$data->tinggi_badan,
            (float)$data->berat_badan,
            $tgl_pengukuran
        );
        
        $lingkar_kepala = isset($data->lingkar_kepala) && !empty($data->lingkar_kepala) ? $data->lingkar_kepala : null;
        
        $query_ukur = "INSERT INTO pengukuran (anak_id, tanggal_pengukuran, tinggi_badan, berat_badan, lingkar_kepala, 
                       z_score, status_gizi, diinput_oleh, sumber_data) 
                       VALUES (:anak_id, :tgl, :tinggi, :berat, :lingkar_kepala, :zscore, :status, :user_id, 'Aplikasi_Mobile')";
        
        $stmt_ukur = $conn->prepare($query_ukur);
        $stmt_ukur->bindParam(":anak_id", $data->anak_id);
        $stmt_ukur->bindParam(":tgl", $tgl_pengukuran);
        $stmt_ukur->bindParam(":tinggi", $data->tinggi_badan);
        $stmt_ukur->bindParam(":berat", $data->berat_badan);
        $stmt_ukur->bindParam(":lingkar_kepala", $lingkar_kepala);
        $stmt_ukur->bindParam(":zscore", $analisis['z_score_utama']);
        $stmt_ukur->bindParam(":status", $analisis['simplified_status']);
        $stmt_ukur->bindParam(":user_id", $data->orang_tua_id);
        $stmt_ukur->execute();
        
        $conn->commit();
        
        $response = [
            "status" => "success",
            "message" => "Data pertumbuhan berhasil disimpan!",
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