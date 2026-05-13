import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Moon, Sun, Globe, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('EN');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/70 backdrop-blur-md border-b border-white/10 shadow-lg py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center text-background font-bold text-xl shadow-[0_0_15px_rgba(0,255,102,0.4)]">
            ث
          </div>
          <span className="font-bold text-xl tracking-tight text-textMain">Thimar</span>
        </Link>

        {/* Search Bar (Center) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-textMuted" />
          </div>
          <input 
            type="text" 
            placeholder="Search farms, deals, or market data..." 
            className="w-full bg-surface/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors focus:bg-surface/80"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          
          <button 
            onClick={() => setLang(lang === 'EN' ? 'AR' : 'EN')}
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-textSecondary hover:text-primary transition-colors"
          >
            <Globe size={16} />
            {lang}
          </button>

          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-textSecondary hover:text-primary transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="w-px h-6 bg-white/10 mx-1"></div>

          <button className="relative text-textSecondary hover:text-primary transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(0,255,102,0.8)]"></span>
          </button>

          <button className="w-8 h-8 rounded-full bg-surfaceHighlight border border-white/10 flex items-center justify-center text-textSecondary hover:text-primary hover:border-primary transition-all">
            <User size={16} />
          </button>

        </div>
      </div>
    </motion.nav>
  );
}
