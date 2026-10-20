import L from "leaflet"

/**
 * Round green pin used for destinations on every map. Leaflet's default marker is avoided on purpose: its PNG files
 * are resolved by path, and bundlers hand back a different shape for them in dev and in production builds.
 */
export const destinationIcon = () =>
  L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color:#10b981;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,.2)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  })
