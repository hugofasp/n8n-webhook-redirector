// CÓDIGO FINAL PARA index.js

const express = require('express');
const app = express();
const port = process.env.PORT || 8080; // Railway geralmente usa PORT 8080 por padrão ou define via env var
const axios = require('axios'); // Adicionar esta linha para usar axios

// Middleware para parsear o corpo da requisição POST
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Defina a URL do seu webhook do n8n - AGORA LÊ DA VARIÁVEL DE AMBIENTE
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL; // <<< ESTA É A MUDANÇA CRÍTICA

// Verificar se a URL do webhook foi definida
if (!N8N_WEBHOOK_URL) {
    console.error('ERRO: A variável de ambiente N8N_WEBHOOK_URL não está definida!');
    process.exit(1); // Sai da aplicação se a variável crítica não estiver definida
}

// Rota para o redirecionamento POST
app.post('/webhook-redirect', async (req, res) => {
    console.log('Received POST request at /webhook-redirect');
    console.log('Redirecting to n8n webhook:', N8N_WEBHOOK_URL); // Log para confirmar o URL usado
    console.log('Request body:', req.body);

    try {
        // Usar axios.post em vez de fetch para melhor tratamento de erros e compatibilidade
        const n8nResponse = await axios.post(N8N_WEBHOOK_URL, req.body, {
            headers: {
                'Content-Type': req.headers['content-type'] || 'application/json',
            }
        });

        console.log('Response from n8n:', n8nResponse.status, n8nResponse.data);

        // Envia a resposta do n8n de volta para o cliente (navegador)
        res.status(n8nResponse.status).send(n8nResponse.data);

    } catch (error) {
        console.error('Error redirecting to n8n:', error);
        // Tentar enviar uma resposta de erro mais útil se for um erro de rede/conexão
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            res.status(502).send('Erro: Não foi possível conectar ao webhook do n8n. Verifique o URL ou o estado do n8n.');
        } else if (error.response) {
            // Se houver uma resposta HTTP do n8n (ex: 404, 500)
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(500).send('Erro interno do servidor ao processar a solicitação.');
        }
    }
});

// Rota de teste simples (GET) para verificar se o serviço está ativo
app.get('/', (req, res) => {
    res.send('Webhook Redirector is running!');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});