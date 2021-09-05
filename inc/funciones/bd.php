<?php 

//Credenciales de la base de datos
define('DB_USUARIO', 'epiz_29623928');
define('DB_PASSWORD', 'WJWwBbeLFjuy');
define('DB_HOST', 'sql101.epizy.com');
define('DB_PORT', '3306');
define('DB_NAME', 'epiz_29623928_agendaphp');

$conn = new mysqli(DB_HOST, DB_USUARIO, DB_PASSWORD, DB_NAME, DB_PORT);

// echo $conn->ping();