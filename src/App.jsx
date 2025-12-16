import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'

function App() {
    return (
        <div style={{ width: '100vw', height: '100vh', background: '#050510' }}>
            <Canvas shadows dpr={[1, 2]}>
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </Canvas>

            {/* UI Overlay */}
            <div
                style={{
                    position: 'absolute',
                    top: '5%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    fontFamily: "'Playfair Display', serif", // A nice serif if available, or fallbacks
                }}
            >
                <h1 style={{
                    fontSize: '3rem',
                    margin: 0,
                    textShadow: '0 0 10px rgba(168, 230, 207, 0.5)',
                    fontWeight: 300
                }}>
                    Merry Christmas
                </h1>
                <p style={{
                    fontSize: '1rem',
                    marginTop: '10px',
                    letterSpacing: '0.2em',
                    opacity: 0.7
                }}>
                    DREAM IN A WINTER WONDERLAND
                </p>
            </div>
        </div>
    )
}

export default App
