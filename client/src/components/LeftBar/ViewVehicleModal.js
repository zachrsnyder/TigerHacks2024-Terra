import React from 'react';
import { X, Calendar, Clock, Car, Info, MapPin, Wrench } from 'lucide-react';

const ViewVehicleModal = ({ isOpen, onClose, vehicle }) => {
  if (!isOpen || !vehicle) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative backdrop-blur-md bg-white/30 rounded-lg shadow-2xl w-full max-w-md mx-4 border border-white/20">
        <div className="flex justify-between items-center p-4 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white">Vehicle Details</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{vehicle.Name}</h3>
                <p className="text-white/70">{vehicle.Manufacturer}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/20">
                <Car className="text-secondary" size={24} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 rounded-full bg-white/10 text-sm text-white/70">
                {vehicle.VehicleID}
              </span>
              <span className="px-2 py-1 rounded-full bg-white/10 text-sm text-white/70">
                {vehicle.Type}
              </span>
              {vehicle.fuelType && (
                <span className="px-2 py-1 rounded-full bg-blue-500/20 text-sm text-blue-300">
                  {vehicle.fuelType}
                </span>
              )}
            </div>
          </div>

          {/* Status Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="text-white/70" size={16} />
                <span className="text-sm font-medium text-white">Status</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {vehicle.active ? 'Active' : 'Inactive'}
              </p>
            </div>
            
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="text-white/70" size={16} />
                <span className="text-sm font-medium text-white">Assignment</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {vehicle.assignedPlotId ? 'Assigned' : 'Unassigned'}
              </p>
            </div>
          </div>

          {/* Dates Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-white/70" size={16} />
              <span className="text-sm text-white">Created: {formatDate(vehicle.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-white/70" size={16} />
              <span className="text-sm text-white">Last Updated: {formatDate(vehicle.updatedAt)}</span>
            </div>
          </div>

          {/* Notes Section */}
          {vehicle.Notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="text-white/70" size={16} />
                <span className="text-sm font-medium text-white">Notes</span>
              </div>
              <p className="text-white/70 text-sm p-3 bg-white/10 rounded-lg">
                {vehicle.Notes}
              </p>
            </div>
          )}

          {/* Cost Per Acre */}
          {vehicle.costPerAcre && (
            <div className="p-4 bg-white/10 rounded-lg">
              <span className="text-sm text-white/70">Cost Per Acre</span>
              <p className="text-lg font-semibold text-white">
                ${vehicle.costPerAcre.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewVehicleModal;
