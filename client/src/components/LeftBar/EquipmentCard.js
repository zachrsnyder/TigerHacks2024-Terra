import React, { useState } from 'react';
import { Tractor, Trash2, Edit2, Eye } from 'lucide-react';
import AssignToPlotModal from './AssignToPlotModal';
import ViewEquipmentModal from './ViewEquipmentModal';

const EquipmentCard = ({ equipment, onDelete, onEdit }) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowAssignModal(true)}
        className="w-full" 
      >
        <div className="group relative overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 
                      rounded-lg p-4 transform transition-all duration-200 hover:bg-white/20 
                      hover:scale-[1.02] hover:shadow-lg hover:border-white/30 mb-2 w-full" 
        >
          <div className="flex justify-between items-start w-full">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-primary/20">
                <Tractor className="text-primary" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-white">{equipment.Name}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/70">
                    {equipment.VehicleID}
                  </span>
                  <span className="text-xs text-white/50">{equipment.Type}</span>
                </div>
              </div>
            </div>
            <div className="absolute top-3 right-2 h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowViewModal(true);
                }}
                className="absolute top-0 left-0 p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <Eye className="text-white/70 hover:text-white" size={16}/>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(equipment);
                }}
                className="absolute top-0 right-0 p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <Edit2 className="text-white/70 hover:text-white" size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(equipment.id);
                }}
                className="absolute bottom-0 right-0 p-1 hover:bg-red-500/20 rounded-full transition-colors"
              >
                <Trash2 className="text-red-400" size={16} />
              </button>
            </div>
          </div>
          {equipment.Notes && (
            <p className="mt-3 text-sm text-white/70 border-t border-white/10 pt-3">
              {equipment.Notes}
            </p>
          )}
        </div>
      </button>

      <ViewEquipmentModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        equipment={equipment}
      />
      <AssignToPlotModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        item={equipment}
        type="equipment"
      />
    </>
  );
};

export default EquipmentCard;