import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SummaryCard from "./SummaryCard";
import CompetitorsTab from "./CompetitorsTab";
import FundingTab from "./FundingTab";
import IndustryTab from "./IndustryTab";
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
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import remarkBreaks from "remark-breaks";

type Company = {
  company_name: string;
  founder_name: string;
  company_pitch_deck_gcs_uri: string;
  is_deck_extracted_and_benchmarked: string;
  // extract_benchmark_agent_response: string;
  doc_id: string;
};

export default function CompanyDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const [activeTab, setActiveTab] = useState<string>("markedupData");
  const [isLoadingCompDetails, setLoadingCompDetails] = useState(false);
  const [company, setCompDetails] = useState<Company | null>(null);
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
    const fetchCompDetails = async () => {
      setLoadingCompDetails(true);
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
        setCompDetails(data);
      } catch (error) {
        console.error("Error fetching company details:", error);
      } finally {
        setLoadingCompDetails(false);
      }
    };

    fetchCompDetails();
  }, [companyId]);

  if (isLoadingCompDetails) {
    return <DetailSkeleton />;
  }
  // ----------------------- Company Info -----------------------
  const companyInfo = {
    name: "Sia",
    parent: "Datastride Analytics, Datastride",
    parentWebsite: "https://datastride.ai/",
    website: "https://sianalytics.in",
    email: "karthik.c@datastride.ai",
    founderName: "Karthick",
    phone: ["+91 87625 25857", "+91 84310 42564"],
    address:
      "Global Village Tech Park, Sattva Global City, RR Nagar, Mysore Road, Bengaluru - 59",
    foundation:
      "Datastride Analytics was founded in 2022 and is based in Bengaluru, India",
    size: "According to its LinkedIn page, Datastride Analytics has a company size of 2-10 employees, with 17 associated members on the platform",
    score: "7",
  };

  // ----------------------- Competitor Data -----------------------
  type Competitor = {
    name: string;
    founded: number;
    hq: string;
    raised: number;
    offerings: string;
    market: string;
    description: string;
    url: string;
  };

  const indianCompetitors: Competitor[] = [
    {
      name: "Yellow.ai",
      founded: 2016,
      hq: "San Mateo, CA",
      raised: 102.2,
      offerings: "No-code chatbot builder, omnichannel bots",
      market: "Enterprises",
      description:
        "A conversational AI platform helping automate customer and employee experiences.",
      url: "https://yellow.ai/",
    },
    {
      name: "Haptik",
      founded: 2013,
      hq: "Mumbai, India",
      raised: 12.2,
      offerings: "Chatbots, voice bots, analytics",
      market: "E-commerce, finance, telecom",
      description:
        "Conversational AI company providing AI-driven solutions for customer engagement.",
      url: "https://www.haptik.ai/",
    },
    {
      name: "Observe.AI",
      founded: 2017,
      hq: "San Francisco, CA",
      raised: 214,
      offerings: "AI contact center analytics",
      market: "Contact centers & enterprises",
      description:
        "Platform that uses AI to analyze customer interactions and optimize agent performance.",
      url: "https://www.observe.ai/",
    },
  ];

  const globalCompetitors: Competitor[] = [
    {
      name: "ThoughtSpot",
      founded: 2012,
      hq: "Sunnyvale, CA",
      raised: 674,
      offerings: "Search-driven analytics, dashboards",
      market: "Large enterprises",
      description:
        "AI-powered analytics platform enabling search-driven insights from enterprise data.",
      url: "https://www.thoughtspot.com/",
    },
    {
      name: "Tellius",
      founded: 2015,
      hq: "Reston, VA",
      raised: 25,
      offerings: "Decision intelligence with NL search",
      market: "Enterprises & data teams",
      description:
        "Decision intelligence platform combining AI/ML with natural language search interface.",
      url: "https://www.tellius.com/",
    },
    {
      name: "Microsoft Power BI",
      founded: 2011,
      hq: "Redmond, WA",
      raised: 0,
      offerings: "BI & visualization platform",
      market: "Individuals to enterprises",
      description:
        "Business analytics service providing interactive visualizations and business intelligence.",
      url: "https://powerbi.microsoft.com/",
    },
  ];

  type CompetitorData = {
    name: string;
    raised: number;
    region: string;
  };

  const chartData: CompetitorData[] = [
    ...indianCompetitors.map((c) => ({
      name: c.name,
      raised: c.raised,
      region: "Indian",
    })),
    ...globalCompetitors.map((c) => ({
      name: c.name,
      raised: c.raised,
      region: "Global",
    })),
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* <InvestmentWeightage/>commented for now if need we can uncomment or we can delete */}
      {/* ---------------- Summary Card ---------------- */}

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
      </div>

      <SummaryCard company={company} />
      {/* <ThesisConfig /> */}

      {/* ---------------- Tabs ---------------- */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {/* <TabsTrigger value="markedupData">
            <img
              src="/assets/gemini_symbol.png"
              alt="AI generated icon"
              className="inline-block w-6 h-4 ml-1"
            />
            AI generated deal note{" "}
          </TabsTrigger> */}
          <TabsTrigger value="investmentMemo">
            Investment Recommendation
          </TabsTrigger>
          <TabsTrigger value="overview">Basic Overview</TabsTrigger>
          <TabsTrigger value="foundingTeam">Team Profiling</TabsTrigger>
          <TabsTrigger value="businessModel">Business Model</TabsTrigger>
          <TabsTrigger value="funding">Funding & Financials</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="traction">Traction</TabsTrigger>
          <TabsTrigger value="industry">Industry & Trends</TabsTrigger>
          <TabsTrigger value="partnership">
            {company?.company_name === "Sia Analytics"
              ? "Partnerships & Strategic Analysis"
              : "SWOT & Risk Analysis"}
          </TabsTrigger>
        </TabsList>

        {/* ------------------Marked up Data--------------------*/}
        {/* <TabsContent value="markedupData">
          {" "}
          {company?.extract_benchmark_agent_response?.trim()?.length ? (
            <article className="prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {company?.extract_benchmark_agent_response}
              </ReactMarkdown>
            </article>
          ) : null}
        </TabsContent> */}

        {/* ------------ Competitors Tab ------------ */}
        <CompetitorsTab company={company} />
        {/* ------------ Funding Tab ------------ */}
        <FundingTab />

        {/* Industry & Trends*/}
        <IndustryTab />

        {/* Problem Statement And Solution */}
        <Overview company={company} />

        {/* Founding team */}
        <FoundingTeam company={company} />

        {/* Traction & User Base */}
        <Traction />

        {/* Business Model & Go to Market */}
        <BusinessModel />
        {/* Other */}
        <PartnershipsAndAnalysis company={company} />

        <InvestmentRecommendation company={company} />
      </Tabs>
    </div>
  );
}
