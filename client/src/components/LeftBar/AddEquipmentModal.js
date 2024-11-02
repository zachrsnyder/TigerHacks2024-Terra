import React, { useState } from 'react';
import { X, Upload, Image, Loader2, AlertCircle } from 'lucide-react';

const AddEquipmentModal = ({ isOpen, onClose }) => {
    const [newDocument, setDocument] = useState({
        VehicleID: "",
        Make: "",
        Model: "",
        Type: "",
        Description: "",
    });

    if (!isOpen) return null;
   
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative backdrop-blur-md bg-white/30 rounded-lg shadow-2xl w-full max-w-md mx-4 border border-white/20">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-white/20">
                    <h2 className="text-xl font-semibold text-white">Add Equipment</h2>
                    <button 
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-4">

                    <div>
                        <label className="block text-white text-sm font-medium mb-1">
                            Vehicle ID
                        </label>
                        <input
                            type="text"
                            value={newDocument.VehicleID}
                            onChange={(e) => setDocument({...newDocument, VehicleID: e.target.value})}
                            className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                            placeholder="Enter vehicle ID"
                        />
                    </div>

                    <div>
                        <label className="block text-white text-sm font-medium mb-1">
                            Make
                        </label>
                        <input
                            type="text"
                            value={newDocument.Make}
                            onChange={(e) => setDocument({...newDocument, Make: e.target.value})}
                            className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                            placeholder="Enter vehicle make"
                        />
                    </div>

                    <div>
                        <label className="block text-white text-sm font-medium mb-1">
                            Model
                        </label>
                        <input
                            type="text"
                            value={newDocument.Model}
                            onChange={(e) => setDocument({...newDocument, Model: e.target.value})}
                            className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                            placeholder="Enter vehicle model"
                        />
                    </div>

                    <div>
                        <label className="block text-white text-sm font-medium mb-1">
                            Type
                        </label>
                        <select
                            value={newDocument.Type}
                            onChange={(e) => setDocument({...newDocument, Type: e.target.value})}
                            className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                        >
                            <option value="">Select equipment type</option>
                            <option value="Tractor">Tractor</option>
                            <option value="Harvester">Harvester</option>
                            <option value="Sprayer">Sprayer</option>
                            <option value="Planter">Planter</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-white text-sm font-medium mb-1">
                            Description
                        </label>
                        <textarea
                            value={newDocument.Description}
                            onChange={(e) => setDocument({ ...newDocument, Description: e.target.value })}
                            className="w-full h-20 px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm resize-none"
                            placeholder="Enter a short description"
                        />
                    </div>



                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 border-t border-white/20">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                    >
                        Add Equipment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEquipmentModal;