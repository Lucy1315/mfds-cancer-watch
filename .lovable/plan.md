

## MFDS 항암제 승인현황 대시보드 - 문서화 엑셀 파일 생성 계획

### 요청 사항
현재 개발된 대시보드를 문서화하는 엑셀 파일을 생성합니다. 첨부된 파일 형식을 참고하여 다음 시트들을 포함합니다:
- **Data** (Raw Data)
- **설명** (컬럼 명칭, 데이터 구조, 필터링 키워드, 수집 방법, 기술 스택 등)

---

### 생성할 엑셀 시트 구조

#### Sheet 1: Data (Raw Data)
| 구분 | 내용 |
|------|------|
| 목적 | 대시보드에서 사용하는 원시 데이터 |
| 데이터 출처 | `src/data/recentApprovals.ts` (13건) |
| 컬럼 | 품목기준코드, 제품명, 업체명, 허가일, 주성분, 적응증, 암종, 허가유형, 제조/수입, 제조국, 위탁제조업체, 비고 |

#### Sheet 2: 설명 (Documentation)
다음 섹션들을 포함:

**섹션 A - 컬럼별 명칭**
| 컬럼명 | 영문명 | API 원본 필드 | 설명 |
|--------|--------|--------------|------|
| 품목기준코드 | id | ITEM_SEQ | 식약처 고유 품목 식별자 |
| 제품명 | drugName | ITEM_NAME | 의약품 제품명 |
| 업체명 | company | ENTP_NAME | 제조/수입 업체 |
| ... | ... | ... | ... |

**섹션 B - 데이터 정리 구조**
```text
데이터 흐름:
공공데이터 API → Edge Function → 필터링/변환 → React 대시보드
```

**섹션 C - 항암제 필터링 키워드**
| 구분 | 키워드 목록 |
|------|------------|
| 포함 키워드 | 항암, 백혈병, 림프종, 골수종, -mab, -nib, -taxel, -platin... |
| 제외 키워드 | 암로디핀, 텔미사르탄, 로사르탄, 발사르탄... |

**섹션 D - 수집방법 개요**
| 단계 | 설명 |
|------|------|
| 1 | 공공데이터포털(data.go.kr) API 호출 |
| 2 | Edge Function에서 키워드별 병렬 검색 |
| 3 | 항암제 필터링 로직 적용 |
| 4 | 암종 자동 분류 |

**섹션 E - 수집 결과 예시**
- API 응답 원본 구조
- 변환 후 데이터 구조

**섹션 F - 필터링 프로세스**
```text
1. 제외 키워드 확인 (오탐 방지)
2. 포함 키워드 매칭
3. 암종 자동 추출
4. 날짜 포맷 변환
```

**섹션 G - 데이터 출처 및 검증**
| 항목 | 내용 |
|------|------|
| API 출처 | 공공데이터포털 DrugPrdtPrmsnInfoService07 |
| 검증 방법 | 식약처 nedrug.mfds.go.kr 교차 확인 |
| 데이터 기간 | 2025-12-01 ~ 2026-01-28 |

**섹션 H - 기술 스택**
| 분류 | 기술 | 버전 | 용도 |
|------|------|------|------|
| Frontend | React | 18.3.1 | UI 프레임워크 |
| Frontend | TypeScript | - | 타입 안정성 |
| Frontend | Tailwind CSS | - | 스타일링 |
| 시각화 | Recharts | - | 차트 컴포넌트 |
| 데이터 처리 | xlsx-js-style | - | 엑셀 내보내기 |
| Backend | Lovable Cloud | - | Edge Functions, DB |

---

### 구현 방식

**새로운 유틸리티 함수 생성:**
```typescript
// src/utils/exportDocumentation.ts
export function exportDocumentationExcel(): void {
  // Sheet 1: Data (Raw Data)
  // Sheet 2: 설명 (Documentation)
}
```

**UI 연동:**
- Header 또는 설정 영역에 "문서화 엑셀 다운로드" 버튼 추가

---

### 수정 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `src/utils/exportDocumentation.ts` | 신규 생성 - 문서화 엑셀 생성 함수 |
| `src/components/Header.tsx` | 문서화 다운로드 버튼 추가 |

---

### 기술 구현 세부사항

1. **xlsx-js-style 활용**: 기존 스타일 상수(STYLES) 재사용
2. **데이터 소스**: `recentApprovals` 배열에서 추출
3. **항암제 키워드**: `supabase/functions/fetch-drug-data/index.ts`에서 추출
4. **다중 시트 생성**: 
   - `XLSX.utils.book_append_sheet(workbook, dataSheet, 'Data')`
   - `XLSX.utils.book_append_sheet(workbook, docSheet, '설명')`

