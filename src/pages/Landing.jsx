import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const bookCovers = [
  { title: 'Sherlock Holmes', author: 'Arthur Conan Doyle', image: 'https://res.cloudinary.com/dghcsoc48/image/upload/v1775064792/img6_abwuxs.jpg' },
  { title: 'Think and Grow Rich', author: 'Napoleon Hill', image: 'https://res.cloudinary.com/dghcsoc48/image/upload/v1775064790/img1_onzzaz.jpg' },
  { title: 'Tom Sawyer', author: 'Mark Twain', image: 'https://res.cloudinary.com/dghcsoc48/image/upload/v1775064790/img4_jquh1s.jpg' },
  { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', image: 'https://res.cloudinary.com/dghcsoc48/image/upload/v1775064792/img5_hxtfyr.jpg' },
  { title: 'Dracula', author: 'Bram Stoker', image: 'https://res.cloudinary.com/dghcsoc48/image/upload/v1775064790/img2_n8khsm.jpg' },
  { title: 'Alices Adventures in Wonderland', author: 'Jane Austen', image: 'https://res.cloudinary.com/dghcsoc48/image/upload/v1775064793/img3_buu1o7.avif' },
]

const quotes = [
  '"📚 Books don\'t teach you to hurry. They teach you the art of life."',
  '"Between pages, futures are quietly being built."',
  '"📖 Knowledge is the treasure, books are the map."',
  '"✨ A reader lives a thousand lives before he dies."',
]

// Typing Effect Component
function TypingQuote({ quote, speed = 50 }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    if (!isTyping) return

    if (displayedText.length < quote.length) {
      const timer = setTimeout(() => {
        setDisplayedText(quote.slice(0, displayedText.length + 1))
      }, speed)
      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
    }
  }, [displayedText, quote, isTyping, speed])

  return <span>{displayedText}</span>
}

