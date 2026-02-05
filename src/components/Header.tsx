 import { Pill, FileDown } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { exportDocumentationExcel } from '@/utils/exportDocumentation';
 
 const Header = () => {
   return (
     <header className="gradient-header text-primary-foreground">
       <div className="container py-6">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-foreground/15 backdrop-blur-sm">
               <Pill className="w-6 h-6" />
             </div>
             <div>
               <h1 className="text-2xl font-bold tracking-tight">MFDS 항암제 승인현황</h1>
               <p className="text-primary-foreground/80 text-sm mt-0.5">
                 식품의약품안전처 항암제 허가 데이터 대시보드
               </p>
             </div>
           </div>
           <Button
             variant="secondary"
             size="sm"
             onClick={exportDocumentationExcel}
             className="flex items-center gap-2 bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground border-0"
           >
             <FileDown className="w-4 h-4" />
             <span className="hidden sm:inline">문서화 다운로드</span>
           </Button>
         </div>
       </div>
     </header>
   );
 };
 
 export default Header;
