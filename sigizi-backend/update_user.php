<?php
require_once 'config.php';
$data = json_decode(file_get_contents("php://input"));
if (!empty($data->id) && !empty($data->nama_lengkap) && !empty($data->email) && !empty($data->role)) {
            try {
                        if (!empty($data->password)) {
                                    $hashed_password = password_hash($data->password, PASSWORD_BCRYPT);
                                    $query = "UPDATE users SET nama_lengkap = :nama, email = :email, role = :role, password = :password WHERE id = :id";
                        } else {
                                    $query = "UPDATE users SET nama_lengkap = :nama, email = :email, role = :role WHERE id = :id";
                        }
                        $stmt = $conn->prepare($query);
                        $stmt->bindParam(":nama", $data->nama_lengkap);
                        $stmt->bindParam(":email", $data->email);
                        $stmt->bindParam(":role", $data->role);
                        $stmt->bindParam(":id", $data->id);
                        if (!empty($data->password)) {
                                    $stmt->bindParam(":password", $hashed_password);
                        }
                        if ($stmt->execute()) {
                                    echo json_encode(["status" => "success", "message" => "Data pengguna berhasil diperbarui!"]);
                        } else {
                                    echo json_encode(["status" => "error", "message" => "Gagal memperbarui data."]);
                        }
            } catch (PDOException $e) {
                        echo json_encode(["status" => "error", "message" => "Kesalahan Server: " . $e->getMessage()]);
            }
} else {
            echo json_encode(["status" => "error", "message" => "Data tidak lengkap!"]);
}
