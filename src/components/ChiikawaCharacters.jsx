import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ChiikawaCharacters() {
    const group = useRef()

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        if (group.current) {
            group.current.children.forEach((child, i) => {
                // Gentle bounce
                child.position.y = -2.7 + Math.sin(t * 4 + i) * 0.02
            })
        }
    })

    // Layout Adjustment:
    // Move slightly further OUT (Z ~ 2.6) to avoid being inside the tree particles.
    // Base Rings start around 3.2, so 2.6 is safely between tree skirt (radius ~2.5) and rings.
    return (
        <group ref={group}>
            {/* Chiikawa (Center) */}
            <Chiikawa position={[0, -2.7, 2.6]} rotation={[0, 0, 0]} />

            {/* Hachiware (Left) - Curving in */}
            <Hachiware position={[-0.8, -2.7, 2.5]} rotation={[0, 0.3, 0]} />

            {/* Usagi (Right) - Curving in */}
            <Usagi position={[0.8, -2.7, 2.5]} rotation={[0, -0.3, 0]} />
        </group>
    )
}

function CartoonMaterial({ color }) {
    return <meshBasicMaterial color={color} toneMapped={false} />
}

function CharacterBody({ color, scale, children, eyebrows = 'normal' }) {
    return (
        <group scale={scale}>
            {/* Main Body */}
            <mesh position={[0, 0.4, 0]}>
                <sphereGeometry args={[0.42, 32, 32]} />
                <CartoonMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.25, 0]} scale={[1.05, 0.8, 1.05]}>
                <sphereGeometry args={[0.4, 32, 32]} />
                <CartoonMaterial color={color} />
            </mesh>

            {/* Legs */}
            <group position={[-0.15, 0.05, 0]}>
                <mesh>
                    <capsuleGeometry args={[0.08, 0.18, 4, 8]} />
                    <CartoonMaterial color={color} />
                </mesh>
            </group>
            <group position={[0.15, 0.05, 0]}>
                <mesh>
                    <capsuleGeometry args={[0.09, 0.18, 4, 8]} />
                    <CartoonMaterial color={color} />
                </mesh>
            </group>

            {/* Arms */}
            <group position={[-0.4, 0.3, 0.1]} rotation={[0, 0, 0.7]}>
                <mesh>
                    <capsuleGeometry args={[0.07, 0.2, 4, 8]} />
                    <CartoonMaterial color={color} />
                </mesh>
            </group>
            <group position={[0.4, 0.3, 0.1]} rotation={[0, 0, -0.7]}>
                <mesh>
                    <capsuleGeometry args={[0.07, 0.2, 4, 8]} />
                    <CartoonMaterial color={color} />
                </mesh>
            </group>

            {/* Face */}
            <FaceFeatures eyebrowType={eyebrows} />

            {children}
        </group>
    )
}

