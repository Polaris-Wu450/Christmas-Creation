import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

export function useHandLandmarker() {
    const [handLandmarker, setHandLandmarker] = useState(null);
    const videoRef = useRef(null);
    const [results, setResults] = useState(null);

    useEffect(() => {
        async function createHandLandmarker() {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );
            const landmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 2
            });
            setHandLandmarker(landmarker);
        }
        createHandLandmarker();
    }, []);

    useEffect(() => {
        if (!handLandmarker) return;

        const video = document.createElement("video");
        video.autoplay = true;
        video.playsInline = true;

        // Check for camera support
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            }).then((stream) => {
                video.srcObject = stream;
                video.addEventListener("loadeddata", () => {
                    videoRef.current = video;
                });
            });
        }

        return () => {
            if (video.srcObject) {
                const tracks = video.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        }
    }, [handLandmarker]);

    useFrame(() => {
        if (handLandmarker && videoRef.current && videoRef.current.readyState >= 2) {
            let startTimeMs = performance.now();
            const detections = handLandmarker.detectForVideo(videoRef.current, startTimeMs);
            setResults(detections);
        }
    });

    return results;
}
