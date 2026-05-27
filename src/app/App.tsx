import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router'

import VariantsPage from './components/VariantsPage'
import LeaderboardPage from './components/LeaderboardPage'
import DashboardPage from './components/DashboardPage'
import KPIDetailsPage from './components/KPIDetailsPage'
import KPIDashboardPage from './components/KPIDashboardPage'
import SalesDashboardPage from './components/SalesDashboardPage'
import DistributionDashboardPage from './components/DistributionDashboardPage'
import FinanceDashboardPage from './components/FinanceDashboardPage'
import RackBillingPage from './components/RackBillingPage'
import SalesDataPage from './components/SalesDataPage'
import StockistPage from './components/StockistPage'
import BottomNav from './components/BottomNav'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F5F7FA]">
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/variants" replace />}
          />

          <Route path="/variants" element={<VariantsPage />} />
          <Route path="/mdp" element={<LeaderboardPage />} />
          <Route path="/dashboard/:wdCode" element={<DashboardPage />} />
          <Route path="/kpi/:wdCode/:kpiName" element={<KPIDetailsPage />} />
          <Route path="/kpi-dashboard" element={<KPIDashboardPage />} />
          <Route path="/sales-dashboard" element={<SalesDashboardPage />} />
          <Route path="/rack-billing" element={<RackBillingPage />} />
          <Route path="/sales-data" element={<SalesDataPage />} />
          <Route path="/stockist" element={<StockistPage />} />
          <Route path="/distribution-dashboard" element={<DistributionDashboardPage />} />
          <Route path="/finance-dashboard" element={<FinanceDashboardPage />} />
        </Routes>

        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
