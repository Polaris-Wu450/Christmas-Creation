import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Updated Palette: Light Pink, Royal Blue, Lavender, Pale Green, Gold
const COLORS = ['#FFB7C5', '#4169E1', '#E6E6FA', '#98FB98', '#FFD700', '#D8BFD8']

export default function Fireworks() {
    const [fireworks, setFireworks] = useState([])

    useEffect(() => {
        // Increase frequency for "continuous" feel
        const interval = setInterval(() => {
            setFireworks(prev => {
                // Allow more concurrent fireworks
                if (prev.length > 12) return prev

                // Randomize position: Ensure it's around the tree but not inside it
                // Tree radius is about ~3 at bottom.
                // We want fireworks on Left and Right sides.
                const isLeft = Math.random() > 0.5
                // X: 3 to 9 (Right) or -9 to -3 (Left)
                const xPos = isLeft ? -(3 + Math.random() * 6) : (3 + Math.random() * 6)

                return [...prev, {
                    id: Date.now(),
                    position: [
                        xPos,
                        2 + Math.random() * 8,      // Y: 2 to 10 (Tree body to top)
                        (Math.random() - 0.5) * 8   // Z: -4 to 4 (Around the tree depth)
                    ],
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    scale: 0.25 + Math.random() * 0.35 // Delicate scale
                }]
            })
        }, 800) // Much faster generation

        return () => clearInterval(interval)
    }, [])

    const handleComplete = (id) => {
        setFireworks(prev => prev.filter(fw => fw.id !== id))
    }

    return (
        <group>
            {fireworks.map(fw => (
                <Firework
                    key={fw.id}
                    {...fw}
                    onComplete={() => handleComplete(fw.id)}
                />
            ))}
        </group>
    )
}

function Firework({ position, color, scale, onComplete }) {
    const count = 100 // Slightly fewer particles for distant feel
    const group = useRef()

    // Particle state
    const [particles] = useState(() => {
        const data = []
        for (let i = 0; i < count; i++) {
            // Sphere distribution
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            // Slower speed for smaller, distant blooom
            const speed = 0.03 + Math.random() * 0.04

            data.push({
                vx: Math.sin(phi) * Math.cos(theta) * speed,
                vy: Math.sin(phi) * Math.sin(theta) * speed,
                vz: Math.cos(phi) * speed,
                x: 0, y: 0, z: 0,
                life: 1.0,
                decay: 0.008 + Math.random() * 0.005 // Faster decay
            })
        }
        return data
    })

    const geometryRef = useRef()

    useFrame(() => {
        if (!geometryRef.current) return

        const positions = geometryRef.current.attributes.position.array
        const sizes = geometryRef.current.attributes.size.array
        let aliveCount = 0

        for (let i = 0; i < count; i++) {
            const p = particles[i]

            if (p.life > 0) {
                // Move position
                p.x += p.vx
                p.y += p.vy
                p.z += p.vz

                // Gravity
                p.vy -= 0.0005

                // Friction / Air resistance for "slow bloom" feel
                p.vx *= 0.98
                p.vy *= 0.98
                p.vz *= 0.98

                // Decay
                p.life -= p.decay

                // Update buffer
                positions[i * 3] = p.x
                positions[i * 3 + 1] = p.y
                positions[i * 3 + 2] = p.z

                // Size fades with life
                sizes[i] = p.life * scale

                aliveCount++
            } else {
                sizes[i] = 0
            }
        }

        geometryRef.current.attributes.position.needsUpdate = true
        geometryRef.current.attributes.size.needsUpdate = true

        if (aliveCount === 0) {
            onComplete()
        }
    })

    return (
        <points ref={group} position={position}>
            <bufferGeometry ref={geometryRef}>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={new Float32Array(count * 3)}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={count}
                    array={new Float32Array(count).fill(1)}
                    itemSize={1}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.5}
                color={color}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                sizeAttenuation={true}
                map={getDiskTexture()} // Use a generated texture for soft particles
            />
        </points>
    )
}

// Helper to create a soft glow texture
let _diskTexture
function getDiskTexture() {
    if (_diskTexture) return _diskTexture

    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 32, 32)

    _diskTexture = new THREE.CanvasTexture(canvas)
    return _diskTexture
}
