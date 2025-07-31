import { type DocumentWithDetails } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface CaseListItemProps {
  document: DocumentWithDetails;
}

export function CaseListItem({ document }: CaseListItemProps) {
  const timeAgo = formatDistanceToNow(new Date(document.createdAt), { 
    addSuffix: true, 
    locale: ar 
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      'مدنية': 'border-primary-500',
      'جنائية': 'border-secondary-500',
      'تجارية': 'border-accent-500',
      'أسرية': 'border-purple-500',
      'إدارية': 'border-gray-500',
    };
    return colors[category as keyof typeof colors] || 'border-gray-500';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'نشط': 'bg-green-100 text-green-800',
      'معلق': 'bg-yellow-100 text-yellow-800',
      'مؤرشف': 'bg-gray-100 text-gray-800',
      'في المراجعة': 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`border-r-4 ${getCategoryColor(document.category)} pr-4`}>
      <h3 className="text-sm font-medium text-gray-900">
        القضية رقم {document.reference}
      </h3>
      <p className="text-xs text-gray-600 mt-1">
        {document.title}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500">{timeAgo}</span>
        <Badge className={getStatusColor(document.status)}>
          {document.status}
        </Badge>
      </div>
    </div>
  );
}
