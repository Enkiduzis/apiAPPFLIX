const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // Adicionar esta linha para importar o módulo 'node-fetch'

const app = express();

// URL do bucket do Cloudflare R2 onde os arquivos estão armazenados
const bucketUrl = 'https://seu-dominio.com';

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
app.get('/file/:filename', async (req, res) => {
  const { filename } = req.params;
  const token = generateAccessToken();
  const fileUrl = `${bucketUrl}/${filename}`;

  try {
    const response = await fetch(fileUrl);
    const fileData = await response.buffer();
    const iv = crypto.randomBytes(16); // Vetor de inicialização aleatório
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encrypted = cipher.update(fileData);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const encryptedFile = encrypted.toString('base64');

    const encryptedFileUrl = `${req.protocol}://${req.get('host')}/encrypted/${encryptedFile}?token=${token}&iv=${iv.toString('base64url')}&filename=${encodeURIComponent(filename)}`;
    res.send(encryptedFileUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao obter o arquivo');
  }
});

// Rota para validar o token de acesso e descriptografar o arquivo
app.get('/encrypted/:encryptedFile', async (req, res) => {
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

    res.setHeader('Content-Type', 'text/html');
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