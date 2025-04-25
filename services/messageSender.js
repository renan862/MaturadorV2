// services/messageSender.js

const fs = require('fs');  // Módulo para leitura de arquivos
const path = require('path');  // Módulo para manipulação de caminhos de arquivos
//const interval = require('../config.json');  // Carrega configurações de intervalos de envio

// Função para carregar o arquivo de configurações sempre que necessário
function carregarConfig() {
  const configPath = path.join(__dirname, '../config.json');  // Caminho do arquivo config.json
  const configData = fs.readFileSync(configPath, 'utf-8');  // Lê o arquivo
  const config = JSON.parse(configData);  // Converte o conteúdo para objeto
  //console.log("Config carregada:", config);  // Verifique se o arquivo está sendo lido corretamente
  return config;
}


// Função para gerar um número aleatório entre 'min' e 'max'
function getRandomInt() {
  const config = carregarConfig();
  //console.log(`Intervalo: ${config.min} - ${config.max}`);  // Exibe o intervalo no console
  return Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
}


// Função para embaralhar uma lista de números
function randomListNumbers(array) {
    for (let i = array.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));  // Gera um índice aleatório
        [array[i], array[j]] = [array[j], array[i]];  // Troca os elementos
    }
}   

// Função para carregar as mensagens a partir do arquivo 'frases.txt'
function loadMessages() {
  const filePath = path.resolve(__dirname, '../messages/frases.txt');  // Caminho do arquivo
  const content = fs.readFileSync(filePath, 'utf-8');  // Lê o conteúdo do arquivo
  return content.split('\n').filter(Boolean);  // Divide por linha e remove linhas vazias
}

// Função assíncrona para enviar mensagens aleatoriamente para os números-alvo
async function sendMessagesRandomly(sessionName, client, targetNumbers = [], repeatCount) {
    for (let i = 0; i < repeatCount; i++) {  // Repete o envio conforme o número especificado
  const messages = loadMessages();  // Carrega as mensagens
  
  if (!messages.length) {  // Se não houver mensagens, emite aviso
    console.warn(`⚠️ Nenhuma mensagem disponível para envio.`);
    return;
  }
  randomListNumbers(targetNumbers);  // Embaralha a lista de números-alvo
  // Envia mensagem aleatória para cada número da lista
  for (const number of targetNumbers) {
    const message = messages[Math.floor(Math.random() * messages.length)];  // Mensagem aleatória
    const delay = getRandomInt() * 1000;  // Intervalo aleatório para o envio
    console.log(`Valor do intervalo: ${delay}`);

    try {
      await client.sendText(number, message);  // Envia a mensagem
      console.log(`✅ [${sessionName}] Enviou para ${number}: "${message}"`);

      // Emite um evento global indicando que a mensagem foi enviada
      global._io.emit('messageSent', { session: sessionName, to: number, content: message });
    } catch (err) {
      // Caso ocorra erro, emite um evento de erro
      let i = 0; if (i < 3) {  // Tenta enviar até 3 vezes
        break;
      }
        // Inicializa o contador de tentativas
      console.error(`❌ Erro ao enviar para ${number} [${sessionName}]:`, err.message);
      global._io.emit('messageError', { session: sessionName, to: number, error: err.message });
      if (i >= 3){
        global._io.emit('messageError', { session: sessionName, to: number, error: err.message });
        break;  // Sai do loop se o erro persistir
      }
      
    }

    await new Promise(resolve => setTimeout(resolve, delay));  // Aguarda o intervalo antes do próximo envio
  }
  }
}

module.exports = { sendMessagesRandomly };
