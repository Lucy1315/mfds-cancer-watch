# MFDS 항암제 승인현황 대시보드 - 구현 문서

> 식품의약품안전처(MFDS) 항암제 허가 현황을 시각화하는 대시보드 애플리케이션

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [데이터 구현](#데이터-구현)
4. [컴포넌트 아키텍처](#컴포넌트-아키텍처)
5. [주요 기능](#주요-기능)
6. [파일 구조](#파일-구조)

---

## 프로젝트 개요

### 목적
- 식품의약품안전처의 항암제 허가 현황을 실시간으로 모니터링
- 데이터 시각화를 통한 승인 트렌드 분석
- Excel 업로드/다운로드를 통한 데이터 관리

### 데이터 기간
- **기본 범위**: 2025-12-01 ~ 2026-01-28
- **데이터 소스**: 공공데이터포털(data.go.kr) API 기반

---

## 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18.3.1 | UI 프레임워크 |
| TypeScript | - | 타입 안정성 |
| Tailwind CSS | - | 스타일링 |
| shadcn/ui | - | UI 컴포넌트 라이브러리 |

### 데이터 시각화
| 라이브러리 | 용도 |
|------------|------|
| Recharts | 파이차트, 바차트, 도넛차트 |
| date-fns | 날짜 포맷팅 |

### 데이터 처리
| 라이브러리 | 용도 |
|------------|------|
| xlsx | Excel 파일 파싱 |
| xlsx-js-style | 스타일이 적용된 Excel 내보내기 |

### Backend (Lovable Cloud)
| 기능 | 구현 |
|------|------|
| Edge Functions | API 키 보호 및 외부 API 호출 |
| Database | 데이터 저장 (PostgreSQL) |

---

## 데이터 구현

### 1. 데이터 소스

#### A. 정적 데이터 (Hardcoded)
```typescript
// src/data/recentApprovals.ts
export const recentApprovals: ExtendedDrugApproval[] = [
  {
    id: "202500001",
    drugName: "키트루다주100밀리그램",
    genericName: "펨브롤리주맙",
    company: "한국엠에스디",
    approvalDate: "2026-01-15",
    indication: "비소세포폐암",
    cancerType: "폐암",
    approvalType: "신약",
    // ...
  }
];
```

#### B. Excel 업로드
```typescript
// src/utils/excelParser.ts
export const parseExcelFile = async (file: File): Promise<ParseResult> => {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  // 컬럼 매핑 및 데이터 변환
  return { drugs, fileName };
};
```

#### C. 공공데이터 API (Edge Function)
```typescript
// supabase/functions/fetch-drug-data/index.ts
// DrbEasyDrugInfoService, DrugPrdtPrmsnInfoService07 API 호출
```

### 2. 데이터 타입 정의

```typescript
// src/data/drugData.ts
export interface DrugApproval {
  id: string;              // 품목기준코드
  drugName: string;        // 제품명
  genericName: string;     // 주성분
  company: string;         // 업체명
  approvalDate: string;    // 허가일
  indication: string;      // 적응증
  cancerType: string;      // 암종
}

// src/data/recentApprovals.ts
export interface ExtendedDrugApproval extends DrugApproval {
  approvalType?: string;           // 허가유형 (신약/제네릭/희귀의약품)
  manufactureType?: string;        // 제조/수입
  manufacturingCountry?: string;   // 제조국
  consignedManufacturer?: string;  // 위탁제조업체
  notes?: string;                  // 비고
}
```

### 3. 자동 분류 로직

#### 암종 자동 추출
```typescript
const extractCancerType = (indication: string): string => {
  const cancerKeywords = {
    '폐암': ['폐암', '비소세포폐암', 'NSCLC', '소세포폐암'],
    '유방암': ['유방암', 'HER2', '삼중음성'],
    '위암': ['위암', '위선암', '위장관기질종양'],
    // ...
  };
  // 키워드 매칭으로 암종 분류
};
```

#### 약물 분류 (접미사 기반)
```typescript
const classifyDrug = (genericName: string): string => {
  if (genericName.includes('-mab')) return '단클론항체';
  if (genericName.includes('-nib')) return '티로신키나제억제제';
  if (genericName.includes('-taxel')) return '탁산계';
  // ...
};
```

---

## 컴포넌트 아키텍처

### 페이지 구조

```
src/pages/Index.tsx (메인 대시보드)
├── Header.tsx (헤더)
├── FilterPanel.tsx (필터 패널)
├── UserGuide.tsx (사용방법 안내)
├── ChartGrid.tsx (차트 그리드)
│   ├── ApprovalChart.tsx (파이차트)
│   ├── ApprovalChart.tsx (도넛차트)
│   ├── ApprovalChart.tsx (바차트)
│   └── ApprovalChart.tsx (월별 추이)
└── DataTable.tsx (상세 테이블)
```

### 주요 컴포넌트

#### 1. FilterPanel (필터 패널)
```typescript
interface FilterState {
  startDate: Date | null;
  endDate: Date | null;
  cancerType: string;      // '전체' | 암종
  manufactureType: string; // '전체' | '제조' | '수입'
  company: string;         // '전체' | 업체명
}
```

#### 2. ChartGrid (차트 그리드)
- **암종별 분포**: 파이차트
- **업체별 분포**: 도넛차트  
- **허가유형별 분포**: 수평 바차트
- **월별 추이**: 영역 차트

#### 3. DataTable (데이터 테이블)
| 컬럼 | 너비 | 설명 |
|------|------|------|
| 품목기준코드 | 120px | MFDS 링크 연결 |
| 제품명 | 200px | 클릭시 상세페이지 |
| 업체명 | 160px | - |
| 허가일 | 100px | YYYY-MM-DD |
| 주성분 | 180px | 성분명 |
| 적응증 | 280px+ | 60자 초과시 말줄임 |
| 암종 | 100px | 분류된 암종 |
| 허가유형 | 100px | 컬러 배지 |
| 제조/수입 | 80px | - |
| 제조국 | 100px | - |
| 위탁제조업체 | 180px | 40자 초과시 말줄임 |
| 비고 | 120px | - |

---

## 주요 기능

### 1. Excel 내보내기

```typescript
// src/utils/excelExport.ts
export const exportToExcel = (data, options) => {
  // 2개 시트 생성: 요약 + 상세
  const wb = XLSX.utils.book_new();
  
  // 스타일 적용
  // - 헤더: 12pt 굵은 흰색, 파란 배경(#2563EB)
  // - 데이터: 11pt, 테두리 그리드
  // - 행 높이: 30-40pt
};
```

### 2. 필터링 시스템

```typescript
const filteredData = useMemo(() => {
  return currentData.filter((drug) => {
    // 날짜 범위 필터
    // 암종 필터
    // 제조/수입 필터
    // 업체 필터
    return true;
  });
}, [currentData, filters]);
```

### 3. 테이블 내 검색

```typescript
const filteredData = useMemo(() => {
  const term = searchTerm.toLowerCase();
  return data.filter((drug) =>
    drug.drugName.toLowerCase().includes(term) ||
    drug.genericName.toLowerCase().includes(term) ||
    drug.company.toLowerCase().includes(term) ||
    drug.indication.toLowerCase().includes(term)
  );
}, [data, searchTerm]);
```

---

## 파일 구조

```
src/
├── components/
│   ├── ApprovalChart.tsx    # 차트 컴포넌트
│   ├── ChartGrid.tsx        # 차트 그리드 레이아웃
│   ├── DataTable.tsx        # 데이터 테이블
│   ├── FilterPanel.tsx      # 필터 패널
│   ├── Header.tsx           # 헤더
│   ├── StatCard.tsx         # 통계 카드
│   ├── UserGuide.tsx        # 사용 안내
│   └── ui/                  # shadcn/ui 컴포넌트
│
├── data/
│   ├── drugData.ts          # 타입 정의 & 암종 목록
│   └── recentApprovals.ts   # 샘플 데이터
│
├── utils/
│   ├── excelExport.ts       # Excel 내보내기
│   └── excelParser.ts       # Excel 파싱
│
├── pages/
│   └── Index.tsx            # 메인 대시보드 페이지
│
└── hooks/
    └── useDrugData.ts       # 데이터 관리 훅

supabase/
└── functions/
    └── fetch-drug-data/     # API 호출 Edge Function
        └── index.ts
```

---

## 스타일 가이드

### 컬러 시스템

```css
/* 허가유형 배지 */
.신약     { background: blue-500/20;    color: blue-600; }
.제네릭   { background: emerald-500/20; color: emerald-600; }
.희귀의약품 { background: orphan/20;      color: orphan; }
```

### 반응형 디자인

- **데스크톱**: 전체 테이블 표시 (min-width: 1800px)
- **태블릿**: 수평 스크롤
- **모바일**: 필터 패널 축소, 카드 스택

---

## 향후 개선 사항

- [ ] 실시간 API 연동 완성
- [ ] 데이터베이스 저장 기능
- [ ] 사용자 인증 및 북마크
- [ ] 알림 기능 (신규 승인 시)
- [ ] PDF 내보내기

---

*마지막 업데이트: 2026년 1월 29일*