export default function Landing() {
  const navigate = useNavigate()
  const { currentUser, profile } = useAuth()
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [quoteKey, setQuoteKey] = useState(0)

  React.useEffect(() => {
    if (currentUser && profile?.role) {
      navigate(`/admin`, { replace: true })
    }
  }, [currentUser, profile, navigate])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length)
      setQuoteKey((prev) => prev + 1)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="text-2xl font-bold">📚 Gyanvatsala Library</div>
        <button 
          onClick={() => navigate('/auth')}
          className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg font-semibold transition"
        >
          Login / Get Started
        </button>
      </nav>

      {/* Netflix-like Hero Section */}
      <section className="py-24 px-4 sm:px-6 relative bg-gradient-to-br from-blue-950 via-purple-950 to-blue-900">
        <div className="max-w-6xl mx-auto">
          {/* Hero Box Container with Background Image and Shadow */}
          <div className="relative h-[500px] sm:h-[550px] rounded-3xl overflow-hidden shadow-2xl" style={{
            boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.05)"
          }}>
            {/* Background Image */}
            <div className="absolute inset-0" style={{
              backgroundImage: "url(/image/hero-bg.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }} />
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
            
            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 sm:px-12 py-12">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight text-white">
                Unlimited books, reading, and more.
              </h1>
              <p className="text-lg sm:text-xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                Access thousands of e-books, audiobooks and curated collections — anytime, anywhere.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/auth')}
                  className="px-10 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-lg transition transform hover:scale-105 shadow-lg"
                >
                  Get Started
                </button>
                <button className="px-10 py-3 bg-gray-600/50 hover:bg-gray-700/60 text-white font-bold text-lg rounded-lg transition transform hover:scale-105 shadow-lg backdrop-blur-sm">
                  Browse
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typing Quote Section */}
      <section className="py-24 px-4 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-4xl md:text-5xl font-bold leading-relaxed text-gray-100 min-h-20 flex items-center justify-center">
            <TypingQuote key={quoteKey} quote={quotes[currentQuoteIndex]} speed={40} />
            <span className="ml-2 text-yellow-400 animate-pulse">|</span>
          </p>
          
          <div className="flex justify-center gap-3 mt-12">
            {quotes.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentQuoteIndex(i)
                  setQuoteKey((prev) => prev + 1)
                }}
                className={`w-3 h-3 rounded-full transition ${
                  i === currentQuoteIndex ? 'bg-yellow-400 scale-150' : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Book Gallery Section - Netflix Style */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-2">📚 Featured Books</h2>
            <p className="text-gray-400 text-lg">Discover our most popular collection</p>
          </div>

          {/* Horizontal Scrollable Books */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {bookCovers.map((book, i) => (
              <div key={i} className="group relative cursor-pointer">
                <div className="relative overflow-hidden rounded-lg shadow-2xl bg-gray-800 aspect-[9/13] transform transition-all duration-300 hover:scale-110 hover:-translate-y-3">
                  <img 
                    src={book.image} 
                    alt={book.title} 
                    className="w-full h-full object-cover group-hover:brightness-110 transition duration-300"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-end justify-end p-4">
                    <p className="text-sm font-bold text-white text-right">{book.title}</p>
                    <p className="text-xs text-gray-300 text-right">{book.author}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">What's Included?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 rounded-2xl bg-slate-800 border border-slate-700 hover:border-slate-600 hover:shadow-2xl transition">
              <div className="text-6xl mb-4">�</div>
              <h3 className="text-xl font-bold mb-2">E-books & Audiobooks</h3>
              <p className="text-gray-300 text-sm">Instant access to thousands of titles across genres and languages.</p>
            </div>

            <div className="p-10 rounded-2xl bg-slate-800 border border-slate-700 hover:border-slate-600 hover:shadow-2xl transition">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2">Study Groups & Notes</h3>
              <p className="text-gray-300 text-sm">Join study circles, share notes and prepare together for exams.</p>
            </div>

            <div className="p-10 rounded-2xl bg-slate-800 border border-slate-700 hover:border-slate-600 hover:shadow-2xl transition">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2">Personalized Picks</h3>
              <p className="text-gray-300 text-sm">Smart recommendations based on what you read and like.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Why join Gyanvatsala?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 rounded-2xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition hover:shadow-2xl">
              <div className="text-6xl mb-4">📚</div>
              <h4 className="text-xl font-bold mb-2">Huge Library</h4>
              <p className="text-gray-300 text-sm">Thousands of e-books and audiobooks across subjects and interests.</p>
            </div>

            <div className="p-10 rounded-2xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition hover:shadow-2xl">
              <div className="text-6xl mb-4">🤝</div>
              <h4 className="text-xl font-bold mb-2">Collaborative Learning</h4>
              <p className="text-gray-300 text-sm">Study groups, shared notes and focused reading lists built by students.</p>
            </div>

            <div className="p-10 rounded-2xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition hover:shadow-2xl">
              <div className="text-6xl mb-4">🎯</div>
              <h4 className="text-xl font-bold mb-2">Smart Recommendations</h4>
              <p className="text-gray-300 text-sm">Personalized suggestions so you always find something worth reading.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Ready to start reading?</h2>
          <p className="text-xl text-gray-200 mb-10">Join thousands of students exploring unlimited books today.</p>
          <button 
            onClick={() => navigate('/auth')}
            className="px-12 py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-lg transition transform hover:scale-105 shadow-2xl"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">📚 Gyanvatsala</h3>
              <p className="text-gray-400 text-base">Your campus library, reimagined. Read, learn, and collaborate.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Browse</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Browse Books</a></li>
                <li><a href="#" className="hover:text-white transition">My Library</a></li>
                <li><a href="#" className="hover:text-white transition">Trending Now</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Connect</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Feedback</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-500">
            <p className="text-base">© 2026 Gyanvatsala Library. All rights reserved. | Designed with 📚 for students</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
