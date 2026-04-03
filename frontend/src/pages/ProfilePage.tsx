import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '@/services/auth.service';
import { Button } from '@/components/shared/Button';
import { LogOut, Home, CheckCircle, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  isLoggedIn: boolean;
  userType: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();

    if (!currentUser?.user || !currentUser?.token) {
      navigate('/login');
      return;
    }

    setUser(currentUser.user);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-900 font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-black tracking-tighter mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">Unable to load profile information.</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 rounded-xl bg-black text-white font-bold uppercase tracking-wider hover:opacity-90"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter bg-gradient-to-b from-black to-gray-400 bg-clip-text text-transparent">
            Welcome, {user.name}
          </h1>
          <p className="text-lg text-gray-600 mt-2">Manage your account and access reviews</p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <p className="text-sm text-gray-500 font-bold tracking-wide mb-2">NAME</p>
            <p className="text-2xl font-black tracking-tight text-gray-900">{user.name}</p>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <p className="text-sm text-gray-500 font-bold tracking-wide mb-2">USER ID</p>
            <p className="text-lg font-mono text-gray-700 break-all">{user.id}</p>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <p className="text-sm text-gray-500 font-bold tracking-wide mb-2">ACCOUNT TYPE</p>
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-bold uppercase tracking-wider">
                {user.userType}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 font-bold tracking-wide mb-2">LOGIN STATUS</p>
            <div className="flex items-center gap-2">
              {user.isLoggedIn ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-bold uppercase tracking-wider text-green-700">
                    Logged In
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-bold uppercase tracking-wider text-red-700">
                    Logged Out
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
            <Button
              className="h-12 rounded-xl bg-black text-white font-bold uppercase tracking-wider hover:opacity-90 flex items-center justify-center gap-2"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
            <Button
              className="h-12 rounded-xl border-2 border-black text-white font-bold uppercase tracking-wider hover:text-black hover:bg-black/5 flex items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
