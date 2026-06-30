import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function ProductModel() {
  const group = useRef(null)

  useFrame(({ clock, pointer }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    group.current.rotation.y = -0.35 + pointer.x * 0.18 + Math.sin(t * 0.6) * 0.035
    group.current.rotation.x = 0.1 - pointer.y * 0.08
    group.current.position.y = Math.sin(t * 0.9) * 0.08
  })

  return (
    <group ref={group} position={[0.45, -0.18, 0]} rotation={[0.1, -0.28, -0.08]} scale={0.78}>
      <mesh>
        <boxGeometry args={[3.5, 5.9, 0.38, 1, 1, 1]} />
        <meshPhysicalMaterial
          color="#7b1f31"
          metalness={0.62}
          roughness={0.28}
          clearcoat={0.75}
          clearcoatRoughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0, 0.22]}>
        <boxGeometry args={[3.14, 5.48, 0.08]} />
        <meshStandardMaterial color="#1a090e" metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh position={[-0.78, 1.75, 0.42]}>
        <boxGeometry args={[1.45, 1.45, 0.18]} />
        <meshPhysicalMaterial color="#9a3347" metalness={0.7} roughness={0.24} clearcoat={0.7} />
      </mesh>
      {[
        [-1.15, 2.1, 0.56],
        [-0.45, 1.75, 0.56],
        [-1.12, 1.32, 0.56],
      ].map((position) => (
        <group key={position.join('-')} position={position} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.28, 0.28, 0.16, 48]} />
            <meshPhysicalMaterial color="#07080b" metalness={0.8} roughness={0.22} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.04, 32]} />
            <meshStandardMaterial color="#1e4169" emissive="#0b1830" emissiveIntensity={0.35} />
          </mesh>
        </group>
      ))}
      <mesh position={[-0.1, 2.18, 0.56]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial color="#f0f2f4" emissive="#ffffff" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0.2, 1.25, 0.56]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.05, 28]} />
        <meshStandardMaterial color="#040404" />
      </mesh>
    </group>
  )
}

export default function ModelScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 9.2], fov: 34 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 4, 4]} intensity={2.2} color="#ffd6df" />
      <pointLight position={[-3, -1, 3]} intensity={1.6} color="#ff5574" />
      <ProductModel />
    </Canvas>
  )
}
