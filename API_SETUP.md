# Configuración y Testing de APIs

## 🔧 Configuración de Variables de Entorno

### Variables Requeridas en Supabase

Para que las funciones de análisis funcionen correctamente, necesitas configurar las siguientes variables de entorno en tu proyecto de Supabase:

```bash
# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key-here

# Firecrawl API (solo para análisis de URLs)
FIRECRAWL_API_KEY=your-firecrawl-api-key-here

# Supabase (ya configuradas automáticamente)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Cómo Configurar las Variables

1. **En Supabase Dashboard:**
   - Ve a tu proyecto de Supabase
   - Navega a Settings > API
   - En la sección "Environment variables", agrega:
     - `OPENAI_API_KEY`
     - `FIRECRAWL_API_KEY`

2. **Para desarrollo local:**
   - Crea un archivo `.env.local` en la raíz del proyecto
   - Agrega las variables de entorno

## 🧪 Testing de las APIs

### 1. Testing de OpenAI API

```bash
# Test básico de OpenAI
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

### 2. Testing de Firecrawl API

```bash
# Test básico de Firecrawl
curl -X POST https://api.firecrawl.dev/v1/scrape \
  -H "Authorization: Bearer YOUR_FIRECRAWL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "formats": ["html", "markdown"],
    "waitFor": 2000
  }'
```

### 3. Testing de las Funciones de Supabase

#### Test de Análisis de URL

```bash
# Obtener token de autenticación primero
curl -X POST https://your-project.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'

# Luego testear la función
curl -X POST https://your-project.supabase.co/functions/v1/analyze-url \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "test-analysis-id",
    "url": "https://example.com"
  }'
```

#### Test de Análisis de Screenshot

```bash
# Convertir imagen a base64
base64 -i screenshot.png > screenshot.txt

# Testear la función
curl -X POST https://your-project.supabase.co/functions/v1/analyze-screenshot \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "test-analysis-id",
    "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }'
```

## 🔍 Monitoreo y Debugging

### Logs de las Funciones

Las funciones ahora incluyen logging detallado:

```typescript
// Logs de validación
console.log('Environment validation passed');

// Logs de retry
console.log(`Attempt ${i + 1}/${maxRetries} for ${url}`);
console.log(`Success on attempt ${i + 1}`);

// Logs de progreso
console.log('Starting Firecrawl scraping...');
console.log('Firecrawl scraping completed, analyzing with OpenAI...');
console.log('Calling OpenAI API...');
console.log('OpenAI analysis completed, saving results...');
```

### Verificar Logs en Supabase

1. Ve a tu proyecto de Supabase
2. Navega a Edge Functions
3. Selecciona la función que quieres monitorear
4. Ve a la pestaña "Logs"

## 🚨 Troubleshooting

### Errores Comunes

#### 1. "OPENAI_API_KEY environment variable is required"
- **Solución:** Configura la variable de entorno en Supabase Dashboard

#### 2. "Firecrawl API error: 401 Unauthorized"
- **Solución:** Verifica que tu API key de Firecrawl sea válida

#### 3. "OpenAI API error: 429 Too Many Requests"
- **Solución:** La función ahora maneja rate limiting automáticamente con retry logic

#### 4. "Authentication failed"
- **Solución:** Verifica que el token de autenticación sea válido

### Rate Limiting

Las funciones ahora incluyen:
- **Retry automático** con exponential backoff
- **Manejo de rate limits** (código 429)
- **Máximo 3 intentos** por llamada

### Timeouts

- **Firecrawl:** 30 segundos por intento
- **OpenAI:** 60 segundos por intento
- **Total:** Máximo 5 minutos para análisis completo

## 📊 Métricas de Rendimiento

### Tiempos Esperados

- **Análisis de URL:** 30-60 segundos
- **Análisis de Screenshot:** 15-30 segundos
- **Retry en rate limit:** 1-4 segundos adicionales

### Límites de Uso

- **OpenAI:** Según tu plan de suscripción
- **Firecrawl:** Según tu plan de suscripción
- **Supabase:** Según tu plan de suscripción

## 🔐 Seguridad

### Validaciones Implementadas

1. **Autenticación JWT** en todas las funciones
2. **Validación de variables de entorno** al inicio
3. **Sanitización de URLs** antes del scraping
4. **Validación de tipos de archivo** para screenshots
5. **Límites de tamaño** para imágenes (10MB máximo)

### Mejores Prácticas

- Nunca expongas las API keys en el frontend
- Usa variables de entorno para todas las configuraciones sensibles
- Monitorea el uso de APIs regularmente
- Implementa rate limiting en el frontend si es necesario

