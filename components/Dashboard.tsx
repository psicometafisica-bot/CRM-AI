import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Deal, DealStage } from '../types';
import { DollarSign, Briefcase, TrendingUp, CheckCircle } from 'lucide-react';

interface DashboardProps {
  deals: Deal[];
}

const Dashboard: React.FC<DashboardProps> = ({ deals }) => {
  const metrics = useMemo(() => {
    const totalRevenue = deals.reduce((acc, deal) => acc + (deal.stage === DealStage.CERRADO_GANADO ? deal.amount : 0), 0);
    const activeDeals = deals.filter(d => d.stage !== DealStage.CERRADO_GANADO && d.stage !== DealStage.CERRADO_PERDIDO).length;
    const wonDeals = deals.filter(d => d.stage === DealStage.CERRADO_GANADO).length;
    const totalClosed = deals.filter(d => d.stage === DealStage.CERRADO_GANADO || d.stage === DealStage.CERRADO_PERDIDO).length;
    const conversionRate = totalClosed > 0 ? Math.round((wonDeals / totalClosed) * 100) : 0;
    
    // Chart data: Revenue by Stage
    const chartData = Object.values(DealStage).map(stage => ({
      name: stage.replace('_', ' '),
      amount: deals.filter(d => d.stage === stage).reduce((acc, d) => acc + d.amount, 0)
    }));

    return { totalRevenue, activeDeals, conversionRate, chartData };
  }, [deals]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Ingresos Totales</p>
            <p className="text-2xl font-bold text-gray-800">${metrics.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Deals Activos</p>
            <p className="text-2xl font-bold text-gray-800">{metrics.activeDeals}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-full text-purple-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tasa de Conversión</p>
            <p className="text-2xl font-bold text-gray-800">{metrics.conversionRate}%</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-6">Valor del Pipeline por Etapa</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {metrics.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name.includes('GANADO') ? '#22c55e' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
