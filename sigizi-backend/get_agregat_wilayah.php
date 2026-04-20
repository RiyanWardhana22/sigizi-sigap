<?php
// 1. Panggil koneksi PDO (sudah termasuk setting CORS)
require_once 'config.php'; 

header('Content-Type: application/json');

try {
    // 2. Ambil data nama kabupaten dan tingkat kerentanannya saja
    $sql = "SELECT * FROM agregat_wilayah";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    // 3. Ubah jadi array
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 4. Kirim ke React
    echo json_encode([
        'status' => 'success', 
        'data' => $data
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error', 
        'message' => 'Gagal mengambil data wilayah: ' . $e->getMessage()
    ]);
}
?>