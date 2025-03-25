import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Task } from "@/db/schema";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";

interface DeleteTaskAlertProps {
  task: Task | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteTaskAlert({
  task,
  onConfirm,
  onCancel,
}: DeleteTaskAlertProps) {
  if (!task) return null;

  return (
    <AlertDialog open={!!task} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogTrigger>
        <Button variant="ghost" size="icon">
          <Trash size={17} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="mb-3">
              <p className="text-xs">{task.abbreviation}</p>
              <p className="text-black text-[17px]">{task.description}</p>
            </div>
            This action cannot be undone. This will permanently delete the task
            and remove it from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
