import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailStatistics {
  totalCount: number;
  cancerTypeStats: Record<string, number>;
  approvalTypeStats: Record<string, number>;
  manufactureStats: { import: number; domestic: number };
  mechanismStats: Record<string, number>;
}

interface EmailRequest {
  recipients: string[];
  subject: string;
  dateRangeText: string;
  statistics: EmailStatistics;
  additionalNote?: string;
  attachExcel: boolean;
  excelBase64?: string;
  excelFilename?: string;
  dashboardUrl: string;
}

// 통계를 문자열로 포맷팅
const formatStats = (stats: Record<string, number>): string => {
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => `${key}(${value}건)`)
    .join(", ");
};

// HTML 이메일 템플릿 생성
const generateEmailHtml = (
  dateRangeText: string,
  statistics: EmailStatistics,
  additionalNote: string | undefined,
  dashboardUrl: string,
  attachExcel: boolean,
  excelFilename?: string
): string => {
  const cancerStats = formatStats(statistics.cancerTypeStats);
  const approvalStats = formatStats(statistics.approvalTypeStats);
  const mechanismStats = Object.keys(statistics.mechanismStats).length > 0
    ? formatStats(statistics.mechanismStats)
    : "분석 중";

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MFDS 항암제 승인현황 리포트</title>
</head>
<body style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.6; color: #1f2937; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
    
    <!-- 헤더 -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 24px 32px;">
      <h1 style="margin: 0; font-size: 24px; font-weight: bold;">📋 MFDS 항암제 승인현황 리포트</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">식품의약품안전처 허가 데이터 기반</p>
    </div>
    
    <!-- 기간 정보 -->
    <div style="background-color: #f0f9ff; padding: 16px 32px; border-bottom: 1px solid #e0e7ff;">
      <p style="margin: 0; font-size: 16px;">
        <strong>📅 승인기간:</strong> ${dateRangeText}
      </p>
    </div>
    
    <!-- 요약 통계 -->
    <div style="padding: 24px 32px;">
      <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">📊 요약 통계</h2>
      
      <!-- 총 승인 품목 -->
      <div style="background-color: #dbeafe; border-radius: 8px; padding: 16px; margin-bottom: 16px; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #1e40af;">총 승인 품목</p>
        <p style="margin: 4px 0 0 0; font-size: 32px; font-weight: bold; color: #1e3a8a;">${statistics.totalCount}건</p>
      </div>
      
      <!-- 통계 그리드 -->
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; vertical-align: top;">
            <strong style="color: #374151;">🔹 암종별 분포</strong>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">${cancerStats}</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; background-color: #ffffff; border: 1px solid #e2e8f0; vertical-align: top;">
            <strong style="color: #374151;">🔹 허가유형별 분포</strong>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">${approvalStats}</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; vertical-align: top;">
            <strong style="color: #374151;">🔹 제조/수입 비율</strong>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">수입(${statistics.manufactureStats.import}건), 제조(${statistics.manufactureStats.domestic}건)</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; background-color: #ffffff; border: 1px solid #e2e8f0; vertical-align: top;">
            <strong style="color: #374151;">🔹 작용기전별 분포</strong>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">${mechanismStats}</p>
          </td>
        </tr>
      </table>
    </div>
    
    ${additionalNote ? `
    <!-- 추가 메모 -->
    <div style="padding: 0 32px 24px 32px;">
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0;">
        <strong style="color: #92400e;">📝 추가 메모</strong>
        <p style="margin: 8px 0 0 0; color: #78350f;">${additionalNote}</p>
      </div>
    </div>
    ` : ''}
    
    ${attachExcel && excelFilename ? `
    <!-- 첨부파일 정보 -->
    <div style="padding: 0 32px 24px 32px;">
      <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px;">
        <p style="margin: 0; color: #166534;">
          <strong>📎 첨부파일:</strong> ${excelFilename}
        </p>
      </div>
    </div>
    ` : ''}
    
    <!-- 대시보드 링크 -->
    <div style="padding: 0 32px 32px 32px;">
      <a href="${dashboardUrl}" style="display: block; background-color: #1e40af; color: white; text-align: center; padding: 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
        🔗 대시보드 바로가기
      </a>
      <p style="margin: 8px 0 0 0; text-align: center; font-size: 12px; color: #9ca3af;">${dashboardUrl}</p>
    </div>
    
  </div>
  
  <!-- 푸터 -->
  <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">본 이메일은 MFDS 항암제 승인현황 대시보드에서 자동 발송되었습니다.</p>
    <p style="margin: 4px 0 0 0;">데이터 출처: 식품의약품안전처 공공데이터포털</p>
  </div>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured. Please add it in the project secrets.");
    }

    const resend = new Resend(RESEND_API_KEY);

    const {
      recipients,
      subject,
      dateRangeText,
      statistics,
      additionalNote,
      attachExcel,
      excelBase64,
      excelFilename,
      dashboardUrl,
    }: EmailRequest = await req.json();

    // 유효성 검사
    if (!recipients || recipients.length === 0) {
      throw new Error("No recipients provided");
    }

    if (!subject || !dateRangeText || !statistics) {
      throw new Error("Missing required fields: subject, dateRangeText, or statistics");
    }

    // HTML 이메일 생성
    const emailHtml = generateEmailHtml(
      dateRangeText,
      statistics,
      additionalNote,
      dashboardUrl,
      attachExcel,
      excelFilename
    );

    // 첨부파일 준비
    const attachments = attachExcel && excelBase64 && excelFilename
      ? [{
          filename: excelFilename,
          content: excelBase64,
        }]
      : undefined;

    // 이메일 발송
    const emailResponse = await resend.emails.send({
      from: "MFDS 대시보드 <onboarding@resend.dev>",
      to: recipients,
      subject: subject,
      html: emailHtml,
      attachments,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent to ${recipients.length} recipient(s)`,
        id: emailResponse.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-approval-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
