import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import "react-quill-new/dist/quill.snow.css";
import { Save, X, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

export default function Editor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams(); // Gets the ID from the URL
  const isNewNote = id === 'new';

  // Customize the toolbar to look professional
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  useEffect(() => {
    // If it's an existing note, fetch its data
    if (!isNewNote) {
      const fetchNote = async () => {
        setIsFetching(true);
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/notes', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (!response.ok) throw new Error('Failed to fetch note');
          
          const notes = await response.json();
          // Find the specific note we are editing
          const existingNote = notes.find(n => n._id === id);
          
          if (existingNote) {
            setTitle(existingNote.title);
            setContent(existingNote.content);
          } else {
            toast.error('Note not found');
            navigate('/');
          }
        } catch (error) {
          toast.error(error.message);
        } finally {
          setIsFetching(false);
        }
      };

      fetchNote();
    }
  }, [id, isNewNote, navigate]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || content === '<p><br></p>') {
      toast.error('Title and content are required');
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    // Determine if we are doing a POST (Create) or PUT (Update)
    const url = isNewNote ? '/api/notes' : `/api/notes/${id}`;
    const method = isNewNote ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save note');
      }

      toast.success(isNewNote ? 'Note created successfully!' : 'Note updated successfully!');
      navigate('/'); // Go back to dashboard
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2.5 px-5 rounded-xl transition-colors shadow-sm"
            >
              <X className="h-5 w-5" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {isNewNote ? 'Save Note' : 'Update Note'}
            </button>
          </div>
        </div>

        {/* Editor Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <input
              type="text"
              placeholder="Note Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-extrabold text-gray-900 placeholder-gray-300 border-none focus:outline-none focus:ring-0 bg-transparent"
            />
          </div>
          
          {/* We use a wrapper class to enforce a minimum height on the Quill editor */}
          <div className="[&_.ql-editor]:min-h-[400px] [&_.ql-editor]:text-gray-700 [&_.ql-editor]:text-lg [&_.ql-toolbar]:bg-gray-50 [&_.ql-toolbar]:border-none [&_.ql-container]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200">
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent} 
              modules={modules}
              placeholder="Start writing your brilliant ideas here..."
            />
          </div>
        </div>
      </main>
    </div>
  );
}