import { CheckCircle2, Clock, TrendingUp, Pill, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import ApprovalChart from '@/components/ApprovalChart';
import DrugTable from '@/components/DrugTable';
import { recentApprovals, dateRange, cancerTypeStats } from '@/data/recentApprovals';

const Index = () => {
  // 최근 승인 데이터 기반 통계
  const recentCount = recentApprovals.length;
  const jan2026Count = recentApprovals.filter(
    (d) => d.approvalDate.startsWith('2026-01')
  ).length;
  const dec2025Count = recentApprovals.filter(
    (d) => d.approvalDate.startsWith('2025-12')
  ).length;

  // 가장 많은 암종
  const topCancerType = Object.entries(cancerTypeStats)
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* 기간 표시 배너 */}
        <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-semibold text-foreground">
                {dateRange.label} 항암제 승인 현황
              </h2>
              <p className="text-sm text-muted-foreground">
                기간: {dateRange.start} ~ {dateRange.end} | 공공데이터 API (data.go.kr) 기반
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="최근 2개월 승인"
            value={recentCount}
            description={`${dateRange.label} 승인 건수`}
            icon={Pill}
          />
          <StatCard
            title="2026년 1월 승인"
            value={jan2026Count}
            description="신규 승인 건수"
            icon={CheckCircle2}
            trend={{ value: Math.round((jan2026Count / (dec2025Count || 1) - 1) * 100), isPositive: jan2026Count >= dec2025Count }}
          />
          <StatCard
            title="2025년 12월 승인"
            value={dec2025Count}
            description="전월 승인 건수"
            icon={Clock}
          />
          <StatCard
            title="주요 암종"
            value={topCancerType ? topCancerType[0] : '-'}
            description={topCancerType ? `${topCancerType[1]}건 승인` : ''}
            icon={TrendingUp}
          />
        </div>

        {/* Chart and Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <ApprovalChart />
          </div>
          <div className="lg:col-span-2">
            <DrugTable />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>본 데이터는 식품의약품안전처 공개자료(공공데이터포털)를 기반으로 제작되었습니다.</p>
          <p className="mt-1">마지막 업데이트: 2026년 1월 28일</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
