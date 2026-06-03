import React from 'react';
import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';

interface EmptyProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const Empty: React.FC<EmptyProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {icon || <Package className="w-8 h-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 text-center mb-4">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

// 加载状态
interface LoadingProps {
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ text = '加载中...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
};

// 骨架屏
interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded-lg',
        className
      )}
    />
  );
};

// 骨架卡片
export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <Skeleton className="h-4 w-3/4 mb-3" />
      <Skeleton className="h-3 w-1/2 mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
};
