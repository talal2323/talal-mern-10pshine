import { Link } from 'react-router-dom';
import { BookText, UserCircle } from 'lucide-react'; // Changed LogOut to UserCircle

export default function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-2 rounded-xl group-hover:bg-blue-700 transition-colors">
              <BookText className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">NotesApp</span>
          </Link>
          
          <Link
            to="/profile"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-lg transition-colors hover:bg-blue-50"
          >
            <UserCircle className="h-6 w-6" />
            <span className="hidden sm:inline">My Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}