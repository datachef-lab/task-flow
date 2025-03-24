"use client";

import { Cronjob, User } from "@/db/schema";
import { getUserById } from "@/lib/services/user-service";
import React, { useEffect, useState } from "react";
import { TableCell, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Edit, Trash } from "lucide-react";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import CronjobForm from "./cronjob-form";

type CronjobCardProps = {
  index: number;
  cronjob: Cronjob;
  onSumbit: (
    e: React.FormEvent<HTMLFormElement>,
    type: "add" | "edit",
    cronjob: Cronjob
  ) => Promise<void>;
  users: User[];
};

export default function CronjobCard({
  index,
  cronjob,
  onSumbit,
  users,
}: CronjobCardProps) {
  const [assignedUser, setAssignedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchAssignedUser = async () => {
      const assignedUser = await getUserById(cronjob.userId as number);
      setAssignedUser(assignedUser);
    };

    fetchAssignedUser();
  }, []);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="default">Medium</Badge>;
      case "low":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getIntervalBadge = (interval: string) => {
    switch (interval) {
      case "daily":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Daily
          </Badge>
        );
      case "weekly":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Weekly
          </Badge>
        );
      case "monthly":
        return (
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-700 border-orange-200"
          >
            Monthly
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <TableRow>
      <TableCell>{cronjob.taskDescription}</TableCell>
      <TableCell>{cronjob.userId}</TableCell>
      <TableCell>
        {cronjob.creationTime &&
        !isNaN(new Date(cronjob.creationTime).getTime())
          ? format(new Date(cronjob.creationTime), "h:mm a")
          : "N/A"}
      </TableCell>

      <TableCell>{getIntervalBadge(cronjob.interval)}</TableCell>
      <TableCell>{getPriorityBadge(cronjob.priorityType)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <CronjobForm
            type="edit"
            users={users}
            cronjob={cronjob}
            onSubmit={onSumbit}
          />
          <Button variant="ghost" size="icon">
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
