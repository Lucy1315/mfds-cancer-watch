import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { DrugApproval } from '@/data/drugData';

interface ChartGridProps {
  data: DrugApproval[];
}

const COLORS = [
  'hsl(220, 70%, 55%)',  // 블루
  'hsl(150, 60%, 45%)',  // 그린
  'hsl(45, 90%, 55%)',   // 옐로우
  'hsl(280, 60%, 55%)',  // 퍼플
  'hsl(0, 70%, 55%)',    // 레드
  'hsl(180, 50%, 45%)',  // 틸
];

const ChartGrid = ({ data }: ChartGridProps) => {
  // 암종별 분포
  const cancerTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((drug) => {
      counts[drug.cancerType] = (counts[drug.cancerType] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [data]);

  // 제조/수입 비율 (drugName에서 수입 여부 추정)
  const manufactureData = useMemo(() => {
    let imported = 0;
    let manufactured = 0;
    data.forEach((drug) => {
      // 회사명에서 추정
      if (drug.company.includes('한국') || drug.company.includes('Korea')) {
        imported++;
      } else {
        manufactured++;
      }
    });
    return [
      { name: '수입', value: imported },
      { name: '제조', value: manufactured },
    ].filter(d => d.value > 0);
  }, [data]);

  // 작용기전별 분포
  const mechanismData = useMemo(() => {
    const mechanisms: Record<string, number> = {
      '면역항암제': 0,
      '표적치료제': 0,
      '호르몬요법': 0,
      '기타': 0,
    };
    data.forEach((drug) => {
      const name = drug.drugName.toLowerCase() + drug.genericName.toLowerCase();
      if (name.includes('mab') || name.includes('주맙') || name.includes('리주맙')) {
        mechanisms['면역항암제']++;
      } else if (name.includes('nib') || name.includes('티닙') || name.includes('니브')) {
        mechanisms['표적치료제']++;
      } else if (name.includes('타미드') || name.includes('루타미드')) {
        mechanisms['호르몬요법']++;
      } else {
        mechanisms['기타']++;
      }
    });
    return Object.entries(mechanisms)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  // 업체별 품목 수
  const companyData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((drug) => {
      counts[drug.company] = (counts[drug.company] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: name.replace('(주)', '').replace('주식회사', ''), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [data]);

  const renderCustomLabel = ({ name, value }: { name: string; value: number }) => {
    return `${name} (${value})`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 암종별 분포 - 바 차트 */}
      <div className="stat-card animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded" />
          <h4 className="font-semibold text-foreground">암종별 분포</h4>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cancerTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}건`, '승인 건수']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {cancerTypeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">상위 암종 현황</p>
      </div>

      {/* 제조/수입 비율 - 도넛 차트 */}
      <div className="stat-card animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-accent rounded" />
          <h4 className="font-semibold text-foreground">제조/수입 비율</h4>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={manufactureData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {manufactureData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}건`, '']}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 작용기전별 분포 - 도넛 차트 */}
      <div className="stat-card animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-secondary rounded" />
          <h4 className="font-semibold text-foreground">작용기전별 분포</h4>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mechanismData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {mechanismData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}건`, '']}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 업체별 품목 수 - 가로 바 차트 */}
      <div className="stat-card animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-destructive rounded" />
          <h4 className="font-semibold text-foreground">업체별 품목 수</h4>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={companyData} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}건`, '']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {companyData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="hsl(0, 70%, 55%)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartGrid;