function FaceFeatures({ eyebrowType }) {
    return (
        <group position={[0, 0.45, 0.44]}> {/* Moved Z forward to 0.44 to sit ON TOP of head surface (r=0.43) */}

            {/* Eyes */}
            <mesh position={[-0.13, 0.05, 0]}>
                <sphereGeometry args={[0.045, 16, 16]} />
                <meshBasicMaterial color="black" />
                <mesh position={[0.015, 0.015, 0.03]}>
                    <sphereGeometry args={[0.015, 8, 8]} />
                    <meshBasicMaterial color="white" />
                </mesh>
            </mesh>
            <mesh position={[0.13, 0.05, 0]}>
                <sphereGeometry args={[0.045, 16, 16]} />
                <meshBasicMaterial color="black" />
                <mesh position={[-0.015, 0.015, 0.03]}>
                    <sphereGeometry args={[0.015, 8, 8]} />
                    <meshBasicMaterial color="white" />
                </mesh>
            </mesh>

            {/* Blush */}
            <mesh position={[-0.22, -0.06, -0.02]} rotation={[0, 0.2, 0]}>
                <circleGeometry args={[0.065, 16]} />
                <meshBasicMaterial color="#FFB7C5" />
            </mesh>
            <mesh position={[0.22, -0.06, -0.02]} rotation={[0, -0.2, 0]}>
                <circleGeometry args={[0.065, 16]} />
                <meshBasicMaterial color="#FFB7C5" />
            </mesh>

            {/* Mouth */}
            <group position={[0, -0.03, 0.02]} scale={0.8}>
                <mesh position={[-0.035, 0, 0]} rotation={[0, 0, Math.PI / 2 + 0.2]}>
                    <torusGeometry args={[0.025, 0.006, 8, 16, Math.PI]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                <mesh position={[0.035, 0, 0]} rotation={[0, 0, Math.PI / 2 - 0.2]}>
                    <torusGeometry args={[0.025, 0.006, 8, 16, Math.PI]} />
                    <meshBasicMaterial color="black" />
                </mesh>
            </group>

            {/* Eyebrows - Fixed Z positions */}
            {eyebrowType === 'chiikawa' && (
                <>
                    <mesh position={[-0.12, 0.18, 0]} rotation={[0, 0, 0.4]}>
                        <capsuleGeometry args={[0.008, 0.05, 4, 8]} />
                        <meshBasicMaterial color="black" />
                    </mesh>
                    <mesh position={[0.12, 0.18, 0]} rotation={[0, 0, -0.4]}>
                        <capsuleGeometry args={[0.008, 0.05, 4, 8]} />
                        <meshBasicMaterial color="black" />
                    </mesh>
                </>
            )}

            {eyebrowType === 'hachiware' && (
                <>
                    <mesh position={[-0.12, 0.18, 0]} rotation={[0, 0, -0.2]}>
                        <capsuleGeometry args={[0.008, 0.04, 4, 8]} />
                        <meshBasicMaterial color="black" />
                    </mesh>
                    <mesh position={[0.12, 0.18, 0]} rotation={[0, 0, 0.2]}>
                        <capsuleGeometry args={[0.008, 0.04, 4, 8]} />
                        <meshBasicMaterial color="black" />
                    </mesh>
                </>
            )}

            {eyebrowType === 'usagi' && (
                <>
                    <mesh position={[-0.12, 0.22, 0]} rotation={[0, 0, 0]}>
                        <capsuleGeometry args={[0.008, 0.04, 4, 8]} />
                        <meshBasicMaterial color="black" />
                    </mesh>
                    <mesh position={[0.12, 0.22, 0]} rotation={[0, 0, 0]}>
                        <capsuleGeometry args={[0.008, 0.04, 4, 8]} />
                        <meshBasicMaterial color="black" />
                    </mesh>
                </>
            )}
        </group>
    )
}

function Chiikawa({ position, rotation }) {
    return (
        <group position={position} rotation={rotation}>
            <CharacterBody color="#FFFFFF" scale={0.55} eyebrows="chiikawa">
                <group position={[-0.2, 0.75, -0.05]}>
                    <mesh>
                        <sphereGeometry args={[0.09, 16, 16]} />
                        <CartoonMaterial color="#FFFFFF" />
                    </mesh>
                </group>
                <group position={[0.2, 0.75, -0.05]}>
                    <mesh>
                        <sphereGeometry args={[0.09, 16, 16]} />
                        <CartoonMaterial color="#FFFFFF" />
                    </mesh>
                </group>
            </CharacterBody>
        </group>
    )
}

// Generate Hachiware's unique texture V2
function getHachiTexture() {
    const size = 1024
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    // 1. Fill base WHITE
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, size, size)

    // 2. Draw BLUE TOP CAP
    ctx.fillStyle = '#4A90E2'
    // Cover the top half roughly
    // In standard UV, Y=0 is bottom?, Y=1 is top? 
    // Usually UV(0,0) is bottom left. So Y=1 is top pole.
    // So painting at Y=0 to Y=H is painting Top to Bottom of sphere. CORRECT.

    // We paint Blue from Y=0 down to Y=300 (approx)
    // But we need the CUTOUT.

    // We define the bottom edge of the blue area.
    // It's low on sides, high in center.
    // Center of texture X = 512.

    // Shape:
    // Start Left Edge (X=0) at Y=400 (Low)
    ctx.beginPath()
    ctx.moveTo(0, 0) // Top Left corner
    ctx.lineTo(size, 0) // Top Right corner
    ctx.lineTo(size, 400) // Bottom Right start of hair

    // Curve to Center Peak
    // We want a sharp peak at X=512. Y should be much smaller (higher up), e.g., Y=150.
    // Line from (1024, 400) to (512, 150)
    // To make it slightly curved like a cat forehead:
    // Use Quadratic Bezier. Control point slightly outwards?
    // Actually, straight lines make the sharpest peak.
    // Let's use slight curve (concave up) to make it look "draped".
    // Control point at (768, 450) -> Keeps it low then rises sharply?

    // Let's try straight lines first for guaranteed sharpness.
    /*
    ctx.lineTo(512, 180) // The Peak (White forehead tip)
    ctx.lineTo(0, 400) // Back to Left
    */

    // With Bezier for style:
    // Right side curve
    ctx.quadraticCurveTo(768, 450, 512, 180)
    // Left side curve
    ctx.quadraticCurveTo(256, 450, 0, 400)

    ctx.lineTo(0, 0) // Close loop
    ctx.fill()

    // Note: The seam is at X=0 and X=1024.
    // We need to make sure Y at X=0 matches Y at X=1024.
    // Current: 400 and 400. Matches.
    // Also the curve tangent should ideally match, but back of head is less critical.

    return new THREE.CanvasTexture(canvas)
}

