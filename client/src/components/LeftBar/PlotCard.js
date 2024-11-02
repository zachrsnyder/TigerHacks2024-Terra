import React from 'react';
import { useMap } from '../../contexts/MapContext';

const PlotCard = ({data, setSelectedPlot, selectedPlot}) => {
    const { centerMap } = useMap();

    const handleClick = () => {
        console.log(selectedPlot)
        console.log(data)
        if(selectedPlot == null || selectedPlot.id != data.id){
          setSelectedPlot(data)
          let lat = data.center[0]
          let lng = data.center[1]
          console.log(lat, lng)
          centerMap({ lng , lat }) 
        }else if(selectedPlot.id == data.id){
          setSelectedPlot(null)
        }
    }


  return (
    <>
    <div className=' rounded-md shadow-md hover:bg-primary-hover mx-2 my-[.1rem] bg-primary hover:cursor-pointer' onClick={handleClick}>
        <p className='text-xl'>{data.name}</p>
    </div>
    </>
  )
}

export default PlotCard