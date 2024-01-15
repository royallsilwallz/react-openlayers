/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import * as olExtent from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import { Cluster, OSM as OSMSource } from 'ol/source';
import { Text, Circle } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import { hexToRgba } from '@Utils/commonUtils';
import getSvgImageIcon from '@Utils/getSvgImageIcon';
// import MapContext from '../MapContext';
import { generateLayerStylePoint } from '../helpers/styleUtils';

function setAsyncStyle(style, feature) {
  // if (style?.icon && style?.background_color) {
  const iconUrl = style?.icon;
  const styleCache = {};
  const size = feature?.get('features')?.length; // const isSVGIcon = checkIfSvgUrl(iconUrl);
  if (size === 1) {
    // eslint-disable-next-line no-inner-declarations
    async function fetchMyAPI() {
      /* eslint-disable-next-line no-await-in-loop */
      const image = await getSvgImageIcon(iconUrl, style.background_color);
      if (image) {
        return generateLayerStylePoint({
          style: { ...style, icon: image },
          feature,
        });
      }
    }
    fetchMyAPI();
  }
  let stylex = styleCache[size];
  stylex = new Style({
    image: new Circle({
      radius: 13,
      stroke: new Stroke({
        color: hexToRgba(style.color, style.opacity || 100),
        // color: 'rgba(200, 13, 18, 0.6)',
        width: 4,
      }),
      fill: new Fill({
        color: hexToRgba(style.background_color, style.opacity || 100),
        width: 40,
      }),
    }),
    text: new Text({
      text: size.toString(),
      fill: new Fill({
        color: '#fff',
      }),
    }),
  });
  styleCache[size] = stylex;
  return stylex;
}

// function getStyles(style, feature) {
//   const styleCache = {};
//   const size = feature?.get('features')?.length;
//
//   if (size === 1) {
//     return generateLayerStylePoint({ style, feature });
//   }
//   let stylex = styleCache[size];
//   stylex = new Style({
//     image: new Circle({
//       radius: 13,
//       stroke: new Stroke({
//         color: hexToRgba(style.color, 100),
//         // color: 'rgba(200, 13, 18, 0.6)',
//         width: 4,
//       }),
//       fill: new Fill({
//         color: hexToRgba(style.background_color, 100),
//         width: 40,
//       }),
//     }),
//     text: new Text({
//       text: size.toString(),
//       fill: new Fill({
//         color: '#fff',
//       }),
//     }),
//   });
//   styleCache[size] = stylex;
//   return stylex;
// }

const ClusterLayer = ({
  map,
  source: layerSource,
  zIndex = 999,
  zoomToLayer = false,
  visibleOnMap = true,
  fetchPopupData,
  style,
}) => {
  const [popupProps, setPopupProps] = useState(null);
  const [vectorLayer, setVectorLayer] = useState(null);
  useEffect(
    () => () => map && vectorLayer && map.removeLayer(vectorLayer),
    [map, vectorLayer],
  );

  useEffect(() => {
    if (!map || !layerSource || !layerSource.features) return;
    const sourceOSM = new OSMSource();
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(layerSource, {
        defaultDataProjection: 'EPSG:3857',
        featureProjection: sourceOSM.getProjection(),
      }),
    });

    const clusterSource = new Cluster({
      distance: parseInt(50, 10),
      source: vectorSource,
    });

    const animatedClusterLayer = new AnimatedCluster({
      source: clusterSource,
      animationDuration: 700,
      distance: 40,
      style: feature => setAsyncStyle(style, feature),
    });

    setVectorLayer(animatedClusterLayer);
  }, [map, layerSource]); // eslint-disable-line

  useEffect(() => {
    if (map && vectorLayer) {
      vectorLayer.setZIndex(zIndex);
    }
  }, [map, vectorLayer, zIndex]);

  useEffect(() => {
    if (map && vectorLayer && zoomToLayer) {
      setTimeout(() => {
        const features = vectorLayer.getSource().getFeatures();
        const extent = olExtent.createEmpty();
        features.forEach(feat =>
          feat.values_?.features.forEach(feature =>
            olExtent.extend(extent, feature.getGeometry().getExtent()),
          ),
        );
        map.getView().fit(extent, map.getSize());
      }, 300);
    }
  }, [map, vectorLayer, zoomToLayer]);

  useEffect(() => {
    if (!map) return;
    map.on('singleclick', evt => {
      // eslint-disable-next-line camelcase
      let area_no_9_extent = null;
      map.forEachFeatureAtPixel(
        evt.pixel,
        featurex => {
          // eslint-disable-next-line camelcase
          area_no_9_extent = featurex.getGeometry().getExtent();
          return featurex;
        },
        true,
        // {
        //   layerFilter(layer) {
        //     return layer.get('layer_name') === 'someName';
        //   },
        // },
      );
      map.getView().fit(area_no_9_extent, {
        duration: 1000,
        padding: [50, 50, 50, 50],
        maxZoom: 11,
      });
    });
  }, [map]);

  useEffect(() => {
    if (!map) return;
    map.on('singleclick', evt => {
      const features = map.getFeaturesAtPixel(evt.pixel);
      if (features.length < 1) {
        // closePopupFn();
        return;
      }
      const featureProperties = features[0].getProperties();
      const feature = featureProperties.features[0].getProperties();
      if (feature.length < 1) {
        return;
      }
      setPopupProps(feature);
    });
  }, [map]);

  useEffect(() => {
    if (!map || !fetchPopupData) return;
    fetchPopupData(popupProps);
  }, [map, popupProps, fetchPopupData]);

  useEffect(() => {
    if (!map || !vectorLayer) return;
    if (visibleOnMap) {
      map.addLayer(vectorLayer);
    } else {
      map.removeLayer(vectorLayer);
    }
  }, [map, vectorLayer, visibleOnMap]);

  useEffect(
    () => () => map && map.removeLayer(vectorLayer),
    [map, vectorLayer],
  );

  return null;
};

export default ClusterLayer;
