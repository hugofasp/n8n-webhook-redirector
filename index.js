const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const axios = require('axios');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ATENÇÃO: O URL do Webhook do n8n está agora HARDCODED AQUI.
// ESTE É O NOVO PRODUCTION URL DO SEU WORKFLOW DE COPYWRITING:
const N8N_WEBHOOK_URL = 'https://automation-n8n.cfsjjr.easypanel.host/webhook/2d787043-575e-4a8e-8c87-0b9796fe23d3';

app.post('/webhook-redirect', async (req, res) => {
    try {
        // Embora o URL esteja hardcoded, mantemos esta verificação básica
        // caso a variável N8N_WEBHOOK_URL fosse acidentalmente alterada para null/undefined.
        if (!N8N_WEBHOOK_URL) {
            console.error('ERRO: A URL do Webhook do n8n não está configurada!');
            return res.status(500).send('Webhook URL não configurado.');
        }

        const response = await axios.post(N8N_WEBHOOK_URL, req.body, {
            headers: {
                'Content-Type': req.headers['content-type'] || 'application/json'
            }
        });

        res.status(response.status).send(response.data);

    } catch (error) {
        console.error('Erro ao redirecionar para n8n:', error);
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            res.status(502).send('Erro: Não foi possível conectar ao webhook do n8n. Verifique o URL ou o estado do n8n.');
        } else if (error.response) {
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(500).send('Erro interno do servidor ao processar a solicitação.');
        }
    }
});

app.get('/', (req, res) => {
    res.send('Webhook Redirector is running!');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});