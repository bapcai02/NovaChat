"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { login, clearError } from '@/store/slices/authSlice'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(clearError())
    // Trigger entrance animation
    setTimeout(() => setIsLoaded(true), 100)
  }, [dispatch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await dispatch(login(formData)).unwrap()
      router.push('/chat')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 animate-gradient-shift"></div>
          
          {/* Large cloud at bottom */}
          <div className="absolute bottom-0 left-1/4 w-24 h-16 bg-white/20 rounded-full opacity-80 transform -translate-y-8 animate-bounce-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-20 h-12 bg-white/20 rounded-full opacity-80 transform -translate-y-6 animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 left-1/2 w-16 h-10 bg-white/20 rounded-full opacity-80 transform -translate-y-4 animate-bounce-slow" style={{ animationDelay: '2s' }}></div>
          
          {/* Floating clouds */}
          <div className="absolute top-20 left-10 w-16 h-8 bg-white/30 rounded-full animate-float"></div>
          <div className="absolute top-32 right-20 w-12 h-6 bg-white/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-16 right-1/3 w-10 h-5 bg-white/25 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
          
          {/* Animated particles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full animate-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${4 + Math.random() * 3}s`
              }}
            />
          ))}
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
        </div>

        <div className={`relative z-10 w-full max-w-6xl flex bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          {/* Left Section - Welcome */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 p-12 flex-col justify-between relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 animate-gradient-shift"></div>
            
            {/* Floating elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 left-10 w-16 h-16 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            
            {/* Cloud separator at bottom */}
            <div className="absolute bottom-0 left-1/4 w-16 h-10 bg-white/20 rounded-full opacity-80 transform -translate-y-6 animate-bounce-slow"></div>
            <div className="absolute bottom-0 right-1/4 w-12 h-8 bg-white/20 rounded-full opacity-80 transform -translate-y-4 animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
            
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-white text-center mb-8 animate-fade-in-up">Welcome to</h1>
              
              {/* Logo with animation */}
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg animate-logo-float hover:animate-logo-bounce transition-all duration-300 cursor-pointer group">
                  <svg className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>NovaChat</h2>
                <p className="text-blue-100 text-lg leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  Connect with your team in real-time. Share ideas, collaborate on projects, and stay organized with our modern chat platform designed for productivity and seamless communication.
                </p>
              </div>
            </div>
            

          </div>

          {/* Right Section - Login Form */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12 bg-white">
            <div className="max-w-md mx-auto">
              {/* Mobile Logo */}
              <div className="lg:hidden flex justify-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center animate-logo-float hover:animate-logo-bounce transition-all duration-300 cursor-pointer group">
                  <svg className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center lg:text-left animate-fade-in-up" style={{ animationDelay: '0.2s' }}>Sign in to your account</h2>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail Address
                  </label>
                  <div className="relative group">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-all duration-300 bg-transparent group-hover:border-blue-400"
                      placeholder="Enter your email"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform duration-300 group-focus-within:scale-110">
                      <svg className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {/* Animated underline */}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-focus-within:w-full"></div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-all duration-300 bg-transparent group-hover:border-blue-400"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 hover:scale-110"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                    {/* Animated underline */}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-focus-within:w-full"></div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-shake">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-400 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none relative overflow-hidden group"
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Button content */}
                    <div className="relative flex items-center">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="animate-pulse">Signing in...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2 group-hover:animate-bounce transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          Sign In
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '1s' }}>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">
                      Don't have an account?
                    </span>
                  </div>
                </div>
              </div>

              {/* Register Link */}
              <div className="mt-6 text-center animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
                <Link 
                  href="/register" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-all duration-300 hover:scale-105 group"
                >
                  <span>Create a new account</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Demo Credentials */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg animate-fade-in-up hover:shadow-md transition-all duration-300 group" style={{ animationDelay: '1.4s' }}>
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-yellow-500 mr-2 group-hover:animate-spin transition-all duration-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-semibold text-gray-700">Demo Credentials</p>
                </div>
                <div className="text-xs text-gray-600 space-y-2">
                  <div className="flex items-center space-x-2 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">admin@novachat.com</span>
                  </div>
                  <div className="flex items-center space-x-2 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-gray-500">Password:</span>
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">password123</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes particle {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes logo-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes logo-bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translateY(0);
          }
          40%, 43% {
            transform: translateY(-10px);
          }
          70% {
            transform: translateY(-5px);
          }
          90% {
            transform: translateY(-2px);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 1s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-gradient-shift {
          animation: gradient-shift 8s ease infinite;
          background-size: 200% 200%;
        }
        
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .animate-particle {
          animation: particle 6s linear infinite;
        }
        
        .animate-logo-float {
          animation: logo-float 3s ease-in-out infinite;
        }
        
        .animate-logo-bounce {
          animation: logo-bounce 1s ease-in-out;
        }
      `}</style>
    </AuthGuard>
  )
}
