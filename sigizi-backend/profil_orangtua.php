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
        $stmt = $conn->prepare("SELECT u.id, u.nama_lengkap, u.tanggal_lahir, u.email, u.role, u.wilayah_id, u.penghasilan_range, u.sanitasi, u.kualitas_air, u.akses_kesehatan, w.nama_kabupaten FROM users u LEFT JOIN wilayah w ON u.wilayah_id = w.id WHERE u.id = :id");
        $stmt->bindParam(":id", $user_id);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            $profil_lengkap = !empty($user['wilayah_id']) && !empty($user['penghasilan_range']) && !empty($user['sanitasi']) && !empty($user['kualitas_air']) && !empty($user['akses_kesehatan']);
            $user['profil_lengkap'] = $profil_lengkap;
            echo json_encode(["status" => "success", "data" => $user]);
        } else {
            echo json_encode(["status" => "error", "message" => "User tidak ditemukan"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if (empty($data->user_id) || empty($data->wilayah_id) || empty($data->penghasilan_range) || empty($data->sanitasi) || empty($data->kualitas_air) || empty($data->akses_kesehatan)) {
        echo json_encode(["status" => "error", "message" => "Semua kolom wajib diisi!"]);
        exit();
    }
    try {
        $tanggal_lahir = !empty($data->tanggal_lahir) ? $data->tanggal_lahir : null;
        $stmt = $conn->prepare("UPDATE users SET wilayah_id = :wilayah_id, penghasilan_range = :penghasilan_range, sanitasi = :sanitasi, kualitas_air = :kualitas_air, akses_kesehatan = :akses_kesehatan, tanggal_lahir = :tanggal_lahir WHERE id = :id");
        $stmt->bindParam(":wilayah_id", $data->wilayah_id);
        $stmt->bindParam(":penghasilan_range", $data->penghasilan_range);
        $stmt->bindParam(":sanitasi", $data->sanitasi);
        $stmt->bindParam(":kualitas_air", $data->kualitas_air);
        $stmt->bindParam(":akses_kesehatan", $data->akses_kesehatan);
        $stmt->bindParam(":tanggal_lahir", $tanggal_lahir);
        $stmt->bindParam(":id", $data->user_id);
        if ($stmt->execute()) {
            $stmtAnak = $conn->prepare("UPDATE anak SET wilayah_id = :wilayah_id WHERE orang_tua_id = :orang_tua_id");
            $stmtAnak->bindParam(":wilayah_id", $data->wilayah_id);
            $stmtAnak->bindParam(":orang_tua_id", $data->user_id);
            $stmtAnak->execute();
            echo json_encode(["status" => "success", "message" => "Data profil berhasil disimpan!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Gagal menyimpan data."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Method tidak diizinkan"]);
}
?>