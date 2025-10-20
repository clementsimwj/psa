// src/components/MetricsDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDashboard } from "../context/DashboardContext";

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentQuestion, focusArea } = useDashboard();

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await axios.get("http://localhost:3000/metrics");
        setMetrics(res.data.metrics);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load metrics:", err);
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", color: "#e0e0e0" }}>
        Loading metrics...
      </div>
    );
  }

  if (!metrics) {
    return (
      <div style={{ padding: "20px", color: "#ff6b6b" }}>
        Failed to load metrics
      </div>
    );
  }

  // Render different views based on focus area
  return (
    <div style={{ 
      padding: "24px", 
      height: "100%", 
      overflowY: "auto",
      backgroundColor: "#1e1e2f"
    }}>
      {/* Question Context Banner */}
      {currentQuestion && (
        <div style={{
          marginBottom: "20px",
          padding: "12px 16px",
          backgroundColor: "#4e8cff20",
          border: "1px solid #4e8cff40",
          borderRadius: "8px",
          fontSize: "13px",
          color: "#4e8cff"
        }}>
          🔍 Analyzing: <span style={{ fontWeight: "500" }}>{currentQuestion}</span>
        </div>
      )}

      <h2 style={{ 
        color: "#e0e0e0", 
        marginBottom: "24px",
        fontSize: "24px",
        fontWeight: "600"
      }}>
        {getTitleForFocus(focusArea)}
      </h2>

      {/* Render content based on focus area */}
      {focusArea === 'terminals' && <TerminalsView metrics={metrics} />}
      {focusArea === 'vessels' && <VesselsView metrics={metrics} />}
      {focusArea === 'carbon' && <CarbonView metrics={metrics} />}
      {focusArea === 'performance' && <PerformanceView metrics={metrics} />}
      {focusArea === 'overview' && <OverviewView metrics={metrics} />}

      {/* Footer Note */}
      <div style={{
        marginTop: "32px",
        marginBottom: "48px",
        padding: "16px",
        backgroundColor: "#2b2b3b",
        borderRadius: "8px",
        textAlign: "center"
      }}>
        <div style={{ color: "#888", fontSize: "14px" }}>
          💡 Ask the AI assistant for detailed insights and recommendations
        </div>
      </div>
    </div>
  );
}

function getTitleForFocus(focusArea) {
  switch(focusArea) {
    case 'terminals': return 'Terminal Performance Analysis';
    case 'vessels': return 'Vessel Operations Overview';
    case 'carbon': return 'Sustainability & Carbon Impact';
    case 'performance': return 'Performance Metrics';
    default: return 'PSA Global Network Insights';
  }
}

// Overview View - General KPIs
function OverviewView({ metrics }) {
  return (
    <>
      {/* KPI Cards Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <MetricCard
          title="Total Vessels"
          value={metrics.totalVessels}
          subtitle="Analyzed"
          icon="🚢"
          color="#4e8cff"
        />
        <MetricCard
          title="Arrival Accuracy"
          value={`${metrics.arrivalAccuracy}%`}
          subtitle={`${metrics.onTimeVessels} on-time arrivals`}
          icon="🎯"
          color={parseFloat(metrics.arrivalAccuracy) >= 85 ? "#51cf66" : "#ffa94d"}
          target="Target: 85%"
        />
        <MetricCard
          title="Avg Berth Time"
          value={`${metrics.avgBerthTime}h`}
          subtitle="Per vessel"
          icon="⏱️"
          color="#845ef7"
        />
        <MetricCard
          title="Carbon Savings"
          value={`${metrics.totalCarbon}t`}
          subtitle="CO₂ abatement"
          icon="🌱"
          color="#51cf66"
        />
        <MetricCard
          title="Bunker Savings"
          value={`$${(metrics.totalBunker / 1000000).toFixed(2)}M`}
          subtitle="Fuel cost savings"
          icon="💰"
          color="#37b24d"
        />
        <MetricCard
          title="Avg Wait Time"
          value={`${metrics.avgWaitTime}h`}
          subtitle="Port congestion indicator"
          icon="⏳"
          color="#ff6b6b"
        />
      </div>

      {/* Alerts */}
      {parseFloat(metrics.arrivalAccuracy) < 85 && (
        <div style={{
          marginTop: "24px",
          padding: "16px",
          backgroundColor: "#2b2b3b",
          borderLeft: "4px solid #ffa94d",
          borderRadius: "8px"
        }}>
          <div style={{ 
            color: "#ffa94d", 
            fontWeight: "600",
            marginBottom: "8px"
          }}>
            ⚠️ Attention Required
          </div>
          <div style={{ color: "#e0e0e0", fontSize: "14px" }}>
            Arrival accuracy at {metrics.arrivalAccuracy}% is below the 85% target.
          </div>
        </div>
      )}
    </>
  );
}

