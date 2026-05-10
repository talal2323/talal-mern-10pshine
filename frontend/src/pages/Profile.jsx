import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, BookText, LogOut, ShieldCheck, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [noteCount, setNoteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Fetch User Details AND Note Stats concurrently!
        const [userRes, notesRes] = await Promise.all([
          fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/notes', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (userRes.ok && notesRes.ok) {
          const user = await userRes.json();
          const notes = await notesRes.json();
          
          setUserData(user);
          setNoteCount(notes.length);
        } else {
          throw new Error('Failed to fetch profile data. Session may have expired.');
        }
      } catch (error) {
        toast.error(error.message);
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Successfully logged out!');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Top Banner / Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm border border-white/30">
                <User className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{userData?.name}</h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-100 mt-1">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verified User</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details & Stats */}
          <div className="p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-2">
              Account Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-start gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="text-gray-900 font-semibold">{userData?.email}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-start gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p className="text-gray-900 font-semibold">{userData?.joinDate}</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-2">
              Your Statistics
            </h3>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-xl shadow-sm text-white">
                  <BookText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900 uppercase tracking-wider">Total Notes Written</p>
                  <p className="text-gray-600 text-sm mt-0.5">Across all your projects</p>
                </div>
              </div>
              <div className="text-4xl font-extrabold text-blue-700">
                {noteCount}
              </div>
            </div>

            {/* Logout Action */}
            <div className="flex justify-center sm:justify-end border-t border-gray-100 pt-8">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 px-8 rounded-xl transition-colors duration-200"
              >
                <LogOut className="h-5 w-5" />
                Sign Out of Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}