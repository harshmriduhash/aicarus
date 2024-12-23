"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React, { useEffect } from "react";
import AskQuestionCard from "../dashboard/ask-question-card";
import MarkdownPreview from "@uiw/react-markdown-preview";
import CodeReferences from "../dashboard/code-references";
import NoProject from "../no-project";
import { cn } from "@/lib/utils";

const QaPage = () => {
  const { projectId } = useProject();
  const [isMounted, setIsMounted] = React.useState(false);
  const { data: questions } = api.project.getQuestions.useQuery({ projectId });

  const [questionIndex, setQuestionIndex] = React.useState(0);
  const currentQuestion = questions?.[questionIndex];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!projectId || projectId === "") return <NoProject />;
  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className="text-xl font-semibold">Saved Answers</h1>
      <div className="h-2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((question, index) => (
          <React.Fragment key={question.id}>
            <SheetTrigger onClick={() => setQuestionIndex(index)}>
              <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow">
                <img
                  height={30}
                  width={30}
                  className="rounded-full"
                  src={question.user.imageUrl ?? ""}
                />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <p className="line-clamp-1 text-lg font-medium text-gray-700">
                      {question.question}
                    </p>
                    <span className="whitespace-nowrap text-xs text-gray-500">
                      {question.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="line-clamp-1 text-sm text-gray-500">
                    {question.answer}
                  </p>
                </div>
              </div>
            </SheetTrigger>
          </React.Fragment>
        ))}
      </div>
      {currentQuestion && (
        <SheetContent
          className="overflow-y-scroll sm:max-w-[70vw]"
          aria-describedby={undefined}
        >
          <SheetHeader>
            <SheetTitle className="mb-2 mr-3 overflow-x-clip overflow-y-scroll text-base">
              {currentQuestion.question}
            </SheetTitle>
            <MarkdownPreview
              source={currentQuestion.answer}
              className={cn(
                (currentQuestion.filesReferences as any[])?.length === 0
                  ? "max-h-[90vh]"
                  : "max-h-[40vh]",
                "max-w-[65vw] overflow-auto rounded-md p-5",
              )}
            />
            <div className="h-2"></div>
            <CodeReferences
              filesReferences={(currentQuestion.filesReferences ?? []) as any}
            />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QaPage;
