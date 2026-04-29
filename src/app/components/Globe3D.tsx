// Globe3D.tsx - Bright version with beautiful star background

import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Maximize2, Map } from "lucide-react";
import * as THREE from "three";

interface Globe3DProps {
  onTransitionToMap: () => void;
  showButton?: boolean;
}

export function Globe3D({ onTransitionToMap, showButton = true }: Globe3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const animationRef = useRef<number>();
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene setup - NO background color (transparent for CSS gradient)
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = window.innerWidth < 768 ? 3.5 : 2.8; // Zoom out on mobile
    cameraRef.current = camera;

    // Renderer setup with alpha for transparent background
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true, // Transparent background
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Define fallback function
    const createFallbackEarth = (): void => {
      console.log('🔵 Using fallback texture');
      setIsLoading(false);
    };

    // Load Earth texture
    const textureLoader = new THREE.TextureLoader();
    
    const earthTexture = textureLoader.load(
      'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
      (texture) => {
        console.log('✅ Texture loaded:', texture.image.width, 'x', texture.image.height);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.repeat.set(1, 1);
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error('❌ Texture failed:', error);
        createFallbackEarth();
      }
    );

    // Create Earth with brighter settings
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    const material = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.3, // Lower = shinier
      metalness: 0.05,
      emissive: new THREE.Color(0x112244), // Subtle blue glow
      emissiveIntensity: 0.15,
    });

    const earth = new THREE.Mesh(geometry, material);
    earth.castShadow = true;
    earth.receiveShadow = true;
    earthRef.current = earth;
    scene.add(earth);

    // Brighter cloud layer
    const cloudGeometry = new THREE.SphereGeometry(1.005, 64, 64);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);

    // Brighter atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(1.02, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: {
        glowColor: { value: new THREE.Color(0x5aa3ff) }, // Brighter blue
        intensity: { value: 0.6 }, // Increased intensity
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float intensity;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = dot(vNormal, viewDir);
          fresnel = pow(1.0 - fresnel, 2.0);
          
          vec3 color = mix(glowColor, vec3(0.7, 0.85, 1.0), fresnel);
          float alpha = fresnel * intensity;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Beautiful star field
    const createStarField = () => {
      const starsGeometry = new THREE.BufferGeometry();
      const starCount = 4000;
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount; i++) {
        const r = 50 + Math.random() * 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Bright white stars with slight color variation
        const brightness = 0.7 + Math.random() * 0.3;
        colors[i * 3] = brightness;
        colors[i * 3 + 1] = brightness * (0.9 + Math.random() * 0.1);
        colors[i * 3 + 2] = brightness;
      }

      starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const starsMaterial = new THREE.PointsMaterial({ 
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 1.0, // Full opacity
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });
      
      const stars = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(stars);
    };

    createStarField();

    // MUCH BRIGHTER lighting
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5); // Increased from 1.5
    sunLight.position.set(2, 1, 3);
    scene.add(sunLight);

    const fillLight1 = new THREE.DirectionalLight(0x6699ff, 0.8); // Brighter
    fillLight1.position.set(-1, 0, 2);
    scene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0xffaa77, 0.6); // Brighter
    fillLight2.position.set(0, 1, -2);
    scene.add(fillLight2);

    const ambientLight = new THREE.AmbientLight(0x8899aa, 1.2); // Much brighter
    scene.add(ambientLight);

    const backLight = new THREE.PointLight(0x5588cc, 0.5); // Brighter
    backLight.position.set(-1, 0, -2);
    scene.add(backLight);

    // Mouse interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0.002 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      rotationVelocity = { x: deltaY * 0.002, y: deltaX * 0.002 };
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => { isDragging = false; };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;
      rotationVelocity = { x: deltaY * 0.002, y: deltaX * 0.002 };
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => { isDragging = false; };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      if (earthRef.current) {
        earthRef.current.rotation.y += rotationVelocity.y;
        earthRef.current.rotation.x += rotationVelocity.x * 0.3;
        earthRef.current.rotation.x = Math.max(-0.3, Math.min(0.3, earthRef.current.rotation.x));

        if (clouds) {
          clouds.rotation.y = earthRef.current.rotation.y * 1.02;
          clouds.rotation.x = earthRef.current.rotation.x;
        }
        
        if (atmosphere) {
          atmosphere.rotation.y = earthRef.current.rotation.y;
          atmosphere.rotation.x = earthRef.current.rotation.x;
        }

        rotationVelocity.x *= 0.95;
        rotationVelocity.y *= 0.95;

        if (Math.abs(rotationVelocity.y) < 0.002) {
          rotationVelocity.y = 0.002 * Math.sign(rotationVelocity.y || 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      earthTexture.dispose();
    };
  }, []);

  return (
    <div 
      // className="relative w-screen h-screen bg-gradient-to-b from-black via-slate-900 to-slate-800 overflow-hidden"
       className="relative w-screen bg-gradient-to-b from-black via-slate-900 to-slate-800 overflow-hidden" style={{ height: '100dvh' }}

      onDoubleClick={onTransitionToMap}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-white text-xl font-medium">Loading Earth...</div>
          </div>
        </div>
      )}

      {showButton && !isLoading && (
        <>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            // className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10"
            className="absolute top-6 sm:top-8 left-0 right-0 text-center pointer-events-none z-10 px-4"
          >
           <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-2 sm:mb-3 drop-shadow-2xl">
            {/* <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-2xl"> */}
              Geography Master
            </h1>
            {/* <p className="text-white/90 text-lg drop-shadow-lg">
              Drag to rotate • Double-click to explore
            </p> */}
            <p className="text-white/90 text-sm sm:text-lg drop-shadow-lg">
           Drag to rotate · Tap to explore
          </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            onClick={onTransitionToMap}
            // className="absolute bottom-24 sm:bottom-12 left-1/2 -translate-x-1/2 px-6 sm:px-8 py-3.5 sm:py-4
  className="absolute left-1/2 -translate-x-1/2 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold text-base sm:text-lg shadow-2xl flex items-center gap-2 sm:gap-3 transition-all hover:scale-105 active:scale-95 z-20"
  style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
>
            <Map className="w-6 h-6" />
            Start Playing
            <Maximize2 className="w-5 h-5" />
          </motion.button>
        </>
      )}
    </div>
  );
}


// import React from "react";
// import { motion } from "motion/react";
// import { Map } from "lucide-react";

// interface Globe3DProps {
//   onTransitionToMap: () => void;
//   showButton?: boolean;
// }

// export function Globe3D({ onTransitionToMap, showButton = true }: Globe3DProps) {
//   return (
//     <div className="relative w-screen h-screen bg-gradient-to-b from-black via-slate-900 to-slate-800 flex items-center justify-center">
//       {showButton && (
//         <div className="text-center px-4">
//           <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-3 drop-shadow-2xl">
//             Geography Master
//           </h1>
//           <p className="text-white/90 text-sm sm:text-lg mb-8">
//             Explore the world
//           </p>
//           <motion.button
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             onClick={onTransitionToMap}
//             className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl flex items-center gap-3 mx-auto active:scale-95"
//           >
//             <Map className="w-6 h-6" />
//             Start Playing
//           </motion.button>
//         </div>
//       )}
//     </div>
//   );
// }