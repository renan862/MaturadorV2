const wppconnect = require('@wppconnect-team/wppconnect');
const fs = require('fs');// Módulo para leitura de arquivos
const path = require('path');// Módulo para manipulação de caminhos de arquivos

// Objeto de sessões ativas
const sessions = {};
// Caminho do arquivo JSON para armazenar as sessões ativas
const sessionsFilePath = path.resolve(__dirname, '..', 'sessions', 'activeSessions.json');

// Função para carregar as sessões ativas do arquivo JSON
function loadSessionsFromFile() {
  if (fs.existsSync(sessionsFilePath)) {
    const data = fs.readFileSync(sessionsFilePath, 'utf-8');
    return JSON.parse(data); // Retorna os nomes das sessões
  }
  return []; // Caso o arquivo não exista, retorna um array vazio
}

// Função para salvar as sessões ativas no arquivo JSON
function saveSessionsToFile() {
  const sessionNames = Object.keys(sessions); // Coleta os nomes das sessões ativas
  fs.writeFileSync(sessionsFilePath, JSON.stringify(sessionNames, null, 2)); // Salva no arquivo JSON
}

// Função para criar uma nova sessão
exports.createSession = async (req, res) => {
  const { sessionName } = req.body;
  if (!sessionName) return res.status(400).json({ error: 'sessionName é obrigatório.' });

  try {
    const client = await wppconnect.create({
      session: sessionName,
      catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
        global._io.emit('qrCode', { session: sessionName, base64Qrimg });
      },
      statusFind: (status, session) => {
        console.log(`🔄 Sessão ${session}: ${status}`);
      },
      headless: true,
      puppeteerOptions: { args: ['--no-sandbox'] },
      sessionPath: path.resolve(__dirname, '..', 'sessions')
    });

    sessions[sessionName] = client;
    saveSessionsToFile(); // Salva as sessões no arquivo após criar uma nova
    res.status(201).json({ message: `Sessão ${sessionName} criada com sucesso.` });

  } catch (err) {
    console.error(`Erro ao criar sessão ${sessionName}:`, err);
    res.status(500).json({ error: 'Erro ao criar sessão.' });
  }
};

// Função para obter as sessões ativas
exports.getSessions = (req, res) => {
  const activeSessions = Object.keys(sessions);
  res.json({ activeSessions });
};

// Função para parar uma sessão
exports.stopSession = (req, res) => {
  const { sessionName } = req.body;
  if (sessions[sessionName]) {
    sessions[sessionName].close();
    //delete sessions[sessionName];
    //saveSessionsToFile(); // Salva as sessões após parar uma
    //return res.json({ message: `Sessão ${sessionName} parada.` });
  }
  res.status(404).json({ error: 'Sessão não encontrada.' });
};

// Função para reiniciar uma sessão
exports.restartSession = async (req, res) => {
  const { sessionName } = req.body;
  if (sessions[sessionName]) {
    await sessions[sessionName].close();
    //delete sessions[sessionName];
  }
  req.body.sessionName = sessionName;
  await exports.createSession(req, res);
};

// Função para deletar uma sessão
exports.deleteSession = (req, res) => {
  const { sessionName } = req.body;
  const sessionFilePath = path.join(__dirname, '..', 'tokens', sessionName);
  if (fs.existsSync(sessionFilePath)) {
    fs.rmSync(sessionFilePath, { recursive: true });
    delete sessions[sessionName];
    saveSessionsToFile(); // Atualiza o arquivo após deletar a sessão
    return res.json({ message: `Sessão ${sessionName} deletada.` });
  }
  res.status(404).json({ error: 'Sessão não encontrada.' });
};

// Função para carregar as sessões ativas ao iniciar o servidor
exports.loadActiveSessions = async () => {
  const sessionNames = loadSessionsFromFile(); // Carrega as sessões do arquivo JSON
  for (const sessionName of sessionNames) {
    try {
      const client = await wppconnect.create({
        session: sessionName,
        headless: true,
        puppeteerOptions: { args: ['--no-sandbox'] },
        sessionPath: path.resolve(__dirname, '..', 'sessions')
      });

      sessions[sessionName] = client;
      console.log(`✅ Sessão ${sessionName} restaurada com sucesso.`);
    } catch (err) {
      console.error(`❌ Erro ao restaurar sessão ${sessionName}:`, err);
    }
  }
};

// Exportando as sessões para poder acessar em outras partes do código
exports.sessions = sessions;
