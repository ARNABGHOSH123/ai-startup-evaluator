import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type LoginModalProps = {
  openDealNote: boolean;
  setOpenDealNote: (value: boolean) => void;
  companyId: string;
};

type Company = {
  extract_benchmark_agent_response: string;
};

export default function AIGeneratedDealNote({
  openDealNote,
  setOpenDealNote,
  companyId,
}: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<Company | null>(null);

  useEffect(() => {
    const fetchCompDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_CLOUD_RUN_SERVICE_URL
          }/get_company_details/${companyId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setExtractedData(data);
      } catch (error) {
        console.error("Error fetching company details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompDetails();
  }, [companyId]);

  return (
    <Dialog open={openDealNote}>
      <DialogContent className="sm:max-w-md rounded-xl">
        {!loading &&
        extractedData?.extract_benchmark_agent_response?.trim()?.length ? (
          <article className="prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {extractedData?.extract_benchmark_agent_response}
            </ReactMarkdown>
          </article>
        ) : (
          "kjlkjdkajdklaklwekwekrwkerwkerwerwerwre"
        )}
        <DialogClose asChild>
          <Button variant="outline" onClick={() => setOpenDealNote(false)}>
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
