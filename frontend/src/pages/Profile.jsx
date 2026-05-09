import { useEffect, useState } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useContext } from 'react';
import { useToast } from '../components/ToastProvider';
import LoadingScreen from '../components/LoadingScreen';
import { API_BASE_URL } from '../utils/config';

const Profile = () => {
  const { token } = useContext(AuthContext);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: '', email: '', avatarUrl: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data.user);
      } catch (error) {
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, showToast]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarFile(reader.result);
      setProfile((prev) => ({ ...prev, avatarUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/auth/profile`,
        {
          name: profile.name,
          avatarUrl: profile.avatarUrl
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setProfile(res.data.user);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading profile..." />;

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            Account Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your personal information and profile settings.
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="card text-center p-8">
            <div className="relative inline-block mb-6 group">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="h-32 w-32 rounded-3xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-xl"
                />
              ) : (
                <div className="h-32 w-32 rounded-3xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-4xl font-bold border border-blue-200 dark:border-blue-800/20">
                  {profile.name?.[0] || 'U'}
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-xl shadow-lg border-2 border-white dark:border-slate-800 cursor-pointer hover:bg-blue-700 transition-all hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile.name}</h2>
            <p className="text-sm text-slate-500 font-medium capitalize mt-1">{profile.role || 'Member'}</p>
            
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-left">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Account Status</h3>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                Verified Account
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="card">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">General Information</h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  value={profile.email}
                  disabled
                  title="Email cannot be changed"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed text-slate-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 justify-center"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      Save Profile Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
