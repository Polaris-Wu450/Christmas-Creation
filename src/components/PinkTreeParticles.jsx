import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Shader for the particles
const vertexShader = `
  uniform float uTime;
  uniform float uScaleFactor; // Add scaling uniform
  uniform float uHighlight; // Add highlight intensity
  attribute float aScale;
  attribute vec3 aColor;
  varying vec3 vColor;
  
  void main() {
    // Boost color brightness based on uHighlight
    // uHighlight will be 1.0 normally, and higher (e.g., 2.0-3.0) when active
    vColor = aColor * uHighlight;
    vec3 pos = position; // This is the base position
    
    // Scale the entire structure based on gesture
    // Apply uScaleFactor to expand outward from center (0,0,0)
    pos *= uScaleFactor;

    // Gentle floating/breathing animation
    // We keep animation relative to original position to avoid amplifying it too much
    float angle = uTime * 0.5 + position.y * 0.5;
    pos.x += sin(angle) * 0.02 * uScaleFactor; 
    pos.z += cos(angle) * 0.02 * uScaleFactor;
    pos.y += sin(uTime + position.x) * 0.02;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Size attenuation
    gl_PointSize = aScale * (300.0 / -mvPosition.z);
    
    // Pulse size
    gl_PointSize *= (1.0 + sin(uTime * 3.0 + pos.y * 10.0) * 0.2);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  varying vec3 vColor;
  
  void main() {
    // Soft circle sprite
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if(ll > 0.5) discard;
    
    // Glow effect
    float strength = (0.5 - ll) * 2.0;
    strength = pow(strength, 1.5); // Cinematic falloff
    
    gl_FragColor = vec4(vColor * 1.5, strength); // Boost color for bloom
  }
`

export default function PinkTreeParticles({ count = 3000, gestureScale = 1, gesturePan = 0, isHighlighted = false }) {
    const mesh = useRef()

    const { positions, colors, scales } = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        const scales = new Float32Array(count)

        const colorWarmPink = new THREE.Color('#FF6B90')
        const colorSoftPink = new THREE.Color('#FF9FB5')
        const colorLightPink = new THREE.Color('#FFEBF0') // Highlight
        const colorGold = new THREE.Color('#FBC96B')

        for (let i = 0; i < count; i++) {
            // Height: 0 to 6
            const h = Math.random() * 6
            const yNormalized = h / 6 // 0 to 1

            // Cone radius at this height: decreases as h increases
            const maxRadius = 2.5 * (1.0 - yNormalized)

            // Random position in circle at this height
            const r = Math.sqrt(Math.random()) * maxRadius
            const theta = Math.random() * Math.PI * 2

            let x = r * Math.cos(theta)
            let z = r * Math.sin(theta)
            let y = h - 3 // Center roughly at 0 vertically (-3 to 3)

            // Assign to arrays
            positions[i * 3] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z

            // --- Color Logic ---
            let finalColor

            // 2. Outer shell mask
            const isOuterLayer = r > maxRadius * 0.75

            if (isOuterLayer) {
                // 3. Height-based gradient for outer layer
                // High probability of light/gold at bottom (yNormalized=0), low at top
                const heightFactor = 1.0 - Math.min(Math.max(yNormalized, 0.0), 1.0)

                // 4. Color distribution
                const rand = Math.random()
                const probLightPink = 0.25 * heightFactor
                const probGold = 0.15 * heightFactor

                if (rand < probLightPink) {
                    finalColor = colorLightPink
                } else if (rand < probLightPink + probGold) {
                    finalColor = colorGold
                } else {
                    // Remaining outer are warm pinks
                    finalColor = Math.random() > 0.5 ? colorWarmPink : colorSoftPink
                }
            } else {
                // 5. Inner particles
                finalColor = Math.random() > 0.5 ? colorWarmPink : colorSoftPink
            }

            colors[i * 3] = finalColor.r
            colors[i * 3 + 1] = finalColor.g
            colors[i * 3 + 2] = finalColor.b

            // Scale variation
            scales[i] = Math.random() * 0.15 + 0.05
        }

        return { positions, colors, scales }
    }, [count])

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uScaleFactor: { value: 1.0 },
        uHighlight: { value: 1.0 }
    }), [])

    // Use a ref to store smoothed pan value for fluid rotation
    const smoothedPan = useRef(0)

    useFrame((state, delta) => {
        // Update uScaleFactor smoothly based on prop
        const currentScale = mesh.current.material.uniforms.uScaleFactor.value
        mesh.current.material.uniforms.uScaleFactor.value = THREE.MathUtils.lerp(currentScale, gestureScale, 0.1)

        // Handle Highlight Transition
        const targetHighlight = isHighlighted ? 3.0 : 1.0
        const currentHighlight = mesh.current.material.uniforms.uHighlight.value
        // Fast attack, slow release? Or just smooth lerp
        // If highlighted (spike), move fast. If release, move a bit slower.
        const lerpFactor = isHighlighted ? 0.1 : 0.02
        mesh.current.material.uniforms.uHighlight.value = THREE.MathUtils.lerp(currentHighlight, targetHighlight, lerpFactor)

        mesh.current.material.uniforms.uTime.value = state.clock.getElapsedTime()

        // 1. Smooth out the input gesturePan
        // Interpolate current smoothed value towards the raw input `gesturePan`
        // Factor 0.05 makes it heavier/smoother, 0.1 is more responsive
        smoothedPan.current = THREE.MathUtils.lerp(smoothedPan.current, gesturePan, 0.05)

        // Base auto-rotation speed
        const autoRotation = state.clock.getElapsedTime() * 0.05

        // Apply smoothed gesture pan to rotation
        // Lower sensitivity slightly (* 1.5 instead of 2)
        const gestureRotation = -smoothedPan.current * 1.5

        mesh.current.rotation.y = autoRotation + gestureRotation

        // Ensure Z rotation is reset
        mesh.current.rotation.z = 0
    })

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aColor"
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aScale"
                    count={scales.length}
                    array={scales}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexColors
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                transparent
            />
        </points>
    )
}
