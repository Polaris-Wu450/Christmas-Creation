import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import PinkTreeParticles from './PinkTreeParticles'
import Snow from './Snow'
import BaseRings from './BaseRings'
import TopDecoration from './TopDecoration'
import { useHandLandmarker } from '../hooks/useHandLandmarker'

// UI Overlay for Wish Input
function WishUI({ onWish, cameraEnabled, setCameraEnabled }) {
    const [wish, setWish] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (wish.trim()) {
            onWish(wish)
            setWish('')
        }
    }

    return (
        <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '500px',
            textAlign: 'center',
            zIndex: 10,
            fontFamily: "'Space Mono', monospace",
            color: 'white'
        }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <input
                    type="text"
                    value={wish}
                    onChange={(e) => setWish(e.target.value)}
                    placeholder="Make a wish..."
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        padding: '10px 20px',
                        borderRadius: '20px',
                        color: 'white',
                        fontFamily: 'inherit',
                        outline: 'none',
                        width: '250px'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        background: 'rgba(255, 105, 180, 0.6)',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '10px 20px',
                        color: 'white',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    SEND
                </button>
            </form>

            <div style={{ marginTop: '20px' }}>
                <label style={{ cursor: 'pointer', fontSize: '0.8rem', opacity: 0.8 }}>
                    <input
                        type="checkbox"
                        checked={cameraEnabled}
                        onChange={(e) => setCameraEnabled(e.target.checked)}
                        style={{ marginRight: '8px' }}
                    />
                    Enable Camera for Magic Gestures
                </label>
            </div>

            {cameraEnabled && <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '5px' }}>
                👐 Open hands to Unleash Energy | ✊ Close hands to Contain
            </div>}
        </div>
    )
}

function GestureController({ isCameraEnabled, setGestureFactor }) {
    const results = useHandLandmarker()

    useEffect(() => {
        if (!isCameraEnabled || !results || !results.landmarks) return

        // Simple logic: Detect if hand is open or closed
        // We can check distance between thumb tip and index tip, or average finger extension
        // Let's use bounding box or average spread?

        let isOpen = false
        if (results.landmarks.length > 0) {
            const hand = results.landmarks[0] // Use first hand
            // Check distance between wrist (0) and middle finger tip (12)
            // vs Wrist (0) and middle finger mcp (9)
            // Or just check if tips are far from palm center

            // Heuristic: Distance between index tip (8) and thumb tip (4)
            const dx = hand[8].x - hand[4].x
            const dy = hand[8].y - hand[4].y
            const dist = Math.sqrt(dx * dx + dy * dy)

            // Threshold might need tuning based on camera distance
            if (dist > 0.15) isOpen = true

            // Better Heuristic for "Unleash": all fingers extended
            // But let's stick to the prompt: Open -> Scale 3x, Closed -> Scale 1x
            // We'll pass a target scale factor
        }

        setGestureFactor(isOpen ? 3.0 : 1.0)

    }, [results, isCameraEnabled, setGestureFactor])

    return null
}

export default function Scene() {
    const [gestureScale, setGestureScale] = useState(1)
    const [cameraEnabled, setCameraEnabled] = useState(false)

    // Wish Animation Logic (simplified placeholder for now)
    const handleWish = (text) => {
        console.log("Wish made:", text)
        // Trigger particle animation here (would need a state for 'wishing' particles)
    }

    return (
        <>
            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2, 12], fov: 50 }}>
                <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={50} />
                <OrbitControls
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.8}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                    zoomSpeed={0.5}
                />

                {/* Ambient & Background */}
                <ambientLight intensity={0.2} color="#220011" />
                <color attach="background" args={['#050005']} />

                {/* Main Content */}
                <PinkTreeParticles count={4000} gestureScale={gestureScale} />
                <BaseRings />
                <TopDecoration />
                <Snow />

                {/* Post Processing */}
                <EffectComposer disableNormalPass>
                    <Bloom
                        luminanceThreshold={0.2}
                        mipmapBlur
                        intensity={1.2}
                        radius={0.5}
                        levels={8}
                    />
                    <Vignette eskil={false} offset={0.1} darkness={1.0} />
                </EffectComposer>

                {cameraEnabled && <GestureController isCameraEnabled={cameraEnabled} setGestureFactor={setGestureScale} />}
            </Canvas>

            <WishUI
                onWish={handleWish}
                cameraEnabled={cameraEnabled}
                setCameraEnabled={setCameraEnabled}
            />
        </>
    )
}
