import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Users, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function FoundingTeam({ company }: any) {
  const bigString = company?.extract_benchmark_agent_response || "";

  // Normalize escape sequences like \n → actual newlines
  const normalizedText = bigString.replace(/\\n/g, "\n");

  function extractBetweenMarkers(
    text: string,
    start: string,
    end: string
  ): string {
    const startIndex = text.indexOf(start);
    if (startIndex === -1) return "";

    const endIndex = text.indexOf(end, startIndex + start.length);
    const rawSection =
      endIndex === -1
        ? text.slice(startIndex + start.length)
        : text.slice(startIndex + start.length, endIndex);

    // Clean markdown characters like **, *, _, etc.
    const cleaned = rawSection
      .replace(/\*/g, "") // remove all asterisks
      .replace(/_/g, "") // remove underscores if any
      .replace(/\s+/g, " ") // normalize multiple spaces
      .replace(/\#/g, "") // remove all asterisks
      .trim();

    return cleaned;
  }

  // Example usage
  const teamData =
    extractBetweenMarkers(normalizedText, "Team Strength", "  **") ||
    extractBetweenMarkers(normalizedText, "The Problem", "The Solution");

  const siaTeam = [
    {
      name: "Divya Krishna R",
      title: "Co-founder, CEO & Director",
      background:
        "Ex-Lead Data Scientist at Bosch. M.E. in IT, Frankfurt University.",
      highlight: "Co-owns 10 patents with Sumalata Kamat.",
      path: "",
    },
    {
      name: "Sumalata Kamat",
      title: "Co-founder & CTO",
      background: "Ex-System Engineer at Bosch. M.Tech from BITS Pilani.",
      highlight: "Expert in scalable systems and co-owner of 10 patents.",
      path: "https://www.signalhire.com/profiles/sumalata-kamat's-email/195762413",
    },
    {
      name: "Karthik C",
      title: "Co-founder & COO",
      background: "Founded Avid Athletes (Sports-Tech). Ex-Byju’s & IBM.",
      highlight: "Blends startup, tech, and operations experience.",
      path: "",
    },
  ];

  const NTeam = [
    {
      name: "Anamika Pandey",
      title: "Founder",
      background:
        "Previously New Initiatives Lead at BBdaily, Bigbasket. Education from NIT Warangal.She is also noted as an MBA dropout from the Booth School of Business, Chicago.",
      highlight: "",
      path: "",
    },
    {
      name: "Charul Chandak",
      title: "",
      background:
        "Previous experience at Nestle, with education from SPJIMR. A LinkedIn profile shows experience as a Marketing Intern at Naario from Feb 2023 - May 2023",
      highlight: "",
      path: "https://in.linkedin.com/in/charul-chandak-spjimr",
    },
    {
      name: "Simran Shali",
      title: "Product and Quality",
      background:
        "Education from Lady Irwin College. She is a Food Technologist and R&D Lead, driving millet-based innovations.",
      highlight: "",
      path: "https://in.linkedin.com/in/ft-simran-shali-9056691ab",
    },
    {
      name: "Vaanya Ranade",
      title: "Partners Lead",
      background:
        "Education from Ashoka University. Her experience includes scaling the brand through community-first marketing.",
      highlight: "",
      path: "https://in.linkedin.com/in/vaanya-ranade-936bb11aa",
    },
    {
      name: "Vandana Sharma",
      title: "Community Manager",
      background:
        "Previous experience at Shaadi.com. She is a community manager focused on women-centric engagement.",
      highlight: "",
      path: "https://in.linkedin.com/in/vandana-sharma-4015b4222",
    },
  ];

  const DTeam = [
    {
      name: "Utsav Bisaria",
      title: "CEO",
      background: "Experience from EY Consulting and Navi Insurance",
      highlight: "",
      path: "https://www.linkedin.com/posts/jagan-kumar-9a866b222_utsav-bisaria-and-yash-ladda-thanks-for-trusting-activity-7289322616807378944-dROg",
    },
    {
      name: "Yash Ladda",
      title: "COO",
      background:
        "Chartered Accountant with an All India Rank 3 and a CFA Level 2 candidate. Previously a Finance Associate at Navi and also worked at PwC.",
      highlight: "",
      path: "https://in.linkedin.com/in/yashladda",
    },
    {
      name: "Dr. Jyoti Prakash Kunungo (Chief Veterinary Officer)",
      title: "Co-founder & COO",
      background:
        "Holds a B.V.Sc. and MBA, with over 12 years of clinical experience at clinics including Cesna and Jiva.",
      highlight: "",
      path: "https://in.linkedin.com/in/dr-jyoti-prakash-kanungo-4189a0234",
    },
  ];

  return (
    <TabsContent value="foundingTeam">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        {/* Team Strength Summary */}
        {teamData && (
          <Card className="lg:col-span-1 border-l-4 border-purple-500 bg-purple-50/40 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="text-purple-600 w-4 h-4" />
                <CardTitle className="text-sm font-semibold text-purple-700">
                  Team Strength Overview
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-700 text-xs space-y-2">
              <div className="flex items-start gap-1">
                {/* <Briefcase className="text-purple-500 w-3 h-3 mt-0.5" /> */}
                <p>{teamData}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Individual Team Cards */}
        {company?.company_name === "Sia Analytics" && (
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {siaTeam.map((member) => (
              <Card
                key={member.name}
                className={`relative overflow-hidden border-t-4 border-blue-600 shadow-sm bg-white p-2`}
              >
                <CardHeader className="pb-1 px-2">
                  <CardTitle className="text-sm font-semibold text-blue-700 leading-tight">
                    <Link to={member.path}>{member.name}</Link>
                  </CardTitle>
                  <p className="text-[11px] text-gray-500">{member.title}</p>
                </CardHeader>

                <CardContent className="text-[12px] text-gray-700 space-y-1 px-2">
                  <p>{member.background}</p>
                  <div className="flex items-center gap-1 text-indigo-600 text-[11px]">
                    {member.highlight && <Star className="w-3 h-3" />}
                    {member.highlight && <span>{member.highlight}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {company?.company_name === "Naario" && (
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {NTeam.map((member) => (
              <Card
                key={member.name}
                className={`relative overflow-hidden border-t-4 border-blue-600 shadow-sm bg-white p-2`}
              >
                <CardHeader className="pb-1 px-2">
                  <CardTitle className="text-sm font-semibold text-blue-700 leading-tight">
                    <Link to={member.path}>{member.name}</Link>
                  </CardTitle>
                  <p className="text-[11px] text-gray-500">{member.title}</p>
                </CardHeader>

                <CardContent className="text-[12px] text-gray-700 space-y-1 px-2">
                  <p>{member.background}</p>
                  <div className="flex items-center gap-1 text-indigo-600 text-[11px]">
                    {member.highlight && <Star className="w-3 h-3" />}
                    {member.highlight && <span>{member.highlight}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {company?.company_name === "Dr Doodley" && (
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {DTeam.map((member) => (
              <Card
                key={member.name}
                className={`relative overflow-hidden border-t-4 border-blue-600 shadow-sm bg-white p-2`}
              >
                <CardHeader className="pb-1 px-2">
                  <CardTitle className="text-sm font-semibold text-blue-700 leading-tight">
                    <Link to={member.path}>{member.name}</Link>
                  </CardTitle>
                  <p className="text-[11px] text-gray-500">{member.title}</p>
                </CardHeader>

                <CardContent className="text-[12px] text-gray-700 space-y-1 px-2">
                  <p>{member.background}</p>
                  <div className="flex items-center gap-1 text-indigo-600 text-[11px]">
                    {member.highlight && <Star className="w-3 h-3" />}
                    {member.highlight && <span>{member.highlight}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TabsContent>
  );
}
