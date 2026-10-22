export interface SceneConfig {
  distance: number;
  azimuth: number;
  polar: number;
  fov: number;
  gridSize: number;
  skyPreset: string;
  lightIntensity: number;
  unitSystem: "metric" | "imperial";
}

export interface TargetCoordinates {
  x: number;
  y: number;
  z: number;
}
