<?php
require_once 'config.php';

try {
            $query = "SELECT id, nama_lengkap, email, role, status_aktif, created_at FROM users ORDER BY created_at DESC";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode([
                        "status" => "success",
                        "data" => $users
            ]);
} catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Gagal mengambil data: " . $e->getMessage()]);
}
