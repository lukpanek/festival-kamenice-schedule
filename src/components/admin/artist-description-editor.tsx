"use client";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { Bold, Italic } from "lucide-react";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeInitialHtml(raw: string | null | undefined): string {
  const t = raw?.trim() ?? "";
  if (!t) return "<p><br></p>";
  if (/<[a-z][\s\S]*>/i.test(t)) return t;
  return `<p>${escapeHtml(t)}</p>`;
}

function LoadInitialHtmlPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();

  useLayoutEffect(() => {
    const normalized = normalizeInitialHtml(html);
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const dom = new DOMParser().parseFromString(normalized, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom.body);
      if (nodes.length) {
        root.append(...nodes);
      } else {
        root.append($createParagraphNode());
      }
    });
  }, [editor, html]);

  return null;
}

function HtmlSyncPlugin({
  inputRef,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [editor] = useLexicalComposerContext();

  return (
    <OnChangePlugin
      onChange={(editorState) => {
        editorState.read(() => {
          const out = $generateHtmlFromNodes(editor, null);
          if (inputRef.current) inputRef.current.value = out;
        });
      }}
    />
  );
}

function FormatToolbar() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const sync = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        setIsBold(selection.hasFormat("bold"));
        setIsItalic(selection.hasFormat("italic"));
      }
    });
  }, [editor]);

  useEffect(() => {
    const unsubUpdate = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(sync);
    });
    const unsubSel = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        sync();
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
    sync();
    return () => {
      unsubUpdate();
      unsubSel();
    };
  }, [editor, sync]);

  return (
    <div className="flex gap-1 border-b bg-muted/30 px-2 py-1.5">
      <Button
        type="button"
        variant={isBold ? "secondary" : "ghost"}
        size="icon-xs"
        className="size-8"
        aria-label="Tučné"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
      >
        <Bold className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant={isItalic ? "secondary" : "ghost"}
        size="icon-xs"
        className="size-8"
        aria-label="Kurzíva"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
      >
        <Italic className="size-3.5" />
      </Button>
    </div>
  );
}

const editorTheme = {
  paragraph: "mb-2 last:mb-0",
  text: {
    bold: "font-bold",
    italic: "italic",
  },
};

export function ArtistDescriptionEditor({
  initialHtml,
}: {
  initialHtml?: string | null;
}) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const initial = initialHtml ?? "";

  return (
    <>
      <LexicalComposer
        initialConfig={{
          namespace: "ArtistLongDescription",
          theme: editorTheme,
          onError: console.error,
        }}
      >
        <div className="flex flex-col rounded-md border border-input bg-background overflow-hidden focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
          <FormatToolbar />
          <div className="relative min-h-[140px]">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  id="long-description-editor"
                  className={cn(
                    "relative z-1 min-h-[140px] px-3 py-2 text-sm leading-relaxed outline-none"
                  )}
                  aria-placeholder="Text popisu…"
                />
              }
              placeholder={
                <div className="pointer-events-none absolute left-3 top-2 z-0 text-sm text-muted-foreground select-none">
                  Text popisu…
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          <HistoryPlugin />
          <LoadInitialHtmlPlugin html={initial} />
          <HtmlSyncPlugin inputRef={hiddenRef} />
        </div>
      </LexicalComposer>
      <input
        ref={hiddenRef}
        type="hidden"
        name="longDescription"
        defaultValue={initial}
      />
    </>
  );
}
