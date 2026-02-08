import { format } from 'date-fns';
import { ExtendedDrugApproval } from '@/data/recentApprovals';
import { FilterState } from '@/components/FilterPanel';

export interface EmailStatistics {
  totalCount: number;
  cancerTypeStats: Record<string, number>;
  approvalTypeStats: Record<string, number>;
  manufactureStats: { import: number; domestic: number };
  mechanismStats: Record<string, number>;
}

export const DASHBOARD_URL = 'https://mfds-cancer-watch.lovable.app';

// 통계 데이터 계산
export const calculateStatistics = (data: ExtendedDrugApproval[]): EmailStatistics => {
  const cancerTypeStats: Record<string, number> = {};
  const approvalTypeStats: Record<string, number> = {};
  const mechanismStats: Record<string, number> = {};
  let importCount = 0;
  let domesticCount = 0;

  data.forEach((drug) => {
    // 암종별 통계
    cancerTypeStats[drug.cancerType] = (cancerTypeStats[drug.cancerType] || 0) + 1;

    // 허가유형별 통계
    if (drug.approvalType) {
      approvalTypeStats[drug.approvalType] = (approvalTypeStats[drug.approvalType] || 0) + 1;
    }

    // 제조/수입 통계
    const isImported = drug.company.includes('한국') || drug.company.includes('Korea');
    if (isImported) {
      importCount++;
    } else {
      domesticCount++;
    }

    // 작용기전 통계 (notes에서 추출)
    const ext = drug as ExtendedDrugApproval;
    if (ext.notes) {
      if (ext.notes.includes('EGFR TKI')) mechanismStats['EGFR TKI'] = (mechanismStats['EGFR TKI'] || 0) + 1;
      else if (ext.notes.includes('FLT3 억제제')) mechanismStats['FLT3 억제제'] = (mechanismStats['FLT3 억제제'] || 0) + 1;
      else if (ext.notes.includes('IDH 억제제')) mechanismStats['IDH 억제제'] = (mechanismStats['IDH 억제제'] || 0) + 1;
      else if (ext.notes.includes('안드로겐 수용체 억제제')) mechanismStats['안드로겐 수용체 억제제'] = (mechanismStats['안드로겐 수용체 억제제'] || 0) + 1;
      else if (ext.notes.includes('ADC')) mechanismStats['ADC'] = (mechanismStats['ADC'] || 0) + 1;
      else if (ext.notes.includes('SERD')) mechanismStats['SERD'] = (mechanismStats['SERD'] || 0) + 1;
    }
  });

  return {
    totalCount: data.length,
    cancerTypeStats,
    approvalTypeStats,
    manufactureStats: { import: importCount, domestic: domesticCount },
    mechanismStats,
  };
};

// 기간 텍스트 생성 (yy-MM-dd 형식)
export const getDateRangeText = (filters: FilterState): string => {
  if (!filters.startDate && !filters.endDate) {
    return '전체 기간';
  }
  if (filters.startDate && filters.endDate) {
    return `${format(filters.startDate, 'yy-MM-dd')} ~ ${format(filters.endDate, 'yy-MM-dd')}`;
  }
  if (filters.startDate) {
    return `${format(filters.startDate, 'yy-MM-dd')} ~`;
  }
  if (filters.endDate) {
    return `~ ${format(filters.endDate, 'yy-MM-dd')}`;
  }
  return '사용자 지정 기간';
};

// 통계를 문자열로 포맷팅
const formatStats = (stats: Record<string, number>): string => {
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => `${key}(${value})`)
    .join(', ');
};

// 이메일 본문 미리보기용 텍스트 생성
export const generateEmailPreview = (
  dateRangeText: string,
  statistics: EmailStatistics,
  additionalNote?: string
): string => {
  let preview = `📋 MFDS 항암제 승인현황 리포트\n\n`;
  preview += `📅 승인기간: ${dateRangeText}\n\n`;
  preview += `📊 요약 통계\n`;
  preview += `• 총 승인 품목: ${statistics.totalCount}건\n\n`;
  
  preview += `🔹 암종별 분포:\n   ${formatStats(statistics.cancerTypeStats)}\n\n`;
  preview += `🔹 허가유형별 분포:\n   ${formatStats(statistics.approvalTypeStats)}\n\n`;
  preview += `🔹 제조/수입 비율:\n   수입(${statistics.manufactureStats.import}), 제조(${statistics.manufactureStats.domestic})\n\n`;
  
  if (Object.keys(statistics.mechanismStats).length > 0) {
    preview += `🔹 작용기전별 분포:\n   ${formatStats(statistics.mechanismStats)}\n\n`;
  }

  if (additionalNote) {
    preview += `📝 추가 메모:\n${additionalNote}\n\n`;
  }

  preview += `🔗 대시보드: ${DASHBOARD_URL}`;

  return preview;
};

// 엑셀 파일명 생성
export const generateExcelFilename = (filters: FilterState): string => {
  if (filters.startDate && filters.endDate) {
    const start = format(filters.startDate, 'yy-MM-dd');
    const end = format(filters.endDate, 'yy-MM-dd');
    return `MFDS_항암제_승인현황_${start}_${end}.xlsx`;
  }
  return `MFDS_항암제_승인현황_전체.xlsx`;
};
