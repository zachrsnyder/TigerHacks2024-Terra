import React from 'react';
import { Map } from 'lucide-react';
import { useMap } from '../../contexts/MapContext';

const PlotCard = ({ data, setSelectedPlot, selectedPlot }) => {
  const { centerMap } = useMap();
  const isSelected = selectedPlot?.id === data.id;

  const handleClick = () => {
    if (selectedPlot?.id !== data.id) {
      setSelectedPlot(data);
      centerMap({ lng: data.center[1], lat: data.center[0] });
    } else {
      setSelectedPlot(null);
    }
  };

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
            ${isSelected ? 'text-primary' : 'text-white/70'}
          `} size={20} />
        </div>
        <div>
          <h4 className="font-medium text-white">{data.name}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-white/50">
              {`${data.center[0].toFixed(6)}, ${data.center[1].toFixed(6)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlotCard;