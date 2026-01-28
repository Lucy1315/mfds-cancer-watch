import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { yearlyStats } from '@/data/drugData';

const ApprovalChart = () => {
  return (
    <div className="stat-card animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-6">연도별 항암제 승인 추이</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={yearlyStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="year" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
              formatter={(value: number) => [`${value}건`, '승인 건수']}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {yearlyStats.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === yearlyStats.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--accent))'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ApprovalChart;
