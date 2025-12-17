import React, { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Standard cubic easing function
function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export default function WishEffect({ wishes, onReachTop }) {
    return (
        <group>
            {wishes.map((wish) => (
                <WishParticle
                    key={wish.id}
                    wish={wish}
                    onComplete={() => onReachTop(wish.id)}
                />
            ))}
        </group>
    )
}

function WishParticle({ wish, onComplete }) {
    const group = useRef()
    const trailRef = useRef()

    // Define path points
    const startPos = new THREE.Vector3(0, -3, 8)
    const endPos = new THREE.Vector3(0, 3.2, 0) // Tree top

    // Random control point for curve
    const controlPoint = useMemo(() => {
        const side = Math.random() > 0.5 ? 1 : -1
        return new THREE.Vector3(
            side * (3 + Math.random() * 2), // x offset for curve
            0,
            4 // z mid
        )
    }, [])

    const startTime = useMemo(() => Date.now(), [])
    const duration = 2500 // 2.5 seconds flight

    useFrame(() => {
        const now = Date.now()
        const progress = Math.min((now - startTime) / duration, 1)

        // Easing
        const t = easeInOutCubic(progress)

        // Quadratic Bezier Curve calculation
        // P = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
        const p0 = startPos
        const p1 = controlPoint
        const p2 = endPos

        const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x
        const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y
        const z = Math.pow(1 - t, 2) * p0.z + 2 * (1 - t) * t * p1.z + Math.pow(t, 2) * p2.z

        if (group.current) {
            group.current.position.set(x, y, z)
            // Rotate particle group for dynamic feel
            group.current.rotation.z += 0.1
            group.current.rotation.y += 0.1

            // Scale down slightly as it reaches top?
            // Or scale up? Let's keep it steady then shrink at very end
            if (progress > 0.9) {
                const shrink = (1 - progress) * 10
                group.current.scale.setScalar(shrink)
            }
        }

        if (progress >= 1) {
            onComplete()
        }
    })

    return (
        <group ref={group}>
            {/* Core Glow Orb */}
            <mesh>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshBasicMaterial
                    color="#FF6B90"
                    transparent
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Outer Halo */}
            <mesh scale={1.8}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshBasicMaterial
                    color="#FF9FB5"
                    transparent
                    opacity={0.3}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Sparkles trailing (simplified as children for now) */}
            <Sparkles count={10} />
        </group>
    )
}

function Sparkles({ count }) {
    const points = useMemo(() => {
        // Random points in sphere volume
        const pts = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const r = 0.3
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            pts[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            pts[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            pts[i * 3 + 2] = r * Math.cos(phi)
        }
        return pts
    }, [count])

    const ref = useRef()
    useFrame(() => {
        ref.current.rotation.y -= 0.05
    })

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={points} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color="white"
                transparent
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    )
}
