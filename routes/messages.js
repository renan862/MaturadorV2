const express = require('express');
const router = express.Router();
const { sendMessagesRandomly } = require('../services/messageSender');
const { sessions } = require('../controllers/sessionController');
const numbers = require('../sessions/numbers.json'); // Importa o arquivo JSON com os números

router.post('/send', async (req, res) => {
    const { sessionName, repeatCount } = req.body;
  
    if (!sessions[sessionName])
      return res.status(404).json({ error: 'Sessão não encontrada.' });
  
    sendMessagesRandomly(sessionName, sessions[sessionName], numbers, repeatCount);
    res.json({ message: 'Disparo iniciado.' });
  });
  

module.exports = router;
