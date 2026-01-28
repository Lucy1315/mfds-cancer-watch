import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { drugApprovals, cancerTypes, DrugApproval } from '@/data/drugData';

const StatusBadge = ({ status }: { status: DrugApproval['status'] }) => {
  const statusConfig = {
    approved: { label: '승인', className: 'status-approved' },
    pending: { label: '심사중', className: 'status-pending' },
    rejected: { label: '반려', className: 'status-rejected' },
  };

  const config = statusConfig[status];
  return <span className={config.className}>{config.label}</span>;
};

const DrugTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCancer, setSelectedCancer] = useState('전체');

  const filteredDrugs = useMemo(() => {
    return drugApprovals.filter((drug) => {
      const matchesSearch =
        drug.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCancer =
        selectedCancer === '전체' || drug.cancerType === selectedCancer;

      return matchesSearch && matchesCancer;
    });
  }, [searchTerm, selectedCancer]);

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground">항암제 승인 목록</h3>
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
            {filteredDrugs.map((drug, index) => (
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
            ))}
          </tbody>
        </table>
      </div>

      {filteredDrugs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          검색 결과가 없습니다.
        </div>
      )}

      <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
        총 {filteredDrugs.length}개 항목
      </div>
    </div>
  );
};

export default DrugTable;
