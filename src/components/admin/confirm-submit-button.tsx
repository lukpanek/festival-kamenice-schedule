"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ConfirmSubmitButtonProps = {
  ariaLabel: string;
  children: ReactNode;
  confirmLabel?: string;
  description: ReactNode;
  title: string;
  triggerClassName?: string;
};

export function ConfirmSubmitButton({
  ariaLabel,
  children,
  confirmLabel = "Smazat",
  description,
  title,
  triggerClassName,
}: ConfirmSubmitButtonProps) {
  const [open, setOpen] = useState(false);
  const [formElement, setFormElement] = useState<HTMLFormElement | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={ariaLabel}
          className={triggerClassName}
          onClick={(event) => {
            setFormElement(event.currentTarget.closest("form"));
          }}
        >
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Zrušit</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              formElement?.requestSubmit();
              setOpen(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
