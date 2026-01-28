import * as XLSX from 'xlsx';
import { DrugApproval } from '@/data/drugData';

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export function exportToExcel(
  drugs: DrugApproval[],
  options: ExportOptions = {}
): void {
  const {
    filename = 'MFDS_항암제_승인현황',
    sheetName = '승인현황',
    dateRange,
  } = options;

  // 데이터 변환
  const excelData = drugs.map((drug, index) => ({
    '순번': index + 1,
    '제품명': drug.drugName,
    '성분명': drug.genericName,
    '제조/수입사': drug.company,
    '적응증': drug.indication,
    '암종': drug.cancerType,
    '승인일': drug.approvalDate,
    '상태': drug.status === 'approved' ? '승인' : drug.status === 'pending' ? '심사중' : '반려',
  }));

  // 워크시트 생성
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // 컬럼 너비 설정
  const columnWidths = [
    { wch: 6 },   // 순번
    { wch: 40 },  // 제품명
    { wch: 20 },  // 성분명
    { wch: 25 },  // 제조/수입사
    { wch: 35 },  // 적응증
    { wch: 10 },  // 암종
    { wch: 12 },  // 승인일
    { wch: 8 },   // 상태
  ];
  worksheet['!cols'] = columnWidths;

  // 워크북 생성
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 요약 시트 추가
  const summaryData = createSummaryData(drugs, dateRange);
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, '요약');

  // 파일 생성일 포함한 파일명
  const dateStr = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${dateStr}.xlsx`;

  // 다운로드
  XLSX.writeFile(workbook, fullFilename);
}

function createSummaryData(
  drugs: DrugApproval[],
  dateRange?: { start: string; end: string }
): Record<string, string | number>[] {
  // 암종별 집계
  const cancerTypeCounts = drugs.reduce((acc, drug) => {
    acc[drug.cancerType] = (acc[drug.cancerType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const summaryRows: Record<string, string | number>[] = [
    { '항목': '데이터 기준', '값': dateRange ? `${dateRange.start} ~ ${dateRange.end}` : '전체' },
    { '항목': '생성일시', '값': new Date().toLocaleString('ko-KR') },
    { '항목': '', '값': '' },
    { '항목': '총 승인 건수', '값': drugs.length },
    { '항목': '', '값': '' },
    { '항목': '=== 암종별 현황 ===', '값': '' },
  ];

  Object.entries(cancerTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      summaryRows.push({ '항목': type, '값': count });
    });

  // 제조사별 집계
  const companyCounts = drugs.reduce((acc, drug) => {
    acc[drug.company] = (acc[drug.company] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  summaryRows.push({ '항목': '', '값': '' });
  summaryRows.push({ '항목': '=== 제조사별 현황 ===', '값': '' });

  Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([company, count]) => {
      summaryRows.push({ '항목': company, '값': count });
    });

  return summaryRows;
}
