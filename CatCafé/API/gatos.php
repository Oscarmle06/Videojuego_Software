<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ... aquí abajo sigue tu código actual de conexión ...
header("Content-Type: application/json; charset=utf-8");

// Cambiado a tu base de datos: catcafe
$conexion = new mysqli("localhost", "emilio", "michi", "catcafe");

if ($conexion->connect_error) {
    echo json_encode(["error" => "Fallo de conexión a catcafe: " . $conexion->connect_error]);
    exit;
}

$sql = "SELECT nombre, edad, caracter, imagen FROM gatos";
$resultado = $conexion->query($sql);

$gatos = [];
if ($resultado->num_rows > 0) {
    while ($fila = $resultado->fetch_assoc()) {
        $gatos[] = $fila;
    }
}

echo json_encode($gatos, JSON_UNESCAPED_UNICODE);
$conexion->close();
?>