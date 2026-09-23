# 🤖 Assistente Gemini — API

API de um assistente de IA com **Google Gemini** e **memória no MongoDB Atlas**, organizada em arquitetura **MVC**.

Projeto da disciplina **Serviços em Nuvem** — IFPR Campus Assis Chateaubriand.

## 📁 Estrutura

```
backend/
├── controllers/
│   ├── chatController.js   # Lógica da IA + salvar/limpar no banco
│   └── pdfController.js    # Gera o PDF com o resumo da conversa
├── models/
│   └── Mensagem.js         # Schema do Mongoose
├── routes/
│   ├── chatRoutes.js       # /api/chat
│   └── pdfRoutes.js        # /api/pdf
├── .env.example            # Modelo das variáveis de ambiente
├── package.json
└── server.js               # "Maestro": conecta o banco e carrega as rotas
```

## 🔌 Rotas

| Método | Rota               | Descrição                                   |
|--------|--------------------|---------------------------------------------|
| POST   | `/api/chat`        | Envia `{ "pergunta": "..." }` e recebe a resposta da IA |
| DELETE | `/api/chat/limpar` | Apaga todo o histórico do MongoDB           |
| POST   | `/api/pdf`         | Envia `{ "historico": "..." }` e recebe um PDF com o resumo |

## ▶️ Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie o arquivo de exemplo e preencha com suas chaves:
   ```bash
   cp .env.example .env
   ```
   - `GEMINI_API_KEY` → gere em https://aistudio.google.com/apikey
   - `MONGO_URI` → no MongoDB Atlas: **Connect → Drivers** (troque `<password>` pela senha do usuário do banco)
3. Inicie o servidor:
   ```bash
   npm start
   ```
   O servidor sobe em `http://localhost:3000`.

## ☁️ Deploy

- **Back-end:** Render — cadastre `GEMINI_API_KEY` e `MONGO_URI` em *Environment*.
- **Front-end:** Vercel — ajuste a constante `API_RENDER` no `index.html` com a URL do Render.

## 🛠️ Tecnologias

Node.js · Express · Mongoose · MongoDB Atlas · Google Gemini · PDFKit · Marked.js