function Hachiware({ position, rotation }) {
    const texture = React.useMemo(() => getHachiTexture(), [])

    return (
        <group position={position} rotation={rotation}>
            <CharacterBody color="#FFFFFF" scale={0.55} eyebrows="hachiware">
                {/* HEAD with Custom Texture */}
                <group position={[0, 0.45, 0]}>
                    {/* Rotate Y so the seam is at the back, Center(512) is at front */}
                    {/* UV Mapping: Center of image X=0.5 usually maps to +Z or -Z depending on rotation. */}
                    {/* We need to rotate mesh so texture center faces front (-Z in local space if looking that way?) */}
                    {/* Let's try rotation -PI/2 or PI/2 */}
                    <mesh rotation={[0, -Math.PI / 2, 0]}>
                        <sphereGeometry args={[0.43, 64, 64]} />
                        <meshBasicMaterial map={texture} toneMapped={false} />
                    </mesh>
                </group>

                {/* Pointy Cat Ears (Cone) */}
                {/* Position needs to be careful not to be inside the head if head is bigger */}
                <group position={[-0.28, 0.78, 0]} rotation={[0, 0, 0.35]}>
                    <mesh>
                        <coneGeometry args={[0.14, 0.28, 16]} />
                        <CartoonMaterial color="#4A90E2" />
                    </mesh>
                </group>
                <group position={[0.28, 0.78, 0]} rotation={[0, 0, -0.35]}>
                    <mesh>
                        <coneGeometry args={[0.14, 0.28, 16]} />
                        <CartoonMaterial color="#4A90E2" />
                    </mesh>
                </group>
            </CharacterBody>
        </group>
    )
}

function Usagi({ position, rotation }) {
    return (
        <group position={position} rotation={rotation}>
            <CharacterBody color="#FFFACD" scale={0.55} eyebrows="usagi">
                <group position={[-0.08, 0.9, 0]} rotation={[0, 0, 0.05]}>
                    <mesh>
                        <capsuleGeometry args={[0.085, 0.45, 4, 8]} />
                        <CartoonMaterial color="#FFFACD" />
                    </mesh>
                    <mesh position={[0, 0.02, 0.075]} rotation={[-0.1, 0, 0]}>
                        <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
                        <meshBasicMaterial color="#FFB7C5" />
                    </mesh>
                </group>
                <group position={[0.08, 0.9, 0]} rotation={[0, 0, -0.05]}>
                    <mesh>
                        <capsuleGeometry args={[0.085, 0.45, 4, 8]} />
                        <CartoonMaterial color="#FFFACD" />
                    </mesh>
                    <mesh position={[0, 0.02, 0.075]} rotation={[-0.1, 0, 0]}>
                        <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
                        <meshBasicMaterial color="#FFB7C5" />
                    </mesh>
                </group>

                <mesh position={[0, 0.2, -0.38]}>
                    <sphereGeometry args={[0.1, 16, 16]} />
                    <CartoonMaterial color="#FFFFFF" />
                </mesh>
            </CharacterBody>
        </group>
    )
}
