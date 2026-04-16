import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', height: '100vh', margin: 0 }}>
        <aside style={{
          width: '210px',
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          <div style={{ padding: '20px 16px', borderBottom: '1px solid #f0ede8' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#ff6b00' }}>GRADION</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Activity Hub</div>
          </div>
          <nav style={{ padding: '12px 8px', flex: 1 }}>
            <a href="/" style={{ display: 'block', padding: '7px 10px', color: '#374151', fontSize: '13px', textDecoration: 'none', marginBottom: '2px' }}>📅 Calendar</a>
            <a href="/events" style={{ display: 'block', padding: '7px 10px', color: '#374151', fontSize: '13px', textDecoration: 'none', marginBottom: '2px' }}>📋 All Events</a>
            <a href="/images" style={{ display: 'block', padding: '7px 10px', color: '#374151', fontSize: '13px', textDecoration: 'none', marginBottom: '2px' }}>🖼 Image Library</a>
            <a href="/admin/events/new" style={{ display: 'block', padding: '7px 10px', color: '#ff6b00', fontSize: '13px', textDecoration: 'none', marginBottom: '2px' }}>➕ New Event</a>
          </nav>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f0ede8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', background: '#ff6b00', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff' }}>AN</div>
            <div style={{ fontSize: '12px', color: '#374151' }}>Admin User</div>
          </div>
        </aside>
        <main style={{ flex: 1, background: '#f9f8f5', overflow: 'auto' }}>
          {children}
        </main>
      </body>
    </html>
  )
}