import express from 'express';
import { VpnLog } from '../models/VpnLog.js';

const router = express.Router();

// Get recent VPN detection logs
router.get('/recent', async (req, res) => {
  try {
    const logs = await VpnLog.find()
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching VPN logs:', error);
    res.status(500).json({ error: 'Failed to fetch VPN logs' });
  }
});

// Get VPN detection statistics
router.get('/stats', async (req, res) => {
  try {
    const totalLogs = await VpnLog.countDocuments();
    const vpnDetected = await VpnLog.countDocuments({ isVpn: true });
    
    res.json({
      total: totalLogs,
      vpnDetected,
      percentage: totalLogs ? ((vpnDetected / totalLogs) * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Error fetching VPN stats:', error);
    res.status(500).json({ error: 'Failed to fetch VPN statistics' });
  }
});

// Get logs for a specific IP
router.get('/ip/:ip', async (req, res) => {
  try {
    const logs = await VpnLog.find({ ip: req.params.ip })
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching IP logs:', error);
    res.status(500).json({ error: 'Failed to fetch IP logs' });
  }
});

export { router as vpnRouter };