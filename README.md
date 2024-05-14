## Tutorial: Armazenamento Seguro de Arquivos com Criptografia e Tokens

Este tutorial demonstra como implementar um servidor Node.js que permite acesso seguro a arquivos armazenados no servidor. O servidor criptografa os arquivos e gera um token de acesso temporário para cada solicitação de download. O token expira após um determinado período de tempo, garantindo que o acesso aos arquivos seja restrito e seguro.

### Pré-requisitos

* Node.js instalado em seu sistema
* Um diretório contendo os arquivos que você deseja disponibilizar de forma segura

### Configuração

1. Crie um novo diretório para o seu projeto e navegue até ele:

```
mkdir arquivo-seguro
cd arquivo-seguro
```

2. Inicialize um novo projeto Node.js:

```
npm init -y
```

3. Instale as dependências necessárias:

```
npm install express crypto
```

4. Crie um novo arquivo chamado `app.js` e adicione o seguinte código:

```javascript
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();

// Diretório onde os arquivos estão armazenados
// Altere para o diretório onde os arquivos estão armazenados efetivamente
// Exemplo de diretório: 'C:/xampp/htdocs/api-test/file'
const fileDirectory = 'C:/xampp/htdocs/api-test/file';

// Chave de criptografia (deve ter 32 caracteres para AES-256)
// Altere para uma chave segura e não compartilhar
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
```

### Atualize as seguintes configurações no código:

* `fileDirectory`: Altere para o caminho absoluto do diretório onde os arquivos estão armazenados em seu sistema.
* `encryptionKey`: Substitua `'your-32-character-encryption-key'` por uma chave de criptografia segura de 32 caracteres.

### Uso

1. Execute o servidor Node.js:

```
node app.js
```

2. Acesse a seguinte URL substituindo `arquivo.txt` pelo nome do arquivo que você deseja baixar:

```
http://localhost:3000/file/arquivo.txt
```

A resposta será uma URL criptografada com um token de acesso temporário, por exemplo:

```
http://localhost:3000/encrypted/LWvz1KPU7p/6pX8gErA5Xw==?token=eyJleHAiOjE3MTU2NDU2NTF9&iv=g9gMal_ayBj4R5uXiWyKIQ&filename=your-file.txt
```

3. Copie e cole essa URL em um navegador ou cliente HTTP para baixar o arquivo criptografado. O servidor descriptografará o arquivo e enviará o conteúdo decodificado para download.

O token de acesso expirará após 5 minutos. Se você tentar acessar a URL após a expiração do token, receberá um erro "Token expirado".

## API em PHP
O aplicativo Android precisa fazer duas solicitações para alcançar esse resultado: uma solicitação GET para obter o token de autenticação e uma solicitação POST para buscar e exibir a página HTML. Aqui está um fluxograma simplificado desse processo:

### Aplicativo Android (Cliente):

#### O usuário clica em um botão no aplicativo Android para abrir o arquivo HTML.
* Solicitação GET (Aplicativo Android para a API):

* O aplicativo Android faz uma solicitação GET para a sua API para obter o token de autenticação.
* A API gera um token de autenticação e o armazena no cache do computador (por exemplo, em um cookie).
* A API retorna o token de autenticação para o aplicativo Android.

* Solicitação POST (Aplicativo Android para a API):
* O aplicativo Android faz uma solicitação POST para a sua API para buscar a página HTML.
* O aplicativo Android envia a URL do arquivo HTML junto com o token de autenticação obtido na etapa anterior.
* A API valida o token de autenticação.
* Se o token for válido, a API busca a página HTML e a retorna como resposta.
* O aplicativo Android exibe a página HTML para o usuário, sem revelar o URL verdadeiro.

### Conclusão

Esse eé serviço que usa o Node.js para criptografa arquivos e gera tokens de acesso temporários para download seguro. Essa abordagem garante que apenas usuários autorizados possam acessar os arquivos dentro de um período de tempo limitado, aumentando a segurança e a privacidade do armazenamento de arquivos.
