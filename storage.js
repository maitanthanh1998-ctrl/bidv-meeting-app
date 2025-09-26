// Netlify function for cloud storage
// Uses JSONBin.io as free external storage service

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

// JSONBin.io configuration (free tier - 100k requests/month)
const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3/b';
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || '$2a$10$demo-key-for-development';
const BIN_ID = process.env.JSONBIN_BIN_ID || '6507ac8354105e766fbf4c4f'; // Demo bin ID

// Fallback in-memory storage for development
let memoryStorage = {};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  const { httpMethod, path, body } = event;
  const segments = path.split('/').filter(Boolean);
  const key = segments[segments.length - 1];

  // Helper functions for JSONBin.io
  const getFromJsonBin = async () => {
    try {
      const response = await fetch(`${JSONBIN_BASE_URL}/${BIN_ID}/latest`, {
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
        },
      });
      if (response.ok) {
        const result = await response.json();
        return result.record || {};
      }
    } catch (error) {
      console.error('JSONBin get error:', error);
    }
    return memoryStorage;
  };

  const saveToJsonBin = async (data) => {
    try {
      const response = await fetch(`${JSONBIN_BASE_URL}/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY,
        },
        body: JSON.stringify(data),
      });
      return response.ok;
    } catch (error) {
      console.error('JSONBin save error:', error);
      memoryStorage = data; // Fallback to memory
      return false;
    }
  };

  try {
    switch (httpMethod) {
      case 'GET':
        const storage = await getFromJsonBin();
        if (key && key !== 'storage') {
          const value = storage[decodeURIComponent(key)];
          if (!value) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'Not found' }),
            };
          }
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              id: key,
              key: decodeURIComponent(key),
              value: value,
              updatedAt: new Date().toISOString(),
            }),
          };
        }
        // List all keys
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(Object.keys(storage)),
        };

      case 'POST':
      case 'PUT':
        const data = JSON.parse(body || '{}');
        if (!data.key || !data.value) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Key and value required' }),
          };
        }
        
        const currentStorage = await getFromJsonBin();
        currentStorage[data.key] = data.value;
        
        const saved = await saveToJsonBin(currentStorage);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            key: data.key,
            saved_to_cloud: saved,
            updatedAt: new Date().toISOString() 
          }),
        };

      case 'DELETE':
        if (key) {
          const currentStorage = await getFromJsonBin();
          if (currentStorage[decodeURIComponent(key)]) {
            delete currentStorage[decodeURIComponent(key)];
            await saveToJsonBin(currentStorage);
          }
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
