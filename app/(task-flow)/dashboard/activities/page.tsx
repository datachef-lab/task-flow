"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, FileEdit, Trash } from "lucide-react";
import { getAllActivities } from "@/lib/services/activity-service";
import { ActivityLog } from "@/db/schema";

export default function ActivityPage() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    const response = await fetch("/api/activities");
    const data: { activities: ActivityLog[] } = await response.json();
    setActivityLogs(data.activities);
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "create":
        return <Check className="h-4 w-4 text-green-500" />;
      case "update":
        return <FileEdit className="h-4 w-4 text-blue-500" />;
      case "delete":
        return <Trash className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case "create":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Created
          </Badge>
        );
      case "update":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Updated
          </Badge>
        );
      case "delete":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Deleted
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container my-8">
      <DashboardShell>
        <DashboardHeader
          heading="Activity Logs"
          text="Track all user activities in the system."
        />
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              A list of all recent activities performed by users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLogs.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center mt-5" colSpan={4}>
                      No activities listed
                    </TableCell>
                  </TableRow>
                )}
                {activityLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.userId}</TableCell>
                    <TableCell>{log.taskId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.actionType)}
                        {getActionBadge(log.actionType)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.createdAt
                        ? format(log.createdAt, "MMM d, yyyy h:mm a")
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DashboardShell>
    </div>
  );
}
