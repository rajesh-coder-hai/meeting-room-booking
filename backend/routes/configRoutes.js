const express = require('express');
const { createConfig, viewConfig, updateConfigById, deleteConfigById } = require('../controllers/configController');
const router = express.Router();

router.post('/', createConfig);
router.get('/', viewConfig);
router.put('/:id', updateConfigById);
router.delete('/:id', deleteConfigById);

module.exports = router;
