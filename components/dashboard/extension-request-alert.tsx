"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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
import { CalendarClock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Task } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ExtensionRequestAlertProps {
  task: Task | null;
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
}

export function ExtensionRequestAlert({
  task,
  onApprove,
  onReject,
  onCancel,
}: ExtensionRequestAlertProps) {
  if (!task) return null;

  const currentDueDate = task.dueDate ? new Date(task.dueDate) : null;
  const requestedDueDate = task.requestedDate
    ? new Date(task.requestedDate)
    : null;

  const daysExtended =
    currentDueDate && requestedDueDate
      ? Math.ceil(
          (requestedDueDate.getTime() - currentDueDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  return (
    <AlertDialog open={!!task} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <CalendarClock className="h-5 w-5 text-amber-500" />
            Extension Request
          </AlertDialogTitle>
          <Badge
            variant="outline"
            className="w-fit mb-2 text-xs bg-amber-50 text-amber-700 border-amber-200"
          >
            {task.abbreviation}
          </Badge>
          <AlertDialogDescription className="text-sm text-slate-700 font-medium">
            {task.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2 space-y-4">
          <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">
                Current Due Date
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {currentDueDate ? format(currentDueDate, "PPP") : "Not set"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">
                Requested Due Date
              </p>
              <p className="text-sm font-semibold text-amber-600">
                {requestedDueDate
                  ? format(requestedDueDate, "PPP")
                  : "Not specified"}
              </p>
            </div>
          </div>

          {daysExtended && (
            <div className="flex items-center justify-center py-1.5">
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200"
              >
                {daysExtended} days extension requested
              </Badge>
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-500">
              Reason for Extension
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700">
              {task.requestDateExtensionReason || "No reason provided"}
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel onClick={onCancel} className="mt-0">
            Cancel
          </AlertDialogCancel>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 flex-1 sm:flex-none"
              onClick={onReject}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex-1 sm:flex-none"
              onClick={onApprove}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
