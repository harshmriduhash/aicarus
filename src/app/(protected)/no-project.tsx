"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

const NoProject = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <p className="text-center text-lg font-medium text-gray-500">
        You haven't selected a project yet.
        <br /> Select one or create a new project to get started.
      </p>
      <Link href="/create" className="text-primary hover:underline">
        <Button>
          <Plus />
          Create a project
        </Button>
      </Link>
    </div>
  );
};

export default NoProject;
