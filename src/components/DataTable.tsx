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
      drug.cancerType.toLowerCase().includes(term) ||
      drug.id.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const handleExport = () => {
    exportToExcel(filteredData, {
      filename: 'MFDS_항암제_승인현황',
      dateRange,
    });
  };

  // 제조/수입 판별
  const getManufactureType = (company: string) => {
    return company.includes('한국') || company.includes('Korea') ? '수입' : '제조';
  };

  // 영문명 추출 (괄호 안 또는 성분명 기반)
  const getEnglishName = (drug: DrugApproval) => {
    // 괄호 안의 영문명 추출 시도
    const match = drug.drugName.match(/\(([^)]+)\)/);
    if (match) {
      const inParen = match[1];
      // 영문이 포함되어 있으면 반환
      if (/[a-zA-Z]/.test(inParen)) {
        return inParen;
      }
    }
    // 성분명이 영문이면 사용
    if (/[a-zA-Z]/.test(drug.genericName)) {
      return drug.genericName;
    }
    return '-';
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
        <table className="data-table min-w-[1400px]">
          <thead>
            <tr>
              <th className="w-[100px]">품목기준코드</th>
              <th>제품명</th>
              <th>제품영문명</th>
              <th>업체명</th>
              <th className="w-[100px]">허가일</th>
              <th>주성분</th>
              <th className="min-w-[250px]">적응증</th>
              <th className="w-[90px]">품목구분</th>
              <th className="w-[80px]">제조/수입</th>
              <th className="w-[80px]">암종</th>
              <th className="min-w-[150px]">비고</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-12 text-muted-foreground">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              filteredData.map((drug, index) => {
                const manufactureType = getManufactureType(drug.company);
                const englishName = getEnglishName(drug);
                
                return (
                  <tr 
                    key={drug.id} 
                    className="animate-slide-in"
                    style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                  >
                    <td className="text-primary font-medium">
                      <a 
                        href={`https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=${drug.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {drug.id}
                      </a>
                    </td>
                    <td className="font-medium">
                      <a href="#" className="text-primary hover:underline">{drug.drugName}</a>
                    </td>
                    <td className="text-muted-foreground text-sm">{englishName}</td>
                    <td>{drug.company}</td>
                    <td className="text-muted-foreground whitespace-nowrap">{drug.approvalDate}</td>
                    <td className="text-primary">{drug.genericName || '-'}</td>
                    <td className="text-sm" title={drug.indication}>
                      {drug.indication.length > 80 
                        ? `${drug.indication.substring(0, 80)}...` 
                        : drug.indication}
                    </td>
                    <td>
                      <span className="text-xs">전문의약품</span>
                    </td>
                    <td>
                      <span className={`text-xs ${manufactureType === '수입' ? 'text-primary' : ''}`}>
                        {manufactureType}
                      </span>
                    </td>
                    <td>
                      <span className="text-primary text-sm">
                        {drug.cancerType}
                      </span>
                    </td>
                    <td className="text-xs text-muted-foreground">
                      {drug.className || '-'}
                    </td>
                  </tr>
                );
              })
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
