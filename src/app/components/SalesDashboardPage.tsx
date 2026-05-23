import { useNavigate } from 'react-router';
import { ArrowLeft, DollarSign, TrendingUp, Users, Package } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const revenueData = [
  { id: 'r1', month: 'Oct', revenue: 45000 },
  { id: 'r2', month: 'Nov', revenue: 52000 },
  { id: 'r3', month: 'Dec', revenue: 61000 },
  { id: 'r4', month: 'Jan', revenue: 58000 },
  { id: 'r5', month: 'Feb', revenue: 67000 },
  { id: 'r6', month: 'Mar', revenue: 75000 },
];

const products = [
  { name: 'Product A', sales: 12500, growth: '+18%' },
  { name: 'Product B', sales: 9800, growth: '+12%' },
  { name: 'Product C', sales: 8200, growth: '+25%' },
  { name: 'Product D', sales: 7600, growth: '+8%' },
];

export default function SalesDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-green-500 to-teal-400 px-6 pt-12 pb-8 rounded-b-3xl shadow-2xl">
        <button
          onClick={() => navigate('/variants')}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Variants</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Sales Dashboard</h1>
            <p className="text-emerald-100 text-sm font-medium">Revenue & Performance Tracking</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
            <div className="text-white/80 text-xs mb-1">Total Revenue</div>
            <div className="text-white font-bold text-lg">₹75K</div>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
            <div className="text-white/80 text-xs mb-1">Growth</div>
            <div className="text-white font-bold text-lg">+22%</div>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
            <div className="text-white/80 text-xs mb-1">Orders</div>
            <div className="text-white font-bold text-lg">1,248</div>
          </div>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="px-6 mt-6">
        <div className="bg-white rounded-3xl p-5 shadow-xl border border-green-100">
          <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #d1fae5',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Performance */}
      <div className="px-6 mt-6">
        <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-green-600" />
          Top Products
        </h3>
        <div className="space-y-3">
          {products.map((product, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 shadow-lg border border-green-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-green-900">{product.name}</h4>
                  <span className="text-green-600 text-sm font-medium">{product.growth}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">₹{product.sales.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">sales</div>
                </div>
              </div>
              <div className="w-full h-2 bg-green-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-teal-400 rounded-full"
                  style={{ width: `${(product.sales / 12500) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Territory Performance */}
      <div className="px-6 mt-6 mb-4">
        <div className="bg-gradient-to-r from-green-600 to-teal-500 rounded-3xl p-6 shadow-2xl">
          <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Territory Performance
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {['North', 'South', 'East', 'West'].map((territory, idx) => (
              <div key={idx} className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                <div className="text-white/80 text-xs mb-1">{territory}</div>
                <div className="text-white font-bold text-xl">₹{(18000 + idx * 3000).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
