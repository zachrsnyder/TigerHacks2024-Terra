import React from 'react';
import { Tractor, Trash2 } from 'lucide-react'; // Import appropriate icons

const EquipmentCard = ({ equipment, onDelete }) => {
  return (
    <div className="bg-secondary/50 p-3 rounded-lg hover:bg-secondary/70 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <Tractor className="text-text" size={20} />
          <div>
            {/* Displaying Name and Type */}
            <h3 className="text-text font-medium">{equipment.Name} ({equipment.Type})</h3>
            <p className="text-text/70 text-sm">{equipment.VehicleID}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(equipment.id)}
          className="text-red-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
      {equipment.Description && (
        <p className="text-text/70 text-sm mt-2">{equipment.Description}</p>
      )}
    </div>
  );
};

export default EquipmentCard;
