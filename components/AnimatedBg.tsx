'use client'
import { useEffect, useRef } from 'react'

export default function AnimatedBg() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const ctx = c.getContext('2d')!
    let animId: number
    const mouse = { x: -9999, y: -9999 }

    const PARTICLE_COUNT = 120
    const CONNECTION_DIST = 160
    const MOUSE_REPEL_DIST = 120

    type Particle = { x: number; y: number; vx: number; vy: number; r: number; baseSpeed: number }
    const particles: Particle[] = []

    function resize() {
      c!.width = window.innerWidth
      c!.height = window.innerHeight
    }

    function init() {
      particles.length = 0
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const speed = 0.4 + Math.random() * 0.8
        const angle = Math.random() * Math.PI * 2
        particles.push({
          x: Math.random() * c!.width,
          y: Math.random() * c!.height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 1 + Math.random() * 2,
          baseSpeed: speed,
        })
      }
    }

    function draw() {
      ctx.clearRect(0, 0, c!.width, c!.height)

      for (const p of particles) {
        // Mouse repulsion
        const mdx = p.x - mouse.x
        const mdy = p.y - mouse.y
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (mdist < MOUSE_REPEL_DIST && mdist > 0) {
          const force = (MOUSE_REPEL_DIST - mdist) / MOUSE_REPEL_DIST * 2
          p.vx += (mdx / mdist) * force * 0.4
          p.vy += (mdy / mdist) * force * 0.4
        }

        // Speed damping toward base speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > p.baseSpeed * 3) {
          p.vx *= 0.95
          p.vy *= 0.95
        } else if (speed < p.baseSpeed * 0.5) {
          p.vx *= 1.02
          p.vy *= 1.02
        }

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > c!.width) p.vx *= -1
        if (p.y < 0 || p.y > c!.height) p.vy *= -1

        // Glowing dot
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
        grd.addColorStop(0, 'rgba(168, 85, 247, 0.9)')
        grd.addColorStop(1, 'rgba(168, 85, 247, 0)')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(200, 140, 255, 0.95)'
        ctx.fill()
      }

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.45
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`
            ctx.lineWidth = (1 - dist / CONNECTION_DIST) * 1.5
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    function onMouseMove(e: MouseEvent) {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    function onMouseLeave() {
      mouse.x = -9999
      mouse.y = -9999
    }

    resize()
    init()
    draw()

    window.addEventListener('resize', () => { resize(); init() })
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', () => { resize(); init() })
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
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
