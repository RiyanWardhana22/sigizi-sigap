<?php
require_once 'config.php';
try {
            $stats = [
                        "total_anak" => 0,
                        "total_stunting" => 0,
                        "total_prastunting" => 0,
                        "total_normal" => 0,
                        "total_pengguna" => 0
            ];
            $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
            $stats['total_pengguna'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            $stmt = $conn->query("SELECT COUNT(*) as count FROM anak");
            $stats['total_anak'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            $query_status = "
        SELECT status_gizi, COUNT(*) as count 
        FROM (
            SELECT p.status_gizi 
            FROM pengukuran p
            INNER JOIN (
                SELECT anak_id, MAX(tanggal_pengukuran) as max_date 
                FROM pengukuran 
                GROUP BY anak_id
            ) latest ON p.anak_id = latest.anak_id AND p.tanggal_pengukuran = latest.max_date
        ) as status_terakhir
        GROUP BY status_gizi
    ";

            $stmt = $conn->query($query_status);
            $status_data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($status_data as $row) {
                        if ($row['status_gizi'] == 'Stunting') $stats['total_stunting'] = $row['count'];
                        if ($row['status_gizi'] == 'Pra-stunting') $stats['total_prastunting'] = $row['count'];
                        if ($row['status_gizi'] == 'Normal') $stats['total_normal'] = $row['count'];
            }

            echo json_encode(["status" => "success", "data" => $stats]);
} catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Kesalahan Sistem: " . $e->getMessage()]);
}
