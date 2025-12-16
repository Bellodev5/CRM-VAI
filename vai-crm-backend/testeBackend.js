const http = require('http');

const tests = [
  {
    name: 'Teste Health Check',
    options: {
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    }
  },
  {
    name: 'Teste Diagnóstico',
    options: {
      hostname: 'localhost',
      port: 5000,
      path: '/api/deals/diagnostico',
      method: 'GET'
    }
  },
  {
    name: 'Teste Criar Venda',
    options: {
      hostname: 'localhost',
      port: 5000,
      path: '/api/deals',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    body: JSON.stringify({
      empresa: 'EMPRESA VIA SCRIPT',
      status: 'novo',
      responsavel: 'Teste Automático'
    })
  }
];

async function runTests() {
  console.log('🧪 INICIANDO TESTES DO BACKEND\n');
  
  for (const test of tests) {
    console.log(`📋 ${test.name}...`);
    
    const req = http.request(test.options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(`📦 Resposta:`, json.success ? 'SUCESSO' : 'FALHA');
          if (json.message) console.log(`   ${json.message}`);
        } catch {
          console.log(`📦 Resposta: ${data.substring(0, 100)}`);
        }
        console.log('');
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ERRO: ${error.message}`);
      console.log('');
    });
    
    if (test.body) {
      req.write(test.body);
    }
    
    req.end();
    
    // Aguarda 1 segundo entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('✨ TESTES CONCLUÍDOS');
}

runTests();