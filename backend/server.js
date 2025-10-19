// backend/server.js
require('dotenv').config()
const express = require('express')
const axios = require('axios')
const msal = require('@azure/msal-node')
const cors = require('cors')

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

//Default Endpoint
app.get('/', (req, res) => {
  res.send('PSA Backend is running. Use /embed-token and /ask endpoints.')
})



// ---------- Endpoint: GET /embed-token ----------
app.get('/embed-token', async (req, res) => {
  try {
    // Get Azure AD token for Power BI REST API
    const tokenResponse = await cca.acquireTokenByClientCredential({
      scopes: ['https://analysis.windows.net/powerbi/api/.default']
    })
    const accessToken = tokenResponse.accessToken

    // Generate embed token for the report
    const embedRes = await axios.post(
      `https://api.powerbi.com/v1.0/myorg/groups/${pbiConfig.workspaceId}/reports/${pbiConfig.reportId}/GenerateToken`,
      { accessLevel: 'View' },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    // Get report embed URL
    const reportRes = await axios.get(
      `https://api.powerbi.com/v1.0/myorg/groups/${pbiConfig.workspaceId}/reports/${pbiConfig.reportId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    res.json({
      embedToken: embedRes.data.token,
      embedUrl: reportRes.data.embedUrl,
      reportId: reportRes.data.id
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to generate embed token' })
  }
})

// ---------- Endpoint: POST /ask ----------
app.post('/ask', async (req, res) => {
    const { question } = req.body
    if (!question) return res.status(400).json({ error: 'Question is required' })

    const fakeResponses = [
        'Berth time improved by 12% last week.',
        'Arrival accuracy is above target for all vessels.',
        'Carbon savings increased by 8% compared to last month.',
        'Recommend optimizing vessel schedules for next quarter.'
    ]

      // Pick a random “AI” response
  const answer = fakeResponses[Math.floor(Math.random() * fakeResponses.length)]
  
  // Return in the same structure as real AI
  res.json({ model: { headline: answer } })
})

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
