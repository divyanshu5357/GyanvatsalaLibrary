import React, { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getDashboardRoute } from '../utils/authRouting'

const heroImage = 'https://res.cloudinary.com/dghcsoc48/image/upload/v1775065351/img11_dovqob.jpg'

const bookCovers = [
  { title: 'Sherlock Holmes', author: 'Arthur Conan Doyle', image: 'https://res.cloudinary.com/dghcsoc48/image/upload/f_auto,q_auto,w_320/v1775064792/img6_abwuxs.jpg' },
  { title: 'Think and Grow Rich', author: 'Napoleon Hill', image: 'https://res.cloudinary.com/dghcsoc48/image/upload/f_auto,q_auto,w_320/v1775064790/img1_onzzaz.jpg' },
  { title: 'Tom Sawyer', author: 'Mark Twain', image: 'https://res.cloudinary.com/dghcsoc48/image/upload/f_auto,q_auto,w_320/v1775064790/img4_jquh1s.jpg' },
  { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', image: 'https://res.cloudinary.com/dghcsoc48/image/upload/f_auto,q_auto,w_320/v1775064792/img5_hxtfyr.jpg' },
  { title: 'Dracula', author: 'Bram Stoker', image: 'https://res.cloudinary.com/dghcsoc48/image/upload/f_auto,q_auto,w_320/v1775064790/img2_n8khsm.jpg' },
]

const quotes = [
  'A desk becomes sacred when discipline meets curiosity.',
  'A good library turns scattered effort into a daily habit.',
  'Quiet hours, sharp focus, and strong books build strong minds.',
  'When your surroundings support study, progress stops feeling random.',
]

const advantages = [
  {
    icon: '📖',
    title: 'Peaceful Study Atmosphere',
    body: 'Study in a calm, focused environment where distractions stay outside and your concentration lasts longer.',
  },
  {
    icon: '⏰',
    title: 'Better Daily Routine',
    body: 'Fixed study hours and a disciplined setting help you stay regular instead of depending on motivation alone.',
  },
  {
    icon: '📚',
    title: 'Useful Reading Access',
    body: 'Read from a curated collection of books that supports exams, self-growth, and serious reading habits.',
  },
]

const reasonsToJoin = [
  {
    icon: '🎯',
    title: 'Improves focus',
    body: 'A structured library setting reduces noise and helps you spend more time in deep work.',
  },
  {
    icon: '🌱',
    title: 'Builds consistency',
    body: 'Showing up to the same study space every day creates momentum and stronger long-term discipline.',
  },
  {
    icon: '🤝',
    title: 'Keeps you motivated',
    body: 'When you study around serious learners, your own standards rise and staying committed becomes easier.',
  },
]

function TypingQuote({ quote, speed = 40 }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    setDisplayedText('')
    setIsTyping(true)
  }, [quote])

  useEffect(() => {
    if (!isTyping) return undefined

    if (displayedText.length < quote.length) {
      const timer = window.setTimeout(() => {
        setDisplayedText(quote.slice(0, displayedText.length + 1))
      }, speed)

      return () => window.clearTimeout(timer)
    }

    setIsTyping(false)
    return undefined
  }, [displayedText, isTyping, quote, speed])

  return <span>{displayedText}</span>
}

