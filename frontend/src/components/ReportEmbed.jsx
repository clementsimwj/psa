// src/components/ReportEmbed.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as pbi from "powerbi-client";

export default function ReportEmbed() {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initEmbed() {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:3000/embed-token"); // call backend
        const { embedUrl, embedToken, reportId } = res.data;

        const powerbiService =
          window.powerbi || new pbi.service.Service(pbi.factories);

        // reset any existing embedded report
        if (containerRef.current) {
          powerbiService.reset(containerRef.current);
        }

        const config = {
          type: "report",
          tokenType: pbi.models.TokenType.Embed,
          accessToken: embedToken,
          embedUrl,
          id: reportId,
          settings: { panes: { filters: { visible: false } } },
        };

        powerbiService.embed(containerRef.current, config);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load Power BI report");
        setLoading(false);
      }
    }

    initEmbed();
  }, []);

  if (loading) return <div style={{ padding: "20px" }}>Loading report...</div>;
  if (error)
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}></div>
  );
}
