import express from 'express';
import { getConfig, setConfig } from '../controllers/syncConfigController.js';

const router = express.Router();

router.get('/', getConfig);
router.post('/', setConfig);

export default router;
