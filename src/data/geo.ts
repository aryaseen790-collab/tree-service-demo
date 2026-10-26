// Approximate town-center coordinates, used only to lay out the stylized
// service-area map. Add an entry when you add a city to business.json.
// `label` moves a town's name if it would collide with a route line on the map.
export const cityCoords: Record<string, { lat: number; lon: number; label?: 'left' | 'right' | 'below' }> = {
  Temple: { lat: 31.098, lon: -97.343 },
  Belton: { lat: 31.056, lon: -97.464 },
  Killeen: { lat: 31.117, lon: -97.728 },
  'Harker Heights': { lat: 31.084, lon: -97.66, label: 'below' },
  Salado: { lat: 30.947, lon: -97.539 },
  Troy: { lat: 31.206, lon: -97.302 },
};
