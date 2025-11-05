import { useState } from "react";
import { PhoneCall, Loader2, CheckCircle } from "lucide-react";
import AudioConversation from "../components/AudioConversation";

export default function PitchCall({
  companyDocId,
  isBenchmarkAvailable,
}: {
  companyDocId: string | null;
  isBenchmarkAvailable: boolean;
}): JSX.Element {
  const [isCalling, setIsCalling] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  // Read founderId from route params (string, not a callable)

  const handleCall = () => {
    setShowModal(true);
    setIsCalling(true);
    setTimeout(() => {
      setIsCalling(false);
      setCallStarted(true);
    }, 800);
  };

  return !callEnded ? (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-indigo-50 to-blue-100 px-6 py-12">
      <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
        Thank You for Submitting Your Deck!
      </h2>
      <p className="text-gray-600 mb-8">
        {isBenchmarkAvailable ? (
          "Please click the button below to initiate the risk assessment call to know more about your startup and further risk clarifications."
        ) : (
          <>
            We’ve received your pitch. Our AI Assistant will review it and get
            back to you shortly. Please refresh the page after{" "}
            <span className="font-semibold">10-15 minutes</span> to trigger the
            call. Have a great day ahead!
          </>
        )}
      </p>

      <div className="border-t border-gray-200 pt-6 w-full max-w-lg">
        {/* Loading state for company doc id */}
        {isBenchmarkAvailable && (
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
        )}

        {callStarted && (
          <p className="text-green-600 font-medium mt-4">
            AI Assistant call initiated successfully!
          </p>
        )}
      </div>

      {showModal && companyDocId && (
        <AudioConversation
          companyDocId={companyDocId}
          isOpen={showModal}
          onChange={setShowModal}
          setCallEnded={setCallEnded}
        />
      )}
    </div>
  ) : (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-indigo-50 to-blue-100 px-6 py-12">
      {/* <Card className="max-w-md mx-auto mt-10 text-center p-6 shadow-lg rounded-2xl bg-green-50 border border-green-200"> */}
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-green-100 p-3 rounded-full">
          <CheckCircle className="text-green-600 w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-green-700">
          Thank You for Your Time! It was great hearing your insights.
        </h2>
        <p className="text-gray-700 justify-center items-center">
          Our team will review the conversation and reach out once an investor
          expresses interest or for next steps. Have a great day ahead!
        </p>
        {/* <Link className="mt-4 bg-green-600 text-white hover:bg-green-700">
          Return to Dashboard
        </Link> */}
      </div>
      {/* </Card> */}
    </div>
  );
}
