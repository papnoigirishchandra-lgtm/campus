import { useCallback, useEffect, useState } from 'react';
import { useToast } from './ToastProvider';
import { getAllUsers, updateUser, deleteUser } from '../services/firestoreService';

const AdminUserTable = ({ onRefresh }) => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('student');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const handleEdit = (u) => { setEditingUser(u); setEditName(u.name); setEditRole(u.role); };
  const handleCancelEdit = () => { setEditingUser(null); setEditName(''); setEditRole('student'); };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSavingEdit(true);
    try {
      await updateUser(editingUser.id, { name: editName, role: editRole });
      showToast('User updated successfully', 'success');
      handleCancelEdit();
      fetchUsers();
      if (onRefresh) onRefresh();
    } catch (error) {
      showToast(error.message || 'Failed to update user', 'error');
    } finally { setSavingEdit(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      await deleteUser(id);
      showToast('User deleted successfully', 'success');
      fetchUsers();
      if (onRefresh) onRefresh();
    } catch (error) {
      showToast(error.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <div className="w-full">
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between mb-6">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">Edit User</h4>
              <button onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label>Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full Name" />
              </div>
              <div className="space-y-2">
                <label>Email (read-only)</label>
                <input value={editingUser.email} disabled className="bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed text-slate-500" />
              </div>
              <div className="space-y-2">
                <label>Role</label>
                <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button onClick={handleSaveEdit} disabled={savingEdit} className="btn-primary w-full">
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={handleCancelEdit} className="btn-secondary w-full">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Management</h3>
      </div>
      <div className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mb-6">
          <div className="flex max-w-md w-full gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </span>
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." className="pl-10 text-sm" />
            </div>
          </div>
          <div className="text-sm font-medium text-slate-500">
            Page <span className="text-slate-900 dark:text-slate-200">{page}</span> of {totalPages} · {filtered.length} users
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading users...
          </div>
        ) : (
          <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 dark:text-slate-300">
                {paginated.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{u.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize border ${
                        u.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
                        : u.role === 'teacher' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30'
                        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(u)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button onClick={() => handleDelete(u.id, u.name)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">No users found.</td></tr>
                )}
              </tbody>
            </table>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-1.5 text-xs disabled:opacity-50">Previous</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-4 py-1.5 text-xs disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserTable;
