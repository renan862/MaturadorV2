// Inicializa a conexão com o servidor usando Socket.io
const socket = io();

// Obtém os elementos do DOM para manipulação
const sessionList = document.getElementById("session-list");
const qrContainer = document.getElementById("qr-container");
const logMessages = document.getElementById("log-messages");
const repeatInput = document.getElementById("repeat-count");
let activeSessions = [];
let globalRepeat = 1;

// Carrega a lista de sessões ativas do servidor e atualiza o DOM
function loadSessions() {
  sessionList.innerHTML = "";
  fetch("/sessions/list")
    .then((res) => res.json())
    .then((data) => {
      activeSessions = data.activeSessions;
      activeSessions.forEach((session) => addSessionElement(session));
    });
}

//Carrega o valor de repetição global do servidor
fetch('/config/globalRepeat')
    .then(res => res.json())
    .then(data => {
        const input = document.getElementById('repeat-count');
        input.value = data.globalRepeat || 1; // Define o valor padrão como 1 se não houver valor definido
    })
    .catch(err => {
        console.error('Erro ao carregar o valor de repetição global:', err);
    })

// Carrega o valor mínimo do servidor
fetch('config/min')
    .then(res => res.json())
    .then(data => {
        const input = document.getElementById('time-min');
        input.value = data.min
    })
    .catch(err => {
        console.error('Erro ao carregar o valor mínimo:', err);
    })

// Carrega o valor máximo do servidor
fetch('config/max')
    .then(res => res.json())
    .then(data => {
        const input = document.getElementById('time-max');
        input.value = data.max
    })
    .catch(err => {
        console.error('Erro ao carregar o valor máximo:', err);

    })

// Atualiza o valor de repetição global no servidor
function updateGlobalRepeat() {
    const repeatCount = document.getElementById('repeat-count').value;
    fetch('/config/globalRepeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ globalRepeat: repeatCount })
    })
    .then(res => res.json())
    .then(data => {        
        console.log('Valor de repetição global atualizado:', data.globalRepeat);
    })
    .catch(err => {
        alert('Erro ao atualizar o valor de repetição global:', err);
        console.error('Erro ao atualizar o valor de repetição global:', err);
    })
}   
// Atualiza o valor mínimo no servidor
function updateMin() {
    const min = document.getElementById('time-min').value;
    fetch('/config/min', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ min: min })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Valor mínimo atualizado:', data.min);   
    })
    .catch(err => {
        alert('Erro ao atualizar o valor mínimo:', err);
        console.error('Erro ao atualizar o valor mínimo:', err);
    })
}
// Atualiza o valor máximo no servidor
function updateMax() {
    const max = document.getElementById('time-max').value;
    fetch('/config/max', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ max: max })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Valor máximo atualizado:', data.max);
    })
    .catch(err => {
        alert('Erro ao atualizar o valor máximo:', err);
        console.error('Erro ao atualizar o valor máximo:', err);
    })
}
//Função para atualizar os 3 valores de configuração
function saveAll() {
    updateGlobalRepeat();
    updateMin();
    updateMax();    
    mostrarAlerta("Atenção","As configurações foram salvas com sucesso"); // Chama a função para mostrar o alerta
}
// Cria uma nova sessão no servidor
document.getElementById("create-session").onclick = () => {
  const name = document.getElementById("session-input").value;
  if (!name) return alert("Informe o nome da sessão.");
  fetch("/sessions/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionName: name }),
  }).then(loadSessions);
};

// Envia uma mensagem para todas as sessões ativas, repetindo conforme configurado
document.getElementById("send-all").onclick = () => {
    activeSessions.forEach((session) => {
                  
            fetch("/messages/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionName: session,
                repeatCount: globalRepeat,
            }),
            })
            
        
    });
  };
  
// Interrompe todas as sessões ativas
document.getElementById("stop-all").onclick = () => {
  activeSessions.forEach((session) => window.stopSession(session));
};

// Reinicia todas as sessões ativas
document.getElementById("restart-all").onclick = () => {
  activeSessions.forEach((session) => {
    fetch("/sessions/restart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionName: session }),
    }).then(loadSessions);
  });
};

