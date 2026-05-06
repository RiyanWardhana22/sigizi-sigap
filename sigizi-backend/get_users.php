<?php
require_once 'config.php';

try {
            $roleFilter = isset($_GET['role']) ? trim($_GET['role']) : null;

            if ($roleFilter) {
                $query = "SELECT id, nama_lengkap, email, role, status_aktif, created_at FROM users WHERE role = ? ORDER BY nama_lengkap ASC";
                $stmt = $conn->prepare($query);
                $stmt->execute([$roleFilter]);
            } else {
                $query = "SELECT id, nama_lengkap, email, role, status_aktif, created_at FROM users ORDER BY created_at DESC";
                $stmt = $conn->prepare($query);
                $stmt->execute();
            }
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode([
                        "status" => "success",
                        "data" => $users
            ]);
} catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Gagal mengambil data: " . $e->getMessage()]);
}