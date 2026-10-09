import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ title, subtitle, children, isAdmin = false }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isAdmin={isAdmin} />
      <div className="lg:ml-64">
        <Topbar title={title} subtitle={subtitle} />
        <main className="p-4 sm:p-6 lg:p-8 page-transition">
          {children}
        </main>
      </div>
    </div>
  );
}
