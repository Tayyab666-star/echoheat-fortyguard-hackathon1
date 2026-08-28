'use client'

interface StatRowProps {
  label: string
  value: string | number
  badgeText?: string
  badgeColor?: 'green' | 'orange' | 'blue'
}

function StatRow({ label, value, badgeText, badgeColor }: StatRowProps) {
  const badgeStyles = {
    green:  'bg-green-500/15 text-green-400',
    orange: 'bg-orange-500/15 text-orange-400',
    blue:   'bg-blue-500/15 text-blue-400',
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      paddingTop: '10px',
      paddingBottom: '10px',
      borderBottom: '1px solid rgba(63,63,70,0.5)',
    }}>
      <span style={{
        fontSize: '12px',
        color: '#A1A1AA',
        fontWeight: 500,
        lineHeight: '1.4',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
      }}>
        {label}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#FAFAFA',
          lineHeight: 1,
        }}>
          {value}
        </span>
        {badgeText && badgeColor && (
          <span className={`
            text-[10px] font-semibold px-2 py-0.5 rounded-full
            ${badgeStyles[badgeColor]}
          `}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  )
}

export function FleetStatusCard() {
  return (
    <div style={{
      background: '#18181B',
      border: '1px solid rgba(63,63,70,0.6)',
      borderRadius: '16px',
      padding: '20px',
      height: '100%',
      minWidth: 0,
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '4px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#FAFAFA',
          margin: 0,
          lineHeight: 1.3,
        }}>
          Fleet Status
        </h3>
      </div>

      {/* Stats */}
      <StatRow
        label="Total Active Vehicles"
        value={50}
      />
      <StatRow
        label="Pre-Cooling Active"
        value={12}
        badgeText="Active"
        badgeColor="green"
      />
      <StatRow
        label="Routes Re-sequenced Today"
        value={7}
        badgeText="Today"
        badgeColor="orange"
      />
      <div style={{ paddingTop: '10px' }}>
        <span style={{
          fontSize: '12px',
          color: '#A1A1AA',
          fontWeight: 500,
          lineHeight: '1.4',
          whiteSpace: 'normal',
        }}>
          SLA Breaches Avoided
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <span style={{ fontSize: '22px', fontWeight: 700, color: '#FAFAFA' }}>3</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
            Saved
          </span>
        </div>
      </div>
    </div>
  )
}
