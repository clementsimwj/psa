// backend/server.js
require('dotenv').config({ path: '../.env' })
const express = require('express')
const axios = require('axios')
const msal = require('@azure/msal-node')
const cors = require('cors')
const aiService = require('./services/aiService')
const dataService = require('./services/dataService')

const app = express()
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT || 3000

// ---------- Power BI Config ----------
const pbiConfig = {
  tenantId: process.env.TENANT_ID,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  workspaceId: process.env.WORKSPACE_ID,
  reportId: process.env.REPORT_ID
}

// ---------- MSAL Client ----------
const msalConfig = {
  auth: {
    clientId: pbiConfig.clientId,
    authority: `https://login.microsoftonline.com/${pbiConfig.tenantId}`,
    clientSecret: pbiConfig.clientSecret
  }
}
const cca = new msal.ConfidentialClientApplication(msalConfig)

// ---------- Load Data on Startup ----------
console.log('🚀 Loading PSA data...')
dataService.loadData()
console.log('✅ Data service ready')

//Default Endpoint
app.get('/', (req, res) => {
  res.send('PSA Backend is running. Use /embed-token and /ask endpoints.')
})

// ---------- Diagnostic Endpoint ----------
app.get('/test-powerbi', async (req, res) => {
  try {
    console.log('🔍 Testing Power BI access...')
    
    // Get Azure AD token
    const tokenResponse = await cca.acquireTokenByClientCredential({
      scopes: ['https://analysis.windows.net/powerbi/api/.default']
    })
    console.log('✅ Got Azure AD token')
    
    const accessToken = tokenResponse.accessToken
    
    // Try to list reports in workspace
    console.log('📋 Listing reports in workspace...')
    const reportsRes = await axios.get(
      `https://api.powerbi.com/v1.0/myorg/groups/${pbiConfig.workspaceId}/reports`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    
    console.log('✅ Found reports:', reportsRes.data.value.length)
    
    // Check if our specific report exists
    const ourReport = reportsRes.data.value.find(r => r.id === pbiConfig.reportId)
    
    if (ourReport) {
      console.log('✅ Our report found:', ourReport.name)
      console.log('📊 Dataset ID:', ourReport.datasetId)
      
      // Try to get dataset info
      try {
        const datasetRes = await axios.get(
          `https://api.powerbi.com/v1.0/myorg/datasets/${ourReport.datasetId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        console.log('✅ Dataset accessible:', datasetRes.data.name)
      } catch (dsErr) {
        console.log('⚠️ Dataset not accessible:', dsErr.response?.status, dsErr.response?.data)
      }
    } else {
      console.log('❌ Our report NOT found in workspace')
    }
    
    res.json({
      success: true,
      reportsCount: reportsRes.data.value.length,
      reports: reportsRes.data.value.map(r => ({ id: r.id, name: r.name, datasetId: r.datasetId })),
      ourReportFound: !!ourReport
    })
    
  } catch (err) {
    console.error('❌ Error testing Power BI:', err.response?.status, err.response?.data || err.message)
    res.status(500).json({ 
      error: 'Failed to test Power BI',
      details: err.response?.data || err.message
    })
  }
})



// ---------- Endpoint: GET /embed-token ----------
app.get('/embed-token', async (req, res) => {
  try {
    // Get Azure AD token for Power BI REST API
    const tokenResponse = await cca.acquireTokenByClientCredential({
      scopes: ['https://analysis.windows.net/powerbi/api/.default']
    })
    const accessToken = tokenResponse.accessToken

    // Get report details first to get the dataset ID
    const reportRes = await axios.get(
      `https://api.powerbi.com/v1.0/myorg/groups/${pbiConfig.workspaceId}/reports/${pbiConfig.reportId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    const datasetId = reportRes.data.datasetId
    console.log('📊 Report data:', {
      id: reportRes.data.id,
      embedUrl: reportRes.data.embedUrl,
      datasetId: datasetId
    })

    // Generate embed token with proper permissions for BOTH report and dataset
    const generateTokenBody = {
      datasets: [
        {
          id: datasetId
        }
      ],
      reports: [
        {
          id: pbiConfig.reportId,
          allowEdit: false
        }
      ]
    }

    console.log('🔑 Generating embed token with body:', JSON.stringify(generateTokenBody, null, 2))

    const embedRes = await axios.post(
      `https://api.powerbi.com/v1.0/myorg/GenerateToken`,
      generateTokenBody,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    console.log('✅ Embed token generated successfully')
    console.log('⏰ Token expires at:', embedRes.data.expiration)

    res.json({
      embedToken: embedRes.data.token,
      embedUrl: reportRes.data.embedUrl,
      reportId: reportRes.data.id,
      datasetId: reportRes.data.datasetId
    })
  } catch (err) {
    console.error('❌ Error generating embed token:')
    console.error('Status:', err.response?.status)
    console.error('Error:', err.response?.data || err.message)
    console.error('Full error:', JSON.stringify(err.response?.data, null, 2))
    res.status(500).json({ 
      error: 'Failed to generate embed token',
      details: err.response?.data || err.message
    })
  }
})

// ---------- Endpoint: POST /ask ----------
app.post('/ask', async (req, res) => {
  const { question, conversationHistory } = req.body
  
  if (!question) {
    return res.status(400).json({ error: 'Question is required' })
  }

  try {
    console.log(`📩 Received question: "${question}"`)
    
    // Get current metrics from data service
    const metrics = dataService.getMetrics()
    
    // Query specific data based on question
    const queryResults = dataService.queryData(question)
    
    // Call Azure OpenAI service with context
    const aiResponse = await aiService.askQuestion(
      question,
      conversationHistory || [],
      metrics
    )
    
    console.log('✅ Sending AI response to frontend')
    
    // Return response in expected format
    res.json({ 
      model: { 
        headline: aiResponse 
      } 
    })
    
  } catch (error) {
    console.error('❌ Error in /ask endpoint:', error.message)
    
    // Return user-friendly error message
    res.status(500).json({ 
      error: 'AI service error',
      message: error.message,
      model: {
        headline: 'Sorry, I encountered an error processing your question. Please try again.'
      }
    })
  }
})

// ---------- Endpoint: GET /metrics ----------
app.get('/metrics', (req, res) => {
  try {
    const metrics = dataService.getMetrics()
    const summary = dataService.getSummary()
    res.json({ metrics, summary })
  } catch (error) {
    console.error('❌ Error in /metrics endpoint:', error.message)
    res.status(500).json({ error: 'Failed to retrieve metrics' })
  }
})

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
