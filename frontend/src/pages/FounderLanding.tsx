import { Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function FounderLanding({user}:any) {
  const founderName =
    JSON.parse(localStorage.getItem("user") || "{}")
      ?.founderName?.toLowerCase()
      ?.replace(/\s+/g, "") || "founder";

  const hours = new Date().getHours();
  const greeting =
    hours < 12
      ? "Good morning"
      : hours < 18
      ? "Good afternoon"
      : "Good evening";

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-indigo-100 via-white to-blue-50 text-center px-6">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 via-white to-blue-200 animate-gradient-slow opacity-70" />

      {/* Foreground content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-2xl"
      >
        {/* Welcome header */}
        <h1 className="text-4xl md:text-5xl font-semibold text-blue-700">
          {greeting}, {founderName || "Founder"}!
        </h1>

        <p className="mt-3 text-gray-600 text-lg">
          Empower your vision — connect with active investors ready to fund
          innovation.
        </p>

        {/* Investors Count */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-14 flex flex-col items-center justify-center"
        >
          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md px-10 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <Users className="w-8 h-8 text-indigo-600" />
            <div className="text-left">
              <p className="text-5xl font-bold text-indigo-700">{42}</p>
              <p className="text-gray-600 text-lg font-medium">
                Investors available to invest
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-14 flex flex-wrap justify-center gap-4"
        >
          <Link
            to="pitch"
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-3 py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            Pitch Your Deck
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
