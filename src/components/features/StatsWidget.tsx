
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Calendar, Users, Grid3X3, DollarSign } from 'lucide-react';

interface StatMetric {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

interface StatsWidgetProps {
  metrics: StatMetric[];
}

export function StatsWidget({ metrics }: StatsWidgetProps) {
  const getChangeIcon = (changeType: string) => {
    if (changeType === 'increase') return <TrendingUp className="h-4 w-4 text-ios-green" />;
    if (changeType === 'decrease') return <TrendingDown className="h-4 w-4 text-ios-red" />;
    return null;
  };

  const getChangeColor = (changeType: string) => {
    if (changeType === 'increase') return 'text-ios-green';
    if (changeType === 'decrease') return 'text-ios-red';
    return 'text-enigma-neutral-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="overflow-hidden bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
            <CardTitle className="text-sm font-medium text-enigma-neutral-500 ios-text-footnote uppercase tracking-wide">
              {metric.title}
            </CardTitle>
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: `${metric.color}20` }}
            >
              <metric.icon className="h-5 w-5" style={{ color: metric.color }} />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="ios-text-title1 font-bold text-enigma-neutral-900 mb-1">
              {metric.value}
            </div>
            <div className="flex items-center ios-text-footnote">
              {getChangeIcon(metric.changeType)}
              <span className={`ml-1 font-semibold ${getChangeColor(metric.changeType)}`}>
                {Math.abs(metric.change)}%
              </span>
              <span className="text-enigma-neutral-500 ml-1">vs. ayer</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
