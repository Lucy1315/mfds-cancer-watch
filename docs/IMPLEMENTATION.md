# MFDS 항암제 승인현황 대시보드 - 구현 문서

> 식품의약품안전처(MFDS) 항암제 허가 현황을 시각화하는 대시보드 애플리케이션

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [데이터 구현](#데이터-구현)
4. [API 연동 상세](#api-연동-상세)
5. [컴포넌트 아키텍처](#컴포넌트-아키텍처)
6. [주요 기능](#주요-기능)
7. [파일 구조](#파일-구조)

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

## API 연동 상세

### 1. 공공데이터포털 API 개요

#### 사용 API
| API 서비스 | 용도 | 엔드포인트 |
|-----------|------|-----------|
| DrugPrdtPrmsnInfoService07 | 의약품 허가 정보 조회 | `apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService07` |
| DrbEasyDrugInfoService | 의약품 간편 정보 조회 | `apis.data.go.kr/1471000/DrbEasyDrugInfoService` |

#### API 인증
- **인증 방식**: 서비스 키 (Service Key)
- **발급처**: [공공데이터포털](https://data.go.kr)
- **보안**: Edge Function을 통한 서버사이드 호출로 API 키 노출 방지

### 2. Edge Function 구현

#### 파일 위치
```
supabase/functions/fetch-drug-data/index.ts
```

#### 환경 변수 설정
```bash
# Lovable Cloud에서 자동 관리됨
DATA_GO_KR_API_KEY=<공공데이터포털_서비스키>
```

#### API 호출 흐름

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React Client  │────▶│   Edge Function  │────▶│  data.go.kr API │
│   (Frontend)    │◀────│  (Lovable Cloud) │◀────│   (공공데이터)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### 3. Edge Function 상세 코드

#### 기본 구조

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS 프리플라이트 처리
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('DATA_GO_KR_API_KEY');
    if (!apiKey) {
      throw new Error('DATA_GO_KR_API_KEY is not configured');
    }

    // API 호출 및 데이터 처리
    const result = await fetchDrugData(apiKey);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

#### API 호출 함수

```typescript
async function fetchDrugsByKeyword(apiKey: string, keyword: string): Promise<FetchResult> {
  const baseUrl = 'https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService07/getDrugPrdtPrmsnInq07';
  
  const params = new URLSearchParams({
    serviceKey: apiKey,    // 인증 키
    pageNo: '1',           // 페이지 번호
    numOfRows: '100',      // 페이지당 건수
    type: 'json',          // 응답 형식
    item_name: keyword,    // 검색 키워드 (제품명)
  });

  const response = await fetch(`${baseUrl}?${params.toString()}`);
  const data = await response.json();
  
  return {
    items: data?.response?.body?.items?.item || [],
    totalCount: data?.response?.body?.totalCount || 0,
  };
}
```

### 4. 항암제 필터링 로직

#### 제외 키워드 (오탐 방지)
```typescript
const EXCLUDE_KEYWORDS = [
  '암로디핀', 'amlodipine',   // 고혈압약 (암 접미사 포함)
  '텔미사르탄', 'telmisartan',
  '로사르탄', 'losartan',
  '발사르탄', 'valsartan',
  // ... 기타 비항암제
];
```

#### 항암제 식별 키워드
```typescript
const ANTICANCER_KEYWORDS = [
  // 명확한 항암 키워드
  '항암', '백혈병', 'leukemia', '림프종', 'lymphoma', '골수종', 'myeloma',
  
  // 항암제 성분 접미사 패턴
  'mab',      // 단클론항체 (트라스투주맙, 니볼루맙 등)
  'nib',      // 티로신키나제억제제 (이마티닙, 게피티닙 등)
  'taxel',    // 탁산계 (파클리탁셀, 도세탁셀)
  'platin',   // 백금화합물 (시스플라틴, 카보플라틴)
  'rubicin',  // 안트라사이클린 (독소루비신)
  'ciclib',   // CDK4/6 억제제 (팔보시클립)
  
  // 구체적 암종
  '폐암', '유방암', '대장암', '위암', '간암', '췌장암', '전립선암',
  
  // 기타 항암 관련
  '종양', 'tumor', 'carcinoma', 'metastatic', '전이',
];
```

#### 필터링 함수
```typescript
function isAnticancerDrug(productName: string, ingredients: string): boolean {
  const combined = `${productName} ${ingredients}`.toLowerCase();
  
  // 1. 제외 키워드 먼저 확인 (오탐 방지)
  for (const keyword of EXCLUDE_KEYWORDS) {
    if (combined.includes(keyword.toLowerCase())) {
      return false;
    }
  }
  
  // 2. 항암 키워드 확인
  for (const keyword of ANTICANCER_KEYWORDS) {
    if (combined.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}
```

### 5. 암종 자동 분류

```typescript
function extractCancerType(indication: string, productName: string): string {
  const combined = `${indication} ${productName}`.toLowerCase();
  
  const cancerTypes: Record<string, string[]> = {
    '폐암': ['폐암', '비소세포폐암', 'nsclc', 'lung cancer', 'sclc'],
    '유방암': ['유방암', 'breast cancer', 'her2'],
    '대장암': ['대장암', '결장암', '직장암', 'colorectal'],
    '위암': ['위암', 'gastric', 'stomach'],
    '간암': ['간암', '간세포암', 'hepatocellular', '렌비마'],
    '췌장암': ['췌장암', 'pancreatic'],
    '전립선암': ['전립선암', 'prostate', '엔잘루타미드'],
    '난소암': ['난소암', 'ovarian', '린파자'],
    '신장암': ['신장암', '신세포암', 'renal'],
    '방광암': ['방광암', '요로상피암', 'bladder'],
    '뇌종양': ['뇌종양', '신경교종', '교모세포종', 'glioma', 'glioblastoma'],
    '혈액암': ['백혈병', 'leukemia', 'aml', 'cml', '림프종', 'lymphoma', '골수종', 'myeloma'],
    '피부암': ['흑색종', 'melanoma'],
  };
  
  for (const [type, keywords] of Object.entries(cancerTypes)) {
    if (keywords.some(k => combined.includes(k))) {
      return type;
    }
  }
  return '기타';
}
```

### 6. 검색 키워드 전략

#### 주요 항암제 키워드 (병렬 검색)
```typescript
const SEARCH_KEYWORDS = [
  // 면역항암제
  '키트루다', '옵디보', '테센트릭', '임핀지',
  
  // 표적항암제
  '허쥬마', '타그리소', '렌비마', '린파자', '이브란스',
  '글리벡', '타세바', '이레사',
  
  // ADC (항체-약물 접합체)
  '엔허투', '다라잘렉스', 'ADC',
  
  // 기존 화학항암제
  '아바스틴', '허셉틴', '리툭산', '젤로다', '알림타',
  '택솔', '탁소테레', '시스플라틴', '카보플라틴',
  '독소루비신', '젬자르', '빈크리스틴',
  
  // 신규 승인 약물
  '보라니고', '반플리타', '퀴자티닙', '보라시데닙',
];
```

#### 병렬 검색 구현
```typescript
// 모든 키워드로 동시 검색 (성능 최적화)
const results = await Promise.all(
  SEARCH_KEYWORDS.map(keyword => fetchDrugsByKeyword(apiKey, keyword))
);

// 중복 제거
const seenIds = new Set<string>();
const allItems: DrugItem[] = [];

for (const result of results) {
  for (const item of result.items) {
    if (!seenIds.has(item.ITEM_SEQ)) {
      seenIds.add(item.ITEM_SEQ);
      allItems.push(item);
    }
  }
}
```

### 7. API 응답 데이터 구조

#### 원본 API 응답 (DrugPrdtPrmsnInfoService07)
```typescript
interface DrugItem {
  ITEM_SEQ: string;           // 품목기준코드
  ITEM_NAME: string;          // 제품명
  ENTP_NAME: string;          // 업체명
  ITEM_PERMIT_DATE: string;   // 허가일자 (YYYYMMDD)
  EE_DOC_DATA?: string;       // 효능효과 (XML)
  UD_DOC_DATA?: string;       // 용법용량 (XML)
  NB_DOC_DATA?: string;       // 주의사항 (XML)
  MAIN_ITEM_INGR?: string;    // 주성분
  INGR_NAME?: string;         // 성분명
  CLASS_NAME?: string;        // 약효분류
}
```

#### 변환된 응답 (Frontend용)
```typescript
interface ProcessedDrug {
  id: string;              // 품목기준코드
  drugName: string;        // 제품명
  genericName: string;     // 주성분명 (추출)
  company: string;         // 업체명
  indication: string;      // 적응증 (정제됨)
  cancerType: string;      // 암종 (자동분류)
  approvalDate: string;    // 허가일 (YYYY-MM-DD)
  status: 'approved';      // 상태
  className?: string;      // 약효분류
}
```

### 8. 클라이언트 호출 방법

#### React에서 Edge Function 호출
```typescript
import { supabase } from '@/integrations/supabase/client';

// 기본 검색 (주요 항암제)
const { data, error } = await supabase.functions.invoke('fetch-drug-data', {
  body: { searchType: 'list' }
});

// 특정 키워드 검색
const { data, error } = await supabase.functions.invoke('fetch-drug-data', {
  body: { searchTerm: '키트루다' }
});

// 전체 항암제 검색 (모든 키워드)
const { data, error } = await supabase.functions.invoke('fetch-drug-data', {
  body: { fetchAll: true }
});
```

### 9. 에러 처리

```typescript
// Edge Function 에러 응답
{
  success: false,
  error: "DATA_GO_KR_API_KEY is not configured",
  data: []
}

// 성공 응답
{
  success: true,
  data: [...],
  totalCount: 150,      // 필터링된 항암제 수
  originalCount: 1200   // API 원본 결과 수
}
```

### 10. 보안 고려사항

| 항목 | 구현 방식 |
|------|----------|
| API 키 보호 | Edge Function 서버사이드 호출 |
| CORS | 허용된 Origin만 접근 |
| 요청 제한 | 공공데이터포털 일일 할당량 준수 |
| 에러 노출 | 클라이언트에 상세 에러 미노출 |

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
