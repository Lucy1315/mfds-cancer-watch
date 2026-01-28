import * as XLSX from 'xlsx';
import { DrugApproval } from '@/data/drugData';
import { ExtendedDrugApproval } from '@/data/recentApprovals';

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export function exportToExcel(
  drugs: (DrugApproval | ExtendedDrugApproval)[],
  options: ExportOptions = {}
): void {
  const {
    filename = 'MFDS_항암제_승인현황',
    dateRange,
  } = options;

  // 워크북 생성
  const workbook = XLSX.utils.book_new();

  // ===== 시트 1: 요약 =====
  const summaryData = createSummarySheet(drugs, dateRange);
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // 요약 시트 컬럼 너비
  summarySheet['!cols'] = [
    { wch: 22 }, { wch: 30 }, { wch: 18 }, { wch: 12 }, { wch: 20 }, { wch: 55 }
  ];
  
  // 행 높이 설정 (가시성 향상)
  summarySheet['!rows'] = summaryData.map((_, index) => ({ hpt: index === 0 ? 35 : 28 }));
  
  // 요약 시트 스타일 적용
  applySummaryStyles(summarySheet, summaryData);
  
  XLSX.utils.book_append_sheet(workbook, summarySheet, '요약');

  // ===== 시트 2: 상세 목록 =====
  const detailData = createDetailSheet(drugs);
  const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
  
  // 상세 시트 컬럼 너비 (가시성 향상)
  detailSheet['!cols'] = [
    { wch: 14 },  // 품목기준코드
    { wch: 35 },  // 제품명
    { wch: 18 },  // 업체명
    { wch: 12 },  // 허가일
    { wch: 38 },  // 주성분
    { wch: 65 },  // 적응증
    { wch: 14 },  // 암종
    { wch: 11 },  // 전문일반
    { wch: 11 },  // 허가유형
    { wch: 10 },  // 제조/수입
    { wch: 20 },  // 제조국
    { wch: 58 },  // 위탁제조업체
    { wch: 25 },  // 비고
  ];
  
  // 행 높이 설정 (헤더 35, 데이터 32)
  detailSheet['!rows'] = detailData.map((_, index) => ({ hpt: index === 0 ? 35 : 32 }));
  
  // 전체 셀에 스타일 적용 (텍스트 줄바꿈, 테두리)
  applyStyles(detailSheet, detailData);
  
  XLSX.utils.book_append_sheet(workbook, detailSheet, '상세목록');

  // 파일 생성일 포함한 파일명
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const fullFilename = `${filename}_${dateStr}.xlsx`;

  // 다운로드
  XLSX.writeFile(workbook, fullFilename);
}

