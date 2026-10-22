export interface SceneConfig {
  distance: number;
  azimuth: number;
  polar: number;
  fov: number;
  gridSize: number;
  lightIntensity: number;
  unitSystem: "metric" | "imperial";
}
