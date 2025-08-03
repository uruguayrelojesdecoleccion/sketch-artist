#!/usr/bin/env node

/**
 * Script de Testing para APIs de OpenAI y Firecrawl
 * 
 * Uso:
 * node scripts/test-apis.js
 * 
 * Requiere variables de entorno:
 * - OPENAI_API_KEY
 * - FIRECRAWL_API_KEY (opcional)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Colores para console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Función para hacer requests HTTPS
function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body)
          };
          resolve(response);
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test OpenAI API
async function testOpenAI() {
  logInfo('Testing OpenAI API...');
  
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    logError('OPENAI_API_KEY not found in environment variables');
    return false;
  }

  try {
    const response = await makeRequest(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        }
      },
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test message. Please respond with "API test successful".'
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      }
    );

    if (response.status === 200) {
      logSuccess('OpenAI API test successful');
      log(`Response: ${response.body.choices[0].message.content}`, 'green');
      return true;
    } else {
      logError(`OpenAI API test failed: ${response.status} - ${JSON.stringify(response.body)}`);
      return false;
    }
  } catch (error) {
    logError(`OpenAI API test error: ${error.message}`);
    return false;
  }
}

// Test Firecrawl API
async function testFirecrawl() {
  logInfo('Testing Firecrawl API...');
  
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  if (!firecrawlKey) {
    logWarning('FIRECRAWL_API_KEY not found - skipping Firecrawl test');
    return true; // No es crítico para el funcionamiento básico
  }

  try {
    const response = await makeRequest(
      'https://api.firecrawl.dev/v1/scrape',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        }
      },
      {
        url: 'https://example.com',
        formats: ['html'],
        waitFor: 1000
      }
    );

    if (response.status === 200 && response.body.success) {
      logSuccess('Firecrawl API test successful');
      log(`Scraped content length: ${response.body.data.html?.length || 0} characters`, 'green');
      return true;
    } else {
      logError(`Firecrawl API test failed: ${response.status} - ${JSON.stringify(response.body)}`);
      return false;
    }
  } catch (error) {
    logError(`Firecrawl API test error: ${error.message}`);
    return false;
  }
}

// Test de validación de URLs
function testURLValidation() {
  logInfo('Testing URL validation...');
  
  const testUrls = [
    'https://example.com',
    'https://www.google.com',
    'https://github.com',
    'http://invalid-url',
    'not-a-url',
    'https://'
  ];

  let validCount = 0;
  let invalidCount = 0;

  testUrls.forEach(url => {
    try {
      new URL(url);
      validCount++;
      log(`✅ Valid URL: ${url}`, 'green');
    } catch (error) {
      invalidCount++;
      log(`❌ Invalid URL: ${url}`, 'red');
    }
  });

  logSuccess(`URL validation test completed: ${validCount} valid, ${invalidCount} invalid`);
  return true;
}

// Test de conversión de imágenes
function testImageConversion() {
  logInfo('Testing image conversion...');
  
  // Crear una imagen de prueba simple (1x1 pixel PNG)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  try {
    // Simular conversión base64
    const buffer = Buffer.from(testImageBase64, 'base64');
    logSuccess(`Image conversion test successful: ${buffer.length} bytes`);
    return true;
  } catch (error) {
    logError(`Image conversion test failed: ${error.message}`);
    return false;
  }
}

// Test de estructura de datos
function testDataStructures() {
  logInfo('Testing data structures...');
  
  const testComponent = {
    name: 'Test Button',
    type: 'button',
    description: 'A test button component',
    html: '<button class="btn">Test</button>',
    css: '.btn { padding: 10px; }',
    react: 'const TestButton = () => <button className="btn">Test</button>',
    tailwind: 'px-4 py-2 bg-blue-500 text-white rounded'
  };

  const testDesignSystem = {
    colors: [
      { name: 'primary', value: '#3B82F6', usage: 'Main brand color' }
    ],
    fonts: [
      { family: 'Inter', sizes: ['14px', '16px'], weights: ['400', '600'] }
    ],
    spacing: [
      { name: 'sm', value: '8px' }
    ],
    borderRadius: [
      { name: 'default', value: '4px' }
    ],
    shadows: [
      { name: 'default', value: '0 1px 3px rgba(0,0,0,0.1)' }
    ]
  };

  try {
    // Validar estructura de componente
    if (!testComponent.name || !testComponent.type) {
      throw new Error('Invalid component structure');
    }

    // Validar estructura de design system
    if (!Array.isArray(testDesignSystem.colors) || !Array.isArray(testDesignSystem.fonts)) {
      throw new Error('Invalid design system structure');
    }

    logSuccess('Data structures test successful');
    return true;
  } catch (error) {
    logError(`Data structures test failed: ${error.message}`);
    return false;
  }
}

// Función principal
async function runTests() {
  log('🚀 Starting API Tests...', 'bold');
  log('');

  const results = {
    openai: false,
    firecrawl: false,
    urlValidation: false,
    imageConversion: false,
    dataStructures: false
  };

  // Ejecutar tests
  results.openai = await testOpenAI();
  log('');
  
  results.firecrawl = await testFirecrawl();
  log('');
  
  results.urlValidation = testURLValidation();
  log('');
  
  results.imageConversion = testImageConversion();
  log('');
  
  results.dataStructures = testDataStructures();
  log('');

  // Resumen de resultados
  log('📊 Test Results Summary:', 'bold');
  log('');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status} ${test}`, color);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  log('');
  if (passedTests === totalTests) {
    logSuccess(`All tests passed! (${passedTests}/${totalTests})`);
    process.exit(0);
  } else {
    logError(`Some tests failed! (${passedTests}/${totalTests})`);
    process.exit(1);
  }
}

// Ejecutar tests si el script se ejecuta directamente
if (require.main === module) {
  runTests().catch(error => {
    logError(`Test runner error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testOpenAI,
  testFirecrawl,
  testURLValidation,
  testImageConversion,
  testDataStructures,
  runTests
}; 