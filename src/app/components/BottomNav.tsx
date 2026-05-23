import { LayoutGrid } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show bottom nav on variants page
  if (location.pathname === '/variants') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl z-50">
      <div className="max-w-md mx-auto px-6 py-3">
        <button
          onClick={() => navigate('/variants')}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-[#1F4E79] to-[#00C2FF] rounded-2xl text-white font-medium hover:shadow-lg transition-all active:scale-95"
        >
          <LayoutGrid className="w-5 h-5" />
          <span>Switch Dashboard</span>
        </button>
      </div>
    </div>
  );
}
