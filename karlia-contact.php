<?php
/**
 * Script simple de proxy pour l'API KARLIA
 * Ce fichier sert d'intermédiaire entre le frontend et l'API KARLIA
 * pour contourner les restrictions CORS
 */

// Autoriser les requêtes depuis n'importe quel domaine (à restreindre en production)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Mode débogage (à désactiver en production)
$debug = false;

// Journal de débogage
function debug_log($message) {
    global $debug;
    if ($debug) {
        error_log("[KARLIA PROXY] " . $message);
    }
}

// Clé API KARLIA
$api_key = 'polopq-kpjsos-213914-1bj1ck-ppgwe2';

// Récupérer le terme de recherche
$search = isset($_GET['q']) ? $_GET['q'] : '';

// Si la recherche est vide, renvoyer un tableau vide
if (empty($search)) {
    echo json_encode(['items' => []]);
    exit;
}

// Construire l'URL pour la recherche de contacts
$url = "https://karlia.fr/app/api/v2/contacts?q=" . urlencode($search) . "&limit=10";
debug_log("URL appelée: " . $url);

// Initialiser cURL
$ch = curl_init($url);

// Configurer les options cURL
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $api_key,
    'Accept: application/json'
]);

// Exécuter la requête
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Journaliser les résultats si en mode débogage
debug_log("Code de réponse HTTP: " . $http_code);
if ($error) {
    debug_log("Erreur cURL: " . $error);
}

// Si la requête échoue, renvoyer une erreur
if ($http_code != 200) {
    echo json_encode([
        'error' => 'Erreur lors de la communication avec KARLIA',
        'code' => $http_code,
        'details' => $error
    ]);
    exit;
}

// Renvoyer directement la réponse au client
echo $response;