const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear o corpo da requisição POST
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Defina a URL do seu webhook do n8n
// ***** ATENÇÃO: SUBSTITUA ESTA URL PELA SUA URL REAL DO WEBHOOK DO N8N *****
const N8N_WEBHOOK_URL = 'https://automation-n8n.cfsjjr.easypanel.host/webhook-test/f8c120f7-438d-4e22-af3b-f5044c438747'; // Substitua AQUI

// Rota para o redirecionamento POST
app.post('/webhook-redirect', async (req, res) => {
  console.log('Received POST request at /webhook-redirect');
  console.log('Request body:', req.body);

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const n8nResponse = await response.text();
    console.log('Response from n8n:', response.status, n8nResponse);

    res.status(response.status).send(n8nResponse);

  } catch (error) {
    console.error('Error redirecting to n8n:', error);
    res.status(500).send('Internal server error processing the request.');
  }
});

// Rota de teste simples (GET) para verificar se o serviço está ativo
app.get('/', (req, res) => {
  res.send('Webhook Redirector is running!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
