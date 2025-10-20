# 🚀 Quick Start Guide

## Start the Application

### Terminal 1 - Backend
```bash
cd backend
node server.js
```
**Expected Output:**
```
✅ Loaded 303 vessel records
✅ Data service ready
Backend running on http://localhost:3000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
**Expected Output:**
```
  VITE ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

---

## 🧪 Test Questions for Demo

### Quick Wins (30 seconds each)
1. `"What's our overall performance?"`
2. `"What carbon savings have we achieved?"`
3. `"Give me 3 recommendations"`

### Detailed Analysis (1-2 minutes)
4. `"Which business units need attention?"`
5. `"How can we improve arrival accuracy?"`
6. `"What vessels have the highest wait times?"`
7. `"Show me sustainability improvements"`

### Strategic Questions
8. `"What should we prioritize next quarter?"`
9. `"Where are the quick wins?"`
10. `"How do we compare to industry targets?"`

---

## 📊 Key Metrics Available

- **Total Vessels:** 303
- **Arrival Accuracy:** 69.0%
- **Average Berth Time:** 37.45h
- **Carbon Savings:** 58.13 tonnes
- **Bunker Savings:** $5.3M
- **Business Units:** 8 terminals

---

## ⚠️ Known Issue: Power BI Display

**Symptom:** Left side shows "Failed to load Power BI report"

**Impact:** AI chat (right side) works perfectly independently

**Workaround:** Use AI chat for all insights - it has full data access

**Debug:** Open browser console (F12) and check for:
- `401 Unauthorized` → Credentials expired
- `404 Not Found` → Report ID issue

---

## ✅ What Works

- ✅ AI chat with real Azure OpenAI
- ✅ 303 vessel records analyzed
- ✅ Structured insights (Observations → Impact → Actions)
- ✅ Conversation memory
- ✅ Business-focused responses
- ✅ Data-driven recommendations

---

## 📱 Browser Access

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:3000  
**Metrics API:** http://localhost:3000/metrics

---

## 🎤 Demo Script (2 minutes)

**Opening (15s):**
"This is PSA's AI-powered Global Insights assistant. Instead of spending time interpreting dashboards, executives can ask questions in natural language."

**Demo (1m 30s):**
1. Type: `"Summarize our performance"`
   - Point out: Real data, 303 vessels
2. Type: `"What needs attention?"`
   - Show: Specific recommendations
3. Type: `"How's our sustainability?"`
   - Highlight: 58 tonnes carbon saved

**Close (15s):**
"The AI analyzes data in seconds, provides business-focused insights, and suggests actions aligned with PSA's strategy. This reduces decision-making time from minutes to seconds."

---

## 🛠️ Troubleshooting

### Backend won't start
```bash
cd backend
npm install
node server.js
```

### Frontend won't start
```bash
cd frontend
npm install
npm run dev
```

### AI not responding
- Check backend console for errors
- Verify .env file has correct PSA_API_URI and PSA_PRIMARY_KEY
- Test: `curl http://localhost:3000`

### No data in responses
- Check backend logs for "✅ Loaded 303 vessel records"
- If missing, verify CSV file at: `backend/data/Reference sample data.csv`

---

## 📞 Quick Support

**Backend Issues:** Check terminal running `node server.js`  
**Frontend Issues:** Check terminal running `npm run dev`  
**AI Issues:** Check browser console (F12)  
**Data Issues:** Check backend console for data loading messages

---

## 🎯 Success Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Browser showing split-screen layout
- [ ] Chat panel visible on right side
- [ ] Can type and send messages
- [ ] AI responds with formatted insights
- [ ] Responses reference specific numbers

If all checked → **You're ready to demo!** 🎉