export default function Landing() {
  const { currentUser, profile } = useAuth()
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [quoteKey, setQuoteKey] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length)
      setQuoteKey((prev) => prev + 1)
    }, 6000)

    return () => window.clearInterval(interval)
  }, [])

  if (currentUser && profile?.role) {
    return <Navigate to={getDashboardRoute(profile.role)} replace />
  }

  return (
    <div id="top" className="min-h-screen overflow-hidden bg-black text-white">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/40 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/image/logo.svg" alt="Gyanvatsala" className="h-8 w-8" />
            <span className="text-2xl font-bold tracking-tight hidden sm:inline">Gyanvatsala Library</span>
            <span className="text-2xl font-bold tracking-tight sm:hidden">Gyanvatsala</span>
          </Link>

          <Link
            to="/auth"
            className="rounded-xl border border-white/10 bg-white/10 px-6 py-3 text-lg font-semibold transition hover:bg-white/15"
          >
            Login / Get Started
          </Link>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-[#05081c] via-[#17123b] to-[#3a1250] px-4 pb-16 pt-28 sm:px-6 sm:pb-24">
        <div className="mx-auto max-w-6xl">
          <div
            className="relative h-[500px] overflow-hidden rounded-[2rem] shadow-2xl sm:h-[560px]"
            style={{
              boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/65" />

            <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 py-12 text-center sm:px-12">
              <h1 className="max-w-5xl text-5xl font-extrabold leading-[0.95] text-white sm:text-6xl md:text-7xl">
                Unlimited books, reading, and more.
              </h1>
              <p className="mt-8 max-w-3xl text-lg leading-relaxed text-gray-100 sm:text-xl">
                Join a disciplined library environment built for focused study hours, better reading habits,
                and steady academic progress.
              </p>

              <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link
                  to="/auth"
                  className="rounded-lg bg-red-600 px-10 py-3 text-lg font-bold text-white shadow-lg transition hover:scale-105 hover:bg-red-700"
                >
                  Get Started
                </Link>
                <a
                  href="#featured-books"
                  className="rounded-lg bg-gray-600/50 px-10 py-3 text-lg font-bold text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-gray-700/60"
                >
                  Browse
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <p className="min-h-20 text-4xl font-bold leading-relaxed text-gray-100 md:text-5xl">
            <span className="text-slate-300">"</span>{' '}
            <TypingQuote key={quoteKey} quote={quotes[currentQuoteIndex]} speed={40} />
            <span className="text-slate-300">"</span>
            <span className="ml-2 animate-pulse text-slate-300">|</span>
          </p>

          <div className="mt-12 flex justify-center gap-3">
            {quotes.map((quote, index) => (
              <button
                key={quote}
                type="button"
                onClick={() => {
                  setCurrentQuoteIndex(index)
                  setQuoteKey((prev) => prev + 1)
                }}
                className={`h-3 w-3 rounded-full transition ${
                  index === currentQuoteIndex ? 'scale-150 bg-yellow-400' : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Show quote ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="featured-books" className="bg-[#0a0a0a] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-4xl font-bold md:text-5xl">Featured Books</h2>
            <p className="mt-2 text-lg text-gray-400">
              A glimpse of the kind of reading that keeps your mind active and your routine meaningful.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {bookCovers.map((book) => (
              <article key={book.title} className="group relative cursor-pointer">
                <div className="aspect-[9/13] overflow-hidden rounded-lg bg-gray-800 shadow-2xl transition-all duration-300 group-hover:-translate-y-3 group-hover:scale-105">
                  <img
                    src={book.image}
                    alt={`${book.title} by ${book.author}`}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    className="h-full w-full object-cover transition duration-300 group-hover:brightness-110"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-transparent to-transparent p-4 opacity-0 transition duration-300 group-hover:opacity-100">
                    <p className="text-sm font-bold text-white">{book.title}</p>
                    <p className="text-xs text-gray-300">{book.author}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="advantages" className="bg-slate-900 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-4xl font-bold md:text-5xl">Advantages of Joining the Library</h2>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {advantages.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-700 bg-slate-800 p-10 transition hover:border-slate-600 hover:shadow-2xl"
              >
                <div className="mb-4 text-5xl">{item.icon}</div>
                <h3 className="text-2xl font-bold">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-gray-300">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-4xl font-bold md:text-5xl">Why Join Gyanvatsala?</h2>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {reasonsToJoin.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-700 bg-slate-800 p-10 transition hover:border-slate-600 hover:shadow-2xl"
              >
                <div className="mb-4 text-5xl">{item.icon}</div>
                <h3 className="text-2xl font-bold">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-gray-300">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-bold md:text-6xl">Ready to build a stronger study routine?</h2>
          <p className="mt-6 text-xl text-gray-200">
            Join Gyanvatsala Library and give your reading, revision, and focus a place that supports them every day.
          </p>
          <Link
            to="/auth"
            className="mt-10 inline-flex rounded-lg bg-red-600 px-12 py-4 text-xl font-bold text-white shadow-2xl transition hover:scale-105 hover:bg-red-700"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div>
              <h3 className="text-2xl font-bold">Gyanvatsala Library</h3>
              <p className="mt-4 text-base text-gray-400">
                A disciplined reading and study space for students who want stronger habits and better focus.
              </p>
            </div>

            <div>
              <h4 className="mb-6 text-lg font-bold">Explore</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#featured-books" className="transition hover:text-white">Featured Books</a></li>
                <li><a href="#advantages" className="transition hover:text-white">Library Advantages</a></li>
                <li><a href="#top" className="transition hover:text-white">Back to Top</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-lg font-bold">For Visitors</h4>
              <ul className="space-y-3 text-gray-400">
                <li>Peaceful study atmosphere</li>
                <li>Curated reading collection</li>
                <li>Disciplined daily routine</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-lg font-bold">Start</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/auth" className="transition hover:text-white">Login</Link></li>
                <li><Link to="/auth" className="transition hover:text-white">Join Now</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-8 text-center text-base text-gray-500">
            <p>© 2026 Gyanvatsala Library. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
