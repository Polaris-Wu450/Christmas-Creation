import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import PinkTreeParticles from './PinkTreeParticles'
import Snow from './Snow'
import BaseRings from './BaseRings'
import TopDecoration from './TopDecoration'
import WishEffect from './WishEffect'
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
                👐 Open hands to Unleash Energy | ✊ Close hands to Contain | 👋 Wave to Sway
            </div>}
        </div>
    )
}

function GestureController({ isCameraEnabled, setGestureFactor, setGesturePan }) {
    const results = useHandLandmarker()

    useEffect(() => {
        if (!isCameraEnabled || !results || !results.landmarks) return

        // Valid hand detected
        if (results.landmarks.length > 0) {
            const hand = results.landmarks[0] // Use first hand

            // 1. OPEN/CLOSE Logic
            // Distance between Index Tip (8) and Thumb Tip (4)
            const dx = hand[8].x - hand[4].x
            const dy = hand[8].y - hand[4].y
            const dist = Math.sqrt(dx * dx + dy * dy)

            // Lower threshold slightly to make it easier to trigger
            // 0.12 is usually good for webcam distance
            const isOpen = dist > 0.12
            setGestureFactor(isOpen ? 3.0 : 1.0)

            // 2. ROTATION Logic
            // Use wrist (0) x-coordinate centered at 0.5
            const handX = hand[0].x

            // Invert x for mirror effect and scale sensitivity
            // Clamp value to avoid extreme spinning if hand tracking glitches
            const rawPan = -(handX - 0.5) * 3
            const clampedPan = Math.max(-1.5, Math.min(1.5, rawPan))

            setGesturePan(clampedPan)
        } else {
            // Reset if no hand
            // Don't reset Scale immediately to avoid flickering if hand is lost briefly?
            // But for now, safe default is 1.0
            setGesturePan(0)
            setGestureFactor(1.0)
        }

    }, [results, isCameraEnabled, setGestureFactor, setGesturePan])

    return null
}

export default function Scene() {
    const [gestureScale, setGestureScale] = useState(1)
    const [gesturePan, setGesturePan] = useState(0)
    const [cameraEnabled, setCameraEnabled] = useState(false)

    // Wish Logic
    const [wishes, setWishes] = useState([])
    const [treeHighlight, setTreeHighlight] = useState(false)

    const handleWish = (text) => {
        console.log("Wish made:", text)
        const id = Date.now()
        setWishes(prev => [...prev, { id, text }])
    }

    const handleWishComplete = (id) => {
        // Remove wish
        setWishes(prev => prev.filter(w => w.id !== id))

        // Trigger highlight
        setTreeHighlight(true)
        setTimeout(() => setTreeHighlight(false), 1000) // Highlight for 1 second
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
                <PinkTreeParticles
                    count={4000}
                    gestureScale={gestureScale}
                    gesturePan={gesturePan}
                    isHighlighted={treeHighlight}
                />
                <BaseRings />
                <TopDecoration />
                <Snow />
                <WishEffect wishes={wishes} onReachTop={handleWishComplete} />

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

                {cameraEnabled &&
                    <GestureController
                        isCameraEnabled={cameraEnabled}
                        setGestureFactor={setGestureScale}
                        setGesturePan={setGesturePan}
                    />
                }
            </Canvas>

            <WishUI
                onWish={handleWish}
                cameraEnabled={cameraEnabled}
                setCameraEnabled={setCameraEnabled}
            />
        </>
    )
}
