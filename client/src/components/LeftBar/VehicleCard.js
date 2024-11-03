import React, { useState } from 'react';
import { Car, Trash2, Edit2 } from 'lucide-react';
import AssignToPlotModal from './AssignToPlotModal';
import { Eye } from 'lucide-react';
import ViewVehicleModal from './ViewVehicleModal';


const VehicleCard = ({ vehicle, onDelete, onEdit }) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showView, setShowView] = useState(false)

  return(
  <>
  <button onClick={() => setShowAssignModal(true)}>
  <div className="group relative overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-4 transform transition-all duration-200 hover:bg-white/20 hover:scale-[1.02] hover:shadow-lg hover:border-white/30">
    <div className="flex justify-between items-start">
      <div className="flex items-center space-x-4">
        <div className="p-2 rounded-lg bg-secondary/20">
          <Car className="text-secondary" size={20} />
        </div>
        <div>
          <h4 className="font-medium text-white">{vehicle.Name}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/70">
              {vehicle.VehicleID}
            </span>
            {vehicle.fuelType && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-xs text-blue-300">
                {vehicle.fuelType}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
            onClick={(e) => {
              e.stopPropagation();
              setShowView(true)
            }}
            className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <Eye className="text-white/70 hover:text-white" size={16}/>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(vehicle);
          }}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <Edit2 className="text-white/70 hover:text-white" size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(vehicle.id);
          }}
          className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
        >
          <Trash2 className="text-red-400" size={16} />
        </button>
      </div>
    </div>
  </div>
  </button>

  <ViewVehicleModal
  isOpen={showView}
  onClose={() => setShowView(false)}
  vehicle={vehicle}
  />

  <AssignToPlotModal
  isOpen={showAssignModal}
  onClose={() => setShowAssignModal(false)}
  item={vehicle}
  type="vehicle"
  />
</>
)};

export default VehicleCard;