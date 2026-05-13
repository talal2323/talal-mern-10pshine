import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Edit3, Trash2, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { io } from 'socket.io-client';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  
  const navigate = useNavigate();

  // Wrapped in useCallback so we can trigger it whenever search/category changes
  const fetchNotes = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (category !== 'All') params.append('category', category);

      const response = await fetch(`/api/notes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      } else {
        throw new Error('Failed to fetch notes');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, category, navigate]);

  // Trigger fetch every time searchTerm or category changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchNotes();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchNotes]);

  // 👇 THE NEW REAL-TIME SOCKET LISTENER 👇
  useEffect(() => {
    // 1. Dial the backend server
    const socket = io('http://localhost:5000'); 

    // 2. Listen for the specific update event
    socket.on('task_status_changed', (updatedTask) => {
      
      // 3. Instantly swap the old note with the newly updated note in the UI
      setNotes((prevNotes) => 
        prevNotes.map((note) => 
          note._id === updatedTask._id ? updatedTask : note
        )
      );

      // 4. Pop a tiny notification so the user knows a live update happened
      toast.success(`Task updated live: ${updatedTask.title}`, {
        icon: '⚡',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    });

    // 5. Hang up the phone when the user leaves the Dashboard
    return () => {
      socket.disconnect();
    };
  }, []); 
  // 👆 END OF SOCKET LOGIC 👆

  // Delete Function
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Note deleted successfully');
        setNotes((prevNotes) => prevNotes.filter((note) => note._id !== id));
      } else {
        throw new Error('Failed to delete note');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
          
          <Link
            to="/editor/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <PlusCircle className="h-5 w-5" />
            Create Note
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div className="relative w-full sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-colors"
            >
              <option value="All">All Categories</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Study">Study</option>
            </select>
          </div>
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No notes found</h3>
            <p className="text-gray-500">Try adjusting your search or create a new note.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {note.category || 'Personal'}
                  </span>
                  {/* Action Buttons: Edit & Delete */}
                  <div className="flex items-center gap-2">
                    <Link to={`/editor/${note._id}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(note._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{note.title}</h3>
                {/* Strip HTML tags for the preview */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                  {note.content.replace(/<[^>]*>?/gm, '')}
                </p>
                <div className="text-xs text-gray-400 mt-auto pt-4 border-t border-gray-100">
                  {new Date(note.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}