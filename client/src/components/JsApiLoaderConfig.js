// Define the required Google Maps JavaScript API libraries
export const libraries = ["places", "geometry"];

// Configuration options for loading the Google Maps JavaScript API
export const loaderOptions = {
  googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  libraries: ["geometry"],
  id: "google-map-script",
};