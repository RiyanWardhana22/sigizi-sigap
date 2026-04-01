<?php
require_once 'config.php';
$data = json_decode(file_get_contents("php://input"));
if (!empty($data->nama_lengkap) && !empty($data->email) && !empty($data->password) && !empty($data->role)) {
            try {
                        $check = $conn->prepare("SELECT id FROM users WHERE email = :email");
                        $check->bindParam(":email", $data->email);
                        $check->execute();

                        if ($check->rowCount() > 0) {
                                    echo json_encode(["status" => "error", "message" => "Email sudah terdaftar!"]);
                                    exit();
                        }
                        $hashed_password = password_hash($data->password, PASSWORD_BCRYPT);
                        $query = "INSERT INTO users (nama_lengkap, email, password, role, status_aktif) VALUES (:nama, :email, :password, :role, 1)";
                        $stmt = $conn->prepare($query);
                        $stmt->bindParam(":nama", $data->nama_lengkap);
                        $stmt->bindParam(":email", $data->email);
                        $stmt->bindParam(":password", $hashed_password);
                        $stmt->bindParam(":role", $data->role);

                        if ($stmt->execute()) {
                                    echo json_encode(["status" => "success", "message" => "Pengguna berhasil ditambahkan!"]);
                        } else {
                                    echo json_encode(["status" => "error", "message" => "Gagal menyimpan data."]);
                        }
            } catch (PDOException $e) {
                        echo json_encode(["status" => "error", "message" => "Kesalahan Server: " . $e->getMessage()]);
            }
} else {
            echo json_encode(["status" => "error", "message" => "Semua kolom wajib diisi!"]);
}
