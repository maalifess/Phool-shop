import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status?: string;
  className?: string;
}

const orderStatuses = [
  { value: 'Under Process', label: 'Under Process', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'Confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'In Progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'Ready', label: 'Ready', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'Dispatched', label: 'Dispatched', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'Completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'Delivered', label: 'Delivered', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
];

export const OrderStatusBadge = ({ status = 'Under Process', className = "" }: OrderStatusBadgeProps) => {
  const statusConfig = orderStatuses.find(s => s.value === status) || orderStatuses[0];
  
  return (
    <Badge 
      className={`border ${statusConfig.color} ${className}`}
    >
      {statusConfig.label}
    </Badge>
  );
};
