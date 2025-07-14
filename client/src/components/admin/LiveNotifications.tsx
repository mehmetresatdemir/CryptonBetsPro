import React, { useState } from 'react';
import { 
  BellRing, 
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LiveNotifications() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="relative bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <BellRing id="notification-bell" className="h-4 w-4" />
      </Button>
    </div>
  );
}