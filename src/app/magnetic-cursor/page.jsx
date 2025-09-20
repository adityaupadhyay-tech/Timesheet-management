'use client'

import { useState, useRef, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  Star, 
  Zap, 
  Target, 
  MousePointer,
  Magnet,
  Sparkles,
  ArrowRight
} from 'lucide-react'

// Custom Magnetic Cursor Hook
function useMagneticPull(ref, strength = 0.1) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength
    
    setOffset({ x: deltaX, y: deltaY })
  }

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 })
  }

  return { offset, handleMouseMove, handleMouseLeave }
}

// Magnetic Cursor Component
function MagneticCursor() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [magneticTarget, setMagneticTarget] = useState(null)
  const [magneticStrength, setMagneticStrength] = useState(0)
  const [framePosition, setFramePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    setCursorPosition({ x: e.clientX, y: e.clientY })
    setIsVisible(true)
    
    // Check if we should activate magnetic effect for any element
    const magneticElements = document.querySelectorAll('[data-magnetic]')
    let foundMagnetic = false
    
    magneticElements.forEach((element) => {
      if (isInMagneticZone(element) && !magneticTarget) {
        handleMagneticEnter(element)
        foundMagnetic = true
      }
    })
    
    // If not in any magnetic zone and we have a target, leave it
    if (!foundMagnetic && magneticTarget) {
      handleMagneticLeave()
    }
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  const handleMagneticEnter = (target, strength = 0.3) => {
    if (isInMagneticZone(target)) {
      setMagneticTarget(target)
      setMagneticStrength(strength)
      
      // Set frame position to element center so it surrounds the element
      const rect = target.getBoundingClientRect()
      setFramePosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      })
    }
  }

  const handleMagneticLeave = () => {
    setMagneticTarget(null)
    setMagneticStrength(0)
  }

  // Check if cursor is within magnetic zone (5px around element)
  const isInMagneticZone = (element) => {
    const rect = element.getBoundingClientRect()
    const margin = 5 // 5px magnetic zone
    
    return (
      cursorPosition.x >= rect.left - margin &&
      cursorPosition.x <= rect.right + margin &&
      cursorPosition.y >= rect.top - margin &&
      cursorPosition.y <= rect.bottom + margin
    )
  }

  // Update frame position when window resizes or scrolls
  useEffect(() => {
    const updateFramePosition = () => {
      if (magneticTarget) {
        const rect = magneticTarget.getBoundingClientRect()
        setFramePosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        })
      }
    }

    window.addEventListener('resize', updateFramePosition)
    window.addEventListener('scroll', updateFramePosition)
    
    return () => {
      window.removeEventListener('resize', updateFramePosition)
      window.removeEventListener('scroll', updateFramePosition)
    }
  }, [magneticTarget])

  // Get dot position - moves inside the element
  const getDotPosition = () => {
    if (!magneticTarget) return { x: 0, y: 0 }
    const rect = magneticTarget.getBoundingClientRect()
    const relativeX = cursorPosition.x - rect.left
    const relativeY = cursorPosition.y - rect.top
    
    // Constrain dot within element bounds
    const constrainedX = Math.max(0, Math.min(relativeX, rect.width))
    const constrainedY = Math.max(0, Math.min(relativeY, rect.height))
    
    return {
      x: constrainedX - rect.width / 2,
      y: constrainedY - rect.height / 2
    }
  }

  // Get element dimensions for corner expansion
  const getElementDimensions = () => {
    if (!magneticTarget) return { width: 0, height: 0 }
    const rect = magneticTarget.getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height
    }
  }
  
  const dotPosition = getDotPosition()
  const elementDimensions = getElementDimensions()
  
  // Use state frame position when magnetic, otherwise use cursor position
  const currentFramePosition = magneticTarget ? framePosition : { x: cursorPosition.x, y: cursorPosition.y }

  return (
    <>
      {/* Hide default cursor and custom animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        * {
          cursor: none !important;
        }
        
        @keyframes rotateAndCenter {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        
        .custom-rotate {
          animation: rotateAndCenter 2s linear infinite;
        }
      `
      }} />

      {/* Custom Cursor */}
      <div
        className={`fixed pointer-events-none z-50 transition-all duration-100 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: magneticTarget ?
            (magneticTarget.getBoundingClientRect().left) :
            cursorPosition.x,
          top: magneticTarget ?
            (magneticTarget.getBoundingClientRect().top) :
            cursorPosition.y,
          transform: magneticTarget ? 'translate(0, 0)' : 'translate(-50%, -50%)',
        }}
      >
        {/* Frame - Sticks to element when magnetic */}
        <div 
          className={`transition-all duration-300 ${
            magneticTarget ? '' : 'custom-rotate'
          }`} 
          style={{
            width: magneticTarget ? elementDimensions.width : 0,
            height: magneticTarget ? elementDimensions.height : 0,
            // Move frame very little in direction of dot when magnetic
            transform: magneticTarget ? 
              `translate(${dotPosition.x * 0.02}px, ${dotPosition.y * 0.02}px)` : 
              undefined
          }}
        >
          {/* Corner indicators */}
          <div className={`absolute top-0 left-0 border-t border-l transition-all duration-300 ${
            magneticTarget ? 'border-black' : 'border-black'
          }`} 
          style={{
            width: magneticTarget ? Math.min(elementDimensions.width * 0.15, 20) : 6,
            height: magneticTarget ? Math.min(elementDimensions.height * 0.15, 20) : 6
          }} />
          
          <div className={`absolute top-0 right-0 border-t border-r transition-all duration-300 ${
            magneticTarget ? 'border-black' : 'border-black'
          }`} 
          style={{
            width: magneticTarget ? Math.min(elementDimensions.width * 0.15, 20) : 6,
            height: magneticTarget ? Math.min(elementDimensions.height * 0.15, 20) : 6
          }} />
          
          <div className={`absolute bottom-0 left-0 border-b border-l transition-all duration-300 ${
            magneticTarget ? 'border-black' : 'border-black'
          }`} 
          style={{
            width: magneticTarget ? Math.min(elementDimensions.width * 0.15, 20) : 6,
            height: magneticTarget ? Math.min(elementDimensions.height * 0.15, 20) : 6
          }} />
          
          <div className={`absolute bottom-0 right-0 border-b border-r transition-all duration-300 ${
            magneticTarget ? 'border-black' : 'border-black'
          }`} 
          style={{
            width: magneticTarget ? Math.min(elementDimensions.width * 0.15, 20) : 6,
            height: magneticTarget ? Math.min(elementDimensions.height * 0.15, 20) : 6
          }} />
          
          {/* Moving dot - only when over element */}
          {magneticTarget && (
            <div 
              className="absolute w-2 h-2 rounded-full bg-black transition-all duration-75 ease-out"
              style={{
                left: `calc(50% + ${dotPosition.x}px)`,
                top: `calc(50% + ${dotPosition.y}px)`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}
          
          {/* Center dot - only show when not over element */}
          {!magneticTarget && (
            <div className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full transform -translate-x-1/2 -translate-y-1/2 bg-black" />
          )}
        </div>
      </div>

      {/* Magnetic Elements */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Magnet className="h-10 w-10 text-blue-600" />
              Magnetic Cursor Demo
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the magnetic cursor effect inspired by Motion+ Cursor. 
              Watch the frame stick to elements and the dot move inside while the frame jiggles.
            </p>
          </div>

          {/* Demo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Magnetic Button */}
            <Card className="group hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-500" />
                  Magnetic Button
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MagneticButton
                  onMagneticEnter={handleMagneticEnter}
                  onMagneticLeave={handleMagneticLeave}
                />
              </CardContent>
            </Card>

            {/* Magnetic Card */}
            <Card className="group hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Magnetic Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MagneticCard
                  onMagneticEnter={handleMagneticEnter}
                  onMagneticLeave={handleMagneticLeave}
                />
              </CardContent>
            </Card>

            {/* Magnetic Icon */}
            <Card className="group hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Magnetic Icon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MagneticIcon
                  onMagneticEnter={handleMagneticEnter}
                  onMagneticLeave={handleMagneticLeave}
                />
              </CardContent>
            </Card>
          </div>

          {/* Interactive Elements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Magnetic List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Magnetic List Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Home', 'About', 'Services', 'Contact'].map((item, index) => (
                    <MagneticListItem
                      key={item}
                      text={item}
                      index={index}
                      onMagneticEnter={handleMagneticEnter}
                      onMagneticLeave={handleMagneticLeave}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Magnetic Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Magnetic Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <MagneticGalleryItem
                      key={item}
                      number={item}
                      onMagneticEnter={handleMagneticEnter}
                      onMagneticLeave={handleMagneticLeave}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <MousePointer className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How it works
                  </h3>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Watch the minimal corner cursor rotate continuously when not over elements</li>
                    <li>• Move your cursor near the elements above to see the frame stick to them</li>
                    <li>• Notice how the frame stops rotating and starts jiggling when stuck</li>
                    <li>• The blue dot moves inside the element following your cursor movement</li>
                    <li>• The frame stays locked to the element while the dot moves freely</li>
                    <li>• Different elements have different magnetic strengths</li>
                    <li>• The effect is inspired by Motion+ Cursor's magnetic features</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

// Magnetic Button Component
function MagneticButton({ 
  onMagneticEnter, 
  onMagneticLeave 
}) {
  const ref = useRef(null)

  return (
    <Button
      ref={ref}
      data-magnetic
      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105"
      onMouseEnter={() => ref.current && onMagneticEnter(ref.current, 0.4)}
      onMouseLeave={() => onMagneticLeave()}
    >
      <Magnet className="h-4 w-4 mr-2" />
      Magnetic Button
    </Button>
  )
}

// Magnetic Card Component
function MagneticCard({ 
  onMagneticEnter, 
  onMagneticLeave 
}) {
  const ref = useRef(null)

  return (
    <div
      ref={ref}
      data-magnetic
      className="p-6 bg-gradient-to-br from-pink-100 to-rose-200 rounded-lg border-2 border-pink-300 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
      onMouseEnter={() => ref.current && onMagneticEnter(ref.current, 0.3)}
      onMouseLeave={() => onMagneticLeave()}
    >
      <Heart className="h-8 w-8 text-pink-500 mx-auto mb-3" />
      <p className="text-center text-gray-700 font-medium">
        This card has magnetic properties!
      </p>
    </div>
  )
}

// Magnetic Icon Component
function MagneticIcon({ 
  onMagneticEnter, 
  onMagneticLeave 
}) {
  const ref = useRef(null)

  return (
    <div
      ref={ref}
      data-magnetic
      className="flex justify-center"
      onMouseEnter={() => ref.current && onMagneticEnter(ref.current, 0.5)}
      onMouseLeave={() => onMagneticLeave()}
    >
      <div className="p-4 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full border-2 border-yellow-300 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-110">
        <Star className="h-12 w-12 text-yellow-500" />
      </div>
    </div>
  )
}

// Magnetic List Item Component
function MagneticListItem({ 
  text, 
  index, 
  onMagneticEnter, 
  onMagneticLeave 
}) {
  const ref = useRef(null)

  return (
    <div
      ref={ref}
      data-magnetic
      className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-102"
      onMouseEnter={() => ref.current && onMagneticEnter(ref.current, 0.2)}
      onMouseLeave={() => onMagneticLeave()}
    >
      <div className="w-2 h-2 bg-blue-500 rounded-full" />
      <span className="text-gray-700 font-medium">{text}</span>
      <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
    </div>
  )
}

// Magnetic Gallery Item Component
function MagneticGalleryItem({ 
  number, 
  onMagneticEnter, 
  onMagneticLeave 
}) {
  const ref = useRef(null)

  const colors = [
    'from-purple-400 to-pink-400',
    'from-blue-400 to-cyan-400',
    'from-green-400 to-emerald-400',
    'from-orange-400 to-red-400'
  ]

  return (
    <div
      ref={ref}
      data-magnetic
      className={`aspect-square bg-gradient-to-br ${colors[number - 1]} rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center justify-center`}
      onMouseEnter={() => ref.current && onMagneticEnter(ref.current, 0.35)}
      onMouseLeave={() => onMagneticLeave()}
    >
      <span className="text-white font-bold text-xl">{number}</span>
    </div>
  )
}

export default function MagneticCursorPage() {
  // TODO: Get user data from authentication context/API
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <MagneticCursor />
    </Layout>
  )
}