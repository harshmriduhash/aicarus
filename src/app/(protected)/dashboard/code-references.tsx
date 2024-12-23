"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import React from "react";

type Props = {
  filesReferences: {
    fileName: string;
    sourceCode: string;
    summary: string;
  }[];
};

const getLanguageFromFileName = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase()!;
  const mapping: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    html: "html",
    css: "css",
    json: "json",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    yaml: "yaml",
    md: "markdown",
  };
  return mapping[extension] || "typescript"; // Default to typescript
};

const CodeReferences = ({ filesReferences }: Props) => {
  const [tab, setTab] = React.useState(filesReferences[0]?.fileName);
  if (filesReferences.length === 0) return null;

  return (
    <div className="max-w-[65vw]">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex gap-2 overflow-x-auto rounded-md bg-gray-200 p-1">
          {filesReferences.map((file, index) => (
            <button
              key={file.fileName + index}
              value={file.fileName}
              onClick={() => setTab(file.fileName)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
                {
                  "bg-primary text-primary-foreground hover:bg-primary/80":
                    tab === file.fileName,
                },
              )}
            >
              {file.fileName}
            </button>
          ))}
        </div>

        {filesReferences.map((file, index) => {
          const language = getLanguageFromFileName(file.fileName);
          return (
            <TabsContent
              key={file.fileName + index}
              value={file.fileName}
              className="max-h-[60vh] max-w-[66vw] overflow-y-scroll"
            >
              <SyntaxHighlighter
                language={language}
                style={materialDark}
                wrapLongLines={true}
                customStyle={{
                  borderRadius: "calc(var(--radius) - 2px)",
                }}
              >
                {file.sourceCode}
              </SyntaxHighlighter>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default CodeReferences;
