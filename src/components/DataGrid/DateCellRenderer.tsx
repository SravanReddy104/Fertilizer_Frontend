import React from 'react';
import dayjs from 'dayjs';

interface DateCellRendererProps {
  value: string;
  format?: string;
}

const DateCellRenderer: React.FC<DateCellRendererProps> = ({ 
  value, 
  format = 'DD/MM/YYYY' 
}) => {
  if (!value) return <span>-</span>;

  const formattedDate = dayjs(value).format(format);
  const isToday = dayjs(value).isSame(dayjs(), 'day');
  const isPast = dayjs(value).isBefore(dayjs(), 'day');

  return (
    <span 
      className={`
        ${isToday ? 'text-blue-600 font-medium' : ''}
        ${isPast ? 'text-red-600' : 'text-gray-900'}
      `}
    >
      {formattedDate}
    </span>
  );
};

export default DateCellRenderer;