// Terminals View - Detailed BU breakdown
function TerminalsView({ metrics }) {
  const terminals = metrics.allBUs || metrics.topBUs || [];
  
  if (terminals.length === 0) {
    return (
      <div style={{
        padding: "20px",
        backgroundColor: "#2b2b3b",
        borderRadius: "12px",
        textAlign: "center",
        color: "#888"
      }}>
        No terminal data available
      </div>
    );
  }

  return (
    <>
      {/* Summary Stats */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <MetricCard
          title="Total Terminals"
          value={terminals.length}
          subtitle="Business units"
          icon="🏢"
          color="#4e8cff"
        />
        <MetricCard
          title="Best Performance"
          value={`${terminals[0]?.accuracy}%`}
          subtitle={terminals[0]?.name}
          icon="🏆"
          color="#ffd43b"
        />
        <MetricCard
          title="Average Accuracy"
          value={`${metrics.arrivalAccuracy}%`}
          subtitle="Network-wide"
          icon="📊"
          color="#845ef7"
        />
      </div>

      {/* Terminal Comparison Chart */}
      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ color: "#e0e0e0", marginBottom: "16px", fontSize: "18px" }}>
          Terminal Rankings by Performance
        </h3>
        <div style={{ display: "grid", gap: "12px" }}>
          {terminals.map((bu, idx) => (
            <TerminalDetailCard key={idx} bu={bu} rank={idx + 1} />
          ))}
        </div>
      </div>

      {/* Performance Distribution */}
      <div style={{ 
        backgroundColor: "#2b2b3b",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "20px"
      }}>
        <h4 style={{ color: "#e0e0e0", marginBottom: "16px", fontSize: "16px" }}>
          Arrival Accuracy Distribution
        </h4>
        {terminals.map((bu, idx) => (
          <div key={idx} style={{ marginBottom: "12px" }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              marginBottom: "6px",
              fontSize: "13px",
              color: "#e0e0e0"
            }}>
              <span>{bu.name}</span>
              <span style={{ fontWeight: "600" }}>{bu.accuracy}%</span>
            </div>
            <div style={{
              height: "8px",
              backgroundColor: "#1e1e2f",
              borderRadius: "4px",
              overflow: "hidden"
            }}>
              <div style={{
                height: "100%",
                width: `${bu.accuracy}%`,
                backgroundColor: parseFloat(bu.accuracy) >= 85 ? "#51cf66" : parseFloat(bu.accuracy) >= 70 ? "#ffa94d" : "#ff6b6b",
                transition: "width 0.5s ease"
              }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// Vessels View - Vessel-specific metrics
function VesselsView({ metrics }) {
  return (
    <>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <MetricCard
          title="Total Vessels"
          value={metrics.totalVessels}
          subtitle="In network"
          icon="🚢"
          color="#4e8cff"
        />
        <MetricCard
          title="Avg Berth Time"
          value={`${metrics.avgBerthTime}h`}
          subtitle="Per vessel"
          icon="⏱️"
          color="#845ef7"
        />
        <MetricCard
          title="Avg Wait Time"
          value={`${metrics.avgWaitTime}h`}
          subtitle="Before berthing"
          icon="⏳"
          color="#ff6b6b"
        />
        <MetricCard
          title="On-Time Performance"
          value={`${metrics.arrivalAccuracy}%`}
          subtitle={`${metrics.onTimeVessels}/${metrics.totalVessels} vessels`}
          icon="✅"
          color="#51cf66"
        />
      </div>

      {/* Vessel Efficiency Breakdown */}
      <div style={{
        backgroundColor: "#2b2b3b",
        padding: "20px",
        borderRadius: "12px"
      }}>
        <h4 style={{ color: "#e0e0e0", marginBottom: "16px" }}>
          Vessel Efficiency Metrics
        </h4>
        <div style={{ display: "grid", gap: "12px" }}>
          <EfficiencyRow 
            label="Best Performing Vessels"
            value={`${metrics.bestBerthTime}h avg berth time`}
            color="#51cf66"
          />
          <EfficiencyRow 
            label="Vessels Needing Attention"
            value={`${metrics.attentionRequired} vessels`}
            color="#ffa94d"
          />
          <EfficiencyRow 
            label="High Wait Time (>10h)"
            value={`${metrics.highWaitTimeCount} vessels`}
            color="#ff6b6b"
          />
        </div>
      </div>
    </>
  );
}

// Carbon View - Sustainability metrics
function CarbonView({ metrics }) {
  return (
    <>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <MetricCard
          title="Total Carbon Savings"
          value={`${metrics.totalCarbon}t`}
          subtitle="CO₂ abatement"
          icon="🌱"
          color="#51cf66"
        />
        <MetricCard
          title="Avg per Vessel"
          value={`${(parseFloat(metrics.totalCarbon) / metrics.totalVessels).toFixed(2)}t`}
          subtitle="CO₂ saved"
          icon="📊"
          color="#37b24d"
        />
        <MetricCard
          title="Bunker Savings"
          value={`$${(metrics.totalBunker / 1000000).toFixed(2)}M`}
          subtitle="Fuel cost savings"
          icon="💰"
          color="#37b24d"
        />
        <MetricCard
          title="Efficiency Impact"
          value={`${metrics.arrivalAccuracy}%`}
          subtitle="Arrival accuracy"
          icon="⚡"
          color="#4e8cff"
        />
      </div>

      {/* Carbon Impact by Terminal */}
      <div style={{
        backgroundColor: "#2b2b3b",
        padding: "20px",
        borderRadius: "12px"
      }}>
        <h4 style={{ color: "#e0e0e0", marginBottom: "16px" }}>
          Environmental Impact by Terminal
        </h4>
        <div style={{ color: "#888", fontSize: "14px", marginBottom: "16px" }}>
          Carbon savings achieved through improved arrival accuracy and reduced wait times
        </div>
        {metrics.topBUs?.map((bu, idx) => (
          <div key={idx} style={{
            padding: "12px",
            backgroundColor: "#1e1e2f",
            borderRadius: "8px",
            marginBottom: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ color: "#e0e0e0" }}>{bu.name}</span>
            <span style={{ color: "#51cf66", fontWeight: "600" }}>
              {bu.accuracy}% efficiency
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

// Performance View - Detailed performance metrics
function PerformanceView({ metrics }) {
  return (
    <>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <MetricCard
          title="Arrival Accuracy"
          value={`${metrics.arrivalAccuracy}%`}
          subtitle={`${metrics.onTimeVessels}/${metrics.totalVessels} vessels`}
          icon="🎯"
          color={parseFloat(metrics.arrivalAccuracy) >= 85 ? "#51cf66" : "#ffa94d"}
          target="Target: 85%"
        />
        <MetricCard
          title="Avg Berth Time"
          value={`${metrics.avgBerthTime}h`}
          subtitle="Turnaround efficiency"
          icon="⏱️"
          color="#845ef7"
        />
        <MetricCard
          title="Avg Wait Time"
          value={`${metrics.avgWaitTime}h`}
          subtitle="Port congestion"
          icon="⏳"
          color="#ff6b6b"
        />
        <MetricCard
          title="Best Performance"
          value={`${metrics.bestBerthTime}h`}
          subtitle="Fastest berth time"
          icon="⚡"
          color="#51cf66"
        />
      </div>

      {/* Top Performers */}
      <div style={{ marginTop: "32px" }}>
        <h3 style={{ color: "#e0e0e0", marginBottom: "16px", fontSize: "18px" }}>
          Top Performing Terminals
        </h3>
        <div style={{ display: "grid", gap: "12px" }}>
          {metrics.topBUs?.map((bu, idx) => (
            <BUCard key={idx} bu={bu} rank={idx + 1} />
          ))}
        </div>
      </div>

      {/* Performance Alert */}
      {parseFloat(metrics.arrivalAccuracy) < 85 && (
        <div style={{
          marginTop: "24px",
          padding: "16px",
          backgroundColor: "#2b2b3b",
          borderLeft: "4px solid #ffa94d",
          borderRadius: "8px"
        }}>
          <div style={{ color: "#ffa94d", fontWeight: "600", marginBottom: "8px" }}>
            ⚠️ Performance Gap Identified
          </div>
          <div style={{ color: "#e0e0e0", fontSize: "14px" }}>
            Current arrival accuracy of {metrics.arrivalAccuracy}% is {(85 - parseFloat(metrics.arrivalAccuracy)).toFixed(1)}% below target.
            This impacts {metrics.attentionRequired} business units.
          </div>
        </div>
      )}
    </>
  );
}

// Helper Components
function TerminalDetailCard({ bu, rank }) {
  return (
    <div style={{
      backgroundColor: "#2b2b3b",
      padding: "16px",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      border: rank <= 3 ? `2px solid ${rank === 1 ? "#ffd43b" : rank === 2 ? "#c0c0c0" : "#cd7f32"}40` : "2px solid transparent"
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: rank === 1 ? "#ffd43b" : rank === 2 ? "#c0c0c0" : rank === 3 ? "#cd7f32" : "#4e4e6e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
        fontWeight: "700",
        color: "#1e1e2f"
      }}>
        #{rank}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: "#e0e0e0", fontSize: "16px", fontWeight: "500", marginBottom: "4px" }}>
          {bu.name}
        </div>
        <div style={{ color: "#888", fontSize: "13px" }}>
          {bu.accuracy}% accuracy · {bu.avgBerthTime}h berth · {bu.avgWaitTime}h wait
        </div>
      </div>
      <div style={{
        padding: "6px 12px",
        backgroundColor: parseFloat(bu.accuracy) >= 85 ? "#51cf6620" : "#ffa94d20",
        borderRadius: "6px",
        color: parseFloat(bu.accuracy) >= 85 ? "#51cf66" : "#ffa94d",
        fontSize: "14px",
        fontWeight: "600"
      }}>
        {bu.accuracy}%
      </div>
    </div>
  );
}

function EfficiencyRow({ label, value, color }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "12px",
      backgroundColor: "#1e1e2f",
      borderRadius: "6px"
    }}>
      <span style={{ color: "#e0e0e0" }}>{label}</span>
      <span style={{ color: color, fontWeight: "600" }}>{value}</span>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, color, target }) {
  return (
    <div style={{
      backgroundColor: "#2b2b3b",
      padding: "20px",
      borderRadius: "12px",
      border: `2px solid ${color}20`,
      transition: "transform 0.2s",
    }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: "12px"
      }}>
        <span style={{ fontSize: "32px", marginRight: "12px" }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ 
            color: "#888", 
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            {title}
          </div>
        </div>
      </div>
      <div style={{ 
        fontSize: "32px", 
        fontWeight: "700",
        color: color,
        marginBottom: "4px"
      }}>
        {value}
      </div>
      <div style={{ color: "#888", fontSize: "13px" }}>
        {subtitle}
      </div>
      {target && (
        <div style={{ 
          color: "#666", 
          fontSize: "11px",
          marginTop: "8px",
          fontStyle: "italic"
        }}>
          {target}
        </div>
      )}
    </div>
  );
}

function BUCard({ bu, rank }) {
  return (
    <div style={{
      backgroundColor: "#2b2b3b",
      padding: "16px",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      gap: "16px"
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: rank === 1 ? "#ffd43b" : rank === 2 ? "#c0c0c0" : "#cd7f32",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        fontWeight: "700",
        color: "#1e1e2f"
      }}>
        #{rank}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ 
          color: "#e0e0e0", 
          fontSize: "16px",
          fontWeight: "500",
          marginBottom: "4px"
        }}>
          {bu.name}
        </div>
        <div style={{ color: "#888", fontSize: "13px" }}>
          {bu.accuracy}% arrival accuracy · {bu.avgBerthTime}h avg berth time
        </div>
      </div>
      <div style={{
        padding: "6px 12px",
        backgroundColor: "#51cf6620",
        borderRadius: "6px",
        color: "#51cf66",
        fontSize: "14px",
        fontWeight: "600"
      }}>
        {bu.accuracy}%
      </div>
    </div>
  );
}
