'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { Grid, Environment } from '@react-three/drei'
import { useState, useEffect } from 'react'
import * as THREE from 'three'

interface SceneConfig {
  distance: number
  azimuth: number
  polar: number
  fov: number
  gridSize: number
  skyPreset: string
  lightIntensity: number
}

function SceneContent({ config }: { config: SceneConfig }) {
  const { camera } = useThree()

  // Update camera with spherical coordinates (orbit around center)
  useEffect(() => {
    const x = config.distance * Math.sin(config.polar) * Math.cos(config.azimuth)
    const y = config.distance * Math.cos(config.polar)
    const z = config.distance * Math.sin(config.polar) * Math.sin(config.azimuth)

    camera.position.set(x, y, z)
    camera.lookAt(0, 0, 0) // Look at center

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = config.fov
      camera.updateProjectionMatrix()
    }
  }, [config.distance, config.azimuth, config.polar, config.fov, camera])

  return (
    <>
      <Environment preset={config.skyPreset as any} />
      <Grid
        args={[100, 100]}
        cellSize={1}
        cellColor="#6f7280"
        sectionSize={config.gridSize}
        sectionColor="#d1d5db"
        fadeStrength={1}
        fadeDistance={100}
        infiniteGrid
      />
      <ambientLight intensity={config.lightIntensity} />
      <directionalLight position={[10, 10, 10]} intensity={config.lightIntensity * 2} />
    </>
  )
}

export default function Scene() {
  const [config, setConfig] = useState<SceneConfig>({
    distance: 15,
    azimuth: 0,
    polar: Math.PI / 4,
    fov: 75,
    gridSize: 10,
    skyPreset: 'sunset',
    lightIntensity: 0.5
  })

  const updateConfig = (key: keyof SceneConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="relative w-full h-screen">
      {/* Canvas */}
      <Canvas style={{ width: '100%', height: '100vh' }}>
        <SceneContent config={config} />
      </Canvas>

      {/* HUD Overlay - Top Left */}
      <div className="absolute top-4 left-4 bg-black/70 text-white p-6 rounded-lg w-80 space-y-4 max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold">Camera Controls</h2>

        {/* Distance */}
        <div>
          <label className="block text-sm font-semibold mb-2">Distance: {config.distance.toFixed(1)}</label>
          <input
            type="range"
            min="5"
            max="50"
            step="0.5"
            value={config.distance}
            onChange={(e) => updateConfig('distance', parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Azimuth (Horizontal Rotation) */}
        <div>
          <label className="block text-sm font-semibold mb-2">Azimuth (Horizontal): {(config.azimuth * 180 / Math.PI).toFixed(0)}°</label>
          <input
            type="range"
            min="-3.14"
            max="3.14"
            step="0.05"
            value={config.azimuth}
            onChange={(e) => updateConfig('azimuth', parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Polar (Vertical Rotation) */}
        <div>
          <label className="block text-sm font-semibold mb-2">Polar (Vertical): {(config.polar * 180 / Math.PI).toFixed(0)}°</label>
          <input
            type="range"
            min="0.1"
            max="3.04"
            step="0.05"
            value={config.polar}
            onChange={(e) => updateConfig('polar', parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        {/* FOV */}
        <div>
          <label className="block text-sm font-semibold mb-2">FOV (Zoom): {config.fov}</label>
          <input
            type="range"
            min="20"
            max="120"
            step="1"
            value={config.fov}
            onChange={(e) => updateConfig('fov', parseInt(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Grid Size */}
        <div>
          <label className="block text-sm font-semibold mb-2">Grid Section: {config.gridSize}</label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={config.gridSize}
            onChange={(e) => updateConfig('gridSize', parseInt(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Light Intensity */}
        <div>
          <label className="block text-sm font-semibold mb-2">Light: {config.lightIntensity.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.lightIntensity}
            onChange={(e) => updateConfig('lightIntensity', parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Sky Preset */}
        <div>
          <label className="block text-sm font-semibold mb-2">Sky</label>
          <select
            value={config.skyPreset}
            onChange={(e) => updateConfig('skyPreset', e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded cursor-pointer"
          >
            <option>sunset</option>
            <option>dawn</option>
            <option>night</option>
            <option>warehouse</option>
            <option>forest</option>
            <option>apartment</option>
            <option>studio</option>
            <option>city</option>
          </select>
        </div>
      </div>
    </div>
  )
}