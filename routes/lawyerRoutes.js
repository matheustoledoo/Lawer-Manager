const express = require('express');
const router = express.Router();
const lawyerController = require('../controllers/lawyerController');

// Rota para obter todos os advogados
router.get('/', lawyerController.getAllLawyers);

// Rota para adicionar um advogado
router.post('/add', lawyerController.createLawyer);

// Rota para deletar um advogado
router.post('/delete/:id', lawyerController.deleteLawyer);

// Rota para exportar advogados para Excel
router.get('/export', lawyerController.exportLawyers);

module.exports = router;
