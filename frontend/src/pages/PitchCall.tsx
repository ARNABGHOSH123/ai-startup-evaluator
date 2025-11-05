import { useEffect, useRef, useState } from "react";
import { PhoneCall, Loader2, CheckCircle } from "lucide-react";
import AudioConversation from "../components/AudioConversation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { jsPDF } from "jspdf";
import { marked } from "marked";

type Company = {
  company_name: string;
  founder_name: string;
  company_pitch_deck_gcs_uri: string;
  is_deck_extracted_and_benchmarked: string;
  extract_benchmark_gcs_uri: string;
  extract_benchmark_agent_response: string;
  doc_id: string;
};
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
  const [isLoadingCompDetails, setLoadingCompDetails] = useState(false);
  const [company, setCompDetails] = useState<Company | null>(null);
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCompDetails = async () => {
      setLoadingCompDetails(true);
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_CLOUD_RUN_SERVICE_URL
          }/get_company_details/${companyDocId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        console.log("data", data);
        setCompDetails(data);
      } catch (error) {
        console.error("Error fetching company details:", error);
      } finally {
        setLoadingCompDetails(false);
      }
    };

    fetchCompDetails();
  }, [companyDocId]);

  // Read founderId from route params (string, not a callable)

  const handleDownload = () => {
    const markdown = company?.extract_benchmark_agent_response || "";
    const plainText = marked.parse(markdown).replace(/<[^>]+>/g, ""); // strip HTML tags

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const margin = 10;
    const lineHeight = 7;
    const maxWidth = 190;

    const lines = pdf.splitTextToSize(plainText, maxWidth);
    let y = margin;

    // Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Benchmark Report", margin, y);
    y += 10;

    // Subtitle
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.text(
      `${company?.company_name || "Startup"} — Health Domain Benchmark`,
      margin,
      y
    );
    y += 10;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    // Add lines with pagination
    for (let i = 0; i < lines.length; i++) {
      if (y > 280) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(lines[i], margin, y);
      y += lineHeight;
    }

    pdf.save(`${company?.company_name || "Benchmark_Report"}.pdf`);
  };

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
      {!isBenchmarkAvailable && (
        <h2 className="text-2xl font-semibold text-green-700 mb-4">
          Thank You for Submitting Your Deck!
        </h2>
      )}
      <p className="text-gray-600 mb-8">
        {isBenchmarkAvailable ? (
          <Card className="p-8 rounded-2xl border border-gray-200 bg-white text-center shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800">
              Benchmark Report is Ready
            </h2>
            <p className="mt-2 text-gray-600 text-base">
              Your startup’s benchmark report is now ready to explore.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-md transition-all">
                    View Report
                  </Button>
                </DialogTrigger>
                {
                  <div ref={contentRef}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto rounded-xl">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-green-700">
                          Benchmark Report
                        </DialogTitle>
                        <DialogDescription className="flex text-sm text-gray-500 justify-between">
                          Detailed AI-generated benchmark insights for your
                          startup.
                          <Button
                            variant="outline"
                            className="border-blue-300 border-solid-4 text-blue-700 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium transition-all justify-end"
                            onClick={handleDownload}
                          >
                            Download PDF
                          </Button>
                        </DialogDescription>
                      </DialogHeader>

                      {/* Render your extracted markdown data */}
                      {!isLoadingCompDetails &&
                      company?.extract_benchmark_agent_response?.trim()
                        ?.length ? (
                        <article className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                          >
                            {company?.extract_benchmark_agent_response}
                          </ReactMarkdown>
                        </article>
                      ) : isLoadingCompDetails ? (
                        <Loader2 className="animate-spin text-blue-600 w-6 h-6" />
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No benchmark data available.
                        </p>
                      )}
                    </DialogContent>
                  </div>
                }
              </Dialog>
            </div>

            <p className="mt-5 text-sm text-gray-500">
              Once reviewed, trigger your{" "}
              <b className="text-green-600">AI Assistant Call</b> for
              personalized guidance.
            </p>
          </Card>
        ) : (
          <Card className="p-6 text-center border-l-4 border-blue-500 bg-blue-50">
            <h2 className="text-xl font-semibold text-blue-700">
              Benchmark Analys is in Progress
            </h2>
            <p className="mt-2 text-gray-700">
              Our AI is reviewing your pitch deck to generate a detailed
              benchmark report.
            </p>
            <div className="mt-4 flex justify-center">
              <Loader2 className="animate-spin text-blue-600 w-6 h-6" />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Estimated time: <b>10 minutes</b>. Feel free to return later to
              check your <b>benchmark results</b> and continue with the{" "}
              <b>AI assistant call</b>.
            </p>
          </Card>
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
      </div>
      {/* </Card> */}
    </div>
  );
}
