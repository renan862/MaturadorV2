const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const sessionRoutes = require('./routes/sessions');
const messageRoutes = require('./routes/messages');
const configRoutes = require('./routes/config'); // Importa as rotas de configuração
const { loadActiveSessions } = require('./controllers/sessionController'); // Importa a função de carregar as sessões

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

global._io = io;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/sessions', sessionRoutes);
app.use('/messages', messageRoutes);
app.use('/config', configRoutes); // Usa as rotas de configuração

app.get('/', (req, res) => res.send('WhatsApp Maturation System - Online'));

const PORT = process.env.PORT || 3000;

// Carregar as sessões ativas ao iniciar o servidor
loadActiveSessions().then(() => {
  console.log('✅ Sessões ativas carregadas com sucesso!');
  server.listen(PORT, () => {
    console.log(`✅ Servidor iniciado na porta ${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Erro ao carregar sessões ativas:', err);
  process.exit(1); // Se falhar ao carregar as sessões, finalize o processo
});



