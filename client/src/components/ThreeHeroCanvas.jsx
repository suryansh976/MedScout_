import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeHeroCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Create Medical Network Nodes
    const nodeCount = 38;
    const geometry = new THREE.SphereGeometry(0.22, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x006a6a,
      transparent: true,
      opacity: 0.75
    });

    const primaryMaterial = new THREE.MeshBasicMaterial({
      color: 0x0b5fff,
      transparent: true,
      opacity: 0.85
    });

    const nodesGroup = new THREE.Group();
    const nodePositions = [];

    for (let i = 0; i < nodeCount; i++) {
      const isPrimary = i % 4 === 0;
      const mesh = new THREE.Mesh(geometry, isPrimary ? primaryMaterial : material);
      
      const x = (Math.random() - 0.5) * 32;
      const y = (Math.random() - 0.5) * 16;
      const z = (Math.random() - 0.5) * 14;

      mesh.position.set(x, y, z);
      nodesGroup.add(mesh);
      nodePositions.push(new THREE.Vector3(x, y, z));
    }

    // Connecting lines between nearby nodes
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x005cb8,
      transparent: true,
      opacity: 0.18
    });

    const lineGeometry = new THREE.BufferGeometry();
    const linePoints = [];

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodePositions[i].distanceTo(nodePositions[j]);
        if (dist < 8) {
          linePoints.push(nodePositions[i].x, nodePositions[i].y, nodePositions[i].z);
          linePoints.push(nodePositions[j].x, nodePositions[j].y, nodePositions[j].z);
        }
      }
    }

    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePoints, 3));
    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    nodesGroup.add(linesMesh);

    // Orbiting rings representing clinical scanning orbits
    const ringGeometry = new THREE.RingGeometry(9, 9.06, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x8cf3f3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 3;
    ring.rotation.y = Math.PI / 6;
    nodesGroup.add(ring);

    scene.add(nodesGroup);

    // Mouse movement parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Resize listener
    const onResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // Animation loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      nodesGroup.rotation.y = elapsedTime * 0.05 + mouseX * 0.2;
      nodesGroup.rotation.x = Math.sin(elapsedTime * 0.08) * 0.1 - mouseY * 0.15;
      ring.rotation.z = elapsedTime * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.65 }}
    />
  );
}
