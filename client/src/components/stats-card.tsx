interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    value: string;
    label: string;
    positive?: boolean;
  };
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  iconColor, 
  trend 
}: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <i className={`${icon} ${iconColor} text-xl`}></i>
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <span 
            className={`text-sm font-medium ${
              trend.positive !== false ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.value}
          </span>
          <span className="text-sm text-gray-500 mr-2">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
