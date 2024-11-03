import React from 'react';
import { AlertCircle } from 'lucide-react';

const SidebarGuide = () => {
  return (
    <div className="absolute left-16 z-20 animate-bounce" style={{ top: '300px' }}>  {/* Using direct pixel value */}
      <div className="relative">
        {/* Arrow pointing to the sidebar toggle */}
        <div className="absolute top-1/2 -left-4 w-0 h-0 
          border-t-[12px] border-t-transparent
          border-r-[16px] border-r-primary
          border-b-[12px] border-b-transparent">
        </div>
        
        {/* Guide message */}
        <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-lg shadow-xl max-w-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Open the Sidebar</h4>
              <p className="text-gray-600 text-sm">
                Click here to access your field information and equipment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarGuide;