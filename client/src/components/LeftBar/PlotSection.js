import React, { useState, useEffect } from 'react';
import { Map } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import PlotCard from './PlotCard';
import { SectionHeader, SectionContent } from './SectionComponents';

const PlotSection = ({ pointPlots, setSelectedPlot, selectedPlot }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [plots, setPlots] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        const plotsCollectionRef = collection(db, 'farms', currentUser.uid, 'plots');
        const plotsSnapshot = await getDocs(plotsCollectionRef);
        
        const plotsData = plotsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPlots(plotsData);
      } catch (error) {
        console.error("Error fetching plots:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchPlots();
    }
  }, [currentUser, pointPlots]);

  return (
    <div className="border-b border-white/10">
      <SectionHeader
        title="Plots"
        icon={Map}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        onAdd={() => setShowAddModal(true)}
      />

      {isOpen && (
        <SectionContent isLoading={isLoading}>
          {plots.length > 0 ? (
            <div className="space-y-2">
              {plots.map(plot => (
                <PlotCard
                  key={plot.id}
                  data={plot}
                  setSelectedPlot={setSelectedPlot}
                  selectedPlot={selectedPlot}
                />
              ))}
            </div>
          ) : (
            <div className="text-white/50 text-center py-4">
              No plots added yet
            </div>
          )}
        </SectionContent>
      )}
    </div>
  );
};

export default PlotSection;