<?php
require_once 'config.php';
try {
    $query = "SELECT id, nama_kabupaten FROM wilayah ORDER BY nama_kabupaten ASC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $wilayah = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["status" => "success", "data" => $wilayah]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Kesalahan Server: " . $e->getMessage()]);
}