import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  Briefcase,
  Users,
  Rocket,
  DollarSign,
  Target,
  Globe,
  BarChart3,
  Building2,
  Handshake,
} from "lucide-react";

const iconMap = {
  Briefcase,
  Users,
  Rocket,
  DollarSign,
  Target,
  Globe,
  BarChart3,
  Building2,
  Handshake,
} as const;

type IconName = keyof typeof iconMap;

interface CardSection {
  title: string;
  icon: IconName;
  color: {
    border: string;
    bg: string;
    text: string;
    icon: string;
  };
  content: string[];
  note?: string;
  colSpan?: string; // For full-width cards
  subItems?: {
    icon: IconName;
    title: string;
    desc: string;
  }[];
}

const businessModelData: CardSection[] = [
  {
    title: "Revenue Model",
    icon: "Briefcase",
    color: {
      border: "border-indigo-500",
      bg: "bg-indigo-50/40",
      text: "text-indigo-700",
      icon: "text-indigo-600",
    },
    content: [
      "<b>Type:</b> Enterprise Sales Model — high-ticket B2B SaaS deals.",
      "<b>Focus:</b> Subscription-based revenue with optional onboarding/setup fees.",
    ],
    note: "Designed for scalability across large enterprise accounts.",
  },
  {
    title: "Target Customer Profile",
    icon: "Target",
    color: {
      border: "border-emerald-500",
      bg: "bg-emerald-50/40",
      text: "text-emerald-700",
      icon: "text-emerald-600",
    },
    content: [
      "Medium to Large Enterprises.",
      "Focus on data-heavy industries such as Manufacturing, BFSI, and Healthcare.",
      "Buyers: Data Heads, CIOs, and Business Analytics Leaders.",
    ],
    note: "Customers seeking automation, scalability, and data democratization.",
  },
  {
    title: "Pricing",
    icon: "DollarSign",
    color: {
      border: "border-purple-500",
      bg: "bg-purple-50/40",
      text: "text-purple-700",
      icon: "text-purple-600",
    },
    content: [
      "<b>Subscription:</b> $60 per user/month.",
      "<b>Setup Cost:</b> One-time fee of $20,000.",
    ],
    note: "Flexible enterprise pricing model with scalable user tiers.",
  },
  {
    title: "Go-to-Market (GTM) Strategy",
    icon: "Rocket",
    colSpan: "col-span-3",
    color: {
      border: "border-blue-500",
      bg: "bg-blue-50/40",
      text: "text-blue-700",
      icon: "text-blue-600",
    },
    content: [],
    subItems: [
      {
        icon: "Handshake",
        title: "Partner Channels",
        desc: "Partnerships with data companies like N Data Services, PROPEL/ATHON, pN, BOSCH, and RAVRC for warm introductions.",
      },
      {
        icon: "Globe",
        title: "Community Building",
        desc: "Hosting webinars, data community events, and thought leadership campaigns.",
      },
      {
        icon: "BarChart3",
        title: "Sectoral Use Cases",
        desc: "Creating vertical-specific solutions and running innovation challenges.",
      },
      {
        icon: "Rocket",
        title: "Digital Marketing",
        desc: "Strategic digital ads, SEO, and influencer collaborations to drive awareness.",
      },
      {
        icon: "Building2",
        title: "Cloud Marketplaces",
        desc: "Listing on major cloud marketplaces for frictionless onboarding.",
      },
    ],
  },
];

export default function BusinessModel() {
  return (
    <TabsContent value="businessModel">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {businessModelData.map((section, idx) => {
          const Icon = iconMap[section.icon];
          return (
            <Card
              key={idx}
              className={`${section.colSpan ?? ""} border-l-4 ${
                section.color.border
              } ${section.color.bg} shadow-sm`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {Icon && (
                    <Icon className={`${section.color.icon} w-4 h-4`} />
                  )}
                  <CardTitle
                    className={`text-sm font-semibold ${section.color.text}`}
                  >
                    {section.title}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent
                className={`text-xs text-gray-700 ${
                  section.subItems
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                    : "space-y-2"
                }`}
              >
                {/* Regular content */}
                {!section.subItems &&
                  section.content.map((text, i) => (
                    <p
                      key={i}
                      dangerouslySetInnerHTML={{ __html: text }}
                    />
                  ))}

                {section.note && !section.subItems && (
                  <div
                    className={`${section.color.bg.replace(
                      "/40",
                      "-100"
                    )} ${section.color.text} text-[11px] p-2 rounded-md`}
                  >
                    {section.note}
                  </div>
                )}

                {/* Sub-items (GTM strategy) */}
                {section.subItems &&
                  section.subItems.map((item, i) => {
                    const SubIcon = iconMap[item.icon];
                    return (
                      <div
                        key={i}
                        className="bg-white p-3 rounded-md shadow-sm"
                      >
                        {SubIcon && (
                          <SubIcon
                            className="w-4 h-4 text-blue-500 inline-block mr-1"
                          />
                        )}
                        <b>{item.title}</b>
                        <p className="mt-1 text-gray-600">{item.desc}</p>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TabsContent>
  );
}
