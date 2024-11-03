export default function calculateZoomFromArea(areaInSquareMeters) {
    // Constants for zoom calculation
    const MAX_ZOOM = 21;
    const MIN_ZOOM = 1;
    
    // Convert area to square kilometers for easier calculations
    const areaInKm2 = areaInSquareMeters / 1000000;
    
    // Simple linear scaling
    // logarithm allows it to be less sensitve to more drastic changes in area.
    const zoomLevel = 14 - (1.5 * Math.log10(areaInKm2 + 0.001));
    
    // Ensure zoom stays within valid bounds
    return Math.min(Math.max(Math.round(zoomLevel), MIN_ZOOM), MAX_ZOOM);
}
