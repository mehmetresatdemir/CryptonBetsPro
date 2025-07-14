import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: number;
}

const StatCard = ({ title, value, description, icon, trend }: StatCardProps) => {
  const isTrendPositive = trend && trend > 0;
  const trendColor = isTrendPositive ? 'text-green-500' : 'text-red-500';
  const trendIcon = isTrendPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;

  return (
    <Card className="border-gray-800 bg-gray-950/50 text-white shadow-md hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          {icon && <div className="p-2 bg-gray-900/50 rounded-md text-yellow-500">{icon}</div>}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-white">{value}</p>
          <div className="flex items-center mt-1 space-x-2">
            {description && <p className="text-xs text-gray-400">{description}</p>}
            {trend !== undefined && (
              <div className={`flex items-center text-xs font-medium ${trendColor}`}>
                {trendIcon}
                <span className="ml-1">{Math.abs(trend).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;