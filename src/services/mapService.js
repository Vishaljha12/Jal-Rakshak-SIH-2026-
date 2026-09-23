// For now, this loads the mock JSON directly, but eventually will call the API
import mockFloodData from '../data/mock/flood.geojson?url'; // Vite way to get URL of asset

export const getFloodGeoJSON = async () => {
  try {
    const res = await fetch(mockFloodData);
    if (!res.ok) throw new Error("Failed to load geojson");
    return await res.json();
  } catch (error) {
    console.error("Error loading mock flood geojson:", error);
    return null;
  }
};
