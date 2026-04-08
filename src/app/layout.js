import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MagneticCursor from "./components/MagneticCursor";
import ParticleBackground from "./components/ParticleBackground";
import Preloader from "./components/Preloader";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://smakresearch.com"),
  title: {
    default: "SMAK | Society for Medical Academia and Knowledge",
    template: "%s | SMAK Research",
  },
  description: "SMAK is the premier global network empowering medical students and clinical researchers through cutting-edge research, academic excellence, and robust clinical collaborations.",
  keywords: [
    "SMAK", 
    "SMAK research",
    "Society for Medical Academia and Knowledge", 
    "medical research club", 
    "medical students research", 
    "clinical research network", 
    "healthcare innovation India", 
    "medical academia", 
    "manthaan healthcare research"
  ],
  authors: [{ name: "SMAK Research" }],
  creator: "SMAK Research",
  publisher: "SMAK Research",
  openGraph: {
    title: "SMAK | Society for Medical Academia and Knowledge",
    description: "Empowering medical students worldwide through research, collaboration, and academic excellence.",
    url: "https://smakresearch.com",
    siteName: "SMAK Research",
    images: [
      {
        // Add a proper og-image if you have one. Falling back to logo.
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "SMAK Research Network",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SMAK | Society for Medical Academia and Knowledge",
    description: "Empowering medical students worldwide through research, collaboration, and academic excellence.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black-void text-gray-100 min-h-screen`}
      >
        <Preloader />
        <MagneticCursor />
        <ParticleBackground />
        
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
