import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const { data: projects } = api.project.getProjects.useQuery();
  const [projectId, setProjectId] = useLocalStorage<string>(
    "aicarus-projectId",
    "",
  );

  const currentProject = projects?.find((project) => project.id === projectId);

  return {
    projects,
    currentProject,
    projectId,
    setProjectId,
  };
};

export default useProject;
