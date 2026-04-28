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
            
            // Total pengguna
            $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
            $stats['total_pengguna'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            // Total anak
            $stmt = $conn->query("SELECT COUNT(*) as count FROM anak");
            $stats['total_anak'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            // Perbaikan query untuk mengambil status gizi TERBARU per anak (berdasarkan tanggal pengukuran terbaru)
            $query_status = "
                SELECT status_gizi, COUNT(*) as count 
                FROM (
                    SELECT p1.status_gizi 
                    FROM pengukuran p1
                    INNER JOIN (
                        SELECT anak_id, MAX(tanggal_pengukuran) as max_tanggal
                        FROM pengukuran
                        GROUP BY anak_id
                    ) p2 ON p1.anak_id = p2.anak_id AND p1.tanggal_pengukuran = p2.max_tanggal
                    GROUP BY p1.anak_id, p1.status_gizi, p1.tanggal_pengukuran
                ) as status_terakhir
                GROUP BY status_gizi
            ";

            $stmt = $conn->query($query_status);
            $status_data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Reset nilai sebelum menghitung ulang
            $stats['total_stunting'] = 0;
            $stats['total_prastunting'] = 0;
            $stats['total_normal'] = 0;

            foreach ($status_data as $row) {
                        if ($row['status_gizi'] == 'Stunting') {
                            $stats['total_stunting'] = $row['count'];
                        }
                        if ($row['status_gizi'] == 'Pra-stunting') {
                            $stats['total_prastunting'] = $row['count'];
                        }
                        if ($row['status_gizi'] == 'Normal') {
                            $stats['total_normal'] = $row['count'];
                        }
            }

            echo json_encode(["status" => "success", "data" => $stats]);
} catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Kesalahan Sistem: " . $e->getMessage()]);
}
?>