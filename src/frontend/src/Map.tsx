import React, { useEffect, useRef } from 'react';
import * as atlas from 'azure-maps-control';
import * as spatial from "azure-maps-spatial-io";
import "azure-maps-control/dist/atlas.min.css";

const Map: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapRef.current) {
      const map = new atlas.Map(mapRef.current, {
        center: [-122.4194, 37.7749],
        zoom: 10,
        view: 'Auto',
        authOptions: {
          authType: atlas.AuthenticationType.subscriptionKey,
          subscriptionKey: process.env.REACT_APP_CONTOSO_BOOKINGS_AZURE_MAPS_KEY as string,
        },
      });

      map.events.add("ready", () => {

        console.log("Map ready");
        // Create a data source and add it to the map.
        const datasource = new atlas.source.DataSource();
        map.sources.add(datasource);
    
        // Create a layer to render the data
        map.layers.add(new atlas.layer.BubbleLayer(datasource));
    
        // Parse the point string.
        let point = spatial.io.ogc.WKT.read("POINT(-122.34009 47.60995)");
    
        // Add the parsed data to the data source.
        datasource.add(point);

        const marker = new atlas.HtmlMarker({
          color: 'Orange',
          text: 'M',
          position: [-122.4194, 37.7749],
        });

        map.markers.add(marker);
        console.log('Marker added:', marker);


      });
    }
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default Map;