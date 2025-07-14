import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const TimeRangeSelector = ({ value, onChange }: TimeRangeSelectorProps) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-400">Zaman Aralığı:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-36 bg-gray-900 border-gray-700 text-white">
          <SelectValue placeholder="Zaman aralığı seç" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-700 text-white">
          <SelectItem value="today">Bugün</SelectItem>
          <SelectItem value="yesterday">Dün</SelectItem>
          <SelectItem value="week">Bu Hafta</SelectItem>
          <SelectItem value="month">Bu Ay</SelectItem>
          <SelectItem value="year">Bu Yıl</SelectItem>
          <SelectItem value="all">Tüm Zamanlar</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeRangeSelector;