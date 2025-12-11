import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { Product } from '../types';
import { TrendingUp, Package, AlertTriangle, XCircle, DollarSign, ShoppingCart, Users, Activity, Percent } from 'lucide-react';

interface DashboardProps {
  products: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ products }) => {
  // Generate real data from products
  const dashboardData = useMemo(() => {
    // Calculate basic stats
    const totalStock = products.reduce((acc, curr) => acc + curr.stock, 0);
    const lowStockCount = products.filter(p => p.stock < 15 && p.stock > 0).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const totalProducts = products.length;
    const totalValue = products.reduce((acc, curr) => {
      const discountedPrice = curr.discount ? curr.price * (1 - curr.discount / 100) : curr.price;
      return acc + (discountedPrice * curr.stock);
    }, 0);
    const avgPrice = products.length > 0 ? products.reduce((acc, curr) => acc + curr.price, 0) / products.length : 0;
    const discountedCount = products.filter(p => p.discount && p.discount > 0).length;

    // Generate category distribution from real products
    const categoryCounts = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(categoryCounts).map(([name, value], index) => ({
      name,
      value,
      color: ['#4f46e5', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 6]
    }));

    // Generate simulated weekly sales data based on products
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const salesData = days.map(day => {
      const baseSales = Math.floor(totalProducts * (0.5 + Math.random() * 0.5));
      const baseRevenue = baseSales * avgPrice * (0.8 + Math.random() * 0.4);
      return {
        name: day,
        sales: baseSales,
        revenue: Math.floor(baseRevenue)
      };
    });

    // Stock level distribution
    const stockLevels = [
      { name: 'In Stock', value: products.filter(p => p.stock >= 15).length, color: '#10b981' },
      { name: 'Low Stock', value: lowStockCount, color: '#f59e0b' },
      { name: 'Out of Stock', value: outOfStockCount, color: '#ef4444' }
    ];

    // Price distribution
    const priceRanges = [
      { name: '< 50K', count: products.filter(p => p.price < 50000).length },
      { name: '50K-100K', count: products.filter(p => p.price >= 50000 && p.price < 100000).length },
      { name: '100K-200K', count: products.filter(p => p.price >= 100000 && p.price < 200000).length },
      { name: '> 200K', count: products.filter(p => p.price >= 200000).length }
    ];

    return {
      totalStock,
      lowStockCount,
      outOfStockCount,
      totalProducts,
      totalValue,
      avgPrice,
      discountedCount,
      categoryData,
      salesData,
      stockLevels,
      priceRanges
    };
  }, [products]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Overview</h2>
        <p className="text-neutral-400 mt-1">Real-time store performance metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Products"
          value={dashboardData.totalProducts}
          icon={<Package className="w-5 h-5" />}
          color="text-violet-400"
          bg="bg-violet-500/10"
          border="border-violet-500/20"
          subtitle="Active items"
        />
        <MetricCard
          title="Total Value"
          value={`UGX ${dashboardData.totalValue.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
          border="border-emerald-500/20"
          subtitle="Inventory value"
        />
        <MetricCard
          title="Low Stock Alert"
          value={dashboardData.lowStockCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="text-amber-400"
          bg="bg-amber-500/10"
          border="border-amber-500/20"
          subtitle="Needs restock"
        />
        <MetricCard
          title="Discounted Products"
          value={dashboardData.discountedCount}
          icon={<Percent className="w-5 h-5" />}
          color="text-cyan-400"
          bg="bg-cyan-500/10"
          border="border-cyan-500/20"
          subtitle="On sale"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-6">Weekly Sales Performance</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={dashboardData.salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#737373', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#737373', fontSize: 12 }}
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
          <h3 className="text-lg font-bold text-white mb-6">Product Categories</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={dashboardData.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {dashboardData.categoryData.map((entry, index) => (
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

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Levels */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-6">Stock Status Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={dashboardData.stockLevels}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {dashboardData.stockLevels.map((entry, index) => (
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

        {/* Price Distribution */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-6">Price Range Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={dashboardData.priceRanges} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#737373', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#737373', fontSize: 11 }}
                />
                <CartesianGrid vertical={false} stroke="#262626" strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171717', borderRadius: '12px', border: '1px solid #333', color: '#fff' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, color, bg, border, subtitle }: {
  title: string,
  value: string | number,
  icon: React.ReactNode,
  color: string,
  bg: string,
  border: string,
  subtitle?: string
}) => (
  <div className={`glass-panel p-6 rounded-3xl transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden group`}>
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150">
      <div className={`w-24 h-24 rounded-full ${bg.replace('/10', '/30')}`} />
    </div>
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-400 mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-white tracking-tight">{value}</h4>
        {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-2xl ${bg} ${color} border ${border}`}>
        {icon}
      </div>
    </div>
  </div>
);

export default Dashboard;