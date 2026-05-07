import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Loader2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      const token = localStorage.getItem('token');
      
      // Protect the route: If no token, kick them to login
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('/api/notes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          throw new Error('Session expired. Please log in again.');
        }

        const data = await response.json();
        setNotes(data);
      } catch (error) {
        toast.error(error.message || 'Failed to load notes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [navigate]);

  // Format the date nicely (e.g., "Oct 12, 2025")
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Notes</h1>
            <p className="text-gray-500 mt-1">Manage and organize your thoughts</p>
          </div>
          
          <button
            onClick={() => navigate('/editor/new')} // We will build this route in PR 8!
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            Create Note
          </button>
        </div>

        {/* State 1: Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading your notes...</p>
          </div>
        ) : notes.length === 0 ? (
          
          /* State 2: Premium Empty State */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto mt-10">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              You haven't created any notes. Click the button below to start capturing your brilliant ideas.
            </p>
            <button
              onClick={() => navigate('/editor/new')}
              className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <Plus className="h-5 w-5" />
              Write your first note
            </button>
          </div>
        ) : (
          
          /* State 3: The Beautiful CSS Grid Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div
                key={note._id}
                onClick={() => navigate(`/editor/${note._id}`)}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 group flex flex-col h-64"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {note.title}
                </h3>
                
                {/* Note preview (strip HTML tags since we will use a Rich Text Editor later) */}
                <p className="text-gray-600 flex-grow line-clamp-4 leading-relaxed">
                  {note.content.replace(/<[^>]*>?/gm, '')}
                </p>
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50 text-sm text-gray-400 font-medium">
                  <Calendar className="h-4 w-4" />
                  {formatDate(note.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}