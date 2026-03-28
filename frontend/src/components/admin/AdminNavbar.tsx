import { Search, Bell } from 'lucide-react';

interface NavbarProps {
  title: string;
}

export default function AdminNavbar({ title }: NavbarProps) {
  return (
    <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 flex items-center justify-between px-8">
      <h1 className="text-2xl font-bold bg-brand-gradient text-transparent bg-clip-text">
        {title}
      </h1>
      
      <div className="flex items-center space-x-6">
        <div className="relative group hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all focus:w-80 focus:bg-white"
          />
        </div>
        
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 max-right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}
