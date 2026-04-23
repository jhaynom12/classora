'use client';

import { useState } from 'react';

export default function TestButtons() {
  const [showChat, setShowChat] = useState(false);
  const [showGuardian, setShowGuardian] = useState(false);

  return (
    <>
      {/* Test Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          border: 'none',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span style={{ fontSize: '24px' }}>💬</span>
      </button>

      {/* Test Guardian Button */}
      <button
        onClick={() => setShowGuardian(!showGuardian)}
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          zIndex: 9999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #a855f7, #ec4899)',
          border: 'none',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span style={{ fontSize: '24px' }}>🧠</span>
      </button>

      {/* Simple Chat Window */}
      {showChat && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '90px',
          zIndex: 9999,
          width: '320px',
          height: '400px',
          background: '#1f2937',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #374151'
        }}>
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: 'white',
            fontWeight: 'bold'
          }}>
            Classora Chat
            <button onClick={() => setShowChat(false)} style={{ float: 'right', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', color: 'white' }}>
            <p>Welcome to Classora Chat!</p>
          </div>
          <div style={{ padding: '16px', borderTop: '1px solid #374151' }}>
            <input type="text" placeholder="Type a message..." style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #4b5563', background: '#374151', color: 'white' }} />
          </div>
        </div>
      )}

      {/* Simple Guardian Window */}
      {showGuardian && (
        <div style={{
          position: 'fixed',
          bottom: '160px',
          right: '90px',
          zIndex: 9999,
          width: '320px',
          height: '400px',
          background: '#1f2937',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #a855f7'
        }}>
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            color: 'white',
            fontWeight: 'bold'
          }}>
            School Guardian AI
            <button onClick={() => setShowGuardian(false)} style={{ float: 'right', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', color: 'white' }}>
            <p>Hello! I'm School Guardian. How can I help you today?</p>
          </div>
          <div style={{ padding: '16px', borderTop: '1px solid #374151' }}>
            <input type="text" placeholder="Ask me anything..." style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #4b5563', background: '#374151', color: 'white' }} />
          </div>
        </div>
      )}
    </>
  );
}
