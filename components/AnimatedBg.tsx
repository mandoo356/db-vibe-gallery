'use client'
import { useEffect, useRef } from 'react'

export default function AnimatedBg() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const ctx = c.getContext('2d')!
    let animId: number

    const PARTICLE_COUNT = 80
    const CONNECTION_DIST = 150
    const particles: { x: number; y: number; vx: number; vy: number }[] = []

    function resize() {
      c!.width = window.innerWidth
      c!.height = window.innerHeight
    }

    function init() {
      particles.length = 0
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * c!.width,
          y: Math.random() * c!.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
        })
      }
    }

    function draw() {
      ctx.clearRect(0, 0, c!.width, c!.height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > c!.width) p.vx *= -1
        if (p.y < 0 || p.y > c!.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(168, 85, 247, 0.6)'
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.25
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    init()
    draw()

    window.addEventListener('resize', () => { resize(); init() })
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', () => { resize(); init() })
    }
  }, [])

  return (
    <canvas
      ref={canvas}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
