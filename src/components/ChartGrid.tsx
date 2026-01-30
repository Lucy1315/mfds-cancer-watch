import { useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  BarChart, Bar
} from 'recharts';
import { DrugApproval } from '@/data/drugData';
import { ExtendedDrugApproval } from '@/data/recentApprovals';

interface ChartGridProps {
  data: (DrugApproval | ExtendedDrugApproval)[];
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
      .sort((a, b) => b.value - a.value);
  }, [data]);

  // 제조/수입 비율
  const manufactureData = useMemo(() => {
    let imported = 0;
    let manufactured = 0;
    data.forEach((drug) => {
      const ext = drug as ExtendedDrugApproval;
      if (ext.manufactureType === '수입') {
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
    const mechanisms: Record<string, number> = {};
    
    data.forEach((drug) => {
      const ext = drug as ExtendedDrugApproval;
      const notes = ext.notes || '';
      
      let mechanism = '기타';
      
      if (notes.includes('ADC')) {
        mechanism = 'ADC';
      } else if (notes.includes('안드로겐 수용체 억제제')) {
        mechanism = '안드로겐 수용체 억제제';
      } else if (notes.includes('SERD') || notes.includes('호르몬요법')) {
        mechanism = '호르몬요법';
      } else if (notes.includes('EGFR TKI')) {
        mechanism = 'EGFR TKI';
      } else if (notes.includes('FLT3 억제제')) {
        mechanism = 'FLT3 억제제';
      } else if (notes.includes('IDH 억제제')) {
        mechanism = 'IDH 억제제';
      } else if (notes.includes('표적항암제') || notes.includes('표적')) {
        mechanism = '표적치료제';
      } else if (notes.includes('면역')) {
        mechanism = '면역항암제';
      }
      
      mechanisms[mechanism] = (mechanisms[mechanism] || 0) + 1;
    });
    
    return Object.entries(mechanisms)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  // 허가유형별 분포
  const approvalTypeData = useMemo(() => {
    const counts: Record<string, number> = {
      '신약': 0,
      '희귀': 0,
      '제네릭': 0,
      '유전자재조합': 0,
      '자료제출': 0,
    };
    data.forEach((drug) => {
      const ext = drug as ExtendedDrugApproval;
      const type = ext.approvalType || '';
      
      if (type.includes('신약')) counts['신약']++;
      if (type.includes('희귀')) counts['희귀']++;
      if (type.includes('제네릭')) counts['제네릭']++;
      if (type.includes('유전자재조합')) counts['유전자재조합']++;
      if (type.includes('자료제출')) counts['자료제출']++;
    });
    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[100px_1fr_1fr_1fr_1fr] gap-4 mb-6">
      {/* 총 품목 수 카드 */}
      <div className="stat-card animate-fade-in flex flex-col justify-center items-center min-h-[200px]">
        <span className="text-4xl font-bold text-primary">{data.length}</span>
        <span className="text-sm text-muted-foreground mt-2">승인 건수</span>
      </div>

      {/* 암종별 분포 - 바 차트 */}
      <div className="stat-card animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded" />
          <h4 className="font-semibold text-foreground">암종별 분포</h4>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={cancerTypeData} margin={{ left: 0, right: 10 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={60} 
                tick={{ fontSize: 10 }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [`${value}건`, '']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {cancerTypeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 허가유형별 분포 - 바 차트 */}
      <div className="stat-card animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-orphan rounded" />
          <h4 className="font-semibold text-foreground">허가유형별 분포</h4>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={approvalTypeData} margin={{ left: 0, right: 10 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={70} 
                tick={{ fontSize: 10 }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [`${value}건`, '']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {approvalTypeData.map((entry, index) => {
                  const colorMap: Record<string, string> = {
                    '신약': 'hsl(220, 70%, 55%)',
                    '희귀': 'hsl(280, 65%, 50%)',
                    '제네릭': 'hsl(150, 60%, 45%)',
                    '유전자재조합': 'hsl(180, 60%, 45%)',
                    '자료제출': 'hsl(45, 80%, 50%)',
                  };
                  return <Cell key={`cell-${index}`} fill={colorMap[entry.name] || COLORS[index]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 제조/수입 비율 - 바 차트 */}
      <div className="stat-card animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-accent rounded" />
          <h4 className="font-semibold text-foreground">제조/수입 비율</h4>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={manufactureData} margin={{ left: 0, right: 10 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={40} 
                tick={{ fontSize: 10 }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [`${value}건`, '']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {manufactureData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 작용기전별 분포 - 바 차트 */}
      <div className="stat-card animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-secondary rounded" />
          <h4 className="font-semibold text-foreground">작용기전별 분포</h4>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={mechanismData} margin={{ left: 0, right: 10 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100} 
                tick={{ fontSize: 9 }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [`${value}건`, '']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {mechanismData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
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
