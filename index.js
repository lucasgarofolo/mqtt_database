require('dotenv').config();
const express = require('express');
const mqtt = require('mqtt');
const pg = require('pg');
const url = require('url');

const app = express();
app.use(express.json());

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: true,
        //ca: fs.readFileSync('certs/ca.pem').toString(),
        ca: process.env.DB_CA,
    },
};

const client = new pg.Client(config);
client.connect(function (err) {
    if (err)
        throw err;
    client.query("SELECT VERSION()", [], function (err, result) {
        if (err)
            throw err;

        console.log(result.rows[0].version);
    });
});

// Configuração do cliente MQTT
const mqttClient = mqtt.connect(process.env.MQTT_BROKER, {
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASSWORD,
    protocol: 'tls',
});

const MQTT_TOPIC = process.env.MQTT_TOPIC;

mqttClient.on('connect', () => {
    console.log(`Conectado ao MQTT Broker e inscrito no tópico: ${MQTT_TOPIC}`);
    mqttClient.subscribe(MQTT_TOPIC);
});

mqttClient.on('message', async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        //console.log('Dados recebidos:', data);
        
        const query = `INSERT INTO atendimentos (bico_id, tempo_espera, tempo_atendimento, data_hora) VALUES ($1, $2, $3, $4)`;
        const values = [data.bico_id, data.tempo_espera, data.tempo_atendimento, data.data_hora];
        await client.query(query, values);
        console.log('Dados inseridos no banco');
    } catch (error) {
        console.error('Erro ao processar mensagem MQTT:', error);
    }
});

// Rota para verificar se a API está rodando
app.get('/', (req, res) => {
    res.send({ status: 'API rodando' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
