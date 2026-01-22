// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'OK' });
  }
  
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  return res.json({
    status: 'healthy',
    service: 'hello-net-backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: 'vercel'
  });
}