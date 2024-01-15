// /* eslint-disable no-unused-vars */
// /* eslint-disable no-nested-ternary */
// import React, { useCallback, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Creators, Types } from '@Actions/map';
// import {
//   legendItemSelector,
//   rasterLegendItemSelector,
//   selectedMetricSelector,
//   selectedMetricValuesSelector,
// } from '@Selectors/map';
// import LegendItem from '@Components/common/LegendItem';
// import { checkIfLoading } from '@Utils/loaderSelector';
// import { isEmpty } from '@src/utils/commonUtils';
// // import { colorSchemes, getGradientCSS } from '@src/constants/colorSchemes';
// import {
//   riskColors,
//   rainfallLayerId,
//   rainfallColorScheme,
// } from '@src/constants/map';
// import { displayRiskColors } from '@Components/IndividualProject/MapTab/MapSection/OpenLayersMap/index';
// import getGradientCSS from '../helpers/getGradientCSS';
// import './legend.scss';
// import { defaultStyles } from '../helpers/styleUtils';
//
// const { toggleLegend } = Creators;
//
// function getRangeArray(min, max, parts) {
//   const numberOfParts = max < parts ? max + 1 : parts;
//   if (
//     min === max ||
//     Number.isNaN(min) ||
//     Number.isNaN(max) ||
//     Number.isNaN(numberOfParts)
//   )
//     return [];
//   const ratio = (max - min) / (numberOfParts - 1);
//   const arr = [];
//   for (let i = min; i <= max; i += ratio) {
//     arr.push(Math.round(i));
//   }
//   return arr;
// }
//
// function prepareDiscreteLegendData(data) {
//   const { colors, values } = data;
//   return colors.map((item, index) => ({
//     color: item,
//     label: `${values[index]} - ${values[index + 1]}`,
//   }));
// }
//
// const tmsLegend = [
//   { type: 'continuous', min: 0.0, max: 5232.0, from: '#ffffff', to: '#ff0000' },
//   {
//     type: 'discrete',
//     colors: ['#FFFFFF', '#FEF9A7', '#FAC213', '#F77E21', '#D61C4E'],
//     values: [0, 1000, 2000, 3000, 4000, 5000],
//   },
// ];
//
// const MapLegend = () => {
//   const legendItems = useSelector(legendItemSelector);
//   const rasterLegendItems = useSelector(rasterLegendItemSelector);
//   const layers = useSelector(state => state.map.layers);
//   const layerStyles = useSelector(state => state.map.layerStyles);
//   const selectedLayerId = useSelector(state => state.map.selectedLayer?.id);
//   const selectedLayerStyle = useSelector(state => state.map.selectedLayerStyle);
//   const showLegend = useSelector(state => state.map.showLegend);
//   const selectedMetric = useSelector(selectedMetricSelector).metric;
//   const selectedMetricValues = useSelector(selectedMetricValuesSelector);
//   const colorScheme = useSelector(state => state.map.colorScheme);
//   const rainfallData = useSelector(state => state.map.rainfallData);
//   const isExporting = useSelector(state =>
//     checkIfLoading(state, [Types.EXPORT_MAP_REQUEST]),
//   );
//   const dispatch = useDispatch();
//
//   const isRainfallLayerChecked =
//     layers.find(item => item.id === rainfallLayerId)?.checked || false;
//
//   const getLayerStyle = useCallback(
//     id =>
//       id === selectedLayerId ? selectedLayerStyle : layerStyles[id]?.style,
//     [layerStyles, selectedLayerStyle, selectedLayerId],
//   );
//
//   const rangeArr = useMemo(
//     () =>
//       getRangeArray(selectedMetricValues?.min, selectedMetricValues?.max, 5),
//     [selectedMetricValues],
//   );
//   const rainfallRangeArr = useMemo(
//     () => getRangeArray(rainfallData?.min, rainfallData?.max, 5),
//     [rainfallData],
//   );
//
//   const discreteLegend = prepareDiscreteLegendData(tmsLegend[1]);
//
//   if (isEmpty(legendItems) && isEmpty(rasterLegendItems)) return '';
//
//   const metricName = selectedMetric?.name;
//   const metricLabel =
//     selectedMetricValues?.type === 'theme'
//       ? `${metricName} Vulnerability`
//       : metricName;
//
//   return (
//     <div className="map-legend" id="map-legend">
//       <div className="legend-title">
//         <h6>Legend</h6>
//         {!isExporting && (
//           <span
//             role="presentation"
//             title={showLegend ? 'Minimize' : 'Maximize'}
//             onClick={() => {
//               dispatch(toggleLegend());
//             }}
//             onKeyUp={() => {}}
//           >
//             <i className="material-icons">
//               {showLegend ? 'expand_more' : 'expand_less'}
//             </i>
//           </span>
//         )}
//       </div>
//
//       {showLegend && (
//         <div
//           className="legend-container is-overflow"
//           style={{
//             maxHeight: isExporting ? 'max-content' : '16rem',
//             overflowY: 'auto',
//             overflowX: 'clip',
//           }}
//         >
//           <div>
//             {legendItems.map(({ name, id }) => (
//               <div key={id} className="legend-item">
//                 <LegendItem styles={getLayerStyle(id)} />
//                 <p>{name}</p>
//               </div>
//             ))}
//           </div>
//
//           {!isEmpty(rasterLegendItems) && (
//             <div className="raster-legend">
//               {rasterLegendItems.map(item =>
//                 item.type === 'continuous' ? (
//                   <div className="range-legend">
//                     <div className="range-title">
//                       <h6>Continuous</h6>
//                     </div>
//                     <div
//                       className="range-color"
//                       style={{
//                         background: getGradientCSS([item.from, item.to]),
//                       }}
//                     />
//                     <ul className="range-label">
//                       {getRangeArray(item.min, item.max, 5)?.map(num => (
//                         <li key={num}>{num}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 ) : item.type === 'discrete' ? (
//                   <div>
//                     <h6>Discrete</h6>
//                     {discreteLegend.map(({ color, label }) => (
//                       <div key={label} className="legend-item">
//                         <LegendItem
//                           styles={{ ...defaultStyles, fillColor: color }}
//                         />
//                         <p>{label}</p>
//                       </div>
//                     ))}
//                   </div>
//                 ) : item.legend?.type === 'unique' ||
//                   item.legend?.type === 'discrete' ? (
//                   <div>
//                     <h6>{item?.name}</h6>
//                     {item?.legend?.data?.map(({ color, label }) => (
//                       <div key={label} className="legend-item">
//                         <LegendItem
//                           styles={{
//                             ...defaultStyles,
//                             fillColor: color,
//                             fillOpacity: 100,
//                           }}
//                         />
//                         <p>{label}</p>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   ''
//                 ),
//               )}
//             </div>
//           )}
//
//           {selectedMetric &&
//             displayRiskColors.includes(selectedMetricValues?.type) && (
//               <div className="raster-legend">
//                 <div>
//                   <h6>{metricLabel}</h6>
//                   {Object.keys(riskColors).map(key => (
//                     <div key={key} className="legend-item">
//                       <LegendItem
//                         styles={{
//                           ...defaultStyles,
//                           fillColor: riskColors[key],
//                           fillOpacity: 100,
//                         }}
//                       />
//                       <p>{key}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//
//           {selectedMetric &&
//             !displayRiskColors.includes(selectedMetricValues?.type) && (
//               <div className="range-legend">
//                 <div className="range-title">
//                   <div style={{ width: '16rem' }}>
//                     <h6>{selectedMetric?.name}</h6>
//                   </div>
//                   {!isExporting && (
//                     <div className="tooltip">
//                       <i className="material-icons">info_outline</i>
//                       <span className="tooltiptext">Metric formula</span>
//                     </div>
//                   )}
//                 </div>
//                 <div
//                   className="range-color"
//                   style={{
//                     background: getGradientCSS(colorScheme),
//                   }}
//                 />
//                 <ul className="range-label">
//                   {rangeArr.map(num => (
//                     <li key={num}>{num}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//
//           {isRainfallLayerChecked && (
//             <div className="range-legend">
//               <div className="range-title">
//                 <div style={{ width: '16rem' }}>
//                   <h6>Rainfall in 24 hours (in mm)</h6>
//                 </div>
//               </div>
//               <div
//                 className="range-color"
//                 style={{
//                   background: getGradientCSS(rainfallColorScheme),
//                 }}
//               />
//               <ul className="range-label">
//                 {rainfallRangeArr.map(num => (
//                   <li key={num}>{num}</li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };
//
// export default MapLegend;
