import { useNavigate } from 'react-router';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const cashflowData = [
  { id: 'c1', month: 'Oct', income: 85000, expense: 62000 },
  { id: 'c2', month: 'Nov', income: 92000, expense: 65000 },
  { id: 'c3', month: 'Dec', income: 98000, expense: 68000 },
  { id: 'c4', month: 'Jan', income: 88000, expense: 64000 },
  { id: 'c5', month: 'Feb', income: 105000, expense: 72000 },
  { id: 'c6', month: 'Mar', income: 112000, expense: 75000 },
];

const budgetCategories = [
  { category: 'Operations', allocated: 45000, spent: 42500, percentage: 94 },
  { category: 'Marketing', allocated: 30000, spent: 28000, percentage: 93 },
  { category: 'R&D', allocated: 25000, spent: 22000, percentage: 88 },
  { category: 'HR', allocated: 20000, spent: 19500, percentage: 97 },
];

export default function FinanceDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-700 to-blue-900 px-6 pt-12 pb-8 border-b border-white/10">
        <button
          onClick={() => navigate('/variants')}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Variants</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 backdrop-blur-sm border-2 border-cyan-500/30 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Finance</h1>
            <p className="text-cyan-400 text-sm font-medium">Financial Performance & Budget</p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <div className="text-white/60 text-xs">Total Revenue</div>
            </div>
            <div className="text-white font-bold text-xl">₹5.8M</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <div className="text-white/60 text-xs">Total Expenses</div>
            </div>
            <div className="text-white font-bold text-xl">₹4.1M</div>
          </div>
          <div className="bg-cyan-500/20 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/30 col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <div className="text-white/80 text-xs">Net Profit</div>
            </div>
            <div className="text-white font-bold text-2xl">₹1.7M</div>
            <div className="text-green-400 text-xs font-medium mt-1">+29.3% vs last quarter</div>
          </div>
        </div>
      </div>

      {/* Cash Flow */}
      <div className="px-6 mt-6">
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Cash Flow Analysis</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cashflowData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: 'white',
                }}
              />
              <Area type="monotone" dataKey="income" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} isAnimationActive={false} />
              <Area type="monotone" dataKey="expense" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Tracking */}
      <div className="px-6 mt-6">
        <h3 className="text-lg font-bold text-white mb-4">Budget vs Actual</h3>
        <div className="space-y-3">
          {budgetCategories.map((budget, idx) => (
            <div
              key={idx}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white">{budget.category}</h4>
                  <div className="text-white/60 text-xs mt-1">
                    ₹{budget.spent.toLocaleString()} / ₹{budget.allocated.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">{budget.percentage}%</div>
                  <div className="text-xs text-white/60">utilized</div>
                </div>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                  style={{ width: `${budget.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast */}
      <div className="px-6 mt-6 mb-4">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl p-6 shadow-2xl border border-cyan-500/30">
          <h4 className="text-white font-bold text-lg mb-4">Q4 Forecast</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="text-white/80 text-xs mb-1">Projected Revenue</div>
              <div className="text-white font-bold text-xl">₹6.2M</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="text-white/80 text-xs mb-1">Projected Profit</div>
              <div className="text-white font-bold text-xl">₹1.9M</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
