import { DrugApproval } from './drugData';

// 2025년 12월 1일 ~ 2026년 1월 28일 항암제 승인 현황 (공공데이터 API 기반)
export const recentApprovals: DrugApproval[] = [
  {
    id: '202600225',
    drugName: '엔잘엑스연질캡슐40밀리그램(엔잘루타미드)',
    genericName: '엔잘루타미드',
    company: '한국메나리니(주)',
    indication: '거세저항성 전립선암 치료',
    cancerType: '전립선암',
    approvalDate: '2026-01-27',
    status: 'approved',
  },
  {
    id: '202600219',
    drugName: '반플리타정17.7밀리그램(퀴자티닙염산염)',
    genericName: '퀴자티닙염산염',
    company: '한국다이이찌산쿄(주)',
    indication: 'FLT3-ITD 변이 양성 급성골수성백혈병 치료',
    cancerType: '혈액암',
    approvalDate: '2026-01-26',
    status: 'approved',
  },
  {
    id: '202600220',
    drugName: '반플리타정26.5밀리그램(퀴자티닙염산염)',
    genericName: '퀴자티닙염산염',
    company: '한국다이이찌산쿄(주)',
    indication: 'FLT3-ITD 변이 양성 급성골수성백혈병 치료',
    cancerType: '혈액암',
    approvalDate: '2026-01-26',
    status: 'approved',
  },
  {
    id: '202600116',
    drugName: '보라니고정10밀리그램(보라시데닙시트르산)',
    genericName: '보라시데닙',
    company: '한국세르비에(주)',
    indication: 'IDH 변이 2등급 신경교종 치료',
    cancerType: '뇌종양',
    approvalDate: '2026-01-13',
    status: 'approved',
  },
  {
    id: '202600117',
    drugName: '보라니고정40밀리그램(보라시데닙시트르산)',
    genericName: '보라시데닙',
    company: '한국세르비에(주)',
    indication: 'IDH 변이 2등급 신경교종 치료',
    cancerType: '뇌종양',
    approvalDate: '2026-01-13',
    status: 'approved',
  },
  {
    id: '202600049',
    drugName: '엔잘루타연질캡슐40밀리그램(엔잘루타미드)',
    genericName: '엔잘루타미드',
    company: '한올바이오파마(주)',
    indication: '거세저항성 전립선암 치료',
    cancerType: '전립선암',
    approvalDate: '2026-01-07',
    status: 'approved',
  },
  {
    id: '202503368',
    drugName: '엔자덱스연질캡슐40밀리그램(엔잘루타미드)',
    genericName: '엔잘루타미드',
    company: '대원제약(주)',
    indication: '거세저항성 전립선암 치료',
    cancerType: '전립선암',
    approvalDate: '2025-12-23',
    status: 'approved',
  },
];

// 기간 정보
export const dateRange = {
  start: '2025-12-01',
  end: '2026-01-28',
  label: '2025년 12월 ~ 2026년 1월',
};

// 암종별 통계
export const cancerTypeStats = recentApprovals.reduce((acc, drug) => {
  acc[drug.cancerType] = (acc[drug.cancerType] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

// 제약사별 통계
export const companyStats = recentApprovals.reduce((acc, drug) => {
  acc[drug.company] = (acc[drug.company] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
