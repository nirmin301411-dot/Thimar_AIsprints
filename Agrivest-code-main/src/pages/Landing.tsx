import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, ShieldCheck, Cpu } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-textMain overflow-x-hidden font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20">
        {/* Background Overlay & Gradients */}
        <div className="absolute inset-0 z-0 bg-background" />
        <div 
          className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
                Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-blue drop-shadow-lg">Wall Street</span><br/> Meets the Farm.
              </h1>
            </motion.div>

            <motion.p 
              className="text-lg md:text-xl text-textSecondary max-w-2xl mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              AI-powered fractional agricultural investing built for the future of sustainable farming. Secure, transparent, and highly profitable.
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <Link to="/login" className="flex items-center gap-2 bg-primary text-background px-8 py-4 rounded-full font-bold hover:bg-primaryHover hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,102,0.4)]">
                Explore Farms <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="flex items-center gap-2 bg-surface/50 backdrop-blur-md border border-borderLight text-textMain px-8 py-4 rounded-full font-bold hover:bg-surfaceHighlight transition-all">
                View Dashboard
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div 
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <div className="border-l-2 border-primary/30 pl-4">
                <div className="text-3xl font-bold text-textMain mb-1">12.4%</div>
                <div className="text-sm text-textMuted font-medium flex items-center gap-1"><TrendingUp size={14} className="text-primary"/> Avg ROI</div>
              </div>
              <div className="border-l-2 border-primary/30 pl-4">
                <div className="text-3xl font-bold text-textMain mb-1">45+</div>
                <div className="text-sm text-textMuted font-medium">Verified Farms</div>
              </div>
              <div className="border-l-2 border-primary/30 pl-4">
                <div className="text-3xl font-bold text-textMain mb-1">12k+</div>
                <div className="text-sm text-textMuted font-medium">Investors</div>
              </div>
              <div className="border-l-2 border-primary/30 pl-4 flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
                  <Cpu className="text-primary" size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold text-primary">AI Risk</div>
                  <div className="text-xs text-textMuted">Analysis</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
