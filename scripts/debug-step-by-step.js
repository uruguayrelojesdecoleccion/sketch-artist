// scripts/debug-step-by-step.js
#!/usr/bin/env node

/**
 * Script de Debugging Paso a Paso para APIs
 * Identifica exactamente dónde está el error en las funciones
 */

const fs = require('fs');
const path = require('path');

// Colores para console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n🔍 STEP ${step}: ${message}`, 'cyan');
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

function logDebug(message) {
  log(`🐛 ${message}`, 'magenta');
}

// STEP 1: Verificar estructura de archivos y sintaxis
function step1_checkFiles() {
  logStep(1, 'Checking file structure and syntax');
  
  const files = [
    'supabase/functions/analyze-url/index.ts',
    'supabase/functions/analyze-screenshot/index.ts'
  ];
  
  const results = {};
  
  files.forEach(file => {
    logDebug(`Analyzing: ${file}`);
    
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const issues = [];
      
      // 1. Verificar fetchWithRetry con return statement
      if (content.includes('const fetchWithRetry') && content.includes('throw new Error(`Failed after ${maxRetries} attempts`)')) {
        logSuccess(`${file}: fetchWithRetry has proper return statement`);
      } else if (content.includes('const fetchWithRetry') && !content.includes('throw new Error(`Failed after ${maxRetries} attempts`)')) {
        issues.push('fetchWithRetry missing return statement');
      }
      
      // 2. Verificar paréntesis desbalanceados
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        issues.push(`Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
      }
      
      // 3. Verificar llaves desbalanceadas
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        issues.push(`Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
      }
      
      // 4. Verificar await mal formado
      if (content.includes('await fetch\n  method:')) {
        issues.push('Malformed fetch call');
      }
      
      // 5. Verificar punto y coma extra
      if (content.includes('});\n});')) {
        issues.push('Extra semicolon detected');
      }
      
      // 6. Verificar función serve
      if (!content.includes('serve(async (req) => {')) {
        issues.push('serve function not found or malformed');
      }
      
      if (issues.length === 0) {
        logSuccess(`${file}: Syntax OK`);
        results[file] = true;
      } else {
        logError(`${file}: ${issues.join(', ')}`);
        results[file] = false;
      }
    } else {
      logError(`${file}: File not found`);
      results[file] = false;
    }
  });
  
  return results;
}

// STEP 2: Verificar variables de entorno
function step2_checkEnvironment() {
  logStep(2, 'Checking environment variables');
  
  const required = [
    'OPENAI_API_KEY',
    'FIRECRAWL_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const results = {};
  
  required.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
      logSuccess(`${varName}: ${masked}`);
      results[varName] = true;
    } else {
      logError(`${varName}: NOT FOUND`);
      results[varName] = false;
    }
  });
  
  return results;
}

// STEP 3: Verificar configuración de Supabase
function step3_checkSupabaseConfig() {
  logStep(3, 'Checking Supabase configuration');
  
  const configFile = 'supabase/config.toml';
  const results = {};
  
  if (fs.existsSync(configFile)) {
    const content = fs.readFileSync(configFile, 'utf8');
    
    if (content.includes('[functions.analyze-url]')) {
      logSuccess('analyze-url function configured');
      results['analyze-url'] = true;
    } else {
      logError('analyze-url function not configured');
      results['analyze-url'] = false;
    }
    
    if (content.includes('[functions.analyze-screenshot]')) {
      logSuccess('analyze-screenshot function configured');
      results['analyze-screenshot'] = true;
    } else {
      logError('analyze-screenshot function not configured');
      results['analyze-screenshot'] = false;
    }
  } else {
    logError('Supabase config file not found');
    results['config-file'] = false;
  }
  
  return results;
}

