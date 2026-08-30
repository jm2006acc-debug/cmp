# Compartilhamento de Tela — App Simples

App web para compartilhar a tela entre duas pessoas em tempo real, usando WebRTC (P2P). O servidor Node.js só faz a "sinalização" inicial (troca de convite entre os dois navegadores) — o vídeo da tela vai direto de um computador para o outro, sem passar pelo servidor.

## Como rodar

1. Instale o Node.js (versão 18 ou mais recente): https://nodejs.org
2. Abra um terminal na pasta do projeto e rode:
   ```
   npm install
   npm start
   ```
3. O servidor vai subir em `http://localhost:3000`

## Como usar

1. A pessoa A abre `http://localhost:3000`, clica em **"Gerar código"** e depois em **"Entrar na sala"**.
2. A pessoa A envia o código gerado (ex: `azul-123`) para a pessoa B por qualquer meio (WhatsApp, etc).
3. A pessoa B abre o mesmo endereço, digita o código recebido e clica em **"Entrar na sala"**.
4. Quando as duas estiverem na sala, qualquer uma pode clicar em **"Compartilhar minha tela"**.
5. A outra pessoa verá a tela aparecer automaticamente em "Tela recebida".

## Importante: para usar entre pessoas em locais diferentes

Rodando só em `localhost`, apenas você (na sua própria máquina) consegue acessar. Para compartilhar de verdade com outra pessoa pela internet, você precisa publicar esse servidor em algum lugar acessível publicamente, por exemplo:
- **Render**, **Railway** ou **Fly.io** (planos gratuitos simples para apps Node.js)
- Uma VPS própria (ex: DigitalOcean, EC2)

O processo em qualquer uma dessas opções é parecido: suba os arquivos deste projeto, configure o comando de start como `npm start` e a porta como variável de ambiente `PORT` (o código já está preparado para isso).

## Estrutura do projeto

```
screenshare/
├── server.js          → servidor Express + WebSocket (sinalização)
├── package.json        → dependências (express, ws)
└── public/
    └── index.html       → interface + lógica WebRTC (tudo em um arquivo)
```

## Limitações desta versão simples

- Suporta apenas 2 pessoas por sala (quem compartilha e quem assiste — mas ambos podem compartilhar, um de cada vez).
- Não há áudio incluído (só vídeo da tela). Dá pra adicionar facilmente trocando `audio: false` por `audio: true` no `getDisplayMedia`.
- Não há autenticação — qualquer pessoa com o código da sala pode entrar.
