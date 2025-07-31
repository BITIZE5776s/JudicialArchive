import { type DocumentWithDetails } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FILE_TYPE_ICONS, STATUS_COLORS } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface DocumentListItemProps {
  document: DocumentWithDetails;
  onViewDocument?: (id: string) => void;
}

export function DocumentListItem({ document, onViewDocument }: DocumentListItemProps) {
  const getFileIcon = (fileType?: string) => {
    if (!fileType) return FILE_TYPE_ICONS.default;
    return FILE_TYPE_ICONS[fileType as keyof typeof FILE_TYPE_ICONS] || FILE_TYPE_ICONS.default;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'غير محدد';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} ميجابايت`;
  };

  const mainPaper = document.papers[0];
  const timeAgo = formatDistanceToNow(new Date(document.createdAt), { 
    addSuffix: true, 
    locale: ar 
  });

  return (
    <div 
      className="flex items-center space-x-4 space-x-reverse p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
      onClick={() => onViewDocument?.(document.id)}
    >
      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <i className={getFileIcon(mainPaper?.fileType ?? undefined)}></i>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {document.title}
        </h3>
        <div className="flex items-center space-x-4 space-x-reverse mt-1">
          <p className="text-xs text-gray-500">{document.category}</p>
          <p className="text-xs text-gray-500">{timeAgo}</p>
          <p className="text-xs text-gray-500">
            {formatFileSize(mainPaper?.fileSize ?? undefined)}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2 space-x-reverse">
        <Badge 
          className={STATUS_COLORS[document.status as keyof typeof STATUS_COLORS]}
        >
          {document.status}
        </Badge>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
          <i className="fas fa-ellipsis-v"></i>
        </Button>
      </div>
    </div>
  );
}
