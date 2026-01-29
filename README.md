# MFDS 항암제 승인현황 대시보드

> 식품의약품안전처(MFDS) 항암제 허가 현황을 시각화하는 대시보드 애플리케이션

[![Made with Lovable](https://img.shields.io/badge/Made%20with-Lovable-ff69b4)](https://lovable.dev)

## 📋 프로젝트 소개

식품의약품안전처의 항암제 허가 데이터를 시각적으로 분석하고 관리할 수 있는 웹 대시보드입니다.

### 주요 기능

- 📊 **데이터 시각화**: 암종별, 업체별, 허가유형별 분포 차트
- 📅 **기간별 필터링**: 날짜 범위, 암종, 제조/수입 구분 필터
- 📤 **Excel 업로드**: 외부 Excel 파일 업로드 및 자동 분류
- 📥 **Excel 다운로드**: 스타일이 적용된 전문적인 보고서 내보내기
- 🔗 **MFDS 연동**: 품목기준코드 클릭 시 공식 페이지 연결

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React 18, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui |
| Charts | Recharts |
| Excel 처리 | xlsx, xlsx-js-style |
| Build Tool | Vite |
| Backend | Lovable Cloud (Supabase) |

---

## 🚀 설치 및 실행

### 사전 요구 사항

- Node.js 18.x 이상
- npm 또는 bun 패키지 매니저

### 로컬 개발 환경 설정

```bash
# 1. 저장소 클론
git clone <YOUR_GIT_URL>

# 2. 프로젝트 디렉토리 이동
cd mfds-cancer-watch

# 3. 의존성 설치
npm install
# 또는
bun install

# 4. 개발 서버 실행
npm run dev
# 또는
bun dev
```

개발 서버가 시작되면 `http://localhost:5173`에서 앱에 접근할 수 있습니다.

### 환경 변수

프로젝트는 Lovable Cloud와 연동되어 있으며, 환경 변수는 자동으로 구성됩니다.

```env
VITE_SUPABASE_URL=<자동 설정>
VITE_SUPABASE_PUBLISHABLE_KEY=<자동 설정>
```

---

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── ApprovalChart.tsx    # 차트 컴포넌트
│   ├── ChartGrid.tsx        # 차트 그리드
│   ├── DataTable.tsx        # 데이터 테이블
│   ├── FilterPanel.tsx      # 필터 패널
│   └── ui/                  # shadcn/ui 컴포넌트
├── data/                # 데이터 정의
│   ├── drugData.ts          # 타입 & 암종 목록
│   └── recentApprovals.ts   # 샘플 데이터
├── utils/               # 유틸리티 함수
│   ├── excelExport.ts       # Excel 내보내기
│   └── excelParser.ts       # Excel 파싱
├── pages/               # 페이지 컴포넌트
│   └── Index.tsx            # 메인 대시보드
└── hooks/               # 커스텀 훅
    └── useDrugData.ts       # 데이터 관리

supabase/
└── functions/           # Edge Functions
    └── fetch-drug-data/     # API 호출

docs/
└── IMPLEMENTATION.md    # 상세 구현 문서
```

---

## 📖 사용 방법

### 1. 데이터 조회

- 기본적으로 2025-12-01 ~ 2026-01-28 기간의 항암제 승인 데이터가 표시됩니다.
- 필터 패널에서 날짜 범위, 암종, 제조/수입 구분을 선택하여 필터링할 수 있습니다.

### 2. Excel 업로드

1. 필터 패널의 **"Excel 업로드"** 버튼 클릭
2. MFDS 형식의 Excel 파일 선택
3. 자동으로 데이터가 파싱되어 대시보드에 반영됨

### 3. Excel 다운로드

- **"전체 다운로드"** 버튼: 현재 필터링된 전체 데이터 내보내기
- **테이블 내 "Excel 다운로드"** 버튼: 테이블에 표시된 데이터만 내보내기

### 4. 상세 정보 확인

- 테이블의 **품목기준코드** 또는 **제품명** 클릭 시 MFDS 공식 상세 페이지로 이동

---

## 🔧 개발 가이드

### 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트 검사
npm run lint
```

### 새 컴포넌트 추가

shadcn/ui 컴포넌트를 추가하려면:

```bash
npx shadcn@latest add <component-name>
```

---

## 🌐 배포

### Lovable 배포

1. [Lovable 프로젝트](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) 접속
2. **Share → Publish** 클릭

### 커스텀 도메인 연결

1. Project > Settings > Domains 이동
2. **Connect Domain** 클릭
3. DNS 설정 안내에 따라 도메인 연결

자세한 내용: [커스텀 도메인 설정 가이드](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## 📄 문서

- [구현 상세 문서](docs/IMPLEMENTATION.md) - 데이터 구조, 컴포넌트 아키텍처, 주요 기능 설명

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

## 🙏 데이터 출처

본 데이터는 [식품의약품안전처](https://mfds.go.kr) 공개자료(공공데이터포털)를 기반으로 제작되었습니다.

---

*마지막 업데이트: 2026년 1월 29일*
