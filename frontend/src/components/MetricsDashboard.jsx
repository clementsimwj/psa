// src/components/MetricsDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ 
      padding: "24px", 
      height: "100%", 
      overflowY: "auto",
      backgroundColor: "#1e1e2f"
    }}>
      <h2 style={{ 
        color: "#e0e0e0", 
        marginBottom: "24px",
        fontSize: "24px",
        fontWeight: "600"
      }}>
        PSA Global Network Insights
      </h2>

      {/* KPI Cards Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
      }}>
        {/* Total Vessels */}
        <MetricCard
          title="Total Vessels"
          value={metrics.totalVessels}
          subtitle="Analyzed"
          icon="🚢"
          color="#4e8cff"
        />

        {/* Arrival Accuracy */}
        <MetricCard
          title="Arrival Accuracy"
          value={`${metrics.arrivalAccuracy}%`}
          subtitle={`${metrics.onTimeVessels} on-time arrivals`}
          icon="🎯"
          color={parseFloat(metrics.arrivalAccuracy) >= 85 ? "#51cf66" : "#ffa94d"}
          target="Target: 85%"
        />

        {/* Average Berth Time */}
        <MetricCard
          title="Avg Berth Time"
          value={`${metrics.avgBerthTime}h`}
          subtitle="Per vessel"
          icon="⏱️"
          color="#845ef7"
        />

        {/* Carbon Savings */}
        <MetricCard
          title="Carbon Savings"
          value={`${metrics.totalCarbon}t`}
          subtitle="CO₂ abatement"
          icon="🌱"
          color="#51cf66"
        />

        {/* Bunker Savings */}
        <MetricCard
          title="Bunker Savings"
          value={`$${(metrics.totalBunker / 1000000).toFixed(2)}M`}
          subtitle="Fuel cost savings"
          icon="💰"
          color="#37b24d"
        />

        {/* Average Wait Time */}
        <MetricCard
          title="Avg Wait Time"
          value={`${metrics.avgWaitTime}h`}
          subtitle="Port congestion indicator"
          icon="⏳"
          color="#ff6b6b"
        />
      </div>

      {/* Business Units Performance */}
      <div style={{ marginTop: "32px" }}>
        <h3 style={{ 
          color: "#e0e0e0", 
          marginBottom: "16px",
          fontSize: "18px",
          fontWeight: "500"
        }}>
          Top Performing Terminals
        </h3>
        <div style={{ 
          display: "grid", 
          gap: "12px"
        }}>
          {metrics.topBUs.map((bu, idx) => (
            <BUCard key={idx} bu={bu} rank={idx + 1} />
          ))}
        </div>
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
            {94} vessels missed the 4-hour arrival window.
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div style={{
        marginTop: "32px",
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
