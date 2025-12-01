import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SummaryCard from "./SummaryCard";
import FoundingTeam from "./FoundingTeam";
import Traction from "./Traction";
import RisksAndStrategicAnalysis from "./RisksAndStrategicAnalysis";
import InvestmentRecommendation from "./InvestmentMemo";
import Overview from "./Overview";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useParams } from "react-router-dom";
import ComprehensiveAnalysis from "./ComprehensiveAnalysis";
import BussinessModel from "./BussinessModel";
import ThesisConfig from "./InvestmentWeightage";

type SubAgentResults = Record<string, any>;

export default function CompanyDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isLoadingCompDetails, setLoadingCompDetails] = useState(false);
  const [company, setCompDetails] = useState<SubAgentResults | null>(null);
  const { state } = useLocation();

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
              method: "POST",
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

  const selectedTab =
    "data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary";
  return (
    <div className="p-4 bg-muted min-h-screen ">
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

        <SummaryCard company={company} state={state} />
      </div>

      {/* ---------------- Tabs ---------------- */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className={`${selectedTab}`}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="foundingTeam" className={`${selectedTab}`}>
            Team Profiling
          </TabsTrigger>
          <TabsTrigger value="comprehensive" className={`${selectedTab}`}>
            Comprehensive Analysis
          </TabsTrigger>
          <TabsTrigger value="partnership" className={`${selectedTab}`}>
            Risk & Strategic Analysis
          </TabsTrigger>
          <TabsTrigger value="traction" className={`${selectedTab}`}>
            Traction
          </TabsTrigger>
          <TabsTrigger value="businessmodel" className={`${selectedTab}`}>
            Business Analysis
          </TabsTrigger>
          <TabsTrigger value="investmentMemo" className={`${selectedTab}`}>
            Investment Recommendation
          </TabsTrigger>
          <TabsTrigger value="thesis" className={`${selectedTab}`}>
            Configure Thesis
          </TabsTrigger>
        </TabsList>
        <ComprehensiveAnalysis company={company} />
        <Overview company={company} />
        <FoundingTeam company={company} />
        <Traction company={company} />
        <BussinessModel company={company} />
        <RisksAndStrategicAnalysis company={company} />
        <InvestmentRecommendation company={company} />
        <ThesisConfig company={company}/>
      </Tabs>

      {/* Floating Chatbot Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className="rounded-full w-10 h-10 bg-red-600 hover:bg-red-700 text-white shadow-lg flex items-center justify-center text-xl"
          onClick={() => console.log("Open chatbot modal")}
        >
          <Bot size={16} />
        </Button>
      </div>
    </div>
  );
}
