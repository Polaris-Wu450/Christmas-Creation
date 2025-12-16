import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

export default function Tree() {
    const group = useRef()

    // Gentle rotation for the whole tree
    useFrame((state, delta) => {
        group.current.rotation.y += delta * 0.1
    })

    // Generate tree layers procedurally for a fuller look
    const { layers, ornaments } = useMemo(() => {
        const layers = []
        const ornaments = []
        const layerCount = 8

        for (let i = 0; i < layerCount; i++) {
            const progress = i / layerCount
            // Non-linear scale for a nicer tree shape (wider at bottom)
            const scale = 1.8 * (1 - progress * 0.9)
            const y = -2 + i * 0.7

            layers.push({
                scale,
                position: [0, y, 0],
                rotation: [0, (Math.random() - 0.5) * 0.5, 0] // Slight random rotation
            })

            // Add ornaments to this layer
            if (i < layerCount - 1) { // Skip top layer for ornaments sometimes
                const numOrnaments = Math.floor(scale * 4) // More ornaments on wider layers
                for (let j = 0; j < numOrnaments; j++) {
                    const angle = (j / numOrnaments) * Math.PI * 2 + Math.random()
                    const radius = scale * 0.85 // Place on surface
                    const ox = Math.cos(angle) * radius
                    const oz = Math.sin(angle) * radius
                    const oy = y - 0.4 + Math.random() * 0.5 // Varied height within layer
                    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff9ff3', '#54a0ff']
                    const color = colors[Math.floor(Math.random() * colors.length)]

                    ornaments.push({ position: [ox, oy, oz], color })
                }
            }
        }
        return { layers, ornaments }
    }, [])

    return (
        <group ref={group}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                {layers.map((layer, index) => (
                    <mesh
                        key={index}
                        position={layer.position}
                        rotation={layer.rotation}
                        receiveShadow
                        castShadow
                    >
                        {/* Wider cones, less tall relative to width for fuller look */}
                        <coneGeometry args={[layer.scale, 1.2, 32]} />
                        <meshPhysicalMaterial
                            color="#a8e6cf"
                            transmission={0.5}
                            thickness={2.5}
                            roughness={0.3}
                            clearcoat={0.8}
                            clearcoatRoughness={0.2}
                            ior={1.4}
                        />
                    </mesh>
                ))}

                {/* Star on top */}
                <mesh position={[0, 4.2, 0]} rotation={[0, 0, Math.PI / 4]}>
                    <octahedronGeometry args={[0.35, 0]} />
                    <meshStandardMaterial
                        color="#fff8e7"
                        emissive="#fff8e7"
                        emissiveIntensity={4}
                        toneMapped={false}
                    />
                </mesh>

                {/* Generated Ornaments */}
                {ornaments.map((data, i) => (
                    <Ornament key={i} {...data} />
                ))}
            </Float>

            {/* Removed Sparkles as requested */}
        </group>
    )
}

function Ornament({ position, color }) {
    const ref = useRef()
    // Random offset for twinkling
    const offset = useMemo(() => Math.random() * 100, [])

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        // Slower, gentler pulse
        ref.current.material.emissiveIntensity = 1.5 + Math.sin(t * 1.5 + offset) * 0.5
    })

    return (
        <mesh ref={ref} position={position}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1.5}
                toneMapped={false}
            />
        </mesh>
    )
}
