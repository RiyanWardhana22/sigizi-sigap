<?php
require_once 'config.php';
$data = json_decode(file_get_contents("php://input"));
if (!empty($data->email) && !empty($data->password)) {
            try {
                        $query = "SELECT id, nama_lengkap, email, password, role FROM users WHERE email = :email LIMIT 1";
                        $stmt = $conn->prepare($query);
                        $stmt->bindParam(":email", $data->email);
                        $stmt->execute();
                        if ($stmt->rowCount() > 0) {
                                    $row = $stmt->fetch(PDO::FETCH_ASSOC);
                                    $hashed_password = $row['password'];
                                    if (password_verify($data->password, $hashed_password)) {
                                                unset($row['password']);
                                                echo json_encode([
                                                            "status" => "success",
                                                            "message" => "Login berhasil!",
                                                            "user" => $row
                                                ]);
                                    } else {
                                                echo json_encode(["status" => "error", "message" => "Password salah!"]);
                                    }
                        } else {
                                    echo json_encode(["status" => "error", "message" => "Email tidak ditemukan!"]);
                        }
            } catch (PDOException $e) {
                        echo json_encode(["status" => "error", "message" => "Terjadi kesalahan sistem: " . $e->getMessage()]);
            }
} else {
            echo json_encode(["status" => "error", "message" => "Email dan Password harus diisi!"]);
}
