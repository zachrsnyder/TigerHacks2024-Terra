import React from 'react';
import { Plus } from 'lucide-react';

export const SectionHeader = ({ title, icon: Icon, isOpen, onToggle, onAdd }) => (
  <div className="flex items-center justify-between p-4 border-b border-white/10">
    <div 
      onClick={onToggle}
      className="flex items-center space-x-3 cursor-pointer group"
    >
      <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
        <Icon className="text-white" size={20} />
      </div>
      <h3 className="text-lg font-medium text-white">{title}</h3>
    </div>
    {title != "Plots" && (
      <button 
        onClick={onAdd}
        className="p-2 rounded-full hover:bg-white/10 transition-colors group"
      >
        <Plus className="text-white/70 group-hover:text-white transition-colors" size={20} />
      </button>
    )}
    
      
  </div>
);

export const SectionContent = ({ children, isLoading }) => (
  <div className="p-4 space-y-4">
    {isLoading ? (
      <div className="text-white/70 text-center py-4">Loading...</div>
    ) : (
      children
    )}
  </div>
);