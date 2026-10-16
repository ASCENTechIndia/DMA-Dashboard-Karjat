import { footerData } from '../data/dashboardData'

/**
 * DashboardFooter
 * Bottom bar: explanatory note on the left, "Data as on" date on the right.
 */
function DashboardFooter({ data = footerData }) {
  return (
    <div className="dma-footer">
      <span className="dma-footer-note">
        <strong>Note:</strong> {data.note.replace('Note: ', '')}
      </span>
      <span className="dma-footer-date">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Data as on: {data.dataAsOn}
      </span>
    </div>
  )
}

export default DashboardFooter
