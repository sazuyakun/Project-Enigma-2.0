import axios from 'axios';
import { VpnLog } from '../models/VpnLog.js';

const IPINFO_TOKEN = 'a293b4fa2f2e78';

const vpnDetection = async (req, res, next) => {
  try {
    let ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
    ip = ip.replace('::ffff:', '');
    
    // Skip for localhost but get external IP
    if (ip === '::1' || ip === '127.0.0.1') {
      const externalIpResponse = await axios.get('https://api.ipify.org?format=json');
      ip = externalIpResponse.data.ip;
    }

    const response = await axios.get(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`);
    
    // Check for VPN/Proxy indicators
    const vpnIndicators = ['vpn', 'proxy', 'hosting', 'datacenter', 'cloud'];
    const isVpn = vpnIndicators.some(indicator => 
      (response.data.org || '').toLowerCase().includes(indicator) ||
      (response.data.company || '').toLowerCase().includes(indicator)
    );

    // Store the detection result
    await VpnLog.create({
      ip,
      isVpn, // Matched case with schema
      details: {
        org: response.data.org,
        company: response.data.company,
        hostname: response.data.hostname,
        city: response.data.city,
        region: response.data.region,
        country: response.data.country
      },
      userAgent: req.headers['user-agent']
    });

    // Add VPN status to request object
    req.vpnStatus = {
      isVpn, // Matched case with schema
      details: response.data
    };

    if (isVpn) { // Matched case with schema
      res.set('X-VPN-Detected', 'true');
    }

    next();
  } catch (error) {
    console.error('VPN detection error:', error.message);
    // Don't stop the request on VPN detection errors
    next();
  }
};

export default vpnDetection;