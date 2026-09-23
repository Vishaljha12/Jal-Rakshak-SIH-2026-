import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, LayerGroup, ZoomControl, useMap } from 'react-leaflet';
import { getFloodGeoJSON } from '../../services/mapService';

// Controller component to automatically pan and fit bounds to the active flood data
function MapBoundsController({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!data || !data.features || data.features.length === 0) return;

    try {
      // Calculate bounding box from GeoJSON features
      let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
      let hasCoords = false;

      const checkCoords = (coords) => {
        if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
          const lon = coords[0];
          const lat = coords[1];
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
          if (lon < minLon) minLon = lon;
          if (lon > maxLon) maxLon = lon;
          hasCoords = true;
        } else if (Array.isArray(coords)) {
          coords.forEach(checkCoords);
        }
      };

      data.features.forEach(f => {
        if (f.geometry && f.geometry.coordinates) {
          checkCoords(f.geometry.coordinates);
        }
      });

      if (hasCoords && minLat <= maxLat && minLon <= maxLon) {
        map.fitBounds([
          [minLat - 0.02, minLon - 0.02],
          [maxLat + 0.02, maxLon + 0.02]
        ], { padding: [20, 20], maxZoom: 14, animate: true });
      }
    } catch (e) {
      console.warn("Map bounds fit error:", e);
    }
  }, [data, map]);

  return null;
}

const defaultCenter = [16.1558, 74.6403]; // Hidkal Dam center

export default function MapViewer({ showLayersControl = true, externalFloodData = null }) {
  const [internalFloodData, setInternalFloodData] = useState(null);

  useEffect(() => {
    if (!externalFloodData) {
      getFloodGeoJSON().then(data => {
        if (data) setInternalFloodData(data);
      });
    }
  }, [externalFloodData]);

  const activeFloodData = externalFloodData || internalFloodData;

  const styleGeoJSON = (feature) => {
    const props = feature.properties || {};
    const color = props.color || (props.tier === 'deep' ? '#e11d48' : props.tier === 'moderate' ? '#0284c7' : '#38bdf8');
    const fillOpacity = props.fillOpacity !== undefined ? props.fillOpacity : 0.65;
    
    return {
      fillColor: props.fillColor || color, 
      weight: props.weight || 2,
      opacity: props.opacity !== undefined ? props.opacity : 0.9,
      color: props.strokeColor || color,
      fillOpacity: fillOpacity
    };
  };

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={11} 
        style={{ height: '100%', width: '100%', background: '#070c18' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <MapBoundsController data={activeFloodData} />
        
        {showLayersControl ? (
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap (Standard)">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite Imagery">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri'
              />
            </LayersControl.BaseLayer>

            <LayersControl.Overlay checked name="Flood Extent & Depth Tiers">
              <LayerGroup>
                {activeFloodData && activeFloodData.type === 'FeatureCollection' && (
                  <GeoJSON 
                    key={JSON.stringify(activeFloodData)} // Force re-render when data changes
                    data={activeFloodData} 
                    style={styleGeoJSON}
                    onEachFeature={(feature, layer) => {
                      if (feature.properties) {
                        const p = feature.properties;
                        layer.bindPopup(`
                          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; line-height: 1.5; min-width: 180px;">
                            <strong style="color: ${p.color || '#0369a1'}; font-size: 13px;">${p.name || 'Hydrodynamic Flood Extent'}</strong><br/>
                            ${p.solver ? `<div style="margin-top:2px; font-weight:600; color:#0369a1;">Model: ${p.solver}</div>` : ''}
                            ${p.depth_range ? `<b>Depth Tier:</b> ${p.depth_range}<br/>` : ''}
                            ${p.area_km2 ? `<b>Submerged Area:</b> ${p.area_km2} km²<br/>` : ''}
                            ${p.max_depth_m ? `<b>Max Depth:</b> ${p.max_depth_m} m<br/>` : ''}
                            ${p.peak_velocity_ms ? `<b>Peak Velocity:</b> ${p.peak_velocity_ms} m/s<br/>` : ''}
                            ${p.fsi_pressure_kpa ? `<b>Dynamic Pressure:</b> ${p.fsi_pressure_kpa} kPa<br/>` : ''}
                            ${p.particles ? `<b>SPH Particles:</b> ${Number(p.particles).toLocaleString()}<br/>` : ''}
                            ${p.grid_cells ? `<b>SWE Grid Cells:</b> ${Number(p.grid_cells).toLocaleString()}<br/>` : ''}
                          </div>
                        `);
                      }
                    }}
                  />
                )}
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>
        ) : (
          <>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {activeFloodData && activeFloodData.type === 'FeatureCollection' && (
              <GeoJSON 
                key={JSON.stringify(activeFloodData)}
                data={activeFloodData} 
                style={styleGeoJSON}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}
