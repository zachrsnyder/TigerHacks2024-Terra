import React from 'react';
import { Car, Trash2 } from 'lucide-react';

const VehicleCard = ({ vehicle, onDelete }) => {
  return (
    <div className="bg-secondary/50 p-3 rounded-lg hover:bg-secondary/70 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <Car className="text-text" size={20} />
          <div>
            <h3 className="text-text font-medium">{vehicle.Name}</h3>
            <p className="text-text/70 text-sm">{vehicle.VehicleID}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(vehicle.id)}
          className="text-red-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;