"use client";

import React from "react";
import Image from "next/image";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import CodeReferences from "./code-references";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const AskQuestionCard = () => {
  const { currentProject } = useProject();
  const [open, setOpen] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [filesReferences, setFilesReferences] = React.useState<
    {
      fileName: string;
      sourceCode: string;
      summary: string;
    }[]
  >([]);
  const [answer, setAnswer] = React.useState("");
  const saveAnswer = api.project.saveAnswer.useMutation();
  const refetch = useRefetch();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject?.id) return;

    setAnswer("");
    setFilesReferences([]);

    setLoading(true);

    try {
      const { output, filesReferences } = await askQuestion(
        question,
        currentProject.id,
      );

      if (output) setOpen(true);

      setFilesReferences(filesReferences);

      for await (const delta of readStreamableValue(output)) {
        if (delta) setAnswer((prev) => prev + delta);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to answer question!");
    } finally {
      setLoading(false);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Question Answer Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-[70vw]"
          aria-describedby="Answer"
          aria-description="Answer"
        >
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>
                <Image src="/logo.png" alt="logo" width={40} height={40} />
              </DialogTitle>
              <Button
                variant="outline"
                disabled={saveAnswer.isPending}
                onClick={() => {
                  saveAnswer.mutate(
                    {
                      projectId: currentProject!.id,
                      question,
                      answer,
                      filesReferences,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Answer saved!");
                        refetch();
                      },
                      onError: (error) => {
                        toast.error("Failed to save answer!");
                      },
                    },
                  );
                }}
              >
                Save Answer
              </Button>
            </div>
          </DialogHeader>
          <MarkdownPreview
            source={answer}
            className="!h-full max-h-[40vh] max-w-[65vw] overflow-auto rounded-md p-5"
          />
          <div className="h-3"></div>
          <CodeReferences filesReferences={filesReferences} />
          <Button type="button" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* Ask Question Card */}
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Ask questions related to the codebase here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <div className="flex items-center justify-start gap-3">
              <Button type="submit" disabled={loading || question.length === 0}>
                Ask Aicarus!
              </Button>
              <Button
                type="reset"
                variant="destructive"
                onClick={() => setQuestion("")}
              >
                Clear question
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
