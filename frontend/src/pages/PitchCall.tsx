import { useState } from "react";
import { PhoneCall, Loader2 } from "lucide-react";
import AudioConversation from "../components/AudioConversation";

export default function PitchCall(): JSX.Element {
  const [isCalling, setIsCalling] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleCall = () => {
    setShowModal(true);
    setIsCalling(true);
    setTimeout(() => {
      setIsCalling(false);
      setCallStarted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-indigo-50 to-blue-100 px-6 py-12">
      <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
        Thank You for Submitting Your Deck!
      </h2>
      <p className="text-gray-600 mb-8">
        We’ve received your pitch. Our AI Assistant will review it and get back
        to you shortly.
      </p>

      <div className="border-t border-gray-200 pt-6 w-full max-w-lg">
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
              <PhoneCall className="w-6 h-5 justify-center items-center" />{" "}
              Trigger AI Assistant Call
            </>
          )}
        </button>

        {callStarted && (
          <p className="text-green-600 font-medium mt-4">
            ✅ AI Assistant call initiated successfully!
          </p>
        )}
      </div>

      {showModal && (
        <AudioConversation isOpen={showModal} onChange={setShowModal} />
      )}
    </div>
  );
}
