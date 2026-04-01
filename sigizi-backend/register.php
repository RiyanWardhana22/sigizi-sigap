<?php
require_once 'config.php';
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->nama_lengkap) && !empty($data->email) && !empty($data->password)) {
            try {
                        $check_query = "SELECT id FROM users WHERE email = :email";
                        $check_stmt = $conn->prepare($check_query);
                        $check_stmt->bindParam(":email", $data->email);
                        $check_stmt->execute();
                        if ($check_stmt->rowCount() > 0) {
                                    echo json_encode(["status" => "error", "message" => "Email sudah terdaftar!"]);
                                    exit();
                        }
                        $hashed_password = password_hash($data->password, PASSWORD_BCRYPT);
                        $query = "INSERT INTO users (nama_lengkap, email, password, role) VALUES (:nama, :email, :password, 'orang_tua')";
                        $stmt = $conn->prepare($query);
                        $stmt->bindParam(":nama", $data->nama_lengkap);
                        $stmt->bindParam(":email", $data->email);
                        $stmt->bindParam(":password", $hashed_password);
                        if ($stmt->execute()) {
                                    echo json_encode(["status" => "success", "message" => "Registrasi berhasil!"]);
                        } else {
                                    echo json_encode(["status" => "error", "message" => "Gagal mendaftarkan pengguna."]);
                        }
            } catch (PDOException $e) {
                        echo json_encode(["status" => "error", "message" => "Terjadi kesalahan sistem: " . $e->getMessage()]);
            }
} else {
            echo json_encode(["status" => "error", "message" => "Data tidak lengkap!"]);
}
