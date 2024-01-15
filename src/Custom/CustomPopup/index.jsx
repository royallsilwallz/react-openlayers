/* eslint-disable no-unused-vars */
/* eslint-disable react/no-danger */
/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable func-names */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { renderToString } from 'react-dom/server';
import Overlay from 'ol/Overlay';
import { getCenter } from 'ol/extent';
import '../../Popup/popup.scss';
import Button from '@Components/common/Button';

import { Creators as CommonCreators } from '@Actions/common';
import { isEmpty } from '@Utils/commonUtils';
import { checkIfLoading } from '@Utils/loaderSelector';
import { Types, Creators } from '@Actions/projectMap';
import Spinner from '@Components/common/Spinner';
import MaterialIcon from '@Components/common/MaterialIcon/index';

const { setImageModal } = CommonCreators;
const { setProjectMapState } = Creators;

function hasKey(obj, key) {
  return Object.keys(obj).some(item => item === key);
}

const popupId = 'popupx';

const CustomPopup = ({
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
  popupData,
  layerExceptionIds = [],
}) => {
  const dispatch = useDispatch();
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
      if (layerId && !exceptionIds.current.includes(layerId)) {
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

  const isPopupDataFetching = useSelector(state =>
    checkIfLoading(state, [Types.GET_MAP_POPUP_DATA_REQUEST]),
  );

  return (
    <div ref={popupRef} id="popup" className="ol-popup">
      <a
        ref={popupCloserRef}
        // href={() => {}}
        id="popup-closer"
        className="ol-popup-closer text-grey-800"
        onClick={closePopupFn}
      />
      {isPopupDataFetching ? (
        <div
          style={{
            height: '170px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spinner className="w-8 h-8 fill-secondary-400" />
        </div>
      ) : (
        <>
          {!isEmpty(popupData) && popupData.Name && <h4>{popupData.Name}</h4>}
          <div className="max-h-72 overflow-y-auto scrollbar">
            {!isEmpty(popupData) && (popupData.image || popupData.url) && (
              <div className="py-2 relative group">
                <img
                  src={popupData.image || popupData.url}
                  className="h-[200px] w-full object-cover"
                  alt=""
                />
                <div
                  className="absolute top-0 left-0 w-full h-[210px] flex cursor-pointer 
                justify-center items-center bg-black opacity-0 group-hover:opacity-60 duration-500"
                  onClick={() => {
                    dispatch(
                      setProjectMapState({ selectedFeatureId: properties.id }),
                    );
                    dispatch(setImageModal(true));
                  }}
                >
                  <MaterialIcon
                    name="crop_free"
                    className="text-icon-md cursor-pointer text-white"
                  />
                </div>
              </div>
            )}
            <div
              id="popup-content"
              style={{ marginTop: '0.5rem' }}
              dangerouslySetInnerHTML={{ __html: popupHTML }}
            />
          </div>
        </>
      )}
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

export default CustomPopup;
