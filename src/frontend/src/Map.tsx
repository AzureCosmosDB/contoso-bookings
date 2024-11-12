import React, { useEffect, useRef } from 'react';
import * as atlas from 'azure-maps-control';
import * as spatial from "azure-maps-spatial-io";
import "azure-maps-control/dist/atlas.min.css";

const azureMapsKey = process.env.REACT_APP_CONTOSO_BOOKINGS_AZURE_MAPS_KEY;

interface MapProps {
  user_coordinates: {lat: number; lng: number};
  search_coordinates: { lat: number; lng: number }[];
}

const Map: React.FC<MapProps> = ({ user_coordinates, search_coordinates }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapRef.current) {
      const map = new atlas.Map(mapRef.current, {
        center:  [user_coordinates.lng, user_coordinates.lat], //[-105.0020980834961, 39.766414642333984],
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
    
        // Create a layer to render the data
        map.layers.add(new atlas.layer.BubbleLayer(datasource));
    
        // Parse the point string.
        let point = spatial.io.ogc.WKT.read(`POINT(${user_coordinates.lng}, ${user_coordinates.lat})`);
    
        // Add the parsed data to the data source.
        datasource.add(point);

        if (search_coordinates.length === 0) {
          return;
        }

        search_coordinates.forEach((coord) => {          

          const marker = new atlas.HtmlMarker({
            color: 'Orange',
            text: 'M',
            position: [ coord.lng, coord.lat ],
          });
          map.markers.add(marker);
        });

      });
    }
  }, [search_coordinates, user_coordinates]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default Map;