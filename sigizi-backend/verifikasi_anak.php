<?php
require_once 'config.php';
$data = json_decode(file_get_contents("php://input"));
if (!empty($data->id)) {
            try {
                        $query = "UPDATE anak SET status_verifikasi = 'Disetujui' WHERE id = :id";
                        $stmt = $conn->prepare($query);
                        $stmt->bindParam(":id", $data->id);

                        if ($stmt->execute()) {
                                    echo json_encode(["status" => "success", "message" => "Data anak berhasil diverifikasi!"]);
                        } else {
                                    echo json_encode(["status" => "error", "message" => "Gagal memverifikasi data."]);
                        }
            } catch (PDOException $e) {
                        echo json_encode(["status" => "error", "message" => "Kesalahan Server: " . $e->getMessage()]);
            }
} else {
            echo json_encode(["status" => "error", "message" => "ID anak tidak ditemukan!"]);
}
