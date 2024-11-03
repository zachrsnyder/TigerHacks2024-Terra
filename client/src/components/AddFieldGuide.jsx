import React from 'react';
import { AlertCircle } from 'lucide-react';

const AddFieldGuide = () => {
    return (
      <div className="absolute top-44 right-8 z-20 animate-bounce">  {/* Changed from top-32 to top-44 */}
        <div className="relative">
          {/* Arrow pointing to the Add Field button */}
          <div className="absolute -top-4 right-20 w-0 h-0 
            border-l-[12px] border-l-transparent
            border-b-[16px] border-b-primary
            border-r-[12px] border-r-transparent">
          </div>
          
          {/* Guide message */}
          <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-lg shadow-xl max-w-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Add Your First Field</h4>
                <p className="text-gray-600 text-sm">
                  Click the "Add Field" button to draw your first field on the map
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default AddFieldGuide;