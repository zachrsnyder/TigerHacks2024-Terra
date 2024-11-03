import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, Search } from 'lucide-react';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

// Success modal component that appears when an item is successfully assigned to a plot
const SuccessModal = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100]">
      <div className="relative backdrop-blur-md bg-black/30 px-8 py-6 rounded-lg shadow-2xl border border-green-500/20 max-w-sm mx-4 text-center">
        <div className="flex flex-col items-center gap-3">
          <CheckCircle className="text-green-500" size={32} />
          <p className="text-white text-lg">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Modal component for assigning a vehicle or equipment item to a plot
const AssignToPlotModal = ({ isOpen, onClose, item, type }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [plots, setPlots] = useState([]);
  const [filteredPlots, setFilteredPlots] = useState([]);
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch plots from Firestore
  useEffect(() => {
    const fetchPlots = async () => {
      if (!isOpen || !currentUser) return;
      
      // Fetch plots from Firestore
      setIsLoading(true);
      try {
        // Get plots collection reference
        const plotsCollectionRef = collection(db, 'farms', currentUser.uid, 'plots');
        const plotsSnapshot = await getDocs(plotsCollectionRef);

        // Map plots data and add assignedVehicles and assignedEquipment fields
        const plotsData = plotsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          assignedVehicles: doc.data().assignedVehicles || [],
          assignedEquipment: doc.data().assignedEquipment || []
        }));
        
        // Set plots and filteredPlots state
        setPlots(plotsData);
        setFilteredPlots(plotsData);
      } catch (err) {
        console.error('Error fetching plots:', err);
        setError('Failed to fetch plots');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlots();
  }, [currentUser, isOpen]);

  // Filter plots based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPlots(plots);
      return;
    }

    // Filter plots based on search term
    const filtered = plots.filter(plot => {
      const searchLower = searchTerm.toLowerCase();
      return (
        plot.name?.toLowerCase().includes(searchLower) ||
        plot.notes?.toLowerCase().includes(searchLower) ||
        plot.crop?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredPlots(filtered);
  }, [searchTerm, plots]);

  // Assign the item to the selected plot
  const handleAssign = async (plot) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Update the item with its new plot assignment and active status
      const itemRef = doc(db, 'farms', currentUser.uid, type, item.id);
      await updateDoc(itemRef, {
        assignedPlotId: plot.id,
        active: true,
        updatedAt: new Date().toISOString()
      });

      // Update the plots assigned items array
      const plotRef = doc(db, 'farms', currentUser.uid, 'plots', plot.id);
      const assignmentField = type === 'vehicles' ? 'assignedVehicles' : 'assignedEquipment';
      const currentAssignments = plot[assignmentField] || [];
      
      // Add the item if its not already in the array
      if (!currentAssignments.includes(item.id)) {
        await updateDoc(plotRef, {
          [assignmentField]: [...currentAssignments, item.id],
          updatedAt: new Date().toISOString()
        });
      }

      // Show success message and close the modal after 1.5 seconds
      setSuccessMessage(`${item.Name} has been assigned to ${plot.name}`);
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      setError(`Failed to assign ${type}: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if the item is already assigned to the selected plot
  const isItemAssignedToPlot = (plotId) => {
    return item.assignedPlotId === plotId;
  };

  // Close the modal if its not open
  if (!isOpen && !showSuccess) return null;

  return (
    <>
      {showSuccess ? (
        <SuccessModal 
          message={successMessage}
          onClose={() => {
            setShowSuccess(false);
            onClose();
          }}
        />
      ) : (
        <div className="fixed inset-0 flex items-center justify-center z-[150] overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <div className="relative backdrop-blur-md bg-white/30 rounded-lg shadow-2xl w-full max-w-md mx-4 border border-white/20">
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <h2 className="text-xl font-semibold text-white">
                Assign {item.Name} to Plot
              </h2>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <div className="p-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm text-black"
                  placeholder="Search plots..."
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                ) : filteredPlots.length > 0 ? (
                  filteredPlots.map((plot) => (
                    <button
                      key={plot.id}
                      onClick={() => handleAssign(plot)}
                      disabled={isSubmitting || (item.assignedPlotId && item.assignedPlotId !== plot.id)}
                      className={`w-full p-4 rounded-lg transition-colors border text-left ${
                        isItemAssignedToPlot(plot.id)
                          ? 'bg-green-500/20 border-green-500/30 hover:bg-green-500/30'
                          : item.assignedPlotId
                          ? 'bg-gray-500/20 border-gray-500/30 cursor-not-allowed'
                          : 'bg-white/10 border-white/20 hover:bg-white/20'
                      }`}
                    >
                      <h3 className="text-white font-medium">{plot.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white/70 text-sm">
                          {(plot.area / 4046.86).toFixed(2)} acres
                        </span>
                        {plot.crop && (
                          <span className="text-white/70 text-sm border border-white/20 px-2 py-0.5 rounded">
                            {plot.crop}
                          </span>
                        )}
                      </div>
                      {isItemAssignedToPlot(plot.id) ? (
                        <span className="text-green-400 text-sm mt-1 block">
                          Currently assigned
                        </span>
                      ) : item.assignedPlotId ? (
                        <span className="text-gray-400 text-sm mt-1 block">
                          Already assigned to another plot
                        </span>
                      ) : null}
                    </button>
                  ))
                ) : (
                  <p className="text-center text-white/70 py-4">
                    {searchTerm ? 'No plots match your search' : 'No plots available'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}    
    </>
  );
};

export default AssignToPlotModal;