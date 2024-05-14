<?php

// Função para buscar o arquivo HTML a partir da URL usando cURL
function getPageFromUrl($url) {
    // Inicializa uma nova sessão cURL
    $curl = curl_init();

    // Define a URL e outras opções
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true, // Retorna o conteúdo da requisição como uma string
        CURLOPT_FOLLOWLOCATION => true, // Segue redirecionamentos
        CURLOPT_MAXREDIRS => 3, // Limita o número máximo de redirecionamentos
        CURLOPT_TIMEOUT => 10, // Tempo limite da requisição em segundos
    ]);

    // Executa a requisição e obtém o conteúdo da página
    $response = curl_exec($curl);

    // Verifica se houve algum erro durante a requisição
    if (curl_errno($curl)) {
        // Se houve um erro, retorna false
        return false;
    }

    // Fecha a sessão cURL
    curl_close($curl);

    // Retorna o conteúdo da página
    return $response;
}

// Função para gerar um token aleatório
function generateToken() {
    return md5(uniqid(rand(), true));
}

// Função para armazenar o token no cache do computador (por exemplo, usando cookies)
function storeToken($token) {
    setcookie('auth_token', $token, time() + 20); // Armazena o token no cookie com tempo de expiração de 20 segundos
}

// Função para validar o token armazenado no cache do computador
function validateToken($token) {
    if (isset($_COOKIE['auth_token']) && $_COOKIE['auth_token'] === $token) {
        return true;
    }
    return false;
}

// Verifica se a solicitação é um GET e se não há token armazenado no cache
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_COOKIE['auth_token'])) {
    // Gera um novo token
    $token = generateToken();
    // Armazena o token no cache do computador
    storeToken($token);
    // Retorna o token gerado
    echo json_encode(['token' => $token]);
    exit;
}

// Verifica se a solicitação é um POST e se a URL e o token foram fornecidos
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['url']) && isset($_POST['token'])) {
    $url = $_POST['url'];
    $token = $_POST['token'];

    // Valida o token
    if (validateToken($token)) {
        // Sua lógica para buscar a página HTML a partir da URL e retornar a resposta
        // Se a página HTML for encontrada, retorna-a como resposta
        // Se a página HTML não puder ser encontrada, retorna um erro 404
        // Se a URL fornecida for inválida, retorna um erro 400
        // Define o tipo de conteúdo como HTML
        header('Content-Type: text/html');
        // Retorna o conteúdo da página HTML
        echo getPageFromUrl($url);
        exit;
    } else {
        // Retorna um erro 403 se o token for inválido ou não estiver presente no cache
        http_response_code(403);
        echo 'Token de autenticação inválido.';
        exit;
    }
} else {
    // Retorna um erro 405 se a solicitação não for um POST ou se a URL e o token não foram fornecidos
    http_response_code(405);
    echo 'Método de solicitação inválido ou URL/token não fornecidos.';
    exit;
}

?>
