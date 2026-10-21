'use client'

import { Canvas } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'

interface BoxProps {
  color?: string
  position?: [number, number, number]
}

function Box({ color = '#ff6b6b', position = [0, 0, 0] }: BoxProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useEffect(() => {
    if (meshRef.current) {
      gsap.to(meshRef.current.rotation, {
        x: Math.PI * 2,
        y: Math.PI * 2,
        duration: 4,
        repeat: -1,
        ease: 'none'
      })
    }
  }, [])

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

interface SphereProps {
  color?: string
  position?: [number, number, number]
}

function Sphere({ color = '#4ecdc4', position = [-3, 0, 0] }: SphereProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (meshRef.current) {
      gsap.to(meshRef.current.position, {
        y: 2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })
    }
  }, [])

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Box />
      <Sphere />
    </Canvas>
  )
}