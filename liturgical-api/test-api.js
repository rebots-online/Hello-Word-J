const http = require('http');

const API_BASE = 'http://localhost:9837';

function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    http.get(`${API_BASE}${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function testAPI() {
  const testDate = '2025-07-06';
  
  console.log('Testing Liturgical API...\n');
  
  try {
    // Test health check
    console.log('1. Health Check:');
    const health = await makeRequest('/health');
    console.log(JSON.stringify(health, null, 2));
    
    // Test calendar
    console.log('\n2. Calendar for', testDate);
    const calendar = await makeRequest(`/calendar/${testDate}`);
    console.log(JSON.stringify(calendar, null, 2));
    
    // Test Mass
    console.log('\n3. Mass for', testDate);
    const mass = await makeRequest(`/mass/${testDate}`);
    console.log(JSON.stringify(mass, null, 2));
    
    // Test Breviary (Lauds)
    console.log('\n4. Breviary (Lauds) for', testDate);
    const breviary = await makeRequest(`/breviary/${testDate}/Lauds`);
    console.log(JSON.stringify(breviary, null, 2));
    
    // Test liturgical year
    console.log('\n5. Liturgical Year for', testDate);
    const yearInfo = await makeRequest(`/liturgical-year/${testDate}`);
    console.log(JSON.stringify(yearInfo, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAPI();