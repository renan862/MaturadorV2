const express = require('express');
const router = express.Router();
const {
    getGlobalRepeat,
    getMin,
    getMax,
    updateGlobalRepeat,
    updateMin,
    updateMax 
} = require('../controllers/configController'); // Importa as funções do controller

router.get('/globalRepeat', getGlobalRepeat); // Rota para obter o valor de globalRepeat
router.get('/min', getMin); // Rota para obter o valor de min
router.get('/max', getMax); // Rota para obter o valor de max
router.post('/globalRepeat', updateGlobalRepeat); // Rota para atualizar o valor de globalRepeat
router.post('/min', updateMin); // Rota para atualizar o valor de min
router.post('/max', updateMax); // Rota para atualizar o valor de max
    
module.exports = router; // Exporta o router para ser usado em outros arquivos