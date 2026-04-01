<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            http_response_code(200);
            exit();
}

$host = "localhost";
$db_name = "sigizi_sigap";
$username = "root";
$password = "";

try {
            $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $exception) {
            echo json_encode(["status" => "error", "message" => "Koneksi database gagal: " . $exception->getMessage()]);
            exit();
}
