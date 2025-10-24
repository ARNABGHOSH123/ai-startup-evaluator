import React, { useState } from "react";
import { PhoneCall, Loader2 } from "lucide-react";

export default function PitchCall() {
  const [isCalling, setIsCalling] = useState(false);
  const [callStarted, setCallStarted] = useState(false);

  // Simulate AI voice assistant call
  const handleCall = async () => {
    setIsCalling(true);
    setTimeout(() => {
      setIsCalling(false);
      setCallStarted(true);
      alert("📞 AI Assistant is calling the founder...");
      // Here, you could trigger an API or backend call (e.g., Twilio / Voiceflow webhook)
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-indigo-50 to-blue-100 px-6 py-12">
        {/* ✅ Thank You Message */}
        <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
          Thank You for Submitting Your Deck!
        </h2>
        <p className="text-gray-600 mb-8">
          We’ve received your pitch. Our AI Assistant will review it and get back to you shortly.
        </p>

        {/* ✅ Call Trigger Section */}
        <div className="border-t border-gray-200 pt-6">

          <button
            onClick={handleCall}
            disabled={isCalling}
            className={`flex items-center justify-center gap-1 w-full p-3 rounded-lg text-white font-medium transition-all ${
              isCalling
                ? "bg-indigo-400 cursor-wait"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isCalling ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Calling...
              </>
            ) : (
              <>
                <PhoneCall className="w-6 h-5 justify-center items-center"/> Trigger AI Assistant Call
              </>
            )}
          </button>

          {/* ✅ Optional confirmation after call */}
          {callStarted && (
            <p className="text-green-600 font-medium mt-4">
              ✅ AI Assistant call initiated successfully!
            </p>
          )}
        </div>
      </div>
  );
}