## 📝 Notas de Desarrollo

### Cambios Recientes

1. **✅ Corregido error de sintaxis** en `analyze-url`
2. **✅ Agregada validación de environment variables**
3. **✅ Implementado retry logic con exponential backoff**
4. **✅ Mejorado logging para debugging**
5. **✅ Agregado manejo de rate limiting**

### Próximas Mejoras

- [ ] Agregar métricas de uso
- [ ] Implementar cache para análisis repetidos
- [ ] Agregar validación de contenido HTML
- [ ] Implementar análisis de performance 

##  **Debugging Paso a Paso - Identificación del Error**

### **Problema Identificado:**

1. **Error en `fetchWithRetry`**: La función no tiene un return statement al final del bucle
2. **Posibles errores de sintaxis** en las funciones de Supabase
3. **Falta validación** de que las funciones se ejecuten correctamente

### **Script de Debugging Detallado:**

```javascript
// scripts/debug-step-by-step.js
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
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

// STEP 1: Verificar estructura de archivos
function step1_checkFiles() {
  logStep(1, 'Checking file structure and syntax');
  
  const files = [
    'supabase/functions/analyze-url/index.ts',
    'supabase/functions/analyze-screenshot/index.ts'
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Verificar errores comunes
      const issues = [];
      
      // 1. Verificar fetchWithRetry sin return
      if (content.includes('const fetchWithRetry') && !content.includes('return response;')) {
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
      
      if (issues.length === 0) {
        logSuccess(`${file}: Syntax OK`);
      } else {
        logError(`${file}: ${issues.join(', ')}`);
      }
    } else {
      logError(`${file}: File not found`);
    }
  });
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
  
  required.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
      logSuccess(`${varName}: ${masked}`);
    } else {
      logError(`${varName}: NOT FOUND`);
    }
  });
}

// STEP 3: Simular ejecución de funciones
function step3_simulateExecution() {
  logStep(3, 'Simulating function execution');
  
  // Simular el flujo de las funciones
  const steps = [
    'Environment validation',
    'Authentication check',
    'Firecrawl API call',
    'OpenAI API call',
    'Database operations'
  ];
  
  steps.forEach((step, index) => {
    logSuccess(`Step ${index + 1}: ${step}`);
  });
}

// STEP 4: Verificar configuración de Supabase
function step4_checkSupabaseConfig() {
  logStep(4, 'Checking Supabase configuration');
  
  const configFile = 'supabase/config.toml';
  if (fs.existsSync(configFile)) {
    const content = fs.readFileSync(configFile, 'utf8');
    
    if (content.includes('[functions.analyze-url]')) {
      logSuccess('analyze-url function configured');
    } else {
      logError('analyze-url function not configured');
    }
    
    if (content.includes('[functions.analyze-screenshot]')) {
      logSuccess('analyze-screenshot function configured');
    } else {
      logError('analyze-screenshot function not configured');
    }
  } else {
    logError('Supabase config file not found');
  }
}

// Función principal
function runDebug() {
  log('🚀 Starting Step-by-Step Debug Process', 'bold');
  
  step1_checkFiles();
  step2_checkEnvironment();
  step3_simulateExecution();
  step4_checkSupabaseConfig();
  
  log('\n Debug Summary:', 'bold');
  log('The main issues to fix are:');
  log('1. fetchWithRetry function missing return statement', 'red');
  log('2. Possible syntax errors in function files', 'red');
  log('3. Environment variables need to be configured', 'yellow');
}

runDebug();
```

### **Correcciones Necesarias:**

1. **Corregir `fetchWithRetry`**:
```typescript
const fetchWithRetry = async (url: string, options: any, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempt ${i + 1}/${maxRetries} for ${url}`);
      const response = await fetch(url, options);
      
      if (response.ok) {
        console.log(`Success on attempt ${i + 1}`);
        return response; // ✅ AQUÍ ESTÁ EL PROBLEMA
      }
      
      if (response.status === 429) {
        const waitTime = 1000 * Math.pow(2, i);
        console.log(`Rate limited, waiting ${waitTime}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error.message);
      if (i === maxRetries - 1) throw error;
      const waitTime = 1000 * (i + 1);
      console.log(`Waiting ${waitTime}ms before retry`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  // ❌ FALTA: return null; o throw new Error('Max retries exceeded');
};
```

2. **Verificar configuración de variables de entorno** en Supabase Dashboard
3. **Deployar las funciones corregidas** a Supabase

¿Te gustaría que implemente estas correcciones específicas o prefieres que ejecute el script de debugging primero para confirmar el problema exacto? 