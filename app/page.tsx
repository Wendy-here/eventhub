import { supabase } from '@/app/lib/supabase'

// @ts-ignore
export default async function CalendarPage() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .gte('date', firstDay.toISOString().split('T')[0])
    .lte('date', lastDay.toISOString().split('T')[0])

  const monthName = today.toLocaleString('default', { month: 'long' })

  const eventsByDate: Record<string, any[]> = {}
  events?.forEach(event => {
    const d = event.date
    if (!eventsByDate[d]) eventsByDate[d] = []
    eventsByDate[d].push(event)
  })

  const startWeekday = firstDay.getDay()
  const totalDays = lastDay.getDate()
  const days = []

  for (let i = 0; i < startWeekday; i++) {
    days.push({ day: null, date: null })
  }
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ day: d, date: dateStr })
  }

  const todayStr = today.toISOString().split('T')[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Top bar */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 24px',
        height: '54px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
            Activity Calendar
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>
            Home / Calendar / {monthName} {year}
          </div>
        </div>
        <a href="/admin/events/new" style={{
          background: '#ff6b00',
          color: '#ffffff',
          padding: '7px 14px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 500,
          textDecoration: 'none',
        }}>
          + New Event
        </a>
      </div>

      {/* Calendar content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>

        {/* Month title */}
        <div style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#111827',
          marginBottom: '16px',
        }}>
          {monthName} {year}
        </div>

        {/* Calendar grid */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>

          {/* Weekday headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            background: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
          }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} style={{
                textAlign: 'center',
                padding: '10px 0',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: d === 'Sun' || d === 'Sat' ? '#ff6b00' : '#9ca3af',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
          }}>
            {days.map((cell, i) => (
              <div key={i} style={{
                borderRight: '1px solid #f3f4f6',
                borderBottom: '1px solid #f3f4f6',
                padding: '8px 7px',
                minHeight: '100px',
                background: cell.date === todayStr ? '#fff8f3' : '#ffffff',
              }}>
                {cell.day && (
                  <>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      fontSize: '12px',
                      fontWeight: 500,
                      marginBottom: '5px',
                      background: cell.date === todayStr ? '#ff6b00' : 'transparent',
                      color: cell.date === todayStr ? '#ffffff' : '#6b7280',
                    }}>
                      {cell.day}
                    </div>

                    {(eventsByDate[cell.date!] || []).map(event => (
                      <a key={event.id} href={`/events/${event.id}`} style={{
                        display: 'block',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 500,
                        marginBottom: '2px',
                        textDecoration: 'none',
                        background: '#fff3eb',
                        color: '#c2410c',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {event.title}
                      </a>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}