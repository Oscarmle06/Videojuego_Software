<?php
header("Content-Type: application/json; charset=utf-8");

// Conexión a tu base de datos corregida: catcafe
$conexion = new mysqli("localhost", "emilio", "michi", "catcafe");

if ($conexion->connect_error) {
    echo json_encode(["error" => "Fallo de conexión a catcafe"]);
    exit;
}

// Capturar el día que envió el $.ajax, si no hay ninguno usa 'Lunes' por defecto
$dia_recibido = isset($_GET['dia_semana']) ? $_GET['dia_semana'] : 'Lunes';

// Función para quitar tildes y asegurar que haga match con el ENUM de tu SQL
function limpiarAcentos($cadena) {
    $buscar  = ['á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú'];
    $reemplazar = ['a', 'e', 'i', 'o', 'u', 'A', 'É', 'I', 'O', 'U'];
    return str_replace($buscar, $reemplazar, $cadena);
}

$dia_limpio = limpiarAcentos($dia_recibido);

// Consulta Relacional SQL usando la estructura de tu script
$sql = "SELECT p.nombre, p.imagen, p.descripcion 
        FROM platillos p
        JOIN menu_dias md ON p.id = md.platillo_id
        WHERE md.dia_semana = ?";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $dia_limpio);
$stmt->execute();
$resultado = $stmt->get_result();

$platillos = [];
while ($fila = $resultado->fetch_assoc()) {
    $platillos[] = $fila;
}

// Retornar la comida en JSON limpio
echo json_encode($platillos, JSON_UNESCAPED_UNICODE);

$stmt->close();
$conexion->close();
?>
