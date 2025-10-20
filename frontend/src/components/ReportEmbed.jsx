// src/components/ReportEmbed.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { models, service, factories } from "powerbi-client";

export default function ReportEmbed() {
  const containerRef = useRef(null);
  const reportRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function initEmbed() {
      try {
        // Wait a bit for the DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!isMounted || !containerRef.current) {
          console.warn('⚠️ Component unmounted or container not ready');
          return;
        }

        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching Power BI embed token...');
        const res = await axios.get("http://localhost:3000/embed-token");
        const { embedUrl, embedToken, reportId, datasetId } = res.data;
        
        console.log('✅ Embed token received');
        console.log('📊 Report ID:', reportId);
        console.log('🔗 Embed URL:', embedUrl);

        if (!isMounted || !containerRef.current) {
          console.error('❌ Container ref is null after token fetch');
          return;
        }

        console.log('✅ Container ready, proceeding with embed...');

        // Create Power BI service instance
        const powerbi = new service.Service(
          factories.hpmFactory,
          factories.wpmpFactory,
          factories.routerFactory
        );

        // Reset any existing embedded report
        powerbi.reset(containerRef.current);

        // Configuration for embedding - matching Microsoft's pattern
        const config = {
          type: "report",
          tokenType: models.TokenType.Embed,
          accessToken: embedToken,
          embedUrl: embedUrl,
          id: reportId,
          permissions: models.Permissions.Read,
          settings: {
            filterPaneEnabled: true,
            navContentPaneEnabled: true,
            layoutType: models.LayoutType.Custom,
            customLayout: {
              displayOption: models.DisplayOption.FitToPage
            }
          }
        };
        
        // Add dataset if available
        if (datasetId) {
          config.datasetId = datasetId;
        }

        console.log('🚀 Embedding Power BI report with config:', {
          type: config.type,
          id: config.id,
          tokenType: config.tokenType,
          hasAccessToken: !!config.accessToken,
          embedUrl: config.embedUrl.substring(0, 80) + '...'
        });
        
        // Embed the report using standard method
        const report = powerbi.embed(containerRef.current, config);
        reportRef.current = report;

        // Handle loaded event
        report.on("loaded", () => {
          console.log('✅ Power BI report loaded successfully');
          console.log('📐 Container info:', {
            width: containerRef.current?.offsetWidth,
            height: containerRef.current?.offsetHeight,
            children: containerRef.current?.children.length
          });
          
          // Check and fix iframe styling
          const iframe = containerRef.current?.querySelector('iframe');
          if (iframe) {
            console.log('✅ iframe found!');
            console.log('🎨 iframe current style:', {
              width: iframe.style.width,
              height: iframe.style.height,
              position: iframe.style.position,
              visibility: iframe.style.visibility,
              display: iframe.style.display
            });
            
            // Force iframe to be visible and fill container
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.display = 'block';
            iframe.style.visibility = 'visible';
            
            console.log('🔧 iframe style fixed!');
            console.log('🔗 iframe src:', iframe.src?.substring(0, 100));
            console.log('📦 iframe attributes:', {
              id: iframe.id,
              name: iframe.name,
              className: iframe.className
            });
            
            // Try to access iframe document (will fail due to CORS but worth checking)
            try {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc) {
                console.log('📄 iframe document accessible');
              } else {
                console.log('🔒 iframe document blocked (CORS - this is normal)');
              }
            } catch (err) {
              console.log('🔒 iframe content blocked by CORS (expected for Power BI)', err.name);
            }
          } else {
            console.warn('⚠️ No iframe found in container');
          }
          
          setLoading(false);
        });

        // Handle rendered event
        report.on("rendered", () => {
          console.log('✅ Power BI report rendered');
          console.log('🎨 Checking iframe...');
          const iframe = containerRef.current?.querySelector('iframe');
          if (iframe) {
            console.log('✅ iframe found:', {
              width: iframe.style.width,
              height: iframe.style.height,
              src: iframe.src?.substring(0, 50) + '...'
            });
          } else {
            console.warn('⚠️ No iframe found in container');
          }
        });

        // Handle errors
        report.on("error", (event) => {
          const errorDetail = event.detail;
          console.error('❌ Power BI error:', errorDetail);
          console.error('📋 Error details:', JSON.stringify(errorDetail, null, 2));
          
          // Check for specific error types
          if (errorDetail?.message?.includes('phasedEmbed')) {
            console.error('💡 phasedEmbedError detected - trying alternative config');
          }
          
          setError(`Power BI Error: ${errorDetail?.message || errorDetail?.errorCode || 'Unknown error'}`);
          setLoading(false);
        });

      } catch (err) {
        console.error('❌ Failed to embed report:', err);
        setError(
          err.response?.data?.error || 
          err.message || 
          "Failed to load Power BI report"
        );
        setLoading(false);
      }
    }

    initEmbed();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (reportRef.current) {
        try {
          reportRef.current.off("loaded");
          reportRef.current.off("rendered");
          reportRef.current.off("error");
        } catch (e) {
          console.warn('Cleanup warning:', e);
        }
      }
    };
  }, []);

  if (loading) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div 
          ref={containerRef} 
          style={{ 
            width: "100%", 
            height: "100%",
            border: "none"
          }}
        />
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "20px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          backgroundColor: '#2b2b3b',
          color: "#e0e0e0",
          zIndex: 10
        }}>
          <div>
            <div style={{ fontSize: "18px", marginBottom: "10px" }}>
              📊 Loading Power BI Dashboard...
            </div>
            <div style={{ fontSize: "14px", color: "#888" }}>
              Please wait while we fetch your report
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div 
          ref={containerRef} 
          style={{ 
            width: "100%", 
            height: "100%",
            border: "none"
          }}
        />
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "20px", 
          color: "#ff6b6b",
          backgroundColor: '#2b2b3b',
          zIndex: 10
        }}>
          <div style={{ fontSize: "18px", marginBottom: "10px" }}>
            ⚠️ {error}
          </div>
          <div style={{ fontSize: "14px", color: "#888", marginTop: "10px" }}>
            Don't worry - you can still use the AI chat to get all dashboard insights!
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
            Check browser console (F12) for detailed error information.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="powerbi-container"
      style={{ 
        width: "100%", 
        height: "100%",
        minHeight: "500px",
        position: "relative",
        display: "block"
      }}
    />
  );
}
