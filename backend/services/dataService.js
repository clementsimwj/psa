// backend/services/dataService.js
const fs = require('fs');
const path = require('path');

/**
 * Data Service - Parses and analyzes PSA CSV data
 * Provides metrics and insights for AI context
 */
class DataService {
  constructor() {
    this.data = [];
    this.metrics = null;
    this.isLoaded = false;
  }

  /**
   * Load and parse the CSV file
   */
  loadData() {
    try {
      const csvPath = path.join(__dirname, '../data/Reference sample data.csv');
      console.log('📊 Loading CSV data from:', csvPath);

      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',');

      // Parse CSV rows
      this.data = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = this.parseCSVLine(line);
          const row = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
          });
          return row;
        });

      console.log(`✅ Loaded ${this.data.length} vessel records`);
      this.calculateMetrics();
      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('❌ Error loading CSV data:', error.message);
      this.isLoaded = false;
      return false;
    }
  }

  /**
   * Parse CSV line handling commas within quoted fields
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  /**
   * Calculate key metrics from the data
   */
  calculateMetrics() {
    if (this.data.length === 0) {
      console.warn('⚠️ No data available for metrics calculation');
      return;
    }

    // Basic counts
    const totalVessels = this.data.length;
    const onTimeVessels = this.data.filter(row => 
      row['ArrivalAccuracy(FinalBTR)'] === 'Y'
    ).length;

    // Berth time analysis
    const berthTimes = this.data
      .map(row => parseFloat(row['Berth Time(hours):ATU-ATB']))
      .filter(val => !isNaN(val));
    const avgBerthTime = (berthTimes.reduce((a, b) => a + b, 0) / berthTimes.length).toFixed(2);

    // Wait time analysis
    const waitTimes = this.data
      .map(row => parseFloat(row['WaitTime(Hours):ATB-BTR']))
      .filter(val => !isNaN(val));
    const avgWaitTime = (waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length).toFixed(2);

    // Carbon and bunker savings
    const carbonSavings = this.data
      .map(row => parseFloat(row['Carbon Abatement (Tonnes)']))
      .filter(val => !isNaN(val));
    const totalCarbon = carbonSavings.reduce((a, b) => a + b, 0).toFixed(2);

    const bunkerSavings = this.data
      .map(row => parseFloat(row['Bunker Saved(USD)']))
      .filter(val => !isNaN(val));
    const totalBunker = Math.round(bunkerSavings.reduce((a, b) => a + b, 0));

    // Business Unit analysis
    const buStats = this.calculateBUStats();

    // High wait time vessels
    const highWaitTimeCount = waitTimes.filter(wt => wt > 10).length;

    // Best performing vessels
    const sortedBerthTimes = [...berthTimes].sort((a, b) => a - b);
    const bestBerthTime = sortedBerthTimes.slice(0, 10).reduce((a, b) => a + b, 0) / 10;

    // Vessels needing attention (high wait, low accuracy, high berth time)
    const attentionRequired = this.data.filter(row => {
      const waitTime = parseFloat(row['WaitTime(Hours):ATB-BTR']);
      const berthTime = parseFloat(row['Berth Time(hours):ATU-ATB']);
      const onTime = row['ArrivalAccuracy(FinalBTR)'] === 'Y';
      return (waitTime > 8 || berthTime > 50 || !onTime);
    }).length;

    this.metrics = {
      totalVessels,
      onTimeVessels,
      arrivalAccuracy: ((onTimeVessels / totalVessels) * 100).toFixed(1),
      avgBerthTime,
      avgWaitTime,
      totalCarbon,
      totalBunker,
      allBUs: buStats.all,  // Add all BUs
      topBUs: buStats.top,
      underperformingBUs: buStats.underperforming,
      highWaitTimeCount,
      bestBerthTime: bestBerthTime.toFixed(2),
      attentionRequired
    };

    console.log('📈 Metrics calculated:', {
      totalVessels,
      arrivalAccuracy: this.metrics.arrivalAccuracy + '%',
      avgBerthTime: avgBerthTime + 'h',
      totalCarbon: totalCarbon + ' tonnes'
    });
  }

  /**
   * Calculate Business Unit statistics
   */
  calculateBUStats() {
    const buMap = {};

    this.data.forEach(row => {
      const bu = row['BU'];
      if (!bu) return;

      if (!buMap[bu]) {
        buMap[bu] = {
          name: bu,
          total: 0,
          onTime: 0,
          berthTimes: [],
          waitTimes: []
        };
      }

      buMap[bu].total++;
      if (row['ArrivalAccuracy(FinalBTR)'] === 'Y') {
        buMap[bu].onTime++;
      }
      
      const berthTime = parseFloat(row['Berth Time(hours):ATU-ATB']);
      if (!isNaN(berthTime)) {
        buMap[bu].berthTimes.push(berthTime);
      }

      const waitTime = parseFloat(row['WaitTime(Hours):ATB-BTR']);
      if (!isNaN(waitTime)) {
        buMap[bu].waitTimes.push(waitTime);
      }
    });

    // Calculate averages and sort
    const buStats = Object.values(buMap).map(bu => ({
      name: bu.name,
      accuracy: ((bu.onTime / bu.total) * 100).toFixed(1),
      avgBerthTime: (bu.berthTimes.reduce((a, b) => a + b, 0) / bu.berthTimes.length).toFixed(2),
      avgWaitTime: bu.waitTimes.length > 0 
        ? (bu.waitTimes.reduce((a, b) => a + b, 0) / bu.waitTimes.length).toFixed(2)
        : '0.00',
      total: bu.total
    })).filter(bu => bu.total >= 5); // Only BUs with 5+ vessels

    // Sort by accuracy
    buStats.sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy));

    return {
      all: buStats,  // Add full list of all BUs
      top: buStats.slice(0, 3),
      underperforming: buStats.slice(-3).map(bu => ({
        ...bu,
        issue: parseFloat(bu.accuracy) < 60 ? 'Low arrival accuracy' : 'Below average performance'
      }))
    };
  }

  /**
   * Get metrics summary for AI context
   */
  getMetrics() {
    if (!this.isLoaded) {
      this.loadData();
    }
    return this.metrics;
  }

  /**
   * Query data based on user question keywords
   */
  queryData(question) {
    const lowerQuestion = question.toLowerCase();
    const results = {
      relevant: true,
      data: null
    };

    // Vessel-specific queries
    if (lowerQuestion.includes('vessel') || lowerQuestion.includes('ship')) {
      const vessels = this.data.slice(0, 10).map(row => ({
        name: row['Vessel'],
        bu: row['BU'],
        onTime: row['ArrivalAccuracy(FinalBTR)'] === 'Y',
        berthTime: row['Berth Time(hours):ATU-ATB'],
        carbonSaved: row['Carbon Abatement (Tonnes)']
      }));
      results.data = { vessels, count: this.data.length };
    }

    // Business unit queries
    if (lowerQuestion.includes('business unit') || lowerQuestion.includes('terminal') || lowerQuestion.includes('port')) {
      results.data = {
        topPerforming: this.metrics.topBUs,
        needingAttention: this.metrics.underperformingBUs
      };
    }

    // Carbon/sustainability queries
    if (lowerQuestion.includes('carbon') || lowerQuestion.includes('sustain') || lowerQuestion.includes('environment')) {
      const topCarbon = this.data
        .map(row => ({
          vessel: row['Vessel'],
          bu: row['BU'],
          carbon: parseFloat(row['Carbon Abatement (Tonnes)'])
        }))
        .filter(v => !isNaN(v.carbon))
        .sort((a, b) => b.carbon - a.carbon)
        .slice(0, 5);

      results.data = {
        totalCarbon: this.metrics.totalCarbon,
        topVessels: topCarbon,
        avgPerVessel: (parseFloat(this.metrics.totalCarbon) / this.metrics.totalVessels).toFixed(3)
      };
    }

    // Wait time / efficiency queries
    if (lowerQuestion.includes('wait') || lowerQuestion.includes('delay') || lowerQuestion.includes('congest')) {
      const highWaitVessels = this.data
        .filter(row => parseFloat(row['WaitTime(Hours):ATB-BTR']) > 8)
        .slice(0, 5)
        .map(row => ({
          vessel: row['Vessel'],
          bu: row['BU'],
          waitTime: row['WaitTime(Hours):ATB-BTR']
        }));

      results.data = {
        avgWaitTime: this.metrics.avgWaitTime,
        highWaitCount: this.metrics.highWaitTimeCount,
        examples: highWaitVessels
      };
    }

    return results;
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    if (!this.isLoaded) {
      this.loadData();
    }

    return {
      overview: `Analyzing ${this.metrics.totalVessels} vessel movements across PSA's global network`,
      highlights: [
        `${this.metrics.arrivalAccuracy}% arrival accuracy rate`,
        `${this.metrics.totalCarbon} tonnes of carbon savings achieved`,
        `$${this.metrics.totalBunker.toLocaleString()} in bunker fuel savings`,
        `Average berth time: ${this.metrics.avgBerthTime} hours`
      ],
      concerns: [
        this.metrics.arrivalAccuracy < 85 ? 'Arrival accuracy below 85% target' : null,
        this.metrics.highWaitTimeCount > 50 ? `${this.metrics.highWaitTimeCount} vessels with excessive wait times` : null,
        this.metrics.attentionRequired > 100 ? `${this.metrics.attentionRequired} vessels require operational review` : null
      ].filter(Boolean)
    };
  }
}

// Export singleton instance
module.exports = new DataService();
