import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, useFBX } from '@react-three/drei';
import * as THREE from 'three';

export default function HeroModel(props) {
  const group = useRef();
  
  // Load character
  const { scene } = useGLTF('/3D-model/model (1).glb');
  
  // Load animation
  const fbx = useFBX('/3D-model/Standing Greeting.fbx');
  
  // Setup animations using the fbx's animation clips applied to the GLB scene
  const { actions, names } = useAnimations(fbx.animations, group);
  
  const headRef = useRef(null);
  const [greetingDone, setGreetingDone] = useState(false);

  useEffect(() => {
    // Find the head or neck bone to rotate
    scene.traverse((child) => {
      if (child.isBone) {
        // Typically named Head, mixamorigHead, etc.
        const name = child.name.toLowerCase();
        if (name.includes('head') || name.includes('neck')) {
          headRef.current = child;
        }
      }
    });

    // Play greeting animation
    if (names.length > 0) {
      const actionName = names[0];
      const action = actions[actionName];
      if (action) {
        action.reset().setLoop(THREE.LoopOnce, 1).play();
        action.clampWhenFinished = true;
        
        // After animation finishes, allow head tracking
        const duration = action.getClip().duration;
        const timer = setTimeout(() => {
          setGreetingDone(true);
        }, duration * 1000 + 500); // add half sec buffer
        
        return () => clearTimeout(timer);
      }
    } else {
      // If no animations found, just enable tracking immediately
      setGreetingDone(true);
    }
  }, [actions, names, scene]);

  useFrame((state) => {
    if (greetingDone && headRef.current) {
      // The cursor coordinates are state.pointer.x and state.pointer.y (-1 to 1)
      const targetX = state.pointer.x * 1.5;
      const targetY = state.pointer.y * 1.5;
      
      // We want to rotate the head. We need to lerp the rotation for smoothness.
      const maxRot = Math.PI / 3;
      const rotX = THREE.MathUtils.clamp(-targetY, -maxRot, maxRot);
      const rotY = THREE.MathUtils.clamp(targetX, -maxRot, maxRot);

      if (headRef.current) {
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, rotX, 0.05);
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, rotY, 0.05);
      } else if (group.current) {
        // Fallback: rotate the whole body slightly
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, rotX * 0.2, 0.05);
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, rotY * 0.5, 0.05);
      }
    } else if (!greetingDone && group.current) {
      // If greeting animation fails to play visually, at least make the model sway slightly
      group.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

// Preload to ensure fast loading
useGLTF.preload('/3D-model/model (1).glb');
useFBX.preload('/3D-model/Standing Greeting.fbx');
