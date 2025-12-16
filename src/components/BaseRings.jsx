import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function BaseRings() {
    const group = useRef()

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        group.current.rotation.y = -t * 0.1 // Counter-rotate slowly

        // Wobble effect
        group.current.rotation.z = Math.sin(t * 0.5) * 0.02
    })

    // Three rings with different radii
    const rings = [3, 4, 5]

    return (
        <group ref={group} position={[0, -3.2, 0]}>
            {rings.map((radius, i) => (
                <RingParticles key={i} radius={radius} count={100 + i * 50} speed={i % 2 === 0 ? 1 : -1} />
            ))}
        </group>
    )
}

function RingParticles({ radius, count, speed }) {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2
            p[i * 3] = Math.cos(angle) * radius
            p[i * 3 + 1] = (Math.random() - 0.5) * 0.2 // Slight vertical scatter
            p[i * 3 + 2] = Math.sin(angle) * radius
        }
        return p
    }, [radius, count])

    const ref = useRef()
    useFrame((state) => {
        ref.current.rotation.y += 0.005 * speed
    })

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={points} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                color="#ffe66d"
                transparent
                opacity={0.6}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    )
}
