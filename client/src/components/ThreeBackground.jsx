import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    const el = mountRef.current
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 20

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    // particles
    const particlesCount = 600
    const positions = new Float32Array(particlesCount * 3)
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 80
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.7 })
    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    let frame = 0
    const animate = () => {
      frame += 0.01
      particles.rotation.y = frame * 0.2
      particles.rotation.x = Math.sin(frame * 0.3) * 0.2
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0 -z-10" />
}