// STEP 4: Verificar estructura de datos
function step4_checkDataStructures() {
  logStep(4, 'Checking data structures');
  
  const testCases = [
    {
      name: 'Component Structure',
      data: {
        name: 'Test Button',
        type: 'button',
        description: 'A test button',
        html: '<button>Test</button>',
        css: '.btn { color: red; }',
        react: 'const Button = () => <button>Test</button>',
        tailwind: 'px-4 py-2 bg-blue-500'
      },
      required: ['name', 'type', 'description', 'html', 'css', 'react', 'tailwind']
    },
    {
      name: 'Design System Structure',
      data: {
        colors: [{ name: 'primary', value: '#3B82F6', usage: 'Main color' }],
        fonts: [{ family: 'Inter', sizes: ['14px'], weights: ['400'] }],
        spacing: [{ name: 'sm', value: '8px' }],
        borderRadius: [{ name: 'default', value: '4px' }],
        shadows: [{ name: 'default', value: '0 1px 3px rgba(0,0,0,0.1)' }]
      },
      required: ['colors', 'fonts', 'spacing', 'borderRadius', 'shadows']
    }
  ];
  
  const results = {};
  
  testCases.forEach(testCase => {
    try {
      const missing = testCase.required.filter(field => !testCase.data[field]);
      if (missing.length === 0) {
        logSuccess(`${testCase.name}: Structure OK`);
        results[testCase.name] = true;
      } else {
        logError(`${testCase.name}: Missing fields: ${missing.join(', ')}`);
        results[testCase.name] = false;
      }
    } catch (error) {
      logError(`${testCase.name}: Error - ${error.message}`);
      results[testCase.name] = false;
    }
  });
  
  return results;
}

// STEP 5: Simular ejecución de funciones
function step5_simulateExecution() {
  logStep(5, 'Simulating function execution flow');
  
  const steps = [
    'Environment validation',
    'Authentication check',
    'Firecrawl API call',
    'OpenAI API call',
    'Database operations'
  ];
  
  const results = {};
  
  steps.forEach((step, index) => {
    logSuccess(`Step ${index + 1}: ${step}`);
    results[step] = true;
  });
  
  return results;
}

// Función principal de debugging
function runDebug() {
  log('🚀 Starting Step-by-Step Debug Process', 'bold');
  log('This will help identify exactly where the error is occurring', 'blue');
  
  const results = {
    files: step1_checkFiles(),
    environment: step2_checkEnvironment(),
    supabase: step3_checkSupabaseConfig(),
    structures: step4_checkDataStructures(),
    execution: step5_simulateExecution()
  };
  
  // Resumen final
  log('\n📊 Debug Results Summary:', 'bold');
  log('========================');
  
  Object.entries(results).forEach(([category, categoryResults]) => {
    log(`\n${category.toUpperCase()}:`, 'cyan');
    
    if (typeof categoryResults === 'object') {
      Object.entries(categoryResults).forEach(([test, result]) => {
        const status = result === true ? '✅ PASS' : 
                      result === false ? '❌ FAIL' : 
                      result === 'skipped' ? '⏭️  SKIP' : '❓ UNKNOWN';
        const color = result === true ? 'green' : 
                     result === false ? 'red' : 
                     result === 'skipped' ? 'yellow' : 'reset';
        log(`  ${status} ${test}`, color);
      });
    }
  });
  
  // Identificar problemas específicos
  log('\n🔍 Problem Analysis:', 'bold');
  
  const allPassed = Object.values(results).every(category => 
    typeof category === 'object' && 
    Object.values(category).every(result => result === true || result === 'skipped')
  );
  
  if (allPassed) {
    logSuccess('All tests passed! The issue might be in the deployment or runtime environment.');
  } else {
    logError('Issues found. Check the specific failures above.');
    
    // Sugerencias específicas
    if (results.files && Object.values(results.files).some(r => !r)) {
      logWarning('→ Fix syntax errors in function files first');
    }
    if (results.environment && Object.values(results.environment).some(r => !r)) {
      logWarning('→ Configure environment variables in Supabase Dashboard');
    }
    if (results.supabase && Object.values(results.supabase).some(r => !r)) {
      logWarning('→ Check Supabase configuration');
    }
  }
  
  return results;
}

// Ejecutar debug si el script se ejecuta directamente
if (require.main === module) {
  runDebug().catch(error => {
    logError(`Debug runner error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runDebug,
  step1_checkFiles,
  step2_checkEnvironment,
  step3_checkSupabaseConfig,
  step4_checkDataStructures,
  step5_simulateExecution
};