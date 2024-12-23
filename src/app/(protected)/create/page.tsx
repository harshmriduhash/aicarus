"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
  repoUrl: string;
  projectName: string;
  branch?: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const refetch = useRefetch();
  const router = useRouter();

  function onSubmit(data: FormInput) {
    const githubRepoRegex =
      /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+(\/)?$/;
    const isValidUrl = githubRepoRegex.test(data.repoUrl);

    if (!isValidUrl) {
      toast.error("Invalid GitHub URL");
      return;
    }

    const creatingToast = toast.loading("Creating project...");

    createProject.mutate(
      {
        githubUrl: data.repoUrl,
        name: data.projectName,
        branch: data.branch,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.dismiss(creatingToast);
          toast.success("Project created successfully");
          refetch();
          router.push("/dashboard");
          reset();
        },
        onError: (error) => {
          toast.dismiss(creatingToast);
          toast.error("Failed to create project: " + error.message);
        },
      },
    );
  }
  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img
        src="/undraw-hacker.svg"
        alt="Create"
        className="h-56 w-auto max-sm:hidden"
      />
      <div>
        <div className="text-2xl font-semibold">
          Link your Github repository
          <div className="text-sm text-muted-foreground">
            Enter the URL of your repository to link it to Aicarus
          </div>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
              required
            />
            <span className="pl-[2px] text-xs text-muted-foreground">
              This will be the name of the project in Aicarus
            </span>
            <div className="h-2"></div>

            <Input
              {...register("repoUrl", { required: true })}
              placeholder="Github URL"
              type="url"
              required
            />
            <span className="pl-[2px] text-xs text-muted-foreground">
              Enter the URL of the repository you want to link
            </span>
            <div className="h-2"></div>

            <Input {...register("branch")} placeholder="Branch (Optional)" />
            <span className="pl-[2px] text-xs text-muted-foreground">
              This is required if your default branch is not called "main"
            </span>

            <div className="h-2"></div>

            <Input
              {...register("githubToken")}
              placeholder="Github Token (Optional)"
            />
            <span className="pl-[2px] text-xs text-muted-foreground">
              This is required for private repositories
            </span>
            <div className="h-2"></div>

            <Button type="submit" disabled={createProject.isPending}>
              Create Project
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
