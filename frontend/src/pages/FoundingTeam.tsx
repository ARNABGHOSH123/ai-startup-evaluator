import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Users, Dot, GraduationCap, Target, BriefcaseBusiness, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function FoundingTeam({ company }: any) {
  return (
    <TabsContent value="foundingTeam">
      <p className="text-xs text-foreground p-4 items-center">
        {
          company?.team_profiling?.team_profiling?.team_strength_overview
            ?.summary_paragraph
        }
      </p>
      {company?.team_profiling?.team_profiling?.team_strength_overview
          ?.summary_paragraph && (
          <Card className="lg:col-span-1 border-l-4 border-cardborder bg-cardborderlight shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center text-cardborder gap-2">
                <Users className="w-4 h-4" />
                <CardTitle className="text-sm font-semibold">
                  Team Strength
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-dark space-y-2">
              {company?.team_profiling?.team_profiling?.team_strength_overview?.bullet_points?.map(
                (point: string) => (
                  <span className="flex space-x-2">
                    <span>
                      <Dot size={32} />
                    </span>
                    <span className="text-xs">{point}</span>
                  </span>
                )
              )}
            </CardContent>
          </Card>
        )}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 p-4">
        {/* Individual Team Cards */}

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          {company?.team_profiling?.team_profiling?.founder_profiles?.map(
            (member: any) => {
              const [name, role] =
                member.name_and_role
                  ?.split(" - ")
                  .map((s: string) => s.trim()) || [];

              return (
                <Card
                  key={name}
                  className="relative overflow-hidden border-t-4 border-primary shadow-sm bg-background p-2"
                >
                  <CardHeader className="pb-1 px-2">
                    <CardTitle className="text-sm font-semibold text-primary leading-tight">
                      <Link to={member?.path}>{name}</Link>
                    </CardTitle>
                    <p className="text-[11px] text-neutral">{role}</p>
                  </CardHeader>

                  <CardContent className="mt-2">
                    <span className="flex flex-col space-y-4">
                    <span>
                      {member?.educational_qualifications && (
                        <span className="flex space-x-2">
                          <span>
                            <GraduationCap size={16} />
                          </span>
                          <span className="text-xs">
                            {member?.educational_qualifications}
                          </span>
                        </span>
                      )}
                    </span>
                    <span>
                      {member?.vision_and_motivation && (
                        <span className="flex space-x-2">
                          <span>
                            <Target size={16} />
                          </span>
                          <span className="text-xs">
                            {member?.vision_and_motivation}
                          </span>
                        </span>
                      )}
                    </span>
                    <span>
                      {member?.professional_background && (
                        <span className="flex space-x-2">
                          <span>
                            <BriefcaseBusiness size={16} />
                          </span>
                          <span className="text-xs">
                            {member?.professional_background}
                          </span>
                        </span>
                      )}
                    </span>
                    <span>
                      {member?.industry_expertise && (
                        <span className="flex space-x-2">
                          <span>
                            <BadgeCheck size={16} />
                          </span>
                          <span className="text-xs">
                            {member?.industry_expertise}
                          </span>
                        </span>
                      )}
                    </span>
                    </span>
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>
        {/* 
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
        )} */}
      </div>
    </TabsContent>
  );
}
