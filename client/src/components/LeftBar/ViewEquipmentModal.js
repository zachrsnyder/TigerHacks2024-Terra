import React from 'react';
import { X, Calendar, Clock, Info, MapPin, Wrench, Tractor } from 'lucide-react';

const ViewEquipmentModal = ({ isOpen, onClose, equipment }) => {
  if (!isOpen || !equipment) return null;

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
          <h2 className="text-xl font-semibold text-white">Equipment Details</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{equipment.Name}</h3>
                <p className="text-white/70">{equipment.Manufacturer}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/20">
                <Tractor className="text-primary" size={24} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 rounded-full bg-white/10 text-sm text-white/70">
                {equipment.VehicleID}
              </span>
              <span className="px-2 py-1 rounded-full bg-white/10 text-sm text-white/70">
                {equipment.Type}
              </span>
            </div>
          </div>

          {/* Equipment Category Info */}
          <div className="p-4 bg-white/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="text-white/70" size={16} />
              <span className="text-sm font-medium text-white">Equipment Category</span>
            </div>
            <p className="text-lg font-semibold text-white">
              {equipment.Type}
            </p>
          </div>

          {/* Status Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-white/70" size={16} />
                <span className="text-sm font-medium text-white">Status</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {equipment.active ? 'Active' : 'Inactive'}
              </p>
            </div>
            
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="text-white/70" size={16} />
                <span className="text-sm font-medium text-white">Assignment</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {equipment.assignedPlotId ? 'Assigned' : 'Unassigned'}
              </p>
            </div>
          </div>

          {/* Dates Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-white/70" size={16} />
              <span className="text-sm text-white">Created: {formatDate(equipment.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-white/70" size={16} />
              <span className="text-sm text-white">Last Updated: {formatDate(equipment.updatedAt)}</span>
            </div>
          </div>

          {/* Notes Section */}
          {equipment.Notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="text-white/70" size={16} />
                <span className="text-sm font-medium text-white">Notes</span>
              </div>
              <p className="text-white/70 text-sm p-3 bg-white/10 rounded-lg">
                {equipment.Notes}
              </p>
            </div>
          )}

          {/* Maintenance Status - Optional section that could be added */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="text-white/70" size={16} />
                <span className="text-sm font-medium text-white">Usage</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {equipment.usage || 'Not Tracked'}
              </p>
            </div>

            <div className="p-4 bg-white/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-white/70" size={16} />
                <span className="text-sm font-medium text-white">Next Service</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {equipment.nextService ? formatDate(equipment.nextService) : 'Not Scheduled'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEquipmentModal;
