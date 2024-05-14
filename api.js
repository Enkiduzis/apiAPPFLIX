const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();

// Diretório onde os arquivos estão armazenados
// Alterar para o diretório onde os arquivos estão armazenados efetivamente
const fileDirectory = 'C:/xampp/htdocs/api-test/file';

// Chave de criptografia (deve ter 32 caracteres para AES-256)
// Alterar para uma chave segura e não compartilhar
// Exemplo de chave AES-256 de 32 caracteres: '01234567890123456789012345678901'
const encryptionKey = 'your-32-character-encryption-key';

// Função para gerar um token de acesso com expiração de 5 minutos
function generateAccessToken(expirationMinutes = 5) {
  const payload = {
    exp: Math.floor(Date.now() / 1000) + (expirationMinutes * 60),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Rota para obter o arquivo criptografado com token de acesso
// Exemplo de URL: http://localhost:3000/file/arquivo.txt
// Irá retornar a URL para download do arquivo criptografado
// Exemplo de URL de download: http://localhost:3000/encrypted/LWvz1KPU7p/6pX8gErA5Xw==?token=eyJleHAiOjE3MTU2NDU2NTF9&iv=g9gMal_ayBj4R5uXiWyKIQ&filename=your-file.txt
app.get('/file/:filename', (req, res) => {
  const { filename } = req.params;
  const token = generateAccessToken();
  const filePath = path.join(fileDirectory, filename);

  try {
    const fileData = fs.readFileSync(filePath);
    const iv = crypto.randomBytes(16); // Vetor de inicialização aleatório
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encrypted = cipher.update(fileData);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const encryptedFile = encrypted.toString('base64');

    const fileExt = path.extname(filename);
	//Altere o servidor para o seu servidor de hospedagem
    res.send(`http://localhost:3000/encrypted/${encryptedFile}?token=${token}&iv=${iv.toString('base64url')}&filename=${encodeURIComponent(filename)}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao obter o arquivo');
  }
});

// Rota para validar o token de acesso e descriptografar o arquivo
// Irá retornar o arquivo para download com o nome original
// Exemplo de URL: http://localhost:3000/encrypted/LWvz1KPU7p/6pX8gErA5Xw==?token=eyJleHAiOjE3MTU2NDU2NTF9&iv=g9gMal_ayBj4R5uXiWyKIQ&filename=your-file.txt
app.get('/encrypted/:encryptedFile', (req, res) => {
  const { encryptedFile } = req.params;
  const { token, iv, filename } = req.query;

  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp < currentTime) {
      return res.status(403).send('Token expirado');
    }

    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, Buffer.from(iv, 'base64url'));
    let decrypted = decipher.update(Buffer.from(encryptedFile, 'base64'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    res.setHeader('Content-Disposition', `attachment; filename="${decodeURIComponent(filename)}"`);
    res.send(decrypted);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao descriptografar o arquivo');
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
  console.log('Pressione Ctrl+C para encerrar');
  console.log('Node em Execução');
});