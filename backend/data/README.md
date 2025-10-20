# Data Directory

## Reference Sample Data ✅

**Status:** CSV file is present and ready for use!

### File Location:
```
backend/data/Reference sample data.csv
```

### Data Overview:
This CSV contains 305 rows of PSA operational data with the following columns:
- **Operator, Service, Dir, BU** - Business and routing information
- **Vessel, IMO, Rotation No.** - Vessel identification
- **From, To** - Origin and destination ports
- **Berth Status** - Current operational status
- **Time Metrics** - BTR, ABT, ATB, ATU timestamps
- **Arrival Variance & Accuracy** - Schedule adherence metrics
- **Wait Time (Hours)** - Various wait time calculations
- **Berth Time (Hours)** - Time spent at berth
- **Assured Port Time Achieved (%)** - Efficiency metric
- **Bunker Saved (USD)** - Cost savings
- **Carbon Abatement (Tonnes)** - Environmental impact

### Key Metrics for AI Analysis:
1. **Berth Time Savings** - Efficiency in vessel turnaround
2. **Arrival Accuracy** - Schedule predictability (Y/N within 4h target)
3. **Carbon Savings** - Environmental impact reduction
4. **Wait Time** - Port congestion indicators
5. **Bunker Savings** - Financial performance

### Next Steps:
- Step 3: Enhance system prompt with data context
- Step 4: Create data parser to extract metrics and inject into AI prompts
