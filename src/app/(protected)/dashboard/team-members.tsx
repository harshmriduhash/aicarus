"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent } from "@/components/ui/hover-card";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import { HoverCardTrigger } from "@radix-ui/react-hover-card";
import { CalendarIcon } from "lucide-react";
import React from "react";

const TeamMembers = () => {
  const { projectId } = useProject();
  const { data: members } = api.project.getTeamMembers.useQuery({ projectId });

  return (
    <div className="inline-flex flex-row-reverse">
      {members?.map((member) => (
        <HoverCard key={member.id}>
          <HoverCardTrigger asChild className="avatar">
            <img
              src={member.user.imageUrl || ""}
              alt={member.user.firstName || ""}
              height={35}
              width={35}
            />
          </HoverCardTrigger>
          <HoverCardContent className="w-fit">
            <div className="flex justify-between gap-4">
              <Avatar>
                <AvatarImage src={member.user.imageUrl || ""} />
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">
                  {member.user.emailAddress}
                </h4>
                <p className="text-sm">
                  {member.user.firstName} {member.user.lastName}
                </p>
                <div className="flex items-center pt-2">
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                  <span className="text-xs text-muted-foreground">
                    Joined {member.createdAt.toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
};
export default TeamMembers;
