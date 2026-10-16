import '../styles/dashboard.css'
import { lazy, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from '../components/Header'
import SummaryCards from '../components/SummaryCards'
import DashboardCard from '../components/DashboardCard'
import TodaysCollectionTable from '../components/TodaysCollectionTable'
import PropertySummaryTable from '../components/PropertySummaryTable'
import CollectionPercentTable from '../components/CollectionPercentTable'
import CollectionStatusModeTable from '../components/CollectionStatusModeTable'
const PropertyDistributionChart = lazy(() =>
  import("../components/PropertyDistributionChart")
);
const CollectionStatusDonutChart = lazy(() =>
  import("../components/CollectionStatusDonutChart")
);
const TopPerformingCorporationsChart = lazy(() =>
  import("../components/TopPerformingCorporationsChart")
);
const PaymentModeAnalysisChart = lazy(() =>
  import("../components/PaymentModeAnalysisChart")
);
const CollectionRankingChart = lazy(() =>
  import("../components/CollectionRankingChart")
);
import Header_NEW from '../components/Header_NEW';
import { getHomePath } from '../utils/auth';
// import DashboardFooter_NEW from '../components/DashboardFooter_NEW';

function DMADashboard() {
    const navigate = useNavigate();
    const [summaryLoaded, setSummaryLoaded] = useState(false);
  return (
    <div className="dma-dashboard">
      <div className="container-fluid px-0">

        <div className="row g-3">
          <div className="col-12">
          <Header_NEW title="Property Tax Dashboard" />
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12">
            <SummaryCards onLoaded={() => setSummaryLoaded(true)} />
          </div>
        </div>

        {/* Back Arrow button */}
        <div className="row g-0" style={{ marginTop: "4px", marginBottom: "-12px" }}>
          <div className="col-12 d-flex justify-content-start">
            <button
              onClick={() => navigate(getHomePath())}
              style={{
                background: "var(--dma-card-bg, #fff)",
                border: "1px solid var(--dma-border, #e3e7f0)",
                color: "var(--dma-navy, #102a6b)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                boxShadow: "var(--dma-shadow)",
                transition: "background-color 0.15s, color 0.15s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f1f5f9";
                e.currentTarget.style.color = "var(--dma-blue, #2f6fed)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--dma-card-bg, #fff)";
                e.currentTarget.style.color = "var(--dma-navy, #102a6b)";
              }}
              title="Go Back to Home"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          </div>
        </div>

        <div className="row g-3 mt-0 align-items-stretch">
  {/* <div className="col-lg-4 col-md-4 col-sm-12 d-flex">
    <DashboardCard
      className="h-100 w-100"
      title="Today's Collection (Amount in Lakhs)"
      icon="calendar"
      color="blue"
    >
      <TodaysCollectionTable />
    </DashboardCard>
  </div> */}

  <div className="col-lg-12 col-md-12 col-sm-12 d-flex">
    <DashboardCard
      className="h-100 w-100"
      title="Property Summary"
      icon="building"
      color="blue"
      split
    >
      <PropertySummaryTable />
    <Suspense fallback={<div>Loading Chart...</div>}>  <PropertyDistributionChart /></Suspense>
    </DashboardCard>
  </div>
</div>

<div className="row g-3 mt-2 align-items-stretch">
  <div className="col-lg-6 col-md-12 d-flex">
    <DashboardCard
      className="h-100 w-100"
      title="Collection % (Amount in Cr)"
      icon="pie"
      color="blue"
    >
      <CollectionPercentTable />
    </DashboardCard>
  </div>

  <div className="col-lg-6 col-md-12 d-flex">
    <DashboardCard
      className="h-100 w-100"
      title="Collection Status Mode Wise"
      icon="status"
      color="blue"
      split
    >
    <Suspense fallback={<div>Loading Chart...</div>}>  <CollectionStatusDonutChart /></Suspense>
      <CollectionStatusModeTable />
    </DashboardCard>
  </div>
</div>

<div className="row g-3 mt-2 align-items-stretch">
  <div className="col-lg-4 col-md-6 col-sm-12 d-flex">
    <DashboardCard
      className="h-100 w-100"
      title="Top Performing Corporations (By Collection %)"
      icon="bars"
      color="green"
    >
    <Suspense fallback={<div>Loading Chart...</div>}> <TopPerformingCorporationsChart /></Suspense>
    </DashboardCard>
  </div>

  <div className="col-lg-4 col-md-6 col-sm-12 d-flex">
    <DashboardCard
      className="h-100 w-100"
      title="Payment Mode Analysis (Collection in Cr)"
      icon="donut"
      color="blue"
    >
    <Suspense fallback={<div>Loading Chart...</div>}>   <PaymentModeAnalysisChart /></Suspense>
    </DashboardCard>
  </div>

  <div className="col-lg-4 col-md-6 col-sm-12 d-flex">
    <DashboardCard
      className="h-100 w-100"
      title="Collection Ranking (By Collection in Cr)"
      icon="trophy"
      color="purple"
    >
    <Suspense fallback={<div>Loading Chart...</div>}>  <CollectionRankingChart /></Suspense>
    </DashboardCard>
  </div>
</div>

{/* Back Arrow button */}
<div className="row g-0" style={{ marginTop: "4px", marginBottom: "-12px" }}>
  <div className="col-12 d-flex justify-content-start">
    <button
      onClick={() => navigate(getHomePath())}
      style={{
        background: "var(--dma-card-bg, #fff)",
        border: "1px solid var(--dma-border, #e3e7f0)",
        color: "var(--dma-navy, #102a6b)",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        boxShadow: "var(--dma-shadow)",
        transition: "background-color 0.15s, color 0.15s"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#f1f5f9";
        e.currentTarget.style.color = "var(--dma-blue, #2f6fed)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--dma-card-bg, #fff)";
        e.currentTarget.style.color = "var(--dma-navy, #102a6b)";
      }}
      title="Go Back to Home"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    </button>
  </div>
</div>

{/* </>)} */}

        {/* <div className="row g-3 mt-2">
          <div className="col-12">
            <DashboardFooter_NEW />
          </div>
        </div> */}

      </div>
    </div>
  );
}

export default DMADashboard;