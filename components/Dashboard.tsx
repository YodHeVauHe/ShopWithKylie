import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { SalesData, CategoryData, Product } from '../types';

interface DashboardProps {
  salesData: SalesData[];
  categoryData: CategoryData[];
  products: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ salesData, categoryData, products }) => {
  // Calculate basic stats
  const totalStock = products.reduce((acc, curr) => acc + curr.stock, 0);
  const lowStockCount = products.filter(p => p.stock < 15 && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalRevenue = salesData.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Overview</h2>
        <p className="text-neutral-400 mt-1">Real-time store performance metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
        <StatCard title="Total Stock" value={totalStock} icon={<path d="M20 7h-4V4c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v3H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2zM9 4h6v3H9V4zm0 6h6v2H9v-2z" />} color="text-violet-400" bg="bg-violet-500/10" border="border-violet-500/20" />
        <StatCard title="Low Stock Items" value={lowStockCount} icon={<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
        <StatCard title="Out of Stock" value={outOfStockCount} icon={<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />} color="text-rose-400" bg="bg-rose-500/10" border="border-rose-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-6">Revenue Trajectory</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#737373', fontSize: 12}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#737373', fontSize: 12}} 
                />
                <CartesianGrid vertical={false} stroke="#262626" strokeDasharray="3 3" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderRadius: '12px', border: '1px solid #333', color: '#fff' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-6">Category Mix</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderRadius: '12px', border: '1px solid #333', color: '#fff' }} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-neutral-400 font-medium ml-2 text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Inventory Table - Added to fill space */}
      <div className="glass-panel rounded-3xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Recent Inventory Status</h3>
          <span className="text-xs text-neutral-500 font-medium px-3 py-1 bg-white/5 rounded-full border border-white/5">
            Real-time Snapshot
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Product</th>
                <th className="pb-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Category</th>
                <th className="pb-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Stock</th>
                <th className="pb-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Price</th>
                <th className="pb-4 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.slice(0, 5).map((product) => (
                <tr key={product.id} className="group hover:bg-white/[0.02]">
                  <td className="py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-neutral-800 border border-white/10 mr-3">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <span className="text-sm font-medium text-white">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-neutral-400">{product.category}</td>
                  <td className="py-4 text-sm font-mono text-neutral-300">{product.stock}</td>
                  <td className="py-4 text-sm font-mono text-neutral-300">${product.price.toFixed(2)}</td>
                  <td className="py-4 text-right">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                      product.stock === 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      product.stock < 15 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {product.stock === 0 ? 'Out of Stock' : product.stock < 15 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, bg, border }: { title: string, value: string | number, icon: React.ReactNode, color: string, bg: string, border: string }) => (
  <div className={`glass-panel p-6 rounded-3xl transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden group`}>
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150">
      <div className={`w-24 h-24 rounded-full ${bg.replace('/10', '/30')}`} />
    </div>
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-400 mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-white tracking-tight">{value}</h4>
      </div>
      <div className={`p-3 rounded-2xl ${bg} ${color} border ${border}`}>
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {icon}
        </svg>
      </div>
    </div>
  </div>
);

export default Dashboard;