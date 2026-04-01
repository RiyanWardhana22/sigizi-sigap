<?php
require_once 'config.php';
$data = json_decode(file_get_contents("php://input"));
if (!empty($data->id)) {
            try {
                        $query = "DELETE FROM users WHERE id = :id";
                        $stmt = $conn->prepare($query);
                        $stmt->bindParam(":id", $data->id);

                        if ($stmt->execute()) {
                                    echo json_encode(["status" => "success", "message" => "Pengguna berhasil dihapus!"]);
                        } else {
                                    echo json_encode(["status" => "error", "message" => "Gagal menghapus pengguna."]);
                        }
            } catch (PDOException $e) {
                        echo json_encode(["status" => "error", "message" => "Kesalahan Server: " . $e->getMessage()]);
            }
} else {
            echo json_encode(["status" => "error", "message" => "ID pengguna tidak ditemukan!"]);
}
