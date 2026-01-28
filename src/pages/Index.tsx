import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { Download, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import FilterPanel, { FilterState } from '@/components/FilterPanel';
import UserGuide from '@/components/UserGuide';
import ChartGrid from '@/components/ChartGrid';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { recentApprovals, dateRange } from '@/data/recentApprovals';
import { cancerTypes, DrugApproval } from '@/data/drugData';
import { parseExcelFile } from '@/utils/excelParser';
import { exportToExcel } from '@/utils/excelExport';

const Index = () => {
  // 필터 상태
  const [filters, setFilters] = useState<FilterState>({
    startDate: new Date('2025-12-01'),
    endDate: new Date('2026-01-28'),
    cancerType: '전체',
    manufactureType: '전체',
    company: '전체',
  });

  // 업로드된 데이터
  const [uploadedData, setUploadedData] = useState<DrugApproval[] | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // 현재 데이터 소스
  const currentData = uploadedData || recentApprovals;

  // 회사 목록 추출
  const companies = useMemo(() => {
    const uniqueCompanies = [...new Set(currentData.map(d => d.company))];
    return uniqueCompanies.sort();
  }, [currentData]);

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    return currentData.filter((drug) => {
      // 날짜 필터
      if (filters.startDate || filters.endDate) {
        const drugDate = new Date(drug.approvalDate);
        if (filters.startDate && drugDate < filters.startDate) return false;
        if (filters.endDate && drugDate > filters.endDate) return false;
      }

      // 암종 필터
      if (filters.cancerType !== '전체' && drug.cancerType !== filters.cancerType) {
        return false;
      }

      // 제조/수입 필터
      if (filters.manufactureType !== '전체') {
        const isImported = drug.company.includes('한국') || drug.company.includes('Korea');
        if (filters.manufactureType === '수입' && !isImported) return false;
        if (filters.manufactureType === '제조' && isImported) return false;
      }

      // 업체 필터
      if (filters.company !== '전체' && drug.company !== filters.company) {
        return false;
      }

      return true;
    });
  }, [currentData, filters]);

  // 필터 초기화
  const handleReset = useCallback(() => {
    setFilters({
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-01-28'),
      cancerType: '전체',
      manufactureType: '전체',
      company: '전체',
    });
    setUploadedData(null);
    setUploadedFileName('');
  }, []);

  // 파일 업로드 처리
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const result = await parseExcelFile(file);
      setUploadedData(result.drugs);
      setUploadedFileName(result.fileName);
      
      // 날짜 범위 자동 설정
      if (result.drugs.length > 0) {
        const dates = result.drugs
          .map(d => d.approvalDate)
          .filter(d => d)
          .sort();
        if (dates.length > 0) {
          setFilters(prev => ({
            ...prev,
            startDate: new Date(dates[0]),
            endDate: new Date(dates[dates.length - 1]),
          }));
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
    }
  }, []);

  // 전체 다운로드
  const handleDownloadAll = () => {
    const currentDateRange = {
      start: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : dateRange.start,
      end: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : dateRange.end,
    };
    exportToExcel(filteredData, {
      filename: `MFDS_항암제_승인현황_${currentDateRange.start}_${currentDateRange.end}`,
      dateRange: currentDateRange,
    });
  };

  // 기간 표시
  const dateRangeLabel = useMemo(() => {
    if (filters.startDate && filters.endDate) {
      return `${format(filters.startDate, 'yy-MM-dd')} ~ ${format(filters.endDate, 'yy-MM-dd')}`;
    }
    return `${dateRange.start} ~ ${dateRange.end}`;
  }, [filters.startDate, filters.endDate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-6">
        {/* 헤더 영역 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">MFDS 항암제 승인현황 대시보드</h1>
              <p className="text-sm text-muted-foreground">
                {uploadedFileName 
                  ? `업로드: ${uploadedFileName} (${filteredData.length}건)`
                  : `기간: ${dateRangeLabel} | 공공데이터 API 기반`
                }
              </p>
            </div>
          </div>
          <Button onClick={handleDownloadAll} className="gap-2">
            <Download className="w-4 h-4" />
            전체 다운로드
          </Button>
        </div>

        {/* 필터 패널 */}
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onReset={handleReset}
          onFileUpload={handleFileUpload}
          cancerTypes={cancerTypes}
          companies={companies}
        />

        {/* 사용방법 안내 */}
        <UserGuide />

        {/* 차트 그리드 */}
        <ChartGrid data={filteredData} />

        {/* 데이터 테이블 */}
        <DataTable 
          data={filteredData} 
          dateRange={{
            start: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : dateRange.start,
            end: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : dateRange.end,
          }}
        />

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8 mt-8 border-t">
          <p>본 데이터는 식품의약품안전처 공개자료(공공데이터포털)를 기반으로 제작되었습니다.</p>
          <p className="mt-1">마지막 업데이트: 2026년 1월 28일</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
