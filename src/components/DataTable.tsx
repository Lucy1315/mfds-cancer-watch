import { useState, useMemo } from 'react';
import { Search, FileText, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DrugApproval } from '@/data/drugData';
import { exportToExcel } from '@/utils/excelExport';

interface DataTableProps {
  data: DrugApproval[];
  title?: string;
  dateRange?: { start: string; end: string };
}

const StatusBadge = ({ status }: { status: DrugApproval['status'] }) => {
  const statusConfig = {
    approved: { label: '승인', className: 'status-approved' },
    pending: { label: '심사중', className: 'status-pending' },
    rejected: { label: '반려', className: 'status-rejected' },
  };

  const config = statusConfig[status];
  return <span className={config.className}>{config.label}</span>;
};

const DataTable = ({ data, title = '품목 상세 정보', dateRange }: DataTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((drug) =>
      drug.drugName.toLowerCase().includes(term) ||
      drug.genericName.toLowerCase().includes(term) ||
      drug.company.toLowerCase().includes(term) ||
      drug.indication.toLowerCase().includes(term) ||
      drug.cancerType.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const handleExport = () => {
    exportToExcel(filteredData, {
      filename: 'MFDS_항암제_승인현황',
      dateRange,
    });
  };

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <span className="text-sm text-muted-foreground ml-2">Total: {filteredData.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="테이블 내 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-[250px]"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Excel 다운로드
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6">
        <table className="data-table min-w-[1200px]">
          <thead>
            <tr>
              <th className="w-[60px]">No.</th>
              <th>업체명</th>
              <th>허가일</th>
              <th>제품명</th>
              <th>주성분</th>
              <th className="min-w-[300px]">적응증</th>
              <th>품목구분</th>
              <th>제조/수입</th>
              <th>암종</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-muted-foreground">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              filteredData.map((drug, index) => (
                <tr 
                  key={drug.id} 
                  className="animate-slide-in"
                  style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                >
                  <td className="text-center text-muted-foreground">{index + 1}</td>
                  <td className="font-medium">{drug.company}</td>
                  <td className="text-muted-foreground whitespace-nowrap">{drug.approvalDate}</td>
                  <td className="font-medium text-primary">
                    <a href="#" className="hover:underline">{drug.drugName}</a>
                  </td>
                  <td className="text-muted-foreground">{drug.genericName}</td>
                  <td className="text-sm" title={drug.indication}>
                    {drug.indication.length > 100 
                      ? `${drug.indication.substring(0, 100)}...` 
                      : drug.indication}
                  </td>
                  <td>
                    <span className="text-xs px-2 py-1 rounded bg-muted">전문의약품</span>
                  </td>
                  <td>
                    <span className={`text-xs px-2 py-1 rounded ${
                      drug.company.includes('한국') ? 'bg-accent/20 text-accent-foreground' : 'bg-secondary'
                    }`}>
                      {drug.company.includes('한국') ? '수입' : '제조'}
                    </span>
                  </td>
                  <td>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                      {drug.cancerType}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={drug.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
        총 {filteredData.length}개 품목
      </div>
    </div>
  );
};

export default DataTable;
