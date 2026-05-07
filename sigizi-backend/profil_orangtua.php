<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    if (!$user_id) {
        echo json_encode(["status" => "error", "message" => "user_id diperlukan"]);
        exit();
    }
    try {
        $stmt = $conn->prepare("
            SELECT u.id, u.nama_lengkap, u.tanggal_lahir, u.email, u.role, 
                   u.wilayah_id, u.penghasilan_range, u.pendidikan_ibu, 
                   u.sanitasi, u.kualitas_air, u.akses_kesehatan, 
                   w.nama_kabupaten 
            FROM users u 
            LEFT JOIN wilayah w ON u.wilayah_id = w.id 
            WHERE u.id = :id
        ");
        $stmt->bindParam(":id", $user_id);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            // Cek kelengkapan profil
            $profil_lengkap = !empty($user['wilayah_id']) 
                && !empty($user['penghasilan_range']) 
                && !empty($user['pendidikan_ibu'])
                && !empty($user['sanitasi']) 
                && !empty($user['kualitas_air']) 
                && !empty($user['akses_kesehatan']);
            
            $user['profil_lengkap'] = $profil_lengkap;
            
            echo json_encode([
                "status" => "success", 
                "data" => $user
            ]);
        } else {
            echo json_encode([
                "status" => "error", 
                "message" => "User tidak ditemukan"
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            "status" => "error", 
            "message" => "Kesalahan sistem: " . $e->getMessage()
        ]);
    }
    
} elseif ($method === 'POST') {
    // Menerima data JSON dari frontend
    $data = json_decode(file_get_contents("php://input"));
    
    // Validasi input - semua field wajib diisi
    if (empty($data->user_id) || 
        empty($data->wilayah_id) || 
        empty($data->penghasilan_range) || 
        empty($data->pendidikan_ibu) ||
        empty($data->sanitasi) || 
        empty($data->kualitas_air) || 
        empty($data->akses_kesehatan)) {
        
        echo json_encode([
            "status" => "error", 
            "message" => "Semua kolom wajib diisi! (termasuk Pendidikan Ibu)"
        ]);
        exit();
    }
    
    try {
        // Validasi nilai yang diperbolehkan untuk pendidikan_ibu
        $pendidikan_valid = [
            "Tidak Sekolah", "SD", "SMP", "SMA", "SMK", 
            "D1", "D2", "D3", "D4", 
            "S1", "S2", "S3", "Spesialis"
        ];
        
        if (!in_array($data->pendidikan_ibu, $pendidikan_valid)) {
            echo json_encode([
                "status" => "error", 
                "message" => "Nilai Pendidikan Ibu tidak valid!"
            ]);
            exit();
        }
        
        // Validasi nilai yang diperbolehkan untuk sanitasi
        $sanitasi_valid = ["Baik", "Buruk"];
        if (!in_array($data->sanitasi, $sanitasi_valid)) {
            echo json_encode([
                "status" => "error", 
                "message" => "Nilai Sanitasi tidak valid!"
            ]);
            exit();
        }
        
        // Validasi nilai yang diperbolehkan untuk kualitas_air
        $air_valid = ["Bersih", "Kotor"];
        if (!in_array($data->kualitas_air, $air_valid)) {
            echo json_encode([
                "status" => "error", 
                "message" => "Nilai Kualitas Air tidak valid!"
            ]);
            exit();
        }
        
        // Validasi nilai yang diperbolehkan untuk akses_kesehatan
        $akses_valid = ["Mudah", "Sulit"];
        if (!in_array($data->akses_kesehatan, $akses_valid)) {
            echo json_encode([
                "status" => "error", 
                "message" => "Nilai Akses Kesehatan tidak valid!"
            ]);
            exit();
        }
        
        // Validasi format tanggal_lahir (jika diisi)
        if (!empty($data->tanggal_lahir)) {
            $date_parts = explode('-', $data->tanggal_lahir);
            if (count($date_parts) !== 3 || !checkdate($date_parts[1], $date_parts[2], $date_parts[0])) {
                echo json_encode([
                    "status" => "error", 
                    "message" => "Format tanggal lahir tidak valid!"
                ]);
                exit();
            }
            
            // Cek tanggal lahir tidak boleh di masa depan
            if (strtotime($data->tanggal_lahir) > time()) {
                echo json_encode([
                    "status" => "error", 
                    "message" => "Tanggal lahir tidak boleh di masa depan!"
                ]);
                exit();
            }
        }
        
        $tanggal_lahir = !empty($data->tanggal_lahir) ? $data->tanggal_lahir : null;
        
        // Update data user
        $stmt = $conn->prepare("
            UPDATE users 
            SET wilayah_id = :wilayah_id, 
                penghasilan_range = :penghasilan_range, 
                pendidikan_ibu = :pendidikan_ibu,
                sanitasi = :sanitasi, 
                kualitas_air = :kualitas_air, 
                akses_kesehatan = :akses_kesehatan, 
                tanggal_lahir = :tanggal_lahir 
            WHERE id = :id
        ");
        
        $stmt->bindParam(":wilayah_id", $data->wilayah_id);
        $stmt->bindParam(":penghasilan_range", $data->penghasilan_range);
        $stmt->bindParam(":pendidikan_ibu", $data->pendidikan_ibu);
        $stmt->bindParam(":sanitasi", $data->sanitasi);
        $stmt->bindParam(":kualitas_air", $data->kualitas_air);
        $stmt->bindParam(":akses_kesehatan", $data->akses_kesehatan);
        $stmt->bindParam(":tanggal_lahir", $tanggal_lahir);
        $stmt->bindParam(":id", $data->user_id);
        
        if ($stmt->execute()) {
            // Update wilayah_id di tabel anak
            $stmtAnak = $conn->prepare("
                UPDATE anak 
                SET wilayah_id = :wilayah_id 
                WHERE orang_tua_id = :orang_tua_id
            ");
            $stmtAnak->bindParam(":wilayah_id", $data->wilayah_id);
            $stmtAnak->bindParam(":orang_tua_id", $data->user_id);
            $stmtAnak->execute();
            
            // Ambil nama kabupaten untuk response
            $stmtWilayah = $conn->prepare("SELECT nama_kabupaten FROM wilayah WHERE id = :id");
            $stmtWilayah->bindParam(":id", $data->wilayah_id);
            $stmtWilayah->execute();
            $wilayah = $stmtWilayah->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                "status" => "success", 
                "message" => "Data profil berhasil disimpan!",
                "data" => [
                    "wilayah_id" => $data->wilayah_id,
                    "nama_kabupaten" => $wilayah ? $wilayah['nama_kabupaten'] : "",
                    "penghasilan_range" => $data->penghasilan_range,
                    "pendidikan_ibu" => $data->pendidikan_ibu,
                    "sanitasi" => $data->sanitasi,
                    "kualitas_air" => $data->kualitas_air,
                    "akses_kesehatan" => $data->akses_kesehatan,
                    "tanggal_lahir" => $tanggal_lahir
                ]
            ]);
        } else {
            echo json_encode([
                "status" => "error", 
                "message" => "Gagal menyimpan data profil."
            ]);
        }
        
    } catch (PDOException $e) {
        echo json_encode([
            "status" => "error", 
            "message" => "Kesalahan sistem: " . $e->getMessage()
        ]);
    }
    
} else {
    echo json_encode([
        "status" => "error", 
        "message" => "Method tidak diizinkan"
    ]);
}
?>