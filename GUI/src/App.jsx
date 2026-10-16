import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import "./styles/dashboard.css";
import RTSDashboard_NEW from "./pages/RTSDashboared_NEW";
import DMADashboard from "./pages/DMADashboard";
import Home_NEW from "./pages/Home_NEW";
import ServiceWiseDashboard from "./pages/ServiceWiseDashboard";
import ErrorPage from "./pages/ErrorPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/propertydashboard"
          element={<DMADashboard />
          }
        />
        <Route
          path="/servicedashboard"
          element={
            <ServiceWiseDashboard />
          }
        />
        <Route
          path="/servicedashboard/:moduleCode"
          element={
            <ServiceWiseDashboard />
          }
        />
        <Route
          path="/estatedashboard"
          element={
            <ServiceWiseDashboard />
          }
        />
        <Route
          path="/rtsdashboard"
          element={
            <RTSDashboard_NEW />
          }
        />

        {/* Dynamic Home Route with access code */}
        <Route path="/QGthcmphdA==" element={<Home_NEW />} />

        {/* Root Route: ErrorPage if unauthorized; dynamic redirect to active home if authorized */}
        <Route path="/" element={<ErrorPage />} />

        {/* Fallback for any unknown route */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router >
  );
}

export default App;