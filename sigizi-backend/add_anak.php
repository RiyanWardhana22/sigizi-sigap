<?php
require_once 'config.php';
$data = json_decode(file_get_contents("php://input"));
if (!empty($data->orang_tua_id) && !empty($data->nama_anak) && !empty($data->tanggal_lahir) && !empty($data->tinggi_badan) && !empty($data->berat_badan)) {
            try {
                        $conn->beginTransaction();
                        $query_anak = "INSERT INTO anak (orang_tua_id, nama_anak, tanggal_lahir, jenis_kelamin, wilayah_id) 
                       VALUES (:orang_tua_id, :nama, :tgl_lahir, :jk, 1)";
                        $stmt_anak = $conn->prepare($query_anak);
                        $stmt_anak->bindParam(":orang_tua_id", $data->orang_tua_id);
                        $stmt_anak->bindParam(":nama", $data->nama_anak);
                        $stmt_anak->bindParam(":tgl_lahir", $data->tanggal_lahir);
                        $stmt_anak->bindParam(":jk", $data->jenis_kelamin);
                        $stmt_anak->execute();
                        $anak_id = $conn->lastInsertId();
                        $tgl_lahir = new DateTime($data->tanggal_lahir);
                        $hari_ini = new DateTime();
                        $selisih = $hari_ini->diff($tgl_lahir);
                        $umur_bulan = ($selisih->y * 12) + $selisih->m;
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
                        $tgl_pengukuran = $hari_ini->format('Y-m-d');
                        $query_ukur = "INSERT INTO pengukuran (anak_id, tanggal_pengukuran, tinggi_badan, berat_badan, z_score, status_gizi, diinput_oleh) 
                       VALUES (:anak_id, :tgl, :tinggi, :berat, :zscore, :status, :user_id)";
                        $stmt_ukur = $conn->prepare($query_ukur);
                        $stmt_ukur->bindParam(":anak_id", $anak_id);
                        $stmt_ukur->bindParam(":tgl", $tgl_pengukuran);
                        $stmt_ukur->bindParam(":tinggi", $data->tinggi_badan);
                        $stmt_ukur->bindParam(":berat", $data->berat_badan);
                        $stmt_ukur->bindParam(":zscore", $z_score);
                        $stmt_ukur->bindParam(":status", $status_gizi);
                        $stmt_ukur->bindParam(":user_id", $data->orang_tua_id);
                        $stmt_ukur->execute();
                        $conn->commit();
                        echo json_encode([
                                    "status" => "success",
                                    "message" => "Data anak berhasil disimpan!",
                                    "hasil" => [
                                                "umur_bulan" => $umur_bulan,
                                                "z_score" => $z_score,
                                                "status_gizi" => $status_gizi
                                    ]
                        ]);
            } catch (PDOException $e) {
                        $conn->rollBack();
                        echo json_encode(["status" => "error", "message" => "Kesalahan Sistem: " . $e->getMessage()]);
            }
} else {
            echo json_encode(["status" => "error", "message" => "Mohon lengkapi semua data anak!"]);
}
