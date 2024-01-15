# react-openlayers

React wrapper for openlayers written in JavaScript.

React Openlayers provides the binding between react and [openlayers](https://openlayers.org/).

# How it works

- The `MapContainer` renders a wrapper `<div>` element for map. We need to pass `mapInstance`, `mapRef` props to this component.
- The `useOlMap` hooks initializes a map instance. It provides us `mapInstance`, `mapRef` variables which can be feed to `MapContainer`.
- The `MapContainer` renders its children components. It uses React Children API to pass the `map` props to all its children components.
- When a child is added to the `MapContainer`, it can access the `map` props that can be used to `addLayer` in the map.
- Similarly, when a child is removed from render tree, it removes its layer from the map as needed.
