import { useNavigate } from 'react-router';
import { ArrowLeft, Truck, Package, MapPin, Clock } from 'lucide-react';

const deliveryStatus = [
  { status: 'On Time', count: 245, percentage: 82, color: 'bg-green-500' },
  { status: 'In Transit', count: 38, percentage: 13, color: 'bg-orange-500' },
  { status: 'Delayed', count: 12, percentage: 4, color: 'bg-red-500' },
  { status: 'Pending', count: 5, percentage: 1, color: 'bg-gray-500' },
];

const warehouses = [
  { name: 'Warehouse A', capacity: 95, location: 'Mumbai', stock: 2450 },
  { name: 'Warehouse B', capacity: 87, location: 'Delhi', stock: 1890 },
  { name: 'Warehouse C', capacity: 92, location: 'Bangalore', stock: 2150 },
  { name: 'Warehouse D', capacity: 78, location: 'Chennai', stock: 1620 },
];

export default function DistributionDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-400 px-6 pt-12 pb-8 rounded-b-3xl shadow-2xl">
        <button
          onClick={() => navigate('/variants')}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Variants</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Distribution</h1>
            <p className="text-orange-100 text-sm font-medium">Supply Chain & Logistics</p>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
            <div className="text-white/80 text-xs mb-1">Active Routes</div>
            <div className="text-white font-bold text-lg">38</div>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
            <div className="text-white/80 text-xs mb-1">Deliveries</div>
            <div className="text-white font-bold text-lg">300</div>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
            <div className="text-white/80 text-xs mb-1">On-Time %</div>
            <div className="text-white font-bold text-lg">82%</div>
          </div>
        </div>
      </div>

      {/* Delivery Status */}
      <div className="px-6 mt-6">
        <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          Delivery Status
        </h3>
        <div className="bg-white rounded-3xl p-5 shadow-xl border border-orange-100">
          <div className="space-y-4">
            {deliveryStatus.map((status, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                    <span className="text-sm font-medium text-gray-700">{status.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-orange-600">{status.count}</span>
                    <span className="text-xs text-gray-500 ml-2">({status.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-orange-50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${status.color} rounded-full transition-all`}
                    style={{ width: `${status.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warehouse Status */}
      <div className="px-6 mt-6">
        <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-600" />
          Warehouse Capacity
        </h3>
        <div className="space-y-3">
          {warehouses.map((warehouse, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 shadow-lg border border-orange-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-orange-900">{warehouse.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500">{warehouse.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">{warehouse.capacity}%</div>
                  <div className="text-xs text-gray-500">{warehouse.stock} units</div>
                </div>
              </div>
              <div className="w-full h-3 bg-orange-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all"
                  style={{ width: `${warehouse.capacity}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Route Optimization */}
      <div className="px-6 mt-6 mb-4">
        <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 rounded-3xl p-6 shadow-2xl">
          <h4 className="text-white font-bold text-lg mb-4">Route Optimization</h4>
          <div className="space-y-3">
            {['Route A → B → C', 'Route D → E → F', 'Route G → H → I'].map((route, idx) => (
              <div
                key={idx}
                className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 flex items-center justify-between"
              >
                <div>
                  <div className="text-white font-medium text-sm">{route}</div>
                  <div className="text-white/80 text-xs mt-1">Efficiency: {95 - idx * 3}%</div>
                </div>
                <Truck className="w-6 h-6 text-white" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
