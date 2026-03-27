import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MagneticCursor from "./components/MagneticCursor";
import ParticleBackground from "./components/ParticleBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SMAK | Society for Medical Academia and Knowledge",
  description: "Empowering medical students through research, collaboration and academic excellence.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black-void text-gray-100 min-h-screen`}
      >
        <MagneticCursor />
        <ParticleBackground />
        
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
