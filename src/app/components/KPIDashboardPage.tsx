import { useNavigate } from 'react-router';
import { ArrowLeft, Target, TrendingUp, Activity, Zap } from 'lucide-react';

const kpiCards = [
  { label: 'Revenue Growth', value: '32.5%', status: 'Excellent', color: 'from-purple-500 to-cyan-500' },
  { label: 'Customer Satisfaction', value: '94', status: 'Good', color: 'from-cyan-500 to-blue-500' },
  { label: 'Market Share', value: '28%', status: 'Excellent', color: 'from-purple-600 to-fuchsia-500' },
  { label: 'Net Promoter Score', value: '78', status: 'Good', color: 'from-indigo-500 to-purple-500' },
];

const departments = [
  { name: 'Sales', score: 92, progress: 92 },
  { name: 'Marketing', score: 87, progress: 87 },
  { name: 'Operations', score: 95, progress: 95 },
  { name: 'Customer Service', score: 89, progress: 89 },
  { name: 'Product', score: 91, progress: 91 },
];

export default function KPIDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-cyan-500 px-6 pt-12 pb-8 rounded-b-3xl shadow-2xl">
        <button
          onClick={() => navigate('/variants')}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Variants</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">KPI Dashboard</h1>
            <p className="text-purple-100 text-sm font-medium">Real-time Performance Indicators</p>
          </div>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="px-6 mt-6 grid grid-cols-2 gap-4">
        {kpiCards.map((kpi, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-5 shadow-xl relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="text-white/80 text-xs font-medium mb-2">{kpi.label}</div>
              <div className="text-white font-bold text-3xl mb-1">{kpi.value}</div>
              <div className="text-white/90 text-xs font-medium">{kpi.status}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Score */}
      <div className="px-6 mt-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-cyan-500" />
              Overall Score
            </h3>
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
              91
            </div>
          </div>
          <div className="w-full h-4 bg-purple-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all"
              style={{ width: '91%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Department Scores */}
      <div className="px-6 mt-6">
        <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Department Performance
        </h3>
        <div className="space-y-3">
          {departments.map((dept, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-purple-900">{dept.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-purple-600">{dept.score}</span>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="w-full h-3 bg-purple-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all"
                  style={{ width: `${dept.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Style Widget */}
      <div className="px-6 mt-6 mb-4">
        <div className="bg-gradient-to-r from-purple-900 via-purple-700 to-cyan-700 rounded-3xl p-6 shadow-2xl">
          <h4 className="text-white font-bold text-lg mb-4">Monthly Performance Heatmap</h4>
          <div className="grid grid-cols-4 gap-2">
            {[95, 88, 92, 87, 90, 93, 89, 94, 91, 88, 92, 96].map((val, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-xl flex items-center justify-center ${
                  val >= 90
                    ? 'bg-cyan-400'
                    : val >= 85
                    ? 'bg-purple-400'
                    : 'bg-purple-300'
                }`}
              >
                <span className="text-white font-bold text-sm">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
