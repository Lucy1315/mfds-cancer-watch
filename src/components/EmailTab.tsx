import { useState, useMemo } from 'react';
import { Mail, Send, Paperclip, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ExtendedDrugApproval } from '@/data/recentApprovals';
import { FilterState } from '@/components/FilterPanel';
import { 
  calculateStatistics, 
  getDateRangeText, 
  generateEmailPreview,
  generateExcelFilename,
  DASHBOARD_URL,
  EmailStatistics 
} from '@/utils/emailDataGenerator';
import { generateExcelBase64 } from '@/utils/excelExport';
import { supabase } from '@/integrations/supabase/client';

interface EmailTabProps {
  data: ExtendedDrugApproval[];
  filters: FilterState;
}

const EmailTab = ({ data, filters }: EmailTabProps) => {
  const { toast } = useToast();
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('MFDS 항암제 승인현황 리포트');
  const [additionalNote, setAdditionalNote] = useState('');
  const [attachExcel, setAttachExcel] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // 기간 텍스트 및 통계 계산
  const dateRangeText = useMemo(() => getDateRangeText(filters), [filters]);
  const statistics = useMemo(() => calculateStatistics(data), [data]);
  const emailPreview = useMemo(
    () => generateEmailPreview(dateRangeText, statistics, additionalNote),
    [dateRangeText, statistics, additionalNote]
  );
  const excelFilename = useMemo(() => generateExcelFilename(filters), [filters]);

  // 수신자 이메일 파싱
  const parseRecipients = (input: string): string[] => {
    return input
      .split(/[,\n;]/)
      .map((email) => email.trim())
      .filter((email) => email && email.includes('@'));
  };

  // 이메일 발송
  const handleSendEmail = async () => {
    const recipientList = parseRecipients(recipients);

    if (recipientList.length === 0) {
      toast({
        title: '수신자 오류',
        description: '유효한 이메일 주소를 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);

    try {
      // 엑셀 Base64 생성 (첨부 선택 시)
      let excelBase64: string | undefined;
      if (attachExcel) {
        const dateRange = {
          start: filters.startDate ? filters.startDate.toISOString().split('T')[0] : '',
          end: filters.endDate ? filters.endDate.toISOString().split('T')[0] : '',
        };
        excelBase64 = generateExcelBase64(data, { dateRange });
      }

      // Edge Function 호출
      const { data: response, error } = await supabase.functions.invoke('send-approval-email', {
        body: {
          recipients: recipientList,
          subject,
          dateRangeText,
          statistics,
          additionalNote: additionalNote || undefined,
          attachExcel,
          excelBase64,
          excelFilename,
          dashboardUrl: DASHBOARD_URL,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: '이메일 발송 완료',
        description: `${recipientList.length}명에게 이메일이 발송되었습니다.`,
      });

      // 폼 초기화
      setRecipients('');
      setAdditionalNote('');
    } catch (error: any) {
      console.error('Email send error:', error);
      toast({
        title: '이메일 발송 실패',
        description: error.message || '이메일 발송 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 이메일 작성 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            이메일 발송
          </CardTitle>
          <CardDescription>
            필터링된 항암제 승인현황을 이메일로 발송합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 수신자 */}
          <div className="space-y-2">
            <Label htmlFor="recipients">수신자 이메일</Label>
            <Textarea
              id="recipients"
              placeholder="이메일 주소를 입력하세요 (쉼표, 세미콜론 또는 줄바꿈으로 구분)"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {parseRecipients(recipients).length}명의 수신자
            </p>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="subject">제목</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* 기간 표시 */}
          <div className="space-y-2">
            <Label>승인기간</Label>
            <div className="px-3 py-2 bg-muted rounded-md text-sm font-medium">
              {dateRangeText}
            </div>
          </div>

          {/* 통계 요약 */}
          <div className="space-y-2">
            <Label>통계 요약</Label>
            <div className="px-3 py-2 bg-muted rounded-md text-sm space-y-1">
              <p>• 총 승인 품목: <strong>{statistics.totalCount}건</strong></p>
              <p>• 수입: {statistics.manufactureStats.import}건 / 제조: {statistics.manufactureStats.domestic}건</p>
            </div>
          </div>

          {/* 추가 메모 */}
          <div className="space-y-2">
            <Label htmlFor="additionalNote">추가 메모 (선택)</Label>
            <Textarea
              id="additionalNote"
              placeholder="이메일에 추가할 메모를 입력하세요"
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
              rows={2}
            />
          </div>

          {/* 엑셀 첨부 옵션 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="attachExcel"
              checked={attachExcel}
              onCheckedChange={(checked) => setAttachExcel(checked === true)}
            />
            <Label htmlFor="attachExcel" className="flex items-center gap-2 cursor-pointer">
              <Paperclip className="w-4 h-4" />
              엑셀 파일 첨부
            </Label>
          </div>

          {attachExcel && (
            <p className="text-xs text-muted-foreground pl-6">
              📎 {excelFilename}
            </p>
          )}

          {/* 대시보드 링크 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink className="w-4 h-4" />
            대시보드 링크가 이메일에 포함됩니다
          </div>

          {/* 발송 버튼 */}
          <Button
            onClick={handleSendEmail}
            disabled={isSending || !recipients.trim()}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                발송 중...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                이메일 발송
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 미리보기 */}
      <Card>
        <CardHeader>
          <CardTitle>이메일 미리보기</CardTitle>
          <CardDescription>
            발송될 이메일의 내용을 미리 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto">
            {emailPreview}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTab;
