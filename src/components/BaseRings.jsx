import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function BaseRings() {
    const group = useRef()

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        group.current.rotation.y = t * 0.05

        // Gentle floating
        group.current.position.y = -2.5 + Math.sin(t * 0.3) * 0.1
    })

    const rings = [3.2, 3.5, 3.8]

    return (
        <group ref={group} position={[0, -2.5, 0]}>
            {rings.map((radius, i) => (
                <ParticleRing
                    key={i}
                    radius={radius}
                    count={150 + i * 50}
                    opacity={0.6 - i * 0.1}
                    speed={i % 2 === 0 ? 1 : -0.5}
                />
            ))}
        </group>
    )
}

function ParticleRing({ radius, count, opacity, speed }) {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2
            const r = radius + (Math.random() - 0.5) * 0.3

            p[i * 3] = Math.cos(angle) * r
            p[i * 3 + 1] = (Math.random() - 0.5) * 0.15
            p[i * 3 + 2] = Math.sin(angle) * r
        }
        return p
    }, [radius, count])

    const ref = useRef()

    useFrame(() => {
        ref.current.rotation.y += 0.002 * speed
    })

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={points} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                color="#FCEEAC"
                transparent
                opacity={opacity}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                sizeAttenuation={true}
            />
        </points>
    )
}
