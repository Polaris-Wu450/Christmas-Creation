import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

export default function TopDecoration() {
    const ref = useRef()

    // Heart Shape - Denser particles for "solid" look
    const { positions, colors, sizes } = useMemo(() => {
        const count = 1500 // Increased density
        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        const sizes = new Float32Array(count)

        const colorWarm = new THREE.Color('#DF0041')
        const colorSoft = new THREE.Color('#FF9FB5')
        const colorGold = new THREE.Color('#FBC96B')

        // Fallback to parametric heart for better particle volume
        for (let i = 0; i < count; i++) {
            // Random t
            const t = Math.random() * Math.PI * 2
            // Random internal fill factor
            const r = Math.pow(Math.random(), 1 / 3) // Bias towards surface

            // Heart equation scaling
            const scale = 0.02 * r

            const x = 16 * Math.pow(Math.sin(t), 3) * scale
            const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale
            const z = (Math.random() - 0.5) * 0.5 * r // Thickness

            positions[i * 3] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z

            // 2. Color Palette
            const rand = Math.random()
            let c
            if (rand > 0.9) c = colorGold // Sparkle
            else if (rand > 0.7) c = colorSoft // Shimmer
            else c = colorWarm // Main

            colors[i * 3] = c.r
            colors[i * 3 + 1] = c.g
            colors[i * 3 + 2] = c.b

            sizes[i] = Math.random() * 0.8 + 0.2
        }

        return { positions, colors, sizes }
    }, [])

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        // Gentle rotation
        ref.current.rotation.y = t * 0.5

        // 5. Subtle Animation: Pulse
        const pulse = 1 + Math.sin(t * 2) * 0.05
        ref.current.scale.set(pulse, pulse, pulse)
    })

    return (
        <group position={[0, 3.4, 0]}>
            <points ref={ref}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
                    <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
                </bufferGeometry>
                <pointsMaterial
                    vertexColors
                    size={0.15}
                    transparent
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    map={getGlowSprite()} // Optional: soft texture
                />
            </points>

            {/* 3. Outer Halo */}
            <mesh>
                <planeGeometry args={[2, 2]} />
                <meshBasicMaterial
                    color="#ff69b4"
                    transparent
                    opacity={0.15}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                >
                    <canvasTexture attach="map" args={[generateHaloTexture()]} />
                </meshBasicMaterial>
            </mesh>
        </group>
    )
}

function getGlowSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(canvas)
    return texture;
}

function generateHaloTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255, 105, 180, 0.5)'); // Pink center
    g.addColorStop(0.5, 'rgba(255, 105, 180, 0.1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return canvas;
}
