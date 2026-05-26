import { useNavigate } from 'react-router';
import { TrendingUp, BarChart3, DollarSign, Truck, Wallet, ArrowRight } from 'lucide-react';

interface Variant {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  path: string;
}

const variants: Variant[] = [
  {
    id: 'mdp',
    name: 'MDP',
    description: 'Market Development Performance Dashboard',
    icon: TrendingUp,
    gradient: 'from-[#0B1F4D] via-[#1F4E79] to-[#00C2FF]',
    path: '/mdp',
  },
  {
    id: 'Rise',
    name: 'Rise',
    description: 'Rise Dashboard',
    icon: BarChart3,
    gradient: 'from-purple-600 via-purple-500 to-cyan-500',
    path: '/kpi-dashboard',
  },
  {
    id: 'Rise summary',
    name: 'Rise-SC',
    description: 'Section and circle Level dashboard',
    icon: TrendingUp,
    gradient: 'from-emerald-600 via-green-500 to-teal-400',
    path: '/sales-dashboard',
  },
  {
    id: 'distribution',
    name: 'DS Productivity',
    description: 'DS Productivity Dashboard',
    icon: Truck,
    gradient: 'from-orange-600 via-amber-500 to-yellow-400',
    path: '/distribution-dashboard',
  },
  {
    id: 'finance',
    name: 'Market Coverage',
    description: 'Market Coverage Dashboard',
    icon: Wallet,
    gradient: 'from-slate-900 via-slate-700 to-blue-900',
    path: '/finance-dashboard',
  },
];

export default function VariantsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E8EDF5] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0B1F4D] via-[#1F4E79] to-[#0B1F4D] px-6 pt-16 pb-12 rounded-b-[3rem] shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-white/20 mb-4 shadow-xl">
            <BarChart3 className="w-10 h-10 text-[#00C2FF]" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard Suite</h1>
          <p className="text-[#00C2FF] text-sm font-medium">Choose Dashboard Variant</p>
        </div>
      </div>

      {/* Variant Cards */}
      <div className="px-6 mt-8 space-y-4">
        {variants.map((variant) => {
          const Icon = variant.icon;
          return (
            <div
              key={variant.id}
              onClick={() => navigate(variant.path)}
              className={`relative bg-gradient-to-r ${variant.gradient} rounded-3xl p-6 shadow-2xl cursor-pointer hover:scale-[1.02] transition-all overflow-hidden group`}
            >
              {/* Background decorations */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 group-hover:scale-110 transition-transform"></div>

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-2xl mb-1">{variant.name}</h3>
                    <p className="text-white/90 text-sm font-medium leading-relaxed">
                      {variant.description}
                    </p>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="px-6 mt-8">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white shadow-lg">
          <p className="text-center text-sm text-gray-600">
            Select a dashboard variant to view performance metrics and analytics
          </p>
        </div>
      </div>
    </div>
  );
}
