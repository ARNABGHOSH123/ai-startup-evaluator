import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HandCoins, Mail, MapPin, PhoneCallIcon, Users } from "lucide-react";
import { Link } from "react-router-dom";
import AIGeneratedDealNote from "./AIGeneratedDealNote";

export default function SummaryCard({
  company,
  companyId,
  state,
}: {
  company: any;
  companyId: string;
  state: any;
}) {
  const [openDealNote, setOpenDealNote] = useState(false);

  // const handleNotifyInvestor = async () => {
  //   try {
  //     const response = await fetch(
  //       `${import.meta.env.VITE_CLOUD_RUN_SERVICE_URL}/send_notification_email`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           companyId: companyId,
  //           founderName: company?.founder_name,
  //           founderEmail:
  //             company?.company_email,
  //         }),
  //       }
  //     );

  //     const data = await response.json();

  //     if (data.success) {
  //       alert("Email notification sent!");
  //     } else {
  //       alert("Failed to send email.");
  //     }
  //   } catch (error) {
  //     console.error("Email error:", error);
  //     alert("Error sending email");
  //   }
  // };

  // ---------- Score Dots UI ----------
  function ScoreCircle({ value }: { value: number }) {
    // value expected: 0–100
    const size = 70;
    const strokeWidth = 8;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const progress = (value / 100) * circumference;

    const color = value < 50 ? "#ef4444" : value < 70 ? "#facc15" : "#0cf060"; // red/yellow/green

    return (
      <div className="flex items-center justify-center relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={
              !isNaN(circumference) && !isNaN(progress)
                ? circumference - progress
                : 0
            }
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center Percentage */}
        <div className="absolute text-lg font-bold text-foreground">
          {value?.toFixed(0)}%
        </div>
      </div>
    );
  }

  // ---------- Component Layout ----------
  return (
    <>
      <AIGeneratedDealNote
        openDealNote={openDealNote}
        setOpenDealNote={setOpenDealNote}
        companyId={companyId}
      />
      <Card className="bg-background shadow-sm rounded-2xl border border-border hover:border-primary pt-5">
        <CardContent className="flex flex-row space-x-4">
          <div className="grid grid-cols-1 gap-y-4 text-sm md:w-3/4">
            {/* Company Name */}
            {/* <div> */}
            <div className="flex space-x-2 items-center">
              <span className="text-2xl font-bold text-foreground">
                {state?.company_name}
              </span>
              <span className="bg-blue-100 px-4 h-4 mt-2 text-xs items-center rounded-xl text-dark">
                {
                  company?.competitor_analysis?.competitor_analysis
                    ?.company_domain
                }
              </span>
              <span className="bg-green-100 px-4 h-4 mt-2 text-xs items-center rounded-xl text-dark">
                {state?.stage_of_development}
              </span>
              <div className="flex space-x-2 mt-2 items-center text-neutral">
                <span className="text-neutral text-xs">
                  Founded{" "}
                  {
                    company?.overview?.overview?.market_size_and_position
                      ?.foundation_year
                  }
                </span>
              </div>
              <div className="flex space-x-2 mt-2 items-center text-neutral">
                <Users size={16} />
                <span className="text-neutral text-xs">
                  {
                    company?.overview?.overview?.market_size_and_position
                      ?.employee_count
                  }{" "}
                  Employees
                </span>
              </div>
            </div>
            <div className="text-foreground text-xs">
              {
                company?.overview?.overview?.market_size_and_position
                  ?.short_description
              }
            </div>
            {/* </div> */}
            <div className="grid grid-flow-row grid-cols-10">
              <div className="flex space-x-2 items-center text-neutral col-span-3">
                <MapPin size={16} />
                <span className="text-neutral text-xs">
                  {
                    company?.overview?.overview?.market_size_and_position
                      ?.geographic_location
                  }
                </span>
              </div>
              <div className="flex space-x-2 items-center text-neutral col-span-3 justify-center">
                <PhoneCallIcon size={16} />
                <span className="text-neutral text-xs">
                  {state?.company_phone_no}
                </span>
              </div>
              <div className="flex space-x-2 items-center text-neutral col-span-3 justify-center">
                <Mail size={16} />
                <Link
                  to={`mailto:${company?.company_email}`}
                  className="text-neutral hover:underline text-xs"
                >
                  {state?.company_email}
                </Link>
              </div>
              {/* <div className="flex space-x-2 items-center col-span-3 justify-center ">
                <Link
                  to={company?.parentWebsite}
                  className="text-neutral hover:underline text-xs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {parent_company || "Datastride Analytics"}
                </Link>
                <span className="bg-green-100 px-4 h-4 text-xs items-center rounded-xl text-dark">
                  Parent
                </span>
              </div> */}
            </div>
          </div>
          <div className="flex flex-col space-y-6">
            <span className="flex space-x-4">
              <Button
                className="text-secondary"
                // onClick={handleNotifyInvestor}
              >
                <HandCoins />
                Express Interest
              </Button>
              <Button
                className="bg-background text-primary hover:border-primary hover:border justify-center px-6"
                onClick={() =>
                  state?.company_name?.toString()?.toLowerCase() ===
                  "sia analytics"
                    ? setOpenDealNote(true)
                    : setOpenDealNote(false)
                }
              >
                <img
                  src="/assets/gemini_symbol.png"
                  alt="AI generated icon"
                  className="inline-block w-6 h-4"
                />
                AI Generated Deal Note{" "}
              </Button>
            </span>
            <span className="flex flex-row place-content-end">
              <span className="flex flex-col space-y-1">
                <span className="text-neutral text-sm">
                  AI CONFIDENCE SCORE
                </span>
                <span>
                  <ScoreCircle
                    value={
                      company?.investment_recommendation
                        ?.investment_recommendation?.confidence_score
                    }
                  />
                </span>
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
