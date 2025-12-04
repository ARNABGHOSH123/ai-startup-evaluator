import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Download,
  Building2,
  Loader,
  AlertTriangle,
  Filter,
  HandCoins,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type Company = {
  company_name: string;
  founder_name: string;
  company_email: string;
  company_phone_no: string;
  stage_of_development: string;
  company_pitch_deck_gcs_uri: string;
  is_deck_extracted_and_benchmarked: string;
  doc_id: string;
};

interface CompanyCardProps {
  company: Company;
  onCompanyClick: (company: Company) => void;
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
        className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border"
        onClick={() => onCompanyClick(company)}
        data-testid={`card-company-${company.doc_id}`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-foreground to-primary-foreground/80 rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-lg">
                {getInitials(company.company_name)}
              </span>
            </div>
            <h3
              className="text-2xl font-semibold text-foreground mb-2"
              data-testid={`text-company-name-${company.doc_id}`}
            >
              {company.company_name}
            </h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center text-sm justify-between space-x-2">
              <span className="text-neutral">Stage</span>
              <span
                className="text-xs hover:cursor-pointer text-primary -mt-2 mr-2 font-semibold bg-primary-foreground rounded-2xl p-2 px-3"
                data-testid={`text-founder-name-${company.doc_id}`}
              >
                {company.stage_of_development}
              </span>
            </div>
            <div className="flex items-center text-sm justify-between space-x-2">
              <span className="text-neutral">Founder</span>
              <span
                className="text-foreground"
                data-testid={`text-founder-name-${company.doc_id}`}
              >
                {company.founder_name}
              </span>
            </div>
            <div className="flex items-center text-sm justify-between space-x-2">
              <span className="text-neutral"><Mail/></span>
              <span
                className="text-foreground"
                data-testid={`text-founder-name-${company.doc_id}`}
              >
                {company.company_email}
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
  const navigate = useNavigate();
  const [isLoadingCompanies, setLoadingCompanies] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("All");

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

  const handleCompanyClick = (company: any) => {
    // setSelectedCompanyId(companyName);
    navigate(`/company/${company?.doc_id}`, {
      state: {
        company_name: company.company_name,
        founder_name: company.founder_name,
        company_email: company?.company_email,
        company_phone_no: company?.company_phone_no,
        stage_of_development: company?.stage_of_development,
      },
    });
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
  const filteredCompanies = companies?.filter((company) => {
    const matchesSearch =
      company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.founder_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = stageFilter === "All";
    // || company.company_stage === stageFilter;

    return matchesSearch && matchesStage;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="grid md:grid-cols-3 md:gap-x-6 gap-4">
          {
            <div></div>
          }
          {companies?.length > 0 && (
            <div className="flex flex-row justify-between border border-border rounded-lg text-foreground hover:border-primary p-4">
              <span className="flex flex-col">
                <span className="text-neutral">Active Startups</span>
                <span className="font-bold text-4xl">{companies?.length}</span>
              </span>
              <Building2 className="w-16 bg-gradient-to-br from-primary-foreground to-primary-foreground/80 p-3 rounded-2xl h-16 text-primary" />
            </div>
          )}
          {/*3 > 0 && (
            <div className="flex flex-row justify-between border border-border rounded-lg text-foreground hover:border-primary p-4">
              <span className="flex flex-col">
                <span className="text-gray-400">Total Valuation</span>
                <span className="font-bold text-4xl">{100}</span>
              </span>
              <HandCoins className="w-16 bg-gradient-to-br from-primary-foreground to-primary-foreground/80 p-3 rounded-2xl h-16 text-primary" />
            </div>
          )*/}
        </div>
        <div className="mb-8">
          <div className="mt-6 flex flex-col md:flex-row items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search startups by company name or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background pl-10 pr-3 py-1.5 border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none text-foreground"
              />
            </div>
            <span className="flex flex-row space-x-4">
              {/* Stage Dropdown */}
              <Filter size={24} className="text-gray-600 mt-1.5" />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="px-3 py-1.5 border border-border rounded-lg bg-background focus:ring-1 focus:ring-primary text-foreground"
              >
                <option value="All">All Stages</option>
                <option value="Seed">Seed</option>
                <option value="Early">Early</option>
                <option value="Growth">Growth</option>
                <option value="Transaction">Transaction</option>
              </select>
            </span>
          </div>
          <div className="flex items-center justify-between">
            {/* Search + Filter Row */}

            {/* <div>
              <h1
                className="text-3xl font-bold text-foreground mb-2"
                data-testid="text-page-title"
              >
                Investment Opportunities
              </h1>
              <p className="text-muted-foreground">
                Discover and analyze promising startups in our portfolio
              </p>
            </div> */}
            {/* <Link to="/">
              <Button
                variant="secondary"
                className="flex items-center space-x-2"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link> */}
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
        {companies?.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="grid-companies"
          >
            {filteredCompanies?.map((company) => (
              <CompanyCard
                key={company?.doc_id}
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
