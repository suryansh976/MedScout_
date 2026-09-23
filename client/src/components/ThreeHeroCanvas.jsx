import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeHeroCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 24);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // 2. Hospital & Emergency Lighting (Ambulance Strobe & Clinical Illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Emergency red flasher
    const emergencyRedLight = new THREE.PointLight(0xef4444, 3.2, 45);
    emergencyRedLight.position.set(-15, 8, 10);
    scene.add(emergencyRedLight);

    // Emergency cyan/blue flasher
    const emergencyBlueLight = new THREE.PointLight(0x0284c7, 3.0, 50);
    emergencyBlueLight.position.set(15, -6, 12);
    scene.add(emergencyBlueLight);

    const hospitalGroup = new THREE.Group();
    scene.add(hospitalGroup);

    // 3. Helper to create an authentic 3D Medical Emergency Cross (with white border / contrast core)
    const createMedicalCross = (colorHex, emissiveHex, size = 1, withBase = true) => {
      const crossGroup = new THREE.Group();
      
      const crossMaterial = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: emissiveHex,
        emissiveIntensity: 0.7,
        roughness: 0.2,
        metalness: 0.35,
        transparent: true,
        opacity: 0.95
      });

      // Horizontal Bar
      const horizGeo = new THREE.BoxGeometry(2.6 * size, 0.8 * size, 0.55 * size);
      const horizMesh = new THREE.Mesh(horizGeo, crossMaterial);
      crossGroup.add(horizMesh);

      // Vertical Bar
      const vertGeo = new THREE.BoxGeometry(0.8 * size, 2.6 * size, 0.55 * size);
      const vertMesh = new THREE.Mesh(vertGeo, crossMaterial);
      crossGroup.add(vertMesh);

      // White clinical backing disc / shield for authentic hospital first-aid badge look
      if (withBase) {
        const discGeo = new THREE.CylinderGeometry(1.6 * size, 1.6 * size, 0.12 * size, 32);
        const discMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.3,
          metalness: 0.1,
          transparent: true,
          opacity: 0.85
        });
        const discMesh = new THREE.Mesh(discGeo, discMat);
        discMesh.rotation.x = Math.PI / 2;
        discMesh.position.z = -0.32 * size;
        crossGroup.add(discMesh);
      }

      return crossGroup;
    };

    // Instantiate 6 Authentic 3D Emergency Crosses (Red Cross & Hospital Cyan)
    const crosses = [
      { mesh: createMedicalCross(0xdc2626, 0xef4444, 1.05, true), x: -14, y: 5.5, z: -3, rotSpeed: 0.007 },
      { mesh: createMedicalCross(0x0284c7, 0x38bdf8, 0.9, true), x: 15, y: 4, z: -2, rotSpeed: -0.006 },
      { mesh: createMedicalCross(0x059669, 0x10b981, 0.75, true), x: -11, y: -6, z: 2, rotSpeed: 0.008 },
      { mesh: createMedicalCross(0xdc2626, 0xb91c1c, 0.65, true), x: 13, y: -6.5, z: -5, rotSpeed: -0.007 },
      { mesh: createMedicalCross(0x0ea5e9, 0x0284c7, 0.55, false), x: 1, y: 8.5, z: -8, rotSpeed: 0.005 },
      { mesh: createMedicalCross(0xef4444, 0xdc2626, 0.5, false), x: -3, y: -7.5, z: -4, rotSpeed: -0.006 }
    ];

    crosses.forEach(({ mesh, x, y, z }) => {
      mesh.position.set(x, y, z);
      hospitalGroup.add(mesh);
    });

    // 4. Multi-Lead Cardiac ECG Heartbeat Monitor Waveform
    // Construct real clinical P-Q-R-S-T wave coordinates
    const buildEcgCurve = (baseY = -2.5, scale = 1, zPos = -2) => {
      const points = [];
      const baseWidth = 38;
      const segments = 180;

      for (let i = 0; i <= segments; i++) {
        const x = -baseWidth / 2 + (i / segments) * baseWidth;
        const cycle = ((x + baseWidth / 2) % 11) / 11;
        let y = 0;

        // P wave (at cycle 0.12 - 0.20)
        if (cycle >= 0.12 && cycle <= 0.20) {
          y = Math.sin(((cycle - 0.12) / 0.08) * Math.PI) * (0.5 * scale);
        }
        // Q dip (at cycle 0.24 - 0.27)
        else if (cycle >= 0.24 && cycle <= 0.27) {
          y = -Math.sin(((cycle - 0.24) / 0.03) * Math.PI) * (0.45 * scale);
        }
        // R sharp cardiac spike (at cycle 0.27 - 0.35)
        else if (cycle >= 0.27 && cycle <= 0.35) {
          y = Math.sin(((cycle - 0.27) / 0.08) * Math.PI) * (3.2 * scale);
        }
        // S dip (at cycle 0.35 - 0.40)
        else if (cycle >= 0.35 && cycle <= 0.40) {
          y = -Math.sin(((cycle - 0.35) / 0.05) * Math.PI) * (0.75 * scale);
        }
        // T wave (at cycle 0.46 - 0.60)
        else if (cycle >= 0.46 && cycle <= 0.60) {
          y = Math.sin(((cycle - 0.46) / 0.14) * Math.PI) * (0.7 * scale);
        }

        points.push(new THREE.Vector3(x, y + baseY, zPos));
      }

      return new THREE.CatmullRomCurve3(points);
    };

    // Primary ECG Tube (Lead II - Vivid Hospital Monitor Green)
    const primaryEcgCurve = buildEcgCurve(-2.8, 1.0, -1.5);
    const primaryEcgGeo = new THREE.TubeGeometry(primaryEcgCurve, 200, 0.1, 8, false);
    const primaryEcgMat = new THREE.MeshBasicMaterial({
      color: 0x059669,
      transparent: true,
      opacity: 0.8
    });
    const primaryEcgMesh = new THREE.Mesh(primaryEcgGeo, primaryEcgMat);
    hospitalGroup.add(primaryEcgMesh);

    // Secondary ECG Tube (Lead V1 - Telemetry Cyan)
    const secondaryEcgCurve = buildEcgCurve(3.2, 0.65, -5);
    const secondaryEcgGeo = new THREE.TubeGeometry(secondaryEcgCurve, 160, 0.06, 8, false);
    const secondaryEcgMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.45
    });
    const secondaryEcgMesh = new THREE.Mesh(secondaryEcgGeo, secondaryEcgMat);
    hospitalGroup.add(secondaryEcgMesh);

    // Live Travelling Cardiac Pulse Spark
    const pulseBeaconGeo = new THREE.SphereGeometry(0.38, 16, 16);
    const pulseBeaconMat = new THREE.MeshBasicMaterial({
      color: 0x10b981
    });
    const pulseBeacon = new THREE.Mesh(pulseBeaconGeo, pulseBeaconMat);
    hospitalGroup.add(pulseBeacon);

    // 5. Emergency Telemetry Radar Rings (Vital Signs monitor ripples)
    const telemetryRings = [];
    for (let r = 0; r < 3; r++) {
      const ringGeo = new THREE.RingGeometry(3.5 + r * 2.8, 3.65 + r * 2.8, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: r === 0 ? 0xdc2626 : 0x0284c7,
        transparent: true,
        opacity: 0.35 - r * 0.08,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(-8, 3, -4);
      ringMesh.rotation.x = Math.PI / 3;
      ringMesh.rotation.y = -Math.PI / 6;
      hospitalGroup.add(ringMesh);
      telemetryRings.push(ringMesh);
    }

    // 6. Medical Care Particle Field (Floating sterile cleanroom ambiance)
    const particleCount = 24;
    const particleGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.45
    });

    const particles = [];
    for (let p = 0; p < particleCount; p++) {
      const particle = new THREE.Mesh(particleGeo, particleMat);
      const px = (Math.random() - 0.5) * 36;
      const py = (Math.random() - 0.5) * 18;
      const pz = (Math.random() - 0.5) * 14;
      particle.position.set(px, py, pz);
      particle.userData = {
        speed: 0.005 + Math.random() * 0.01,
        yBase: py
      };
      hospitalGroup.add(particle);
      particles.push(particle);
    }

    // Mouse movement parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Window Resize Handling
    const onResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // 7. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotate and float 3D medical crosses
      crosses.forEach(({ mesh, rotSpeed }, index) => {
        mesh.rotation.x += rotSpeed;
        mesh.rotation.y += rotSpeed * 1.2;
        mesh.position.y += Math.sin(elapsedTime * 1.4 + index) * 0.007;
      });

      // Animate emergency strobe lighting (alternating red and blue pulse like emergency response)
      const strobePhase = Math.sin(elapsedTime * 4);
      emergencyRedLight.intensity = strobePhase > 0 ? 3.5 : 1.2;
      emergencyBlueLight.intensity = strobePhase < 0 ? 3.5 : 1.2;

      // Animate cardiac pulse spark along the primary ECG curve
      const pulseT = (elapsedTime * 0.3) % 1;
      const pulsePos = primaryEcgCurve.getPoint(pulseT);
      pulseBeacon.position.copy(pulsePos);

      // Pulse telemetry rings
      telemetryRings.forEach((ring, i) => {
        ring.rotation.z += 0.004 * (i % 2 === 0 ? 1 : -1);
        ring.scale.setScalar(1 + Math.sin(elapsedTime * 2.2 + i) * 0.05);
      });

      // Float cleanroom ambient particles
      particles.forEach((particle, idx) => {
        particle.position.y = particle.userData.yBase + Math.sin(elapsedTime * 1.6 + idx) * 0.5;
      });

      // Camera parallax response to mouse
      camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 1.0 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-85"
      aria-hidden="true"
    />
  );
}
