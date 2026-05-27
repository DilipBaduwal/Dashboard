import { Package } from 'lucide-react';

export default function StockistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E8EDF5] pb-12">
      <div className="bg-gradient-to-br from-[#0B1F4D] via-[#1F4E79] to-[#0B1F4D] px-6 pt-16 pb-12 rounded-b-[3rem] shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-white/20 mb-4 shadow-xl">
            <Package className="w-10 h-10 text-[#00C2FF]" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">Stockist</h1>
          <p className="text-[#00C2FF] text-sm font-medium">Stockist Management Dashboard</p>
        </div>
      </div>

      <div className="px-6 mt-8">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white shadow-lg">
          <p className="text-gray-700">This page will show Stockist management features. Placeholder content for now.</p>
        </div>
      </div>
    </div>
  );
}
