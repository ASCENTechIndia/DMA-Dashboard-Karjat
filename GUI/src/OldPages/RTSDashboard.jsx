import '../styles/dashboard.css'

import Header from '../components/Header'
import SummaryCards from '../components/SummaryCards'
import DashboardCard from '../components/DashboardCard'
import Table from '../components/Table'
import DashboardFooter from "../components/DashboardFooter";



function RTSDashboard() {
  return (
    <div className="dma-dashboard">
      <div className="dma-grid">
        <Header />

        <div className="dma-row">
            <Table />
        </div>

        {/* <DashboardFooter /> */}
      </div>
    </div>
  )
}

export default RTSDashboard
