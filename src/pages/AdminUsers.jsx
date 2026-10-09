import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/ui/StatCard';

const mockUsers = [
  { id: 1, name: 'Manju', email: 'manju@example.com', role: 'Document Owner', status: 'Active', docs: 24, joined: 'Jan 2026' },
  { id: 2, name: 'Arjun', email: 'arjun@example.com', role: 'Document Owner', status: 'Active', docs: 15, joined: 'Feb 2026' },
  { id: 3, name: 'Kavya', email: 'kavya@example.com', role: 'Document Owner', status: 'Active', docs: 8, joined: 'Mar 2026' },
  { id: 4, name: 'Rahul', email: 'rahul@example.com', role: 'Document Owner', status: 'Suspended', docs: 3, joined: 'Apr 2026' },
  { id: 5, name: 'Priya', email: 'priya@example.com', role: 'Document Owner', status: 'Active', docs: 19, joined: 'May 2026' },
  { id: 6, name: 'Vikram', email: 'vikram@example.com', role: 'Document Owner', status: 'Active', docs: 7, joined: 'Jun 2026' },
];

export default function AdminUsers() {
  return (
    <DashboardLayout title="Users" subtitle="Manage all registered users" isAdmin>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon={Users} label="Total Users" value="1,248" color="primary" />
          <StatCard icon={UserCheck} label="Active Users" value="1,203" color="emerald" />
          <StatCard icon={UserX} label="Suspended" value="45" color="rose" />
          <StatCard icon={TrendingUp} label="New This Month" value="87" color="accent" />
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Documents</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-semibold">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-navy-900">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-navy-700">{user.role}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-navy-900">{user.docs}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${user.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-500">{user.joined}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
