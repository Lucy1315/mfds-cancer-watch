import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, RefreshCw, Database } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { drugApprovals, cancerTypes, DrugApproval } from '@/data/drugData';
import { useDrugData } from '@/hooks/useDrugData';
import { cn } from '@/lib/utils';

const StatusBadge = ({ status }: { status: DrugApproval['status'] }) => {
  const statusConfig = {
    approved: { label: '승인', className: 'status-approved' },
    pending: { label: '심사중', className: 'status-pending' },
    rejected: { label: '반려', className: 'status-rejected' },
  };

  const config = statusConfig[status];
  return <span className={config.className}>{config.label}</span>;
};

interface DrugTableProps {
  showApiButton?: boolean;
}

const DrugTable = ({ showApiButton = true }: DrugTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCancer, setSelectedCancer] = useState('전체');
  const [useApiData, setUseApiData] = useState(false);
  
  const { isLoading, apiDrugs, hasLoadedOnce, fetchDrugs } = useDrugData();

  // 사용할 데이터 소스 결정
  const dataSource = useApiData && hasLoadedOnce ? apiDrugs : drugApprovals;

  const filteredDrugs = useMemo(() => {
    return dataSource.filter((drug) => {
      const matchesSearch =
        drug.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCancer =
        selectedCancer === '전체' || drug.cancerType === selectedCancer;

      return matchesSearch && matchesCancer;
    });
  }, [searchTerm, selectedCancer, dataSource]);

  const handleLoadApiData = async () => {
    const result = await fetchDrugs();
    if (result?.success) {
      setUseApiData(true);
    }
  };

  const handleToggleDataSource = () => {
    if (!useApiData && !hasLoadedOnce) {
      handleLoadApiData();
    } else {
      setUseApiData(!useApiData);
    }
  };

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">항암제 승인 목록</h3>
          {showApiButton && (
            <Button
              variant={useApiData ? "default" : "outline"}
              size="sm"
              onClick={handleToggleDataSource}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              {useApiData ? '공공데이터' : '샘플데이터'}
            </Button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="약품명, 성분명, 제조사 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-[280px]"
            />
          </div>
          <Select value={selectedCancer} onValueChange={setSelectedCancer}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cancerTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 데이터 소스 표시 */}
      <div className="mb-4 p-3 rounded-lg bg-muted/50 text-sm">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            useApiData ? "bg-primary" : "bg-accent"
          )} />
          <span className="text-muted-foreground">
            {useApiData 
              ? '공공데이터 API (data.go.kr) - 식약처 의약품 제품 허가정보' 
              : '샘플 데이터 - 공공데이터 API 연동 버튼을 클릭하세요'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6">
        <table className="data-table min-w-[800px]">
          <thead>
            <tr>
              <th>약품명</th>
              <th>성분명</th>
              <th>제조/수입사</th>
              <th>적응증</th>
              <th>암종</th>
              <th>승인일</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    공공데이터 API에서 데이터를 가져오는 중...
                  </div>
                </td>
              </tr>
            ) : (
              filteredDrugs.map((drug, index) => (
                <tr 
                  key={drug.id} 
                  className="animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="font-medium text-foreground">{drug.drugName}</td>
                  <td className="text-muted-foreground">{drug.genericName}</td>
                  <td>{drug.company}</td>
                  <td className="max-w-[200px] truncate" title={drug.indication}>
                    {drug.indication}
                  </td>
                  <td>
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-medium">
                      {drug.cancerType}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{drug.approvalDate}</td>
                  <td>
                    <StatusBadge status={drug.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && filteredDrugs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          검색 결과가 없습니다.
        </div>
      )}

      <div className="mt-4 pt-4 border-t text-sm text-muted-foreground flex items-center justify-between">
        <span>총 {filteredDrugs.length}개 항목</span>
        {useApiData && hasLoadedOnce && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchDrugs(searchTerm)}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            새로고침
          </Button>
        )}
      </div>
    </div>
  );
};

export default DrugTable;
