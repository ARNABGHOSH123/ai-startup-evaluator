import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

type Company = {
  company_name: string;
  founder_name: string;
  company_pitch_deck_gcs_uri: string;
  is_deck_extracted_and_benchmarked: string;
  extract_benchmark_gcs_uri: string;
  extract_benchmark_agent_response: string;
  doc_id: string;
};

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="flex items-start justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center mb-4"
                  >
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompanyDetail() {
  const { company_id } = useParams();
  const [isLoadingCompDetails, setLoadingCompDetails] = useState(false);
  const [company, setCompDetails] = useState<Company | null>(null);

  useEffect(() => {
    const fetchCompDetails = async () => {
      setLoadingCompDetails(true);
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_CLOUD_RUN_SERVICE_URL
          }/get_company_details/${company_id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setCompDetails(data);
      } catch (error) {
        console.error("Error fetching company details:", error);
      } finally {
        setLoadingCompDetails(false);
      }
    };

    fetchCompDetails();
  }, [company_id]);

  if (isLoadingCompDetails) {
    return <DetailSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link to="/investor">
            <Button
              variant="ghost"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-4"
              data-testid="button-back-to-companies"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Companies</span>
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1
                className="text-3xl font-bold text-foreground mb-2"
                data-testid={`text-company-name-${company?.doc_id}`}
              >
                {company?.company_name} (Staging investment memo)
              </h1>
            </div>
          </div>
        </div>

        {company?.extract_benchmark_agent_response?.trim()?.length ? (
          <article className="prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {company?.extract_benchmark_agent_response}
            </ReactMarkdown>
          </article>
        ) : null}
      </div>
    </div>
  );
}
