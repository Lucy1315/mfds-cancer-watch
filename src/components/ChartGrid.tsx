import { useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
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
  // 암종별 분포 (파이 차트용)
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
    const mechanisms: Record<string, number> = {
      '면역항암제': 0,
      '표적치료제': 0,
      'ADC': 0,
      '호르몬요법': 0,
      '기타': 0,
    };
    data.forEach((drug) => {
      const ext = drug as ExtendedDrugApproval;
      const notes = ext.notes?.toLowerCase() || '';
      const name = drug.drugName.toLowerCase() + drug.genericName.toLowerCase();
      
      if (notes.includes('adc') || name.includes('탄신') || name.includes('마포도틴') || name.includes('소라브탄신')) {
        mechanisms['ADC']++;
      } else if (name.includes('mab') || name.includes('주맙') || name.includes('리주맙') || notes.includes('면역')) {
        mechanisms['면역항암제']++;
      } else if (name.includes('nib') || name.includes('티닙') || name.includes('니브') || notes.includes('표적') || notes.includes('억제제')) {
        mechanisms['표적치료제']++;
      } else if (name.includes('타미드') || name.includes('루타미드') || notes.includes('호르몬') || notes.includes('serd')) {
        mechanisms['호르몬요법']++;
      } else {
        mechanisms['기타']++;
      }
    });
    return Object.entries(mechanisms)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  // 허가유형별 분포 (신약, 희귀, 제네릭, 유전자재조합 및 세포배양의약품, 자료제출의약품)
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
      
      // 각 키워드를 개별적으로 체크
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* 총 품목 수 카드 */}
      <div className="stat-card animate-fade-in flex flex-col justify-center items-center">
        <span className="text-4xl font-bold text-primary">{data.length}</span>
        <span className="text-sm text-muted-foreground mt-2">총 품목 수</span>
      </div>

      {/* 암종별 분포 - 파이 차트 */}
      <div className="stat-card animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded" />
          <h4 className="font-semibold text-foreground">암종별 분포</h4>
        </div>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={cancerTypeData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
              >
                {cancerTypeData.map((_, index) => (
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
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* 3x3 그리드 범례 */}
        <div className="grid grid-cols-3 gap-1 mt-2">
          {cancerTypeData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-[10px] text-muted-foreground truncate">
                {item.name}({item.value})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 허가유형별 분포 - 도넛 차트 */}
      <div className="stat-card animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-orphan rounded" />
          <h4 className="font-semibold text-foreground">허가유형별 분포</h4>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={approvalTypeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
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
                formatter={(value) => {
                  const item = approvalTypeData.find(d => d.name === value);
                  return <span className="text-xs">{value}({item?.value || 0}건)</span>;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
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
                formatter={(value) => {
                  const item = manufactureData.find(d => d.name === value);
                  return <span className="text-xs">{value}({item?.value || 0}건)</span>;
                }}
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
                formatter={(value) => {
                  const item = mechanismData.find(d => d.name === value);
                  return <span className="text-xs">{value}({item?.value || 0}건)</span>;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartGrid;
