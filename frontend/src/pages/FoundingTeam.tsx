import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Users, Award, Briefcase, Lightbulb, Star } from "lucide-react";
import { Link } from "react-router-dom";

// Map of icons
const iconMap = {
  Users,
  Briefcase,
  Award,
  Lightbulb,
} as const;

type IconName = keyof typeof iconMap;

interface TeamCardItem {
  icon: IconName;
  text: string;
}

interface TeamCardData {
  title: string;
  headerIcon: IconName;
  color: {
    border: string;
    bg: string;
    text: string;
    icon: string;
  };
  items: TeamCardItem[];
  summary: { text: string };
}

export default function FoundingTeam() {
  const team = [
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

  // Dynamic card data
  const teamStrengthCard: TeamCardData = {
    title: "Team Strength Overview",
    color: {
      border: "border-purple-500",
      bg: "bg-purple-50/40",
      text: "text-purple-700",
      icon: "text-purple-500",
    },
    headerIcon: "Users",
    items: [
      {
        icon: "Briefcase",
        text: "Strong technical background from <b>Bosch</b>, a global engineering leader.",
      },
      {
        icon: "Award",
        text: "Two co-founders hold <b>10 patents</b> in AI and analytics.",
      },
      {
        icon: "Lightbulb",
        text: "Prior entrepreneurial experience — one co-founded a <b>sports-tech startup</b>.",
      },
    ],
    summary: {
      text: "<b>Summary:</b> Strong mix of <b>tech expertise</b>, <b>IP ownership</b>, and <b>execution skill</b>.",
    },
  };

  const HeaderIcon = iconMap[teamStrengthCard.headerIcon];

  return (
    <TabsContent value="foundingTeam">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        {/* Team Strength Summary (Dynamic) */}
        <Card
          className={`lg:col-span-1 border-l-4 ${teamStrengthCard.color.border} ${teamStrengthCard.color.bg} shadow-sm`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              {HeaderIcon && (
                <HeaderIcon
                  className={`${teamStrengthCard.color.text} w-4 h-4`}
                />
              )}
              <CardTitle
                className={`text-sm font-semibold ${teamStrengthCard.color.text}`}
              >
                {teamStrengthCard.title}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="text-gray-700 text-xs space-y-2">
            {teamStrengthCard.items.map((item, i) => {
              const Icon = iconMap[item.icon];
              return (
                <div key={i} className="flex items-start gap-1">
                  {Icon && (
                    <Icon
                      className={`${teamStrengthCard.color.icon} w-3 h-3 mt-0.5`}
                    />
                  )}
                  <p dangerouslySetInnerHTML={{ __html: item.text }} />
                </div>
              );
            })}
            <div className="bg-purple-100 text-purple-800 text-[11px] p-2 rounded-md">
              <p
                dangerouslySetInnerHTML={{
                  __html: teamStrengthCard.summary.text,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Individual Team Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {team.map((member) => (
            <Card
              key={member.name}
              className="relative overflow-hidden border-t-4 border-blue-600 shadow-sm bg-white p-2"
            >
              <CardHeader className="pb-1 px-2">
                <CardTitle className="text-sm font-semibold text-blue-700 leading-tight">
                  {member.path ? (
                    <Link to={member.path}>{member.name}</Link>
                  ) : (
                    member.name
                  )}
                </CardTitle>
                <p className="text-[11px] text-gray-500">{member.title}</p>
              </CardHeader>

              <CardContent className="text-[12px] text-gray-700 space-y-1 px-2">
                <p>{member.background}</p>
                <div className="flex items-center gap-1 text-indigo-600 text-[11px]">
                  <Star className="w-3 h-3" />
                  <span>{member.highlight}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TabsContent>
  );
}
