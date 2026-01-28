import { CheckCircle2, Clock, TrendingUp, Pill } from 'lucide-react';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import ApprovalChart from '@/components/ApprovalChart';
import DrugTable from '@/components/DrugTable';
import { drugApprovals } from '@/data/drugData';

const Index = () => {
  const approvedCount = drugApprovals.filter((d) => d.status === 'approved').length;
  const pendingCount = drugApprovals.filter((d) => d.status === 'pending').length;
  const thisYearCount = drugApprovals.filter(
    (d) => d.approvalDate.startsWith('2024') && d.status === 'approved'
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="총 승인 항암제"
            value={approvedCount}
            description="누적 승인 건수"
            icon={Pill}
          />
          <StatCard
            title="2024년 신규 승인"
            value={thisYearCount}
            description="올해 승인 건수"
            icon={CheckCircle2}
            trend={{ value: 27, isPositive: true }}
          />
          <StatCard
            title="심사 진행중"
            value={pendingCount}
            description="현재 심사중인 품목"
            icon={Clock}
          />
          <StatCard
            title="승인률"
            value="94.2%"
            description="최근 3년 평균"
            icon={TrendingUp}
            trend={{ value: 2.1, isPositive: true }}
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
          <p>본 데이터는 식품의약품안전처 공개자료를 기반으로 제작되었습니다.</p>
          <p className="mt-1">마지막 업데이트: 2025년 1월</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
