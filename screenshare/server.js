// Servidor simples de sinalização para compartilhamento de tela via WebRTC
// Não transmite vídeo/áudio pelo servidor: apenas troca mensagens (SDP/ICE)
// para que os dois navegadores criem uma conexão direta (P2P).

const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, 'public')));

// salas: { codigoDaSala: Set de conexões }
const salas = new Map();

function entrarNaSala(codigo, ws) {
  if (!salas.has(codigo)) salas.set(codigo, new Set());
  const sala = salas.get(codigo);

  if (sala.size >= 2) {
    ws.send(JSON.stringify({ tipo: 'sala-cheia' }));
    ws.close();
    return;
  }

  sala.add(ws);
  ws.codigoDaSala = codigo;

  // avisa aos outros participantes que alguém entrou
  const outros = [...sala].filter((c) => c !== ws);
  outros.forEach((c) => c.send(JSON.stringify({ tipo: 'par-entrou' })));

  ws.send(JSON.stringify({ tipo: 'entrou', totalNaSala: sala.size }));
}

function sair(ws) {
  const codigo = ws.codigoDaSala;
  if (!codigo || !salas.has(codigo)) return;
  const sala = salas.get(codigo);
  sala.delete(ws);
  sala.forEach((c) => c.send(JSON.stringify({ tipo: 'par-saiu' })));
  if (sala.size === 0) salas.delete(codigo);
}

wss.on('connection', (ws) => {
  ws.on('message', (msgBruta) => {
    let msg;
    try {
      msg = JSON.parse(msgBruta);
    } catch (e) {
      return;
    }

    if (msg.tipo === 'entrar-na-sala') {
      entrarNaSala(msg.codigo, ws);
      return;
    }

    // repassa sinalização (oferta/resposta/ice) para o outro participante da sala
    const codigo = ws.codigoDaSala;
    if (!codigo || !salas.has(codigo)) return;
    const sala = salas.get(codigo);
    [...sala]
      .filter((c) => c !== ws)
      .forEach((c) => c.send(JSON.stringify(msg)));
  });

  ws.on('close', () => sair(ws));
});

const PORTA = process.env.PORT || 3000;
server.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