// Adiciona um item à lista de sessões no DOM
function addSessionElement(session) {
  const li = document.createElement("li");
  li.className = "bg-gray-800 px-3 py-2 rounded flex justify-between items-center";
  li.innerHTML = `
    <span class="font-semibold">${session}</span>
    <div class="flex gap-2">
      <button onclick="sendMsg('${session}')" class="bg-blue-600 px-2 py-1 rounded">Enviar</button>
      <button onclick="stopSession('${session}')" class="bg-yellow-600 px-2 py-1 rounded">Parar</button>
      <button onclick="restartSession('${session}')" class="bg-orange-600 px-2 py-1 rounded">Reiniciar</button>
      <button onclick="deleteSession('${session}')" class="bg-red-600 px-2 py-1 rounded">Deletar</button>
    </div>
  `;
  sessionList.appendChild(li);
}

// Função para enviar mensagem para todas as sessões ativas
window.sendMsgToAllSessions = (sessions) => {
    sessions.forEach((session) => {
      let i = 0;
      function repeatSend() {
        if (i >= globalRepeat) return; // Não envia mais se atingiu o limite de repetições
        fetch("/messages/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionName: session,
            repeatCount: globalRepeat,
          }),
        }).then(() => {
          i++;
          if (i < globalRepeat) {
            setTimeout(repeatSend, 1000); // Reenvia a mensagem a cada 1 segundo, até atingir o limite
          }
        });
      }
      repeatSend();
    });
  };
  
  
// Função para enviar mensagem para uma sessão específica
window.sendMsg = (session) => {
  fetch(`/messages/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionName: session,
      repeatCount: globalRepeat,
    }),
  });
};

// Função para parar uma sessão específica
window.stopSession = (session) => {
  fetch("/sessions/stop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionName: session }),
  }).then(loadSessions);
};

// Função para deletar uma sessão específica
window.deleteSession = (session) => {
  fetch("/sessions/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionName: session }),
  }).then(loadSessions);
};
// Função para reiniciar uma sessão específica
window.restartSession = (session) => {
  fetch("/sessions/restart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionName: session }),
  }).then(loadSessions);
};

// Exibe o QR code recebido do servidor
socket.on("qrCode", ({ session, base64Qrimg }) => {
  const div = document.createElement("div");
  div.className = "p-3 bg-gray-800 rounded";
  div.innerHTML = `<p class="font-bold">${session}</p><img src="${base64Qrimg}" class="mt-2 border" />`;
  qrContainer.appendChild(div);
});

// Exibe o log de mensagens enviadas com sucesso
socket.on("messageSent", ({ session, to, content }) => {
  const li = document.createElement("li");
  const timestamp = new Date().toLocaleTimeString();
  li.innerHTML = `<span class="text-green-400">[${timestamp}] [${session}]</span> → ${to} : "${content}"`;
  logMessages.prepend(li);
});

// Exibe o log de erro ao tentar enviar uma mensagem
socket.on("messageError", ({ session, to, error }) => {
  const li = document.createElement("li");
  const timestamp = new Date().toLocaleTimeString();
  li.innerHTML = `<span class="text-red-400">[${timestamp}] Erro na sessão: [${session}]</span> → ${to} : "${error}"`;
  logMessages.prepend(li);
});

//Alerta personalizado 
function mostrarAlerta(title, msg) {
    const alerta = document.createElement('div');
    alerta.classList.add('bg-teal-100', 'border-t-4', 'border-teal-500', 'rounded-b', 'text-teal-900', 'px-4', 'py-2', 'shadow-md', 'absolute', 'top-4', 'right-4', 'w-72', 'z-50');
    alerta.setAttribute('role', 'alert');
    alerta.innerHTML = `<div class="flex"><div class="py-1"><svg class="fill-current h-6 w-6 text-teal-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg></div><div><p class="font-bold">${title}</p><p class="text-sm">${msg}</p></div></div>`;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 5000);
  }


  function atualizarRelogio() {
    const clock = document.getElementById('clock');
    const now = new Date();

    let horas = now.getHours();
    let minutos = now.getMinutes();
    let segundos = now.getSeconds();

    // Adiciona 0 antes de números menores que 10
    horas = horas < 10 ? '0' + horas : horas;
    minutos = minutos < 10 ? '0' + minutos : minutos;
    segundos = segundos < 10 ? '0' + segundos : segundos;

    // Exibe no formato HH:MM:SS
    clock.textContent = `${horas}:${minutos}:${segundos}`;
}

// Atualiza o relógio a cada segundo
setInterval(atualizarRelogio, 1000);

// Chama a função uma vez para exibir o relógio imediatamente
atualizarRelogio();

// Inicializa o carregamento das sessões ao carregar a página
loadSessions();
