import React from 'react';
import { Map } from 'lucide-react';
import { useMap } from '../../contexts/MapContext';

const PlotCard = ({ data, setSelectedPlot, selectedPlot }) => {
  const { centerMap } = useMap();
  const isSelected = selectedPlot?.id === data.id;

  // Handle click event on plot card
  const handleClick = () => {
    if (selectedPlot?.id !== data.id) {
      setSelectedPlot(data);
      centerMap({ lng: data.center[1], lat: data.center[0] }, data.area);
    } else {
      setSelectedPlot(null);
    }
  };
  
  // Return the plot card component
  return (
    <div
      onClick={handleClick}
      className={`
        group relative overflow-hidden
        bg-white/10 backdrop-blur-lg
        border ${isSelected ? 'border-primary' : 'border-white/20'}
        rounded-lg p-4 mx-2 my-1
        transform transition-all duration-200
        hover:bg-white/20 hover:scale-[1.02] hover:shadow-lg hover:border-white/30
        cursor-pointer
      `}
    >
      <div className="flex items-center space-x-4">
        <div className={`
          p-2 rounded-lg
          ${isSelected ? 'bg-primary/20' : 'bg-white/10'}
        `}>
          <Map className={`
            ${isSelected ? 'text-primary' : 'text-text/70'}
          `} size={20} />
        </div>
        <div>
          <h4 className="font-medium text-text">{data.name}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-text/50">
              {`${data.center[0].toFixed(6)}, ${data.center[1].toFixed(6)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlotCard;