import { Pill, FlaskConical, Sparkles, Dna, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalTypeBadgeProps {
  approvalType?: string;
  className?: string;
}

// 허가유형별 스타일 및 아이콘 정의
const getApprovalTypeConfig = (approvalType: string) => {
  // 키워드 기반 분류
  const isNewDrug = approvalType.includes('신약');
  const isGeneric = approvalType.includes('제네릭');
  const isOrphan = approvalType.includes('희귀');
  const isBiotech = approvalType.includes('유전자재조합') || approvalType.includes('세포배양');
  const isDataSubmission = approvalType.includes('자료제출');

  // 복합 유형 처리
  if (isOrphan && isBiotech && isDataSubmission) {
    return {
      icon: Dna,
      bgColor: 'bg-purple-500/15',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-500/30',
    };
  }

  if (isNewDrug && isBiotech) {
    return {
      icon: Dna,
      bgColor: 'bg-blue-500/15',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-500/30',
    };
  }

  if (isOrphan && isBiotech) {
    return {
      icon: Dna,
      bgColor: 'bg-purple-500/15',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-500/30',
    };
  }

  if (isNewDrug) {
    return {
      icon: Sparkles,
      bgColor: 'bg-blue-500/15',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-500/30',
    };
  }

  if (isOrphan) {
    return {
      icon: FlaskConical,
      bgColor: 'bg-purple-500/15',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-500/30',
    };
  }

  if (isGeneric) {
    return {
      icon: Pill,
      bgColor: 'bg-emerald-500/15',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500/30',
    };
  }

  // 기본값
  return {
    icon: FileText,
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
    borderColor: 'border-muted',
  };
};

const ApprovalTypeBadge = ({ approvalType, className }: ApprovalTypeBadgeProps) => {
  if (!approvalType || approvalType === '-') {
    return <span className="text-muted-foreground text-xs">-</span>;
  }

  const config = getApprovalTypeConfig(approvalType);
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium',
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
      title={approvalType}
    >
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="truncate max-w-[200px]">{approvalType}</span>
    </div>
  );
};

export default ApprovalTypeBadge;