function createSummarySheet(
  drugs: (DrugApproval | ExtendedDrugApproval)[],
  dateRange?: { start: string; end: string }
): (string | number)[][] {
  const title = dateRange 
    ? `${dateRange.start.substring(0, 7).replace('-', '년 ')}월 항암제 승인현황 요약`
    : '항암제 승인현황 요약';

  // 허가유형별 집계
  const approvalTypes: Record<string, number> = {};
  const manufactureTypes: Record<string, number> = { '수입': 0, '제조': 0 };
  
  drugs.forEach((drug) => {
    const ext = drug as ExtendedDrugApproval;
    const type = ext.approvalType || '기타';
    approvalTypes[type] = (approvalTypes[type] || 0) + 1;
    
    const mType = ext.manufactureType || (drug.company.includes('한국') ? '수입' : '제조');
    manufactureTypes[mType] = (manufactureTypes[mType] || 0) + 1;
  });

  const rows: (string | number)[][] = [
    [title, '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['승인 현황 통계', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['구분', '건수', '', '', '', ''],
    ['총 제품 수', drugs.length, '', '', '', ''],
  ];

  // 허가유형별 추가
  Object.entries(approvalTypes).forEach(([type, count]) => {
    rows.push([type, count, '', '', '', '']);
  });

  // 제조/수입 추가
  rows.push(['수입', manufactureTypes['수입'], '', '', '', '']);
  rows.push(['제조', manufactureTypes['제조'], '', '', '', '']);
  
  rows.push(['', '', '', '', '', '']);
  rows.push(['', '', '', '', '', '']);
  rows.push(['제품별 상세 목록', '', '', '', '', '']);
  rows.push(['', '', '', '', '', '']);
  rows.push(['품목기준코드', '제품명', '업체명', '허가유형', '제조국', '위탁제조업체']);

  // 제품 목록
  drugs.forEach((drug) => {
    const ext = drug as ExtendedDrugApproval;
    rows.push([
      drug.id,
      drug.drugName,
      drug.company,
      ext.approvalType || '-',
      ext.manufacturingCountry || '-',
      ext.consignedManufacturer || '',
    ]);
  });

  return rows;
}

function createDetailSheet(
  drugs: (DrugApproval | ExtendedDrugApproval)[]
): (string | number)[][] {
  const headers = [
    '품목기준코드', '제품명', '업체명', '허가일', '주성분', 
    '적응증', '암종', '전문일반', '허가유형', '제조/수입', 
    '제조국', '위탁제조업체', '비고'
  ];

  const rows: (string | number)[][] = [headers];

  drugs.forEach((drug) => {
    const ext = drug as ExtendedDrugApproval;
    rows.push([
      drug.id,
      drug.drugName,
      drug.company,
      drug.approvalDate,
      drug.genericName,
      drug.indication,
      drug.cancerType,
      ext.drugCategory || '전문의약품',
      ext.approvalType || '-',
      ext.manufactureType || (drug.company.includes('한국') ? '수입' : '제조'),
      ext.manufacturingCountry || '-',
      ext.consignedManufacturer || '',
      ext.notes || '',
    ]);
  });

  return rows;
}

function applyStyles(sheet: XLSX.WorkSheet, data: (string | number)[][]): void {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (!sheet[cellRef]) {
        sheet[cellRef] = { t: 's', v: '' };
      }
      
      const cell = sheet[cellRef];
      if (!cell.s) {
        cell.s = {};
      }
      
      // 헤더 행 스타일 (더 두껍고 진한 배경)
      if (row === 0) {
        cell.s = {
          font: { name: '맑은 고딕', bold: true, sz: 12, color: { rgb: '1F2937' } },
          fill: { patternType: 'solid', fgColor: { rgb: 'D1D5DB' } },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: {
            top: { style: 'medium', color: { rgb: '374151' } },
            bottom: { style: 'medium', color: { rgb: '374151' } },
            left: { style: 'thin', color: { rgb: '6B7280' } },
            right: { style: 'thin', color: { rgb: '6B7280' } },
          },
        };
      } else {
        // 데이터 행 스타일 (더 큰 폰트, 줄무늬 배경)
        const isEvenRow = row % 2 === 0;
        cell.s = {
          font: { name: '맑은 고딕', sz: 11, color: { rgb: '374151' } },
          fill: isEvenRow 
            ? { patternType: 'solid', fgColor: { rgb: 'F9FAFB' } }
            : { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
          alignment: { vertical: 'center', wrapText: true },
          border: {
            top: { style: 'thin', color: { rgb: 'D1D5DB' } },
            bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
            left: { style: 'thin', color: { rgb: 'E5E7EB' } },
            right: { style: 'thin', color: { rgb: 'E5E7EB' } },
          },
        };
      }
    }
  }
}

function applySummaryStyles(sheet: XLSX.WorkSheet, data: (string | number)[][]): void {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (!sheet[cellRef]) continue;
      
      const cell = sheet[cellRef];
      if (!cell.s) {
        cell.s = {};
      }
      
      // 제목 행 (첫 번째 행)
      if (row === 0) {
        cell.s = {
          font: { name: '맑은 고딕', bold: true, sz: 16, color: { rgb: '1E3A8A' } },
          alignment: { horizontal: 'left', vertical: 'center' },
        };
      }
      // 섹션 헤더 (승인 현황 통계, 제품별 상세 목록)
      else if (data[row]?.[0] === '승인 현황 통계' || data[row]?.[0] === '제품별 상세 목록') {
        cell.s = {
          font: { name: '맑은 고딕', bold: true, sz: 13, color: { rgb: '1F2937' } },
          fill: { patternType: 'solid', fgColor: { rgb: 'E5E7EB' } },
          alignment: { vertical: 'center' },
        };
      }
      // 테이블 헤더 행
      else if (data[row]?.[0] === '구분' || data[row]?.[0] === '품목기준코드') {
        cell.s = {
          font: { name: '맑은 고딕', bold: true, sz: 11, color: { rgb: '1F2937' } },
          fill: { patternType: 'solid', fgColor: { rgb: 'D1D5DB' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'medium', color: { rgb: '374151' } },
            bottom: { style: 'medium', color: { rgb: '374151' } },
            left: { style: 'thin', color: { rgb: '6B7280' } },
            right: { style: 'thin', color: { rgb: '6B7280' } },
          },
        };
      }
      // 일반 데이터
      else {
        cell.s = {
          font: { name: '맑은 고딕', sz: 11, color: { rgb: '374151' } },
          alignment: { vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
            left: { style: 'thin', color: { rgb: 'E5E7EB' } },
            right: { style: 'thin', color: { rgb: 'E5E7EB' } },
          },
        };
      }
    }
  }
}
