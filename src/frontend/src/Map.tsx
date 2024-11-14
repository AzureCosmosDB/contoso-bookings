import React, { useEffect, useRef } from 'react';
import * as atlas from 'azure-maps-control';
import * as spatial from "azure-maps-spatial-io";
import "azure-maps-control/dist/atlas.min.css";
import './Map.css';

const azureMapsKey = process.env.REACT_APP_CONTOSO_BOOKINGS_AZURE_MAPS_KEY;

interface MapProps {
  user_coordinates: {lat: number; lng: number};
  search_map_results: { name: String, price:number, similarity_score:number, lat: number; lng: number }[];
}

const Map: React.FC<MapProps> = ({ user_coordinates, search_map_results }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapRef.current) {
      const map = new atlas.Map(mapRef.current, {
        center:  [user_coordinates.lng, user_coordinates.lat],
        zoom: 10,
        view: 'Auto',
        authOptions: {
          authType: atlas.AuthenticationType.subscriptionKey,
          subscriptionKey: azureMapsKey as string,
        },
      });

      map.events.add("ready", () => {

        // Create a data source and add it to the map.
        const datasource = new atlas.source.DataSource();
        map.sources.add(datasource);
        map.layers.add(new atlas.layer.BubbleLayer(datasource));
        let point = spatial.io.ogc.WKT.read(`POINT(${user_coordinates.lng}, ${user_coordinates.lat})`);
    
        // Add the parsed data to the data source.
        datasource.add(point);

        if (search_map_results.length === 0) {
          return;
        }

        search_map_results.forEach((search_result) => {          

          
          const marker = new atlas.HtmlMarker({
            htmlContent: '<div class="pulseIcon"></div>',
            position: [ search_result.lng, search_result.lat ],
            popup: new atlas.Popup({
              content: `<div class="marker-popup">
                          <h3>${search_result.name}</h3>
                          <p>Price: ${search_result.price} per day</p>
                          <p>Similarity Score: ${search_result.similarity_score}</p>
                        </div>`,
              pixelOffset: [0, -20],
            }),
          });

          map.markers.add(marker);

          map.events.add('click',marker, () => {
            marker.togglePopup();
          });

        });

      });
    }
  }, [search_map_results, user_coordinates]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default Map;