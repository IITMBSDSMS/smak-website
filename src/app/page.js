"use client"

import MemberCard from "./components/MemberCard"
import Navbar from "./components/Navbar"
import Image from "next/image"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import EventCard from "./components/EventCard"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {

  const [events, setEvents] = useState([])
  const [leaders, setLeaders] = useState([])
  const [collabs, setCollabs] = useState([])

  const [index, setIndex] = useState(1)

  const [stats, setStats] = useState({
    papers: 0,
    members: 0,
    workshops: 0,
    partners: 0
  })

  useEffect(() => {

    async function loadData() {

      const { data: leadersData } = await supabase
        .from("leaders")
        .select("*")
        .order("created_at", { ascending: true })

      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false })

      const { data: collabData } = await supabase
        .from("collaborators")
        .select("*")

      if (leadersData) setLeaders(leadersData)
      if (eventsData) setEvents(eventsData)
      if (collabData) setCollabs(collabData)

    }

    loadData()

    const target = { papers: 120, members: 800, workshops: 45, partners: 12 }

    const startCounter = () => {
      setStats({ papers: 0, members: 0, workshops: 0, partners: 0 })

      const interval = setInterval(() => {
        setStats(prev => ({
          papers: prev.papers < target.papers ? prev.papers + 2 : target.papers,
          members: prev.members < target.members ? prev.members + 10 : target.members,
          workshops: prev.workshops < target.workshops ? prev.workshops + 1 : target.workshops,
          partners: prev.partners < target.partners ? prev.partners + 1 : target.partners
        }))
      }, 40)

      setTimeout(() => {
        clearInterval(interval)
        startCounter()
      }, 2200)
    }

    startCounter()

  }, [])

  const prev = () => {
    setIndex((prevIndex) => (prevIndex === 0 ? events.length - 1 : prevIndex - 1))
  }

  const next = () => {
    setIndex((prevIndex) => (prevIndex === events.length - 1 ? 0 : prevIndex + 1))
  }

  return (

    <main>

      <Navbar />

      <motion.section
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative text-center min-h-screen flex flex-col items-center justify-center overflow-hidden"
      >

        <svg
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
          viewBox="0 0 1000 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="150" cy="150" r="5" fill="#3B82F6" className="animate-pulse" />
          <circle cx="300" cy="80" r="5" fill="#3B82F6" className="animate-pulse" />
          <circle cx="450" cy="200" r="5" fill="#3B82F6" className="animate-pulse" />
          <circle cx="650" cy="120" r="5" fill="#3B82F6" className="animate-pulse" />
          <circle cx="850" cy="220" r="5" fill="#3B82F6" className="animate-pulse" />

          <line x1="150" y1="150" x2="300" y2="80" stroke="#3B82F6" strokeOpacity="0.2" />
          <line x1="300" y1="80" x2="450" y2="200" stroke="#3B82F6" strokeOpacity="0.2" />
          <line x1="450" y1="200" x2="650" y2="120" stroke="#3B82F6" strokeOpacity="0.2" />
          <line x1="650" y1="120" x2="850" y2="220" stroke="#3B82F6" strokeOpacity="0.2" />
        </svg>

      <div className="relative mx-auto mb-6 w-[110px] h-[110px] md:w-[140px] md:h-[140px] flex items-center justify-center z-10">

  {/* outer rotating ring */}
  <div className="absolute inset-0 rounded-full border-2 border-blue-500 animate-spin [animation-duration:8s]"></div>

  {/* inner rotating ring */}
  <div className="absolute inset-3 rounded-full border border-blue-400 opacity-60 animate-spin [animation-duration:14s]"></div>

  {/* logo */}
  <Image
    src="/logo.png"
    width={110}
    height={110}
    alt="SMAK logo"
    className="relative z-10 rounded-full shadow-lg"
  />

</div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold relative z-10 px-6">
          Society for Medical Academia and Knowledge
        </h1>

        <p className="text-gray-600 mt-4 max-w-xl mx-auto relative z-10 px-6 text-sm md:text-base">
          Empowering medical students through research,
          collaboration and academic excellence.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 relative z-10 px-6">

          <Link
            href="/join"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block"
          >
            Join SMAK
          </Link>

          <Link
            href="/research-club"
            className="bg-teal-500 text-white px-6 py-3 rounded-lg inline-block"
          >
            Explore Research Club
          </Link>

        </div>

      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative py-20 bg-black text-white z-20"
      >

        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Leadership
        </h2>

        <div className="relative max-w-7xl mx-auto overflow-hidden px-6 md:px-8 py-12">

          {/* left fade */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-black to-transparent z-10"></div>

          {/* right fade */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-black to-transparent z-10"></div>

          <div className="flex animate-scroll-x w-max hover:[animation-play-state:paused]">

            {/* group 1 */}
            <div className="flex items-center gap-10 pr-10">
              {leaders.map((leader, i) => (
                <MemberCard
                  key={i}
                  role={leader.role}
                  college={leader.college}
                  image={leader.image}
                />
              ))}
            </div>

            {/* duplicate group for seamless loop */}
            <div className="flex items-center gap-10 pr-10">
              {leaders.map((leader, i) => (
                <MemberCard
                  key={"dup-" + i}
                  role={leader.role}
                  college={leader.college}
                  image={leader.image}
                />
              ))}
            </div>

          </div>

        </div>

      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative py-24 bg-gradient-to-b from-blue-900 to-black text-white overflow-hidden"
      >

        <svg
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
          viewBox="0 0 800 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="120" r="4" fill="white" className="animate-pulse" />
          <circle cx="200" cy="200" r="4" fill="white" className="animate-pulse" />
          <circle cx="350" cy="150" r="4" fill="white" className="animate-pulse" />
          <circle cx="500" cy="260" r="4" fill="white" className="animate-pulse" />
          <circle cx="650" cy="180" r="4" fill="white" className="animate-pulse" />

          <line x1="100" y1="120" x2="200" y2="200" stroke="white" strokeOpacity="0.15" />
          <line x1="200" y1="200" x2="350" y2="150" stroke="white" strokeOpacity="0.15" />
          <line x1="350" y1="150" x2="500" y2="260" stroke="white" strokeOpacity="0.15" />
          <line x1="500" y1="260" x2="650" y2="180" stroke="white" strokeOpacity="0.15" />
        </svg>

        <div className="relative z-10 text-center mb-12">

          <h2 className="text-3xl md:text-4xl font-bold tracking-wide">
            UPCOMING EVENTS
          </h2>

          <p className="text-gray-300 mt-2">
            Gallery
          </p>

        </div>

        <div className="relative z-10 max-w-6xl mx-auto overflow-hidden px-6 md:px-8">

          <div
            className="flex items-center gap-8 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${index * 440}px)` }}
          >

            {events.map((event, i) => (
              <img
                key={event.id || i}
                src={event.image}
                alt="event"
                width={420}
                height={520}
                className={`rounded-xl shadow-2xl transition-all duration-500 transform ${i === index ? 'scale-110 z-10' : 'scale-90 opacity-40'} hover:scale-110`}
              />
            ))}

          </div>

        </div>

        {/* navigation buttons */}
        <div className="relative z-10 flex justify-center gap-6 mt-10">

          <button
            onClick={prev}
            className="bg-black border border-gray-500 px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            ◀
          </button>

          <button
            onClick={next}
            className="bg-black border border-gray-500 px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            ▶
          </button>

        </div>

      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-28 bg-white text-gray-900"
      >

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center px-6 md:px-8 relative z-10">

          {/* Illustration */}
          <div className="flex justify-center">

            <svg
              width="420"
              height="420"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-80 animate-spin [animation-duration:18s]"
            >
              <circle cx="200" cy="200" r="120" stroke="#3B82F6" strokeWidth="2" />
              <circle cx="200" cy="200" r="80" stroke="#3B82F6" strokeOpacity="0.5" />
              <circle cx="200" cy="200" r="40" stroke="#3B82F6" strokeOpacity="0.3" />

              <circle cx="200" cy="80" r="5" fill="#3B82F6" className="animate-pulse" />
              <circle cx="120" cy="200" r="5" fill="#3B82F6" className="animate-pulse" />
              <circle cx="280" cy="200" r="5" fill="#3B82F6" className="animate-pulse" />
              <circle cx="200" cy="320" r="5" fill="#3B82F6" className="animate-pulse" />

              <line x1="200" y1="80" x2="200" y2="160" stroke="#3B82F6" strokeOpacity="0.4" />
              <line x1="120" y1="200" x2="160" y2="200" stroke="#3B82F6" strokeOpacity="0.4" />
              <line x1="280" y1="200" x2="240" y2="200" stroke="#3B82F6" strokeOpacity="0.4" />
              <line x1="200" y1="320" x2="200" y2="240" stroke="#3B82F6" strokeOpacity="0.4" />
            </svg>

          </div>

          {/* Text Content */}
          <div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">
              Research Club
            </h2>

            <p className="text-gray-800 mb-6 leading-relaxed text-lg max-w-xl">
              The SMAK Research Club empowers medical students to engage in
              academic research, collaborate on clinical studies, and publish
              impactful scientific work. Through mentorship, workshops and
              collaborative projects, we aim to cultivate the next generation
              of clinician-scientists.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">

              <Link
                href="/research-club"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
              >
                Join Research Club
              </Link>

              <Link
                href="/research-club"
                className="bg-white border-2 border-gray-900 text-gray-900 font-semibold px-6 py-3 rounded-lg shadow-sm hover:bg-gray-100 hover:shadow-md transition-all duration-200 inline-block"
              >
                Learn More
              </Link>

            </div>

          </div>

        </div>

      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 bg-black text-white"
      >

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Trusted By Leading Institutions
          </h2>
          <p className="text-gray-400 mt-3">
            Our collaborators and academic partners
          </p>
        </div>

        <div className="relative max-w-7xl mx-auto overflow-hidden px-6 md:px-8">

          {/* left fade */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-black to-transparent z-10"></div>

          {/* right fade */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-black to-transparent z-10"></div>

          <div className="flex animate-scroll-x w-max gap-16 items-center hover:[animation-play-state:paused]">

            {/* group 1 */}
            <div className="flex items-center gap-16">

              {collabs.map((c) => (
                <img
                  key={c.id}
                  src={c.logo}
                  width={140}
                  height={60}
                  alt={c.name}
                  className="grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition duration-300"
                />
              ))}

            </div>

            {/* duplicate group for seamless infinite loop */}
            <div className="flex items-center gap-16">

              {collabs.map((c) => (
                <img
                  key={"dup-" + c.id}
                  src={c.logo}
                  width={140}
                  height={60}
                  alt={c.name}
                  className="grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition duration-300"
                />
              ))}

            </div>

          </div>

        </div>

      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 bg-gradient-to-b from-black to-gray-900 text-white"
      >

        <div className="max-w-6xl mx-auto text-center mb-16 px-8">
          <h2 className="text-3xl md:text-4xl font-bold">Our Impact</h2>
          <p className="text-gray-400 mt-3">SMAK in numbers</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 text-center px-6 md:px-8">

          <div>
            <h3 className="text-3xl md:text-5xl font-bold text-blue-500">{stats.papers}+</h3>
            <p className="text-gray-300 mt-2">Research Papers</p>
          </div>

          <div>
            <h3 className="text-3xl md:text-5xl font-bold text-blue-500">{stats.members}+</h3>
            <p className="text-gray-300 mt-2">Active Members</p>
          </div>

          <div>
            <h3 className="text-3xl md:text-5xl font-bold text-blue-500">{stats.workshops}+</h3>
            <p className="text-gray-300 mt-2">Workshops Conducted</p>
          </div>

          <div>
            <h3 className="text-3xl md:text-5xl font-bold text-blue-500">{stats.partners}+</h3>
            <p className="text-gray-300 mt-2">Partner Institutions</p>
          </div>

        </div>

      </motion.section>

      {/* Call To Action */}
      <motion.section
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-28 bg-black text-white text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-6 px-6">
          Join The SMAK Community
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-10 px-6 text-sm md:text-base">
          Be part of a growing network of medical students advancing
          research, collaboration and academic excellence across India.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-6">
          <Link
            href="/join"
            className="bg-blue-600 px-8 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
          >
            Join SMAK
          </Link>
          <Link
            href="/contact"
            className="border border-gray-500 px-8 py-3 rounded-lg hover:bg-gray-800 transition inline-block"
          >
            Contact Us
          </Link>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-6 md:px-8">
          <div>
            <h3 className="text-white text-xl font-semibold mb-3">
              SMAK
            </h3>
            <p className="text-sm md:text-base">
              Society of Medical Academia and Knowledge.
              Empowering future clinician-scientists through
              collaboration and research.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link href="/research-club" className="hover:text-white transition">Research Club</Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition">Events</Link>
              </li>
              <li>
                <Link href="/collaborators" className="hover:text-white transition">Collaborators</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">Contact</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Connect</h4>
            <div className="flex flex-col space-y-2">
              <a
                href="mailto:official@smakresearch.com"
                className="hover:text-white transition"
              >
                Email: official@smakresearch.com
              </a>

              <a
                href="https://www.linkedin.com/company/s-m-a-k-soceity-for-medical-academia-knowledge/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                LinkedIn
              </a>

              <a
                href="https://www.instagram.com/smak.community?igsh=OXpvanFyMDI5NjBu"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-10 text-sm">
          © {new Date().getFullYear()} SMAK. All rights reserved.
        </div>
      </footer>

    </main>
  )
}