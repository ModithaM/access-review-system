import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/HomePage';
import Login from './components/auth/login.component';
import Register from './components/auth/register.component';
import ProfilePage from './pages/ProfilePage';
import ReportIssuePage from './pages/ReportIssuePage';
import Header from './components/shared/Header';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import PublicSpacesPage from './pages/admin/PublicSpacesPage';
import AccessFeaturesPage from './pages/admin/AccessFeaturesPage';
import ReviewsPage from './pages/admin/ReviewsPage';
import UsersPage from './pages/admin/UsersPage';
import ReportedIssuesPage from './pages/admin/ReportedIssuesPage';
import CompactAnalyticsDashboardPage from './pages/admin/CompactAnalyticsDashboardPage';

function MainLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Public / Main Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/report-issue" element={<ReportIssuePage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="spaces" element={<PublicSpacesPage />} />
          <Route path="features" element={<AccessFeaturesPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="issues" element={<ReportedIssuesPage />} />
          <Route path="analytics" element={<CompactAnalyticsDashboardPage />} />
          <Route
            path="settings"
            element={<div className="p-8 font-medium">Settings (Coming Soon)</div>}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
