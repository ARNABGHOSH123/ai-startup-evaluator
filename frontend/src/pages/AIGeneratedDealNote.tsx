import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type AIDealNoteProps = {
  openDealNote: boolean;
  setOpenDealNote: (value: boolean) => void;
  companyId: string;
};

interface DealNoteResponse {
  deal_note: string;
}

export default function AIGeneratedDealNote({
  openDealNote,
  setOpenDealNote,
  companyId,
}: AIDealNoteProps) {
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<DealNoteResponse | null>(
    null
  );

  useEffect(() => {
    const fetchCompDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_CLOUD_RUN_SERVICE_URL
          }/fetch_investment_deal_note`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              company_doc_id: companyId,
            }),
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
    <Dialog open={openDealNote} onOpenChange={setOpenDealNote}>
      <DialogContent className="rounded-xl p-4 space-y-2 max-h-[80vh] overflow-y-auto max-w-4xl">
        {!loading && extractedData?.deal_note ? (
          <article className="max-w-none space-y-3">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {extractedData?.deal_note}
            </ReactMarkdown>
          </article>
        ) : (
          "No Data"
        )}
      </DialogContent>
    </Dialog>
  );
}
