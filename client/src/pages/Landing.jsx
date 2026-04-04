import React, { useEffect, useState } from 'react'

// MobileSlider component for horizontal swipe/slide on mobile
function MobileSlider({ items, renderItem, autoSlideInterval = 1000 }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setIndex((i) => (i + 1) % items.length), autoSlideInterval);
    return () => clearTimeout(timer);
  }, [index, items.length, autoSlideInterval]);
  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="flex items-center justify-center w-full">
        <div className="transition-transform duration-500 w-full flex justify-center">
          {renderItem(items[index], index)}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, i) => (
          <span key={i} className={`inline-block w-2 h-2 rounded-full ${i === index ? 'bg-violet-400' : 'bg-gray-600'}`}></span>
        ))}
      </div>
    </div>
  );
}
import FeatureFlipCarousel from '../components/FeatureFlipCarousel'
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
    icon: '🗓️',
    title: 'Builds consistency',
    body: 'Showing up to the same study space every day creates momentum and stronger long-term discipline.',
  },
  {
    icon: '🤝',
    title: 'Keeps you motivated',
    body: 'When you study around serious learners, your own standards rise and staying committed becomes easier.',
  },
]

// Library Features Section Data
const libraryFeatures = [
  {
    icon: '🎯',
    title: 'Study-Friendly Environment',
    body: 'A calm and distraction-free space designed to improve focus and productivity.',
  },
  {
    icon: '📰',
    title: 'Daily Newspapers (Hindi & English)',
    body: 'Stay updated with current affairs through both Hindi and English newspapers.',
  },
  {
    icon: '📶',
    title: 'High-Speed Wi-Fi',
    body: 'Access fast and reliable internet for online study, research, and learning.',
  },
  {
    icon: '❄️',
    title: 'Air-Conditioned Rooms',
    body: 'Comfortable air-conditioned rooms to ensure a pleasant study experience.',
  },
  {
    icon: '⏳',
    title: 'Limited Seating (Only 40 Seats)',
    body: 'Limited seats to maintain discipline, reduce noise, and enhance concentration.',
  },
  {
    icon: '💺',
    title: 'Comfortable Seating',
    body: 'Ergonomic chairs and desks designed for long and comfortable study hours.',
  },
  {
    icon: '📹',
    title: '24/7 CCTV Surveillance',
    body: 'Continuous monitoring to ensure safety and security for all students.',
  },
  {
    icon: '💧',
    title: 'RO Drinking Water',
    body: 'Clean and safe drinking water available for everyone.',
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
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/45 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-4">
          <Link
            to="/"
            className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-all duration-300 hover:border-cyan-400/35 hover:bg-white/[0.06]"
          >
            <img
              src="/image/logo.svg"
              alt="Gyanvatsala"
              className="h-10 w-10 rounded-xl transition-transform duration-300 group-hover:scale-105"
            />
            <span className="truncate text-xl font-bold tracking-tight sm:text-2xl hidden sm:inline">Gyanvatsala Library</span>
            <span className="truncate text-xl font-bold tracking-tight sm:hidden">Gyanvatsala</span>
          </Link>
          <Link
            to="/auth"
            className="inline-flex shrink-0 min-w-[120px] items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/15 via-sky-500/15 to-blue-500/20 px-5 py-3 text-base font-semibold text-white shadow-[0_14px_32px_-20px_rgba(34,211,238,0.95)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/60 hover:from-cyan-500/30 hover:via-sky-500/30 hover:to-blue-500/35 hover:shadow-[0_18px_36px_-18px_rgba(56,189,248,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 sm:min-w-[160px] sm:px-6"
          >
            Login
          </Link>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-[#05081c] via-[#17123b] to-[#3a1250] px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-28">
        <div className="mx-auto max-w-6xl">
          <div
            className="relative min-h-[600px] sm:min-h-[700px] flex items-center justify-center overflow-hidden rounded-[2rem] shadow-2xl"
            style={{
              boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/65" />

            <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16 text-center w-full max-w-3xl mx-auto">
              <h1 className="w-full text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-white">
                Unlimited books, reading, and more.
              </h1>
              <p className="mt-8 w-full text-base sm:text-lg md:text-xl leading-relaxed text-gray-100">
                Join a disciplined library environment built for focused study hours, better reading habits,
                and steady academic progress.
              </p>

              <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center w-full">
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

      <section className="bg-slate-950 px-4 pb-8 pt-12 sm:px-6 sm:pb-10 sm:pt-14">
        <div className="mx-auto max-w-[1500px] text-center">
          <p className="min-h-0 text-xl font-bold leading-tight tracking-tight text-gray-100 sm:text-2xl md:text-[1.9rem] lg:whitespace-nowrap lg:text-[2.1rem] xl:text-[2.3rem]">
            <span className="text-slate-300">"</span>{' '}
            <TypingQuote key={quoteKey} quote={quotes[currentQuoteIndex]} speed={40} />
            <span className="text-slate-300">"</span>
            <span className="ml-2 animate-pulse text-slate-300">|</span>
          </p>
        </div>
      </section>


      <section id="featured-books" className="bg-[#0a0a0a] px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-bold md:text-5xl">Featured Books</h2>
            <p className="mx-auto mt-2 max-w-3xl text-lg text-gray-400">
              A glimpse of the kind of reading that keeps your mind active and your routine meaningful.
            </p>
          </div>

          {/* Responsive Book Slider for Mobile, Grid for Desktop */}
          <div className="block sm:hidden">
            <MobileSlider items={bookCovers} renderItem={(book) => (
              <article key={book.title} className="card-hover group relative cursor-pointer w-64 mx-auto">
                <div className="aspect-[9/13] overflow-hidden rounded-lg bg-gray-800 shadow-2xl transition-all duration-300 group-hover:-translate-y-3 group-hover:scale-105">
                  <img
                    src={book.image}
                    alt={`${book.title} by ${book.author}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-300 group-hover:brightness-110"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-transparent to-transparent p-4 opacity-0 transition duration-300 group-hover:opacity-100">
                    <p className="text-sm font-bold text-white">{book.title}</p>
                    <p className="text-xs text-gray-300">{book.author}</p>
                  </div>
                </div>
              </article>
            )} />
          </div>
          <div className="hidden justify-items-center gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {bookCovers.map((book) => (
              <article key={book.title} className="card-hover group relative w-full max-w-[210px] cursor-pointer">
                <div className="aspect-[9/13] overflow-hidden rounded-lg bg-gray-800 shadow-2xl transition-all duration-300 group-hover:-translate-y-3 group-hover:scale-105">
                  <img
                    src={book.image}
                    alt={`${book.title} by ${book.author}`}
                    loading="lazy"
                    decoding="async"
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

      {/* Library Features Section - Flip Carousel */}
      <section id="library-features" className="bg-gradient-to-br from-[#181c2e] via-[#23204a] to-[#2e1a4d] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold md:text-5xl">📚 Library Features</h2>
            <p className="mt-2 text-lg text-gray-200">
              Everything you need for a focused, comfortable, and productive study experience.
            </p>
          </div>
          {/* Mobile horizontal slider for features */}
          <div className="block sm:hidden">
            <MobileSlider
              items={libraryFeatures}
              autoSlideInterval={1000}
              renderItem={(feature, idx) => (
                <div
                  className="card-hover group [perspective:1000px] w-72 h-72 cursor-pointer mx-auto"
                  onClick={e => e.currentTarget.classList.toggle('flipped')}
                >
                  <div className="relative w-full h-full duration-700 [transform-style:preserve-3d] group-[.flipped]:[transform:rotateY(180deg)]">
                    {/* Front */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-violet-700/30 bg-[#1a1c2e] shadow-xl text-7xl text-white transition-all duration-500 [backface-visibility:hidden]">
                      {feature.icon}
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-violet-700/30 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl text-center px-6 text-white [transform:rotateY(180deg)] [backface-visibility:hidden]">
                      <div className="mb-2 text-3xl font-bold">{feature.title}</div>
                      <div className="text-base text-gray-100">{feature.body}</div>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
          {/* Desktop carousel as before */}
          <div className="hidden sm:block">
            <FeatureFlipCarousel features={libraryFeatures} cardsPerSlide={3} autoSlideInterval={3000} />
          </div>
        </div>
      </section>

      <section id="advantages" className="bg-slate-900 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-4xl font-bold md:text-5xl">Advantages of Joining the Library</h2>
          {/* Mobile horizontal slider for advantages */}
          <div className="block md:hidden mt-16">
            <MobileSlider
              items={advantages}
              autoSlideInterval={1000}
              renderItem={(item, idx) => (
                <div
                className="card-hover group [perspective:1000px] w-72 h-72 cursor-pointer mx-auto"
                  onClick={e => e.currentTarget.classList.toggle('flipped')}
                >
                  <div className="relative w-full h-full duration-700 [transform-style:preserve-3d] group-[.flipped]:[transform:rotateY(180deg)]">
                    {/* Front */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 p-10 shadow-xl text-5xl text-white transition-all duration-500 [backface-visibility:hidden]">
                      {item.icon}
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-10 shadow-xl text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                      <h3 className="text-2xl font-bold text-white drop-shadow">{item.title}</h3>
                      <p className="mt-4 text-base leading-7 text-gray-100 drop-shadow">{item.body}</p>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
          {/* Desktop grid as before */}
          <div className="hidden md:grid mt-16 grid-cols-1 gap-8 md:grid-cols-3">
            {advantages.map((item, idx) => (
              <div
                key={item.title}
                className="card-hover group [perspective:1000px] w-full h-full min-h-[320px] cursor-pointer"
                onMouseEnter={e => e.currentTarget.classList.add('flipped')}
                onMouseLeave={e => e.currentTarget.classList.remove('flipped')}
              >
                <div className="relative w-full h-full duration-700 [transform-style:preserve-3d] group-[.flipped]:[transform:rotateY(180deg)]">
                  {/* Front */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 p-10 shadow-xl text-5xl text-white transition-all duration-500 [backface-visibility:hidden]">
                    {item.icon}
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-10 shadow-xl text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <h3 className="text-2xl font-bold text-white drop-shadow">{item.title}</h3>
                    <p className="mt-4 text-base leading-7 text-gray-100 drop-shadow">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-4xl font-bold md:text-5xl">Why Join Gyanvatsala?</h2>
          {/* Mobile horizontal slider for reasons */}
          <div className="block md:hidden mt-16">
            <MobileSlider
              items={reasonsToJoin}
              autoSlideInterval={2000}
              renderItem={(item, idx) => (
                <div
                className="card-hover group [perspective:1000px] w-72 h-72 cursor-pointer mx-auto"
                  onClick={e => e.currentTarget.classList.toggle('flipped')}
                >
                  <div className="relative w-full h-full duration-700 [transform-style:preserve-3d] group-[.flipped]:[transform:rotateY(180deg)]">
                    {/* Front */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 p-10 shadow-xl text-5xl text-white transition-all duration-500 [backface-visibility:hidden]">
                      {item.icon}
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-10 shadow-xl text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                      <h3 className="text-2xl font-bold text-white drop-shadow">{item.title}</h3>
                      <p className="mt-4 text-base leading-7 text-gray-100 drop-shadow">{item.body}</p>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
          {/* Desktop grid as before */}
          <div className="hidden md:grid mt-16 grid-cols-1 gap-8 md:grid-cols-3">
            {reasonsToJoin.map((item, idx) => (
              <div
                key={item.title}
                className="card-hover group [perspective:1000px] w-full h-full min-h-[320px] cursor-pointer"
                onMouseEnter={e => e.currentTarget.classList.add('flipped')}
                onMouseLeave={e => e.currentTarget.classList.remove('flipped')}
              >
                <div className="relative w-full h-full duration-700 [transform-style:preserve-3d] group-[.flipped]:[transform:rotateY(180deg)]">
                  {/* Front */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 p-10 shadow-xl text-5xl text-white transition-all duration-500 [backface-visibility:hidden]">
                    {item.icon}
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-10 shadow-xl text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <h3 className="text-2xl font-bold text-white drop-shadow">{item.title}</h3>
                    <p className="mt-4 text-base leading-7 text-gray-100 drop-shadow">{item.body}</p>
                  </div>
                </div>
              </div>
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

      <footer className="border-t border-white/10 bg-black px-6 pt-12 pb-4 animate-fadeInUp">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="card-hover transition-all duration-300 hover:scale-105 hover:bg-white/5 rounded-xl p-2">
              <h3 className="text-2xl font-bold transition-colors duration-300 hover:text-violet-400">Gyanvatsala Library</h3>
              <p className="mt-4 text-base text-gray-400">A disciplined reading and study space for students who want stronger habits and better focus.</p>
            </div>
            <div className="card-hover transition-all duration-300 hover:scale-105 hover:bg-white/5 rounded-xl p-2">
              <h4 className="mb-6 text-lg font-bold transition-colors duration-300 hover:text-violet-400">Explore</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#featured-books" className="transition-all duration-300 hover:text-violet-400 hover:underline">Featured Books</a></li>
                <li><a href="#advantages" className="transition-all duration-300 hover:text-violet-400 hover:underline">Library Advantages</a></li>
                <li><a href="#top" className="transition-all duration-300 hover:text-violet-400 hover:underline">Back to Top</a></li>
              </ul>
            </div>
            <div className="card-hover transition-all duration-300 hover:scale-105 hover:bg-white/5 rounded-xl p-2">
              <h4 className="mb-6 text-lg font-bold transition-colors duration-300 hover:text-violet-400">For Visitors</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="transition-all duration-300 hover:text-violet-400">Peaceful study atmosphere</li>
                <li className="transition-all duration-300 hover:text-violet-400">Curated reading collection</li>
                <li className="transition-all duration-300 hover:text-violet-400">Disciplined daily routine</li>
              </ul>
            </div>
            <div className="card-hover transition-all duration-300 hover:scale-105 hover:bg-white/5 rounded-xl p-2">
              <h4 className="mb-6 text-lg font-bold transition-colors duration-300 hover:text-violet-400">Start</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/auth" className="transition-all duration-300 hover:text-violet-400 hover:underline">Login</Link></li>
                <li><Link to="/auth" className="transition-all duration-300 hover:text-violet-400 hover:underline">Join Now</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-4 text-center text-base text-gray-500 animate-fadeInUp">
            <p>© 2026 Gyanvatsala Library. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 1s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </div>
  )
}
