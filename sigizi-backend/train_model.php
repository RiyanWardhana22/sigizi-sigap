<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            http_response_code(200);
            exit();
}
if (isset($_FILES['dataset']) && isset($_POST['algorithm'])) {
            $algorithm = $_POST['algorithm'];
            $target_dir = "uploads/";
            $file_name = time() . "_" . basename($_FILES["dataset"]["name"]);
            $target_file = $target_dir . $file_name;
            if (move_uploaded_file($_FILES["dataset"]["tmp_name"], $target_file)) {
                        $command = escapeshellcmd("python model_trainer.py " . $target_file . " " . $algorithm);
                        $output = shell_exec($command);
                        unlink($target_file);
                        if ($output) {
                                    echo $output;
                        } else {
                                    echo json_encode(["status" => "error", "message" => "Gagal mengeksekusi script Python. Pastikan Python terinstall dan terdaftar di PATH (Environment Variables)."]);
                        }
            } else {
                        echo json_encode(["status" => "error", "message" => "Gagal mengunggah file dataset."]);
            }
} else {
            echo json_encode(["status" => "error", "message" => "Dataset atau Algoritma tidak ditemukan!"]);
}
