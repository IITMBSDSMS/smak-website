import Image from "next/image"
import Link from "next/link"

export default function Navbar() {
  return (

    <header className="fixed top-0 left-0 w-full flex items-center justify-between px-8 py-4 bg-white text-black shadow-md z-50">

      <div className="flex items-center gap-3">

        <Image
          src="/logo.png"
          width={40}
          height={40}
          alt="SMAK Logo"
        />

        <h1 className="font-semibold text-lg">
          SMAK
        </h1>

      </div>

      <nav className="flex gap-6 text-sm text-black font-semibold">

        <Link href="/">Home</Link>
        <Link href="/research-club">Research Club</Link>
        <Link href="/events">Events</Link>
        <Link href="/board">Board</Link>
        <Link href="/collaborators">Collaborators</Link>
        <Link href="/contact">Contact</Link>

      </nav>

    </header>
  )
}