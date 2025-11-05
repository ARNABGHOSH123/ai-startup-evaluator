import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Download, Building2 } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Company = {
  company_name: string;
  founder_name: string;
  company_pitch_deck_gcs_uri: string;
  is_deck_extracted_and_benchmarked: string;
  extract_benchmark_gcs_uri: string;
  doc_id: string;
  company_email: string;
};

interface CompanyCardProps {
  company: Company;
  onCompanyClick: (companyName: string) => void;
}

function CompanyCard({ company, onCompanyClick }: CompanyCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // const getStatusColor = (status: string) => {
  //   switch (status?.toLowerCase()) {
  //     case "active":
  //       return "bg-green-500";
  //     case "series a":
  //       return "bg-yellow-500";
  //     case "series b":
  //       return "bg-blue-500";
  //     default:
  //       return "bg-green-500";
  //   }
  // };


  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm"
      onClick={() => onCompanyClick(company.doc_id)}
      data-testid={`card-company-${company.doc_id}`}
    >
      <CardHeader className="pb-2 flex items-center gap-4">
        {/* Company Logo / Initials */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          {getInitials(company.company_name)}
        </div>

        {/* Company Info */}
        <div className="flex-1">
          <h3
            className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors"
            data-testid={`text-company-name-${company.doc_id}`}
          >
            {company.company_name}
          </h3>
          {company.founder_name && (
            <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
              <User className="w-4 h-4 text-gray-400" />
              <span>{company.founder_name}</span>
            </p>
          )}
          {company.company_email && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              📧 {company.company_email}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-3 border-t border-gray-100 text-sm text-gray-600 flex justify-between items-center">
        <span className="italic text-gray-500">Tap to view benchmark</span>

        <div className="flex items-center text-blue-600 font-medium text-xs gap-1">
          View Details
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </CardContent>
    </Card>
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
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  // useEffect(() => {
  //   if (!authLoading && !user) {
  //     toast({
  //       title: "Unauthorized",
  //       description: "You are logged out. Logging in again...",
  //       variant: "destructive",
  //     });
  //     setTimeout(() => {
  //       window.location.href = "/api/login";
  //     }, 500);
  //     return;
  //   }
  // }, [user, authLoading, toast]);

  // const { data: companies = [], isLoading, error } = useQuery<Company[]>({
  //   queryKey: ['/api/companies'],
  //   enabled: !!user,
  // });

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
                variant="outline"
                className="flex items-center space-x-2"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>

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
        ) : (
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
        )}
      </div>
    </div>
  );
}
