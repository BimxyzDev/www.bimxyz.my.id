const axios = require('axios');
const qs = require('qs');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const ATLANTIC_URL = 'https://atlantich2h.com';
  const API_KEY = 'TBdyF1Yp2mn63eoR1jkAX1ZrE3K96j41fo3tpN84A4TubYf7hflBKH9n5EBvsgGsFm3WPY482eAQ06zbN1WOgM1RvoY1w30gCdPh';

  try {
    const { action, ...requestData } = req.body;
    
    if (!action) {
      return res.status(400).json({ 
        success: false, 
        message: 'Action is required' 
      });
    }

    let endpoint = '';
    let payload = { api_key: API_KEY };

    switch (action) {
      case 'create':
        endpoint = '/deposit/create';
        payload = {
          ...payload,
          reff_id: requestData.reff_id || `DEP${Date.now()}`,
          nominal: parseInt(requestData.nominal) || 10000,
          type: requestData.type || 'ewallet',
          metode: requestData.metode || 'qris'
        };
        break;

      case 'status':
        endpoint = '/deposit/status';
        payload = {
          ...payload,
          id: requestData.id
        };
        break;

      case 'instant':
        endpoint = '/deposit/instant';
        payload = {
          ...payload,
          id: requestData.id,
          action: 'true'
        };
        break;

      case 'cancel':
        endpoint = '/deposit/cancel';
        payload = {
          ...payload,
          id: requestData.id
        };
        break;

      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid action' 
        });
    }

    console.log(`Calling Atlantic API: ${endpoint}`, payload);

    const config = {
      method: 'post',
      url: ATLANTIC_URL + endpoint,
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      data: qs.stringify(payload),
      timeout: 30000
    };

    const response = await axios(config);
    
    // Forward Atlantic response to client
    res.status(200).json(response.data);

  } catch (error) {
    console.error('Atlantic API Error:', error.message);
    
    if (error.response) {
      // Atlantic API returned error
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // No response received
      res.status(500).json({
        success: false,
        message: 'No response from Atlantic API',
        error: error.message
      });
    } else {
      // Request setup error
      res.status(500).json({
        success: false,
        message: 'Request setup failed',
        error: error.message
      });
    }
  }
};
