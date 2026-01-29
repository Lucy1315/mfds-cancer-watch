import { DrugApproval } from './drugData';

// 확장된 약품 정보 인터페이스
export interface ExtendedDrugApproval extends DrugApproval {
  manufacturingCountry?: string;  // 제조국
  consignedManufacturer?: string; // 위탁제조업체
  approvalType?: string;          // 허가유형 (신약, 제네릭, 희귀의약품 등)
  drugCategory?: string;          // 품목구분
  manufactureType?: string;       // 제조/수입
  notes?: string;                 // 비고
}

// 2025년 12월 1일 ~ 2026년 1월 28일 항암제 승인 현황 (공공데이터 API + 추가 조사 기반)
export const recentApprovals: ExtendedDrugApproval[] = [
  {
    id: '202600226',
    drugName: '오티닙정40밀리그램(오시머티닙메실산염)',
    genericName: '오시머티닙메실산염 (Osimertinib Mesylate)',
    company: '(주)종근당',
    indication: 'EGFR 변이 양성 비소세포폐암 치료',
    cancerType: '폐암',
    approvalDate: '2026-01-27',
    status: 'approved',
    manufacturingCountry: '한국',
    consignedManufacturer: '',
    approvalType: '제네릭(합성의약품)',
    drugCategory: '전문의약품',
    manufactureType: '제조',
    notes: 'EGFR TKI, 표적항암제',
  },
  {
    id: '202600227',
    drugName: '오티닙정80밀리그램(오시머티닙메실산염)',
    genericName: '오시머티닙메실산염 (Osimertinib Mesylate)',
    company: '(주)종근당',
    indication: 'EGFR 변이 양성 비소세포폐암 치료',
    cancerType: '폐암',
    approvalDate: '2026-01-27',
    status: 'approved',
    manufacturingCountry: '한국',
    consignedManufacturer: '',
    approvalType: '제네릭(합성의약품)',
    drugCategory: '전문의약품',
    manufactureType: '제조',
    notes: 'EGFR TKI, 표적항암제',
  },
  {
    id: '202600225',
    drugName: '엔잘엑스연질캡슐40밀리그램(엔잘루타미드)',
    genericName: '엔잘루타미드 (Enzalutamide)',
    company: '한국메나리니(주)',
    indication: '거세저항성 전이성 전립선암 또는 거세저항성 비전이성 전립선암 치료',
    cancerType: '전립선암',
    approvalDate: '2026-01-27',
    status: 'approved',
    manufacturingCountry: '이탈리아',
    consignedManufacturer: 'A. Menarini Manufacturing Logistics and Services S.r.l.',
    approvalType: '제네릭(합성의약품)',
    drugCategory: '전문의약품',
    manufactureType: '수입',
    notes: '안드로겐 수용체 억제제',
  },
  {
    id: '202600219',
    drugName: '반플리타정17.7밀리그램(퀴자티닙염산염)',
    genericName: '퀴자티닙염산염 (Quizartinib Hydrochloride)',
    company: '한국다이이찌산쿄(주)',
    indication: 'FLT3-ITD 변이 양성 새롭게 진단된 급성골수성백혈병(AML) 성인 환자의 치료',
    cancerType: '급성골수성백혈병',
    approvalDate: '2026-01-26',
    status: 'approved',
    manufacturingCountry: '독일, 포르투갈, 프랑스',
    consignedManufacturer: 'Daiichi Sankyo Europe GmbH, Hovione FarmaCiencia S.A., Patheon France',
    approvalType: '신약(합성의약품)',
    drugCategory: '전문의약품',
    manufactureType: '수입',
    notes: 'FLT3 억제제, 표적항암제',
  },
  {
    id: '202600220',
    drugName: '반플리타정26.5밀리그램(퀴자티닙염산염)',
    genericName: '퀴자티닙염산염 (Quizartinib Hydrochloride)',
    company: '한국다이이찌산쿄(주)',
    indication: 'FLT3-ITD 변이 양성 새롭게 진단된 급성골수성백혈병(AML) 성인 환자의 치료',
    cancerType: '급성골수성백혈병',
    approvalDate: '2026-01-26',
    status: 'approved',
    manufacturingCountry: '독일, 포르투갈, 프랑스',
    consignedManufacturer: 'Daiichi Sankyo Europe GmbH, Hovione FarmaCiencia S.A., Patheon France',
    approvalType: '신약(합성의약품)',
    drugCategory: '전문의약품',
    manufactureType: '수입',
    notes: 'FLT3 억제제, 표적항암제',
  },
  {
    id: '202600116',
    drugName: '보라니고정10밀리그램(보라시데닙시트르산)',
    genericName: '보라시데닙시트르산 (Vorasidenib Citrate)',
    company: '한국세르비에(주)',
    indication: 'IDH1 또는 IDH2 변이를 가진 2등급 신경교종 성인 환자의 치료',
    cancerType: '뇌종양(신경교종)',
    approvalDate: '2026-01-13',
    status: 'approved',
    manufacturingCountry: '독일, 아일랜드',
    consignedManufacturer: 'Rottendorf Pharma GmbH, Servier (Ireland) Industries Limited',
    approvalType: '희귀의약품(합성의약품)',
    drugCategory: '전문의약품',
    manufactureType: '수입',
    notes: 'IDH 억제제, 표적항암제',
  },
  {
    id: '202600117',
    drugName: '보라니고정40밀리그램(보라시데닙시트르산)',
    genericName: '보라시데닙시트르산 (Vorasidenib Citrate)',
    company: '한국세르비에(주)',
    indication: 'IDH1 또는 IDH2 변이를 가진 2등급 신경교종 성인 환자의 치료',
    cancerType: '뇌종양(신경교종)',
    approvalDate: '2026-01-13',
    status: 'approved',
    manufacturingCountry: '독일, 아일랜드',
    consignedManufacturer: 'Rottendorf Pharma GmbH, Servier (Ireland) Industries Limited',
    approvalType: '희귀의약품(합성의약품)',
    drugCategory: '전문의약품',
    manufactureType: '수입',
    notes: 'IDH 억제제, 표적항암제',
  },
  {
    id: '202600049',
    drugName: '엔잘루타연질캡슐40밀리그램(엔잘루타미드)',
    genericName: '엔잘루타미드 (Enzalutamide)',
    company: '한올바이오파마(주)',
    indication: '거세저항성 전이성 전립선암 또는 거세저항성 비전이성 전립선암 치료',
    cancerType: '전립선암',
    approvalDate: '2026-01-07',
    status: 'approved',
    manufacturingCountry: '한국',
    consignedManufacturer: '',
    approvalType: '제네릭(합성의약품)',
    drugCategory: '전문의약품',
    manufactureType: '제조',
    notes: '안드로겐 수용체 억제제',
  },
  {
    id: '202503368',
    drugName: '엔자덱스연질캡슐40밀리그램(엔잘루타미드)',
    genericName: '엔잘루타미드 (Enzalutamide)',
    company: '대원제약(주)',
    indication: '거세저항성 전이성 전립선암 또는 거세저항성 비전이성 전립선암 치료',
    cancerType: '전립선암',
    approvalDate: '2025-12-23',
    status: 'approved',
    manufacturingCountry: '한국',
    consignedManufacturer: '',
    approvalType: '제네릭(합성의약품)',
    drugCategory: '전문의약품',
    manufactureType: '제조',
    notes: '안드로겐 수용체 억제제',
  },
  {
    id: '202503352',
    drugName: '브렌랩주70밀리그램(벨란타맙마포도틴)',
    genericName: '벨란타맙마포도틴 (Belantamab Mafodotin)',
    company: '(주)글락소스미스클라인',
    indication: '재발 또는 불응성 다발골수종의 치료 - 이전에 한 가지 이상의 치료를 받은 성인 다발골수종 환자에서 보르테조밉 및 덱사메타손과의 병용요법',
    cancerType: '다발성골수종',
    approvalDate: '2025-12-22',
    status: 'approved',
    manufacturingCountry: '벨기에',
    consignedManufacturer: 'GlaxoSmithKline Biologicals S.A.',
    approvalType: '신약(유전자재조합의약품 및 세포배양의약품)',
    drugCategory: '전문의약품',
    manufactureType: '수입',
    notes: 'BCMA 표적 ADC, 희귀신약',
  },
  {
    id: '202503351',
    drugName: '브렌랩주100밀리그램(벨란타맙마포도틴)',
    genericName: '벨란타맙마포도틴 (Belantamab Mafodotin)',
    company: '(주)글락소스미스클라인',
    indication: '재발 또는 불응성 다발골수종의 치료 - 이전에 한 가지 이상의 치료를 받은 성인 다발골수종 환자에서 보르테조밉 및 덱사메타손과의 병용요법',
    cancerType: '다발성골수종',
    approvalDate: '2025-12-22',
    status: 'approved',
    manufacturingCountry: '벨기에',
    consignedManufacturer: 'GlaxoSmithKline Biologicals S.A.',
    approvalType: '신약(유전자재조합의약품 및 세포배양의약품)',
    drugCategory: '전문의약품',
    manufactureType: '수입',
    notes: 'BCMA 표적 ADC, 희귀신약',
  },
  {
    id: '202503327',
    drugName: '엘라히어주(미르베툭시맙소라브탄신)',
    genericName: '미르베툭시맙소라브탄신 (Mirvetuximab Soravtansine)',
    company: '한국애브비(주)',
    indication: 'FRα 양성이면서 백금기반 화학요법에 저항성이 있는 고등급 장액성 상피성 난소암, 난관암 또는 원발성 복막암 성인 환자에서 단독요법',
    cancerType: '난소암',
    approvalDate: '2025-12-19',
    status: 'approved',
    manufacturingCountry: '미국',
    consignedManufacturer: 'ImmunoGen, Inc.',
    approvalType: '희귀의약품(유전자재조합의약품 및 세포배양의약품)',
    drugCategory: '전문의약품',
    manufactureType: '수입',
    notes: 'FRα 표적 ADC, 희귀의약품',
  },
  {
    id: '202503198',
    drugName: '풀베란트프리필드주사(풀베스트란트)',
    genericName: '풀베스트란트 (Fulvestrant)',
    company: '동국제약(주)',
    indication: 'HR-양성, HER2-음성, 폐경기 이후 여성의 진행성 또는 전이성 유방암 치료. CDK4/6 억제제와 병용요법',
    cancerType: '유방암',
    approvalDate: '2025-12-08',
    status: 'approved',
    manufacturingCountry: '한국',
    consignedManufacturer: '동국제약 진천공장',
    approvalType: '제네릭(합성의약품)',
    drugCategory: '전문의약품',
    manufactureType: '제조',
    notes: 'SERD, 호르몬요법',
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

// 허가유형별 통계
export const approvalTypeStats = recentApprovals.reduce((acc, drug) => {
  const type = drug.approvalType || '기타';
  acc[type] = (acc[type] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
