import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import UploadDocument from './pages/UploadDocument';
import RiskAnalysis from './pages/RiskAnalysis';
import SecurityPolicy from './pages/SecurityPolicy';
import Repository from './pages/Repository';
import ShareDocument from './pages/ShareDocument';
import SharedDocumentAccess from './pages/SharedDocumentAccess';
import AuditLogs from './pages/AuditLogs';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminDocuments from './pages/AdminDocuments';
import AdminRiskMonitoring from './pages/AdminRiskMonitoring';
import AdminUsers from './pages/AdminUsers';
import AdminAuditLogs from './pages/AdminAuditLogs';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/upload" element={<UploadDocument />} />
          <Route path="/risk-analysis" element={<RiskAnalysis />} />
          <Route path="/security-policy" element={<SecurityPolicy />} />
          <Route path="/repository" element={<Repository />} />
          <Route path="/share" element={<ShareDocument />} />
          <Route path="/shared-access" element={<SharedDocumentAccess />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/documents" element={<AdminDocuments />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/risk-monitoring" element={<AdminRiskMonitoring />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
