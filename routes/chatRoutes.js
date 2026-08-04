const express = require('express');
const router = express.Router();
const { processarMensagem, limparHistorico } = require('../controllers/chatController');

// POST /api/chat -> conversar com a IA
router.post('/', processarMensagem);

// DELETE /api/chat/limpar -> apagar o histórico do banco
router.delete('/limpar', limparHistorico);

module.exports = router;