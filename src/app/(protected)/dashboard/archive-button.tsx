"use client";
import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React from "react";
import { toast } from "sonner";

const ArchiveButton = () => {
  const archiveProject = api.project.archiveProject.useMutation();
  const { projectId, projects, setProjectId } = useProject();
  const refetch = useRefetch();

  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={() => {
        const confirm = window.confirm(
          "Are you sure you want to archive this project?",
        );
        if (confirm) {
          archiveProject.mutate(
            { projectId },
            {
              onSuccess: () => {
                const remainingProjects =
                  projects?.filter((p) => p.id !== projectId) || [];
                // Set the project ID to the first remaining project, or an empty string
                setProjectId(remainingProjects[0]?.id || "");

                toast.success("Project archived successfully");
                refetch();
              },
              onError: (error) => {
                toast.error("Failed to archive project");
              },
            },
          );
        }
      }}
    >
      Archive
    </Button>
  );
};

export default ArchiveButton;
