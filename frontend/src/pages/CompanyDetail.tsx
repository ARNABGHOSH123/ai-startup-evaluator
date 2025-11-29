import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SummaryCard from "./SummaryCard";
import FoundingTeam from "./FoundingTeam";
import Traction from "./Traction";
import BusinessModel from "./BussinessModel";
import PartnershipsAndAnalysis from "./PartnershipsAndAnalysis";
import InvestmentRecommendation from "./InvestmentMemo";
import Overview from "./Overview";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import ComprehensiveAnalysis from "./ComprehensiveAnalysis";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import remarkBreaks from "remark-breaks";

type SubAgentResults = Record<string, any>;

export default function CompanyDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const [activeTab, setActiveTab] = useState<string>("markedupData");
  const [isLoadingCompDetails, setLoadingCompDetails] = useState(false);
  const [company, setCompDetails] = useState<SubAgentResults | null>(null);
  console.log(company);

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

  useEffect(() => {
    const fetchMultipleRequests = async () => {
      setLoadingCompDetails(true);

      const subAgents = [
        "business_model",
        "competitor_analysis",
        "team_profiling",
        "overview",
        "funding_and_financials",
        "industry_trends",
        "partnerships_and_strategic_analysis",
        "traction",
        "investment_recommendation",
      ];

      try {
        // Map each sub-agent to a fetch request
        const fetchPromises = subAgents.map((subAgent) =>
          fetch(
            `${
              import.meta.env.VITE_CLOUD_RUN_SERVICE_URL
            }/sub_agents/${companyId}/${subAgent}`,
            {
              method: "POST", // or GET depending on your API
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                company_doc_id: companyId,
                sub_agent_name: subAgent,
              }),
            }
          ).then((res) => res.json())
        );

        // Wait for all requests to finish
        const results = await Promise.all(fetchPromises);

        // Combine results into an object keyed by sub-agent
        const mergedData = subAgents.reduce((acc, subAgent, index) => {
          acc[subAgent] = results[index];
          return acc;
        }, {} as Record<string, any>);

        setCompDetails(mergedData);
      } catch (error) {
        console.error("Error fetching sub-agent data:", error);
      } finally {
        setLoadingCompDetails(false);
      }
    };

    fetchMultipleRequests();
  }, [companyId]);

  if (isLoadingCompDetails) {
    return <DetailSkeleton />;
  }

  return (
    <div className="p-4 bg-muted min-h-screen ">
      {/* <InvestmentWeightage/>commented for now if need we can uncomment or we can delete */}
      {/* ---------------- Summary Card ---------------- */}

      <div>
        <span>
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
        </span>

        <SummaryCard company={company} />
      </div>
      {/* <ThesisConfig /> */}

      {/* ---------------- Tabs ---------------- */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {/* <TabsTrigger value="investmentMemo">
            Investment Recommendation
          </TabsTrigger> */}
          <TabsTrigger value="overview">Basic Overview</TabsTrigger>
          <TabsTrigger value="foundingTeam">Team Profiling</TabsTrigger>
          <TabsTrigger value="comprehensive">
            Comprehensive Analysis
          </TabsTrigger>
          <TabsTrigger value="partnership">
            Partnerships & Strategic Analysis
          </TabsTrigger>
          <TabsTrigger value="traction">Traction</TabsTrigger>
          {/*<TabsTrigger value="businessModel">Business Model</TabsTrigger>
          
          
         
          <TabsTrigger value="industry">Industry & Trends</TabsTrigger>
          */}
        </TabsList>

        {/* ------------ Competitors Tab ------------ */}
        {/* <CompetitorsTab company={company} /> */}
        {/* ------------ Funding Tab ------------ */}
        <ComprehensiveAnalysis company={company} />

        {/* Industry & Trends*/}
        {/* <IndustryTab /> */}

        {/* Problem Statement And Solution */}
        <Overview company={company} />

        {/* Founding team */}
        <FoundingTeam company={company} />

        {/* Traction & User Base */}
        <Traction company={company} />

        {/* Business Model & Go to Market */}
        {/* <BusinessModel /> */}
        {/* Other */}
        <PartnershipsAndAnalysis company={company} />

        {/* <InvestmentRecommendation company={company} /> */}
      </Tabs>
    </div>
  );
}
