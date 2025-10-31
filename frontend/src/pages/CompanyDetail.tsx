import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import InvestmentWeightage from "./InvestmentWeightage";

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<string>("competitors");

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
    score: "7"
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
      <SummaryCard companyInfo={companyInfo} />

      {/* ---------------- Tabs ---------------- */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="foundingTeam">Founding Team</TabsTrigger>
          <TabsTrigger value="businessModel">Business Model</TabsTrigger>
          <TabsTrigger value="funding">Funding & Financials</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="traction">Traction</TabsTrigger>
          <TabsTrigger value="industry">Industry & Trends</TabsTrigger>
          <TabsTrigger value="partnership">Partnerships & Strategic Analysis</TabsTrigger>
          <TabsTrigger value="investmentMemo">Investment Memo</TabsTrigger>
          
        </TabsList>

        {/* ------------ Competitors Tab ------------ */}
        <CompetitorsTab
          indianCompetitors={indianCompetitors}
          globalCompetitors={globalCompetitors}
          chartData={chartData}
        />
        {/* ------------ Funding Tab ------------ */}
        <FundingTab />

        {/* Industry & Trends*/}
        <IndustryTab />

    {/* Problem Statement And Solution */}
        <Overview />

      {/* Founding team */}
      <FoundingTeam />

      {/* Traction & User Base */}
      <Traction />

      {/* Business Model & Go to Market */}
      <BusinessModel />
      {/* Other */}
      <PartnershipsAndAnalysis/>

      <InvestmentRecommendation />
      </Tabs>
    </div>
  );
}
