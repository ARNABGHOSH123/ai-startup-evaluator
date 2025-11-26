import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Download,
  Building2,
  Loader,
  AlertTriangle,
} from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type Company = {
  company_name: string;
  founder_name: string;
  company_pitch_deck_gcs_uri: string;
  is_deck_extracted_and_benchmarked: string;
  doc_id: string;
};

interface CompanyCardProps {
  company: Company;
  onCompanyClick: (companyName: string) => void;
}

function CompanyCard({ company, onCompanyClick }: CompanyCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleDownloadDeck = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    try {
      setDownloading(true);
      const response = await fetch(
        `${
          import.meta.env.VITE_CLOUD_RUN_SERVICE_URL
        }/get_company_pitch_deck_signed_url/${company.doc_id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gcs_uri: company.company_pitch_deck_gcs_uri }),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch signed URL");
      const data = await response.json();
      const signedUrl = data?.signedUrl;
      if (signedUrl) window.open(signedUrl, "_blank");
      else throw new Error("Signed URL missing in response");
    } catch (err: any) {
      setError(err?.message || "Download failed. Try again later.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="space-y-2"
      data-testid={`wrapper-company-${company.doc_id}`}
    >
      <Card
        className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        onClick={() => onCompanyClick(company.doc_id)}
        data-testid={`card-company-${company.doc_id}`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                {getInitials(company.company_name)}
              </span>
            </div>
          </div>
          <h3
            className="text-lg font-semibold text-foreground mb-2"
            data-testid={`text-company-name-${company.doc_id}`}
          >
            {company.company_name}
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span
                className="text-sm text-foreground"
                data-testid={`text-founder-name-${company.doc_id}`}
              >
                {company.founder_name}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                disabled={downloading}
                onClick={handleDownloadDeck}
                className="text-primary hover:underline text-sm disabled:cursor-not-allowed"
                data-testid={`button-download-deck-${company.doc_id}`}
              >
                {downloading ? (
                  <>
                    <Loader className="w-4 h-4 mr-1 animate-spin" />
                    Downloading
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-1" />
                    Download Deck
                  </>
                )}
              </Button>
            </div>
            {error && (
              <Alert
                variant="destructive"
                className="mt-1"
                data-testid={`alert-download-error-${company.doc_id}`}
              >
                <AlertTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Download failed
                </AlertTitle>
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CompanyCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <Skeleton className="w-16 h-4" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InvestorPortal() {
  // const { user, isLoading: authLoading } = useAuth();
  // const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoadingCompanies, setLoadingCompanies] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
  //   null
  // );

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_CLOUD_RUN_SERVICE_URL}/get_companies_list`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setCompanies(data?.companies);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setFetchError("Failed to load companies. Please try again later.");
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleCompanyClick = (companyId: string) => {
    // setSelectedCompanyId(companyName);
    navigate(`/company/${companyId}`);
  };

  if (isLoadingCompanies) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-5 w-96" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CompanyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // if (error) {
  //   if (isUnauthorizedError(error as Error)) {
  //     toast({
  //       title: "Unauthorized",
  //       description: "You are logged out. Logging in again...",
  //       variant: "destructive",
  //     });
  //     setTimeout(() => {
  //       window.location.href = "/api/login";
  //     }, 500);
  //     return null;
  //   }

  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <Card className="w-full max-w-md mx-4">
  //         <CardContent className="pt-6">
  //           <div className="text-center">
  //             <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
  //               <Building2 className="w-6 h-6 text-destructive" />
  //             </div>
  //             <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Companies</h3>
  //             <p className="text-muted-foreground">
  //               Failed to load investment opportunities. Please try again later.
  //             </p>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold text-foreground mb-2"
                data-testid="text-page-title"
              >
                Investment Opportunities
              </h1>
              <p className="text-muted-foreground">
                Discover and analyze promising startups in our portfolio
              </p>
            </div>
            <Link to="/">
              <Button
                variant="secondary"
                className="flex items-center space-x-2"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Global fetch error */}
        {fetchError && (
          <div className="mb-6" data-testid="alert-fetch-error">
            <Alert variant="destructive" className="max-w-2xl">
              <AlertTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Error loading companies
              </AlertTitle>
              <AlertDescription className="text-sm">
                {fetchError}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Companies Grid */}
        {companies.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="grid-companies"
          >
            {companies.map((company) => (
              <CompanyCard
                key={company.doc_id}
                company={company}
                onCompanyClick={handleCompanyClick}
              />
            ))}
          </div>
        ) : !fetchError ? (
          /* Empty State */
          <div className="text-center py-16" data-testid="empty-companies">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Companies Available
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              There are currently no investment opportunities available. Please
              check back later or contact our team for more information.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
