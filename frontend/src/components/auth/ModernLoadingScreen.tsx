"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface ModernLoadingScreenProps {
  message?: string
}

export default function ModernLoadingScreen({ message = "Loading..." }: ModernLoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl mb-8 shadow-2xl"
        >
          <motion.div
            className="relative"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-12 h-12 border-3 border-white rounded-full"></div>
            <div className="absolute top-2 left-2 w-8 h-8 bg-white rounded-full opacity-90"></div>
            <div className="absolute top-4 left-4 w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"></div>
          </motion.div>
          
          {/* Floating status indicators */}
          <motion.div
            className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-lg"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-1 -left-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </motion.div>

        {/* Loading Spinner */}
        <div className="relative mb-6">
          <motion.div
            className="w-16 h-16 border-4 border-white/20 border-t-blue-400 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Inner spinning ring */}
          <motion.div
            className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-12 border-4 border-transparent border-t-purple-400 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ 
              duration: 0.8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Loading Text */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
        >
          Nova Chat
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-slate-300 text-lg mb-8"
        >
          {message}
        </motion.p>

        {/* Animated Dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-blue-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => {
            // Use fixed positions to avoid hydration mismatch
            const positions = [
              { left: 26, top: 9 }, { left: 97, top: 46 }, { left: 87, top: 92 },
              { left: 56, top: 11 }, { left: 45, top: 76 }, { left: 34, top: 54 },
              { left: 98, top: 50 }, { left: 70, top: 26 }, { left: 51, top: 14 },
              { left: 17, top: 45 }, { left: 87, top: 62 }, { left: 32, top: 7 },
              { left: 29, top: 26 }, { left: 8, top: 50 }, { left: 6, top: 17 },
              { left: 25, top: 42 }, { left: 58, top: 15 }, { left: 1, top: 69 },
              { left: 38, top: 10 }, { left: 29, top: 66 }
            ]
            const pos = positions[i] || { left: 50, top: 50 }
            
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                }}
                animate={{
                  y: [0, -100],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 3 + (i % 3) * 0.5,
                  repeat: Infinity,
                  delay: (i % 4) * 0.5,
                  ease: "easeOut"
                }}
              />
            )
          })}
        </div>

        {/* Gradient Background Animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
              "linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))",
              "linear-gradient(45deg, rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2))"
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  )
}
