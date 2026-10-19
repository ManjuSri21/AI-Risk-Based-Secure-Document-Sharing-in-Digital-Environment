import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import { adminApi } from '../services/api';
import { useToast } from '../components/ui/Toast';

const defaultUsers = [
  { id: '1', name: 'Manju', email: 'manju@gmail.com', role: 'Document Owner', status: 'Active', docs: 24, joined: 'Oct 2026' },
];

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState(defaultUsers);

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers();
      if (res?.users?.length) {
        setUsers(res.users);
      }
    } catch {
      // Keep default users on offline mode
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    if (user.role === 'System Administrator') {
      toast('Cannot modify system administrator accounts', 'warning');
      return;
    }

    try {
      const res = await adminApi.toggleUserStatus(user.id);
      toast(res.message || `User status changed to ${res.status}`, 'success');
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: res.status || (u.status === 'Active' ? 'Suspended' : 'Active') } : u))
      );
    } catch {
      // Local fallback
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u))
      );
      toast(`User status changed (Demo Mode)`, 'info');
    }
  };

  const activeCount = users.filter((u) => u.status === 'Active').length;
  const suspendedCount = users.filter((u) => u.status === 'Suspended').length;

  return (
    <DashboardLayout title="Users" subtitle="Manage all registered users" isAdmin>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon={Users} label="Total Users" value={users.length.toString()} color="primary" />
          <StatCard icon={UserCheck} label="Active Users" value={activeCount.toString()} color="emerald" />
          <StatCard icon={UserX} label="Suspended" value={suspendedCount.toString()} color="rose" />
          <StatCard icon={TrendingUp} label="New This Month" value="3" color="accent" />
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
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-semibold">
                          {user.name ? user.name[0] : 'U'}
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
                    <td className="px-5 py-4 text-right">
                      {user.role !== 'System Administrator' && (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all ${
                            user.status === 'Active'
                              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {user.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
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
