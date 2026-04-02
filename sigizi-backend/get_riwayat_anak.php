<?php
require_once 'config.php';
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : '';
if (!empty($user_id)) {
            try {
                        $query_anak = "SELECT id, nama_anak, tanggal_lahir, jenis_kelamin FROM anak WHERE orang_tua_id = :uid LIMIT 1";
                        $stmt_anak = $conn->prepare($query_anak);
                        $stmt_anak->bindParam(":uid", $user_id);
                        $stmt_anak->execute();
                        $anak = $stmt_anak->fetch(PDO::FETCH_ASSOC);
                        if ($anak) {
                                    $query_ukur = "SELECT tanggal_pengukuran, tinggi_badan, berat_badan, z_score, status_gizi 
                           FROM pengukuran WHERE anak_id = :aid ORDER BY tanggal_pengukuran ASC";
                                    $stmt_ukur = $conn->prepare($query_ukur);
                                    $stmt_ukur->bindParam(":aid", $anak['id']);
                                    $stmt_ukur->execute();

                                    $riwayat = $stmt_ukur->fetchAll(PDO::FETCH_ASSOC);

                                    echo json_encode([
                                                "status" => "success",
                                                "anak" => $anak,
                                                "riwayat" => $riwayat
                                    ]);
                        } else {
                                    echo json_encode(["status" => "empty", "message" => "Belum ada data anak yang didaftarkan."]);
                        }
            } catch (PDOException $e) {
                        echo json_encode(["status" => "error", "message" => "Kesalahan Sistem: " . $e->getMessage()]);
            }
} else {
            echo json_encode(["status" => "error", "message" => "ID Orang Tua tidak valid!"]);
}
