const express = require('express');
const router = express.Router();
const {
  createSession,
  getSessions,
  stopSession,
  restartSession,
  deleteSession
} = require('../controllers/sessionController');

router.post('/create', createSession);
router.get('/list', getSessions);
router.post('/stop', stopSession);
router.post('/restart', restartSession);
router.delete('/delete', deleteSession);

module.exports = router;
