<?php
// Define directory where files are stored
define('FILE_DIRECTORY', 'files/');

// Define encryption key
define('ENCRYPTION_KEY', '01234567890123456789012345678901');

// Generate token with 5 minutes expiration
function generateAccessToken($expirationMinutes = 5) {
	$payload = [
		'exp' => time() + $expirationMinutes * 60
	];
	return base64_encode(json_encode($payload));
}

// Return URL of encrypted file with token
function getEncryptedFileUrl($filename) {
	$fileData = file_get_contents(FILE_DIRECTORY . $filename);
	$iv = openssl_random_pseudo_bytes(16);
	$cipher = openssl_encrypt($fileData, 'AES-256-CBC', ENCRYPTION_KEY, 0, $iv);
	$token = generateAccessToken();
	$encryptedFile = base64_encode($cipher);
	return "http://localhost/encrypted/{$encryptedFile}?token={$token}&iv=" . base64_encode($iv) . "&filename=" . urlencode($filename);
}

// Return decrypted file
function getDecryptedFile() {
	$encryptedFile = $_GET['encryptedFile'];
	$token = $_GET['token'];
	$iv = base64_decode($_GET['iv']);
	$payload = json_decode(base64_decode($token), true);
	if($payload['exp'] < time()) {
		http_response_code(403);
		die('Token expired');
	}
	$cipher = openssl_decrypt(base64_decode($encryptedFile), 'AES-256-CBC', ENCRYPTION_KEY, 0, $iv);
	header('Content-Disposition: attachment; filename="' . urldecode($_GET['filename']) . '"');
	echo $cipher;
}

// Routes
if(isset($_GET['encryptedFile'])) {
	getDecryptedFile();
} else {
	$filename = 'your-file.html';
	echo getEncryptedFileUrl($filename);
}
?>
