"use client";

import { useState } from "react";

export default function FloatingButtons() {
  const [showChat, setShowChat] = useState(false);
  const [showAi, setShowAi] = useState(false);

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          cursor: "pointer",
          zIndex: 9999,
          fontSize: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold"
        }}
      >
        💬
      </button>

      {/* AI Guardian Button */}
      <button
        onClick={() => setShowAi(!showAi)}
        style={{
          position: "fixed",
          bottom: "90px",
          right: "20px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#a855f7",
          color: "white",
          border: "none",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          cursor: "pointer",
          zIndex: 9999,
          fontSize: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold"
        }}
      >
        🧠
      </button>

      {/* Chat Window */}
      {showChat && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "90px",
            width: "320px",
            height: "450px",
            backgroundColor: "#1f2937",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #374151"
          }}
        >
          <div
            style={{
              padding: "16px",
              backgroundColor: "#3b82f6",
              color: "white",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span>Classora Chat</span>
            <button
              onClick={() => setShowChat(false)}
              style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "20px" }}
            >
              ×
            </button>
          </div>
          <div style={{ flex: 1, padding: "16px", overflowY: "auto", color: "white" }}>
            <p>Welcome to Classora Chat!</p>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>Connect with teachers and parents</p>
          </div>
          <div style={{ padding: "16px", borderTop: "1px solid #374151" }}>
            <input
              type="text"
              placeholder="Type a message..."
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #4b5563",
                backgroundColor: "#374151",
                color: "white",
                outline: "none"
              }}
            />
          </div>
        </div>
      )}

      {/* AI Guardian Window */}
      {showAi && (
        <div
          style={{
            position: "fixed",
            bottom: "160px",
            right: "90px",
            width: "320px",
            height: "450px",
            backgroundColor: "#1f2937",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #a855f7"
          }}
        >
          <div
            style={{
              padding: "16px",
              backgroundColor: "#a855f7",
              color: "white",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span>School Guardian AI</span>
            <button
              onClick={() => setShowAi(false)}
              style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "20px" }}
            >
              ×
            </button>
          </div>
          <div style={{ flex: 1, padding: "16px", overflowY: "auto", color: "white" }}>
            <p>Hello! I'm School Guardian.</p>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>Ask me about grades, attendance, fees, or anything school-related!</p>
          </div>
          <div style={{ padding: "16px", borderTop: "1px solid #374151" }}>
            <input
              type="text"
              placeholder="Ask a question..."
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #4b5563",
                backgroundColor: "#374151",
                color: "white",
                outline: "none"
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
