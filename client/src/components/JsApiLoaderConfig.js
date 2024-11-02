export const libraries = ["places", "geometry"];

export const loaderOptions = {
  googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  libraries: ["geometry"],
  id: "google-map-script",
};