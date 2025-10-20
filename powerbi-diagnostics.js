// Quick Power BI Diagnostics Script
// Run this in browser console (F12) on the frontend page

console.log('🔍 Power BI Diagnostics');
console.log('======================\n');

// Test 1: Check if backend is reachable
fetch('http://localhost:3000')
  .then(res => res.text())
  .then(data => {
    console.log('✅ Backend is reachable');
    console.log('Response:', data);
  })
  .catch(err => {
    console.error('❌ Backend not reachable:', err);
  });

// Test 2: Try to get embed token
fetch('http://localhost:3000/embed-token')
  .then(res => {
    console.log('Embed token status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('✅ Embed token received:');
    console.log('- Token length:', data.embedToken?.length || 0);
    console.log('- Embed URL:', data.embedUrl);
    console.log('- Report ID:', data.reportId);
  })
  .catch(err => {
    console.error('❌ Failed to get embed token:', err);
    console.log('\n💡 Solution: Power BI credentials may be expired.');
    console.log('Contact PSA hackathon organizers for new credentials.');
  });

// Test 3: Check Power BI client library
setTimeout(() => {
  if (window.powerbi) {
    console.log('✅ Power BI client library loaded');
  } else {
    console.error('❌ Power BI client library not loaded');
    console.log('💡 Check if powerbi-client package is installed');
  }
}, 1000);
