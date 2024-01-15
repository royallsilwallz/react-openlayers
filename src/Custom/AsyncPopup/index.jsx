/* eslint-disable no-unused-vars */
/* eslint-disable react/no-danger */
/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable func-names */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { renderToString } from 'react-dom/server';
import Overlay from 'ol/Overlay';
import { getCenter } from 'ol/extent';
import '../../Popup/popup.scss';
import Button from '@Components/common/Button';

function hasKey(obj, key) {
  return Object.keys(obj).some(item => item === key);
}

const popupId = 'popupx';

const AsyncPopup = ({
  map,
  fetchPopupData,
  popupUI,
  openPopupFor,
  zoomedExtent,
  onPopupClose,
  buttonText,
  onButtonClick,
  closePopup = false,
  loading = false,
  layerExceptionIds = [],
}) => {
  const popupRef = useRef(null);
  const popupCloserRef = useRef(null);
  const [coordinates, setCoordinates] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [properties, setProperties] = useState(null);
  const [popupHTML, setPopupHTML] = useState('');
  const exceptionIds = useRef([]);
  const disabled = useRef(false);

  useEffect(() => {
    disabled.current = closePopup;
  }, [closePopup]);

  useEffect(() => {
    exceptionIds.current = layerExceptionIds;
  }, [layerExceptionIds]);

  // add overlay to popupRef
  useEffect(() => {
    if (!map || !popupRef.current) return;
    const overlayInstance = new Overlay({
      element: popupRef.current,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
      id: popupId,
    });
    setOverlay(overlayInstance);
  }, [map, popupRef]);

  // function for closing popup
  const closePopupFn = useCallback(() => {
    if (!popupCloserRef.current || !overlay) return;
    overlay.setPosition(undefined);
    // onPopupClose();
    setPopupHTML('');
    setProperties(null);
    popupCloserRef.current.blur();
  }, [overlay, popupCloserRef]);

  useEffect(() => {
    if (!map || !closePopup) return;
    closePopupFn();
  }, [map, closePopup, closePopupFn]);

  // get properties and coordinates of feature
  useEffect(() => {
    if (!map) return;
    map.on('click', evt => {
      if (disabled.current) return;
      const { coordinate } = evt;
      const features = map.getFeaturesAtPixel(evt.pixel);
      if (features.length < 1) {
        closePopupFn();
        return;
      }
      const featureProperties = features[0].getProperties();
      const { layer_id: layerId } = featureProperties;
      if (!exceptionIds.current.includes(layerId)) {
        setProperties(featureProperties);
        setCoordinates(coordinate);
      } else {
        closePopupFn();
        setProperties(null);
        setCoordinates(null);
      }
    });
  }, [map, closePopupFn]);

  // fetch popup data when properties is set
  useEffect(() => {
    if (!map || !properties) return;
    // const { layerId } = properties;
    // if (layerIds.includes(layerId) || hasKey(properties, 'layer')) {
    fetchPopupData(properties);
    // }
    // eslint-disable-next-line
  }, [map, properties]);

  // getPopupUI, setpopupHTML, setOverlayPosition, addOverlayToMap
  useEffect(() => {
    if (!map || !coordinates || !overlay || !properties || closePopup) return;
    const htmlString = renderToString(popupUI(properties));
    setPopupHTML(htmlString);
    overlay.setPosition(coordinates);
    const popupOverlay = map.getOverlayById(popupId);
    if (!popupOverlay) {
      map.addOverlay(overlay);
    }
  }, [map, overlay, coordinates, popupUI, properties, closePopup]);

  useEffect(() => {
    if (!map || !openPopupFor || !zoomedExtent) return;
    const center = getCenter(zoomedExtent);
    setProperties({ id: openPopupFor, layer: 'site' });
    setCoordinates(center);
  }, [map, openPopupFor, zoomedExtent]);

  return (
    <div ref={popupRef} id="popup" className="ol-popup">
      <a
        ref={popupCloserRef}
        // href={() => {}}
        id="popup-closer"
        className="ol-popup-closer text-grey-800"
        onClick={closePopupFn}
      />
      <div
        id="popup-content"
        style={{ marginTop: '0.5rem' }}
        dangerouslySetInnerHTML={{ __html: popupHTML }}
      />
      {!loading && (
        <div className="mt-2">
          <Button
            className="btn-secondary btn-sm btn-noborder"
            onClick={() => onButtonClick(properties)}
          >
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AsyncPopup;
