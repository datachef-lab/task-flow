"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Plus, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Cronjob, User } from "@/db/schema";
import CronjobCard from "./cronjob-card";
import {
  createCronjob,
  getAllCronjobs,
  updateCronjob,
} from "@/lib/services/cronjob-service.server";
import CronjobForm from "./cronjob-form";
import { getAllUsers } from "@/lib/services/user-service";
import { toast } from "sonner";

export function CronjobSettings() {
  const [cronjobs, setCronjobs] = useState<Cronjob[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { users } = await getAllUsers();
      setUsers(users);
    } catch (error) {
      toast.error("Failed to fetch users.");
    }
  };

  useEffect(() => {
    fetchCronjobs();
  }, []);

  const fetchCronjobs = async () => {
    try {
      const response = await fetch("/api/cronjobs");
      if (!response.ok) {
        throw new Error("Failed to fetch cronjobs");
      }
      const data: {
        cronjobs: Cronjob[];
        currentPage: number;
        totalPages: number;
        totalCronjobs: number;
      } = await response.json();

      console.log("cronjobs:", data.cronjobs);
      setCronjobs(data.cronjobs);
    } catch (error) {
      console.error("Error fetching cronjobs:", error);
    }
  };

  if (users.length === 0) {
    return null;
  }

  const handleSumbit = async (
    e: React.FormEvent<HTMLFormElement>,
    type: "add" | "edit",
    cronjob: Cronjob
  ) => {
    e.preventDefault();
    if (type === "add") {
      try {
        const response = await fetch("/api/cronjobs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cronjob),
        });

        if (response.ok) {
          toast.success("New Cronjob Created!");
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Unable to create new cronjob!");
        }
      } catch (error) {
        toast.error("Something went wrong!");
      }
    } else {
      try {
        const response = await fetch(`/api/cronjobs/${cronjob.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cronjob),
        });

        if (response.ok) {
          toast.success("Cronjob updated!");
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Unable to update the cronjob!");
        }
      } catch (error) {
        toast.error("Something went wrong!");
      }
    }

    await fetchCronjobs();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cronjobs</CardTitle>
            <CardDescription>Manage automated recurring tasks.</CardDescription>
          </div>
          <CronjobForm type="add" users={users} onSubmit={handleSumbit} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Creation Time</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cronjobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={64} className="text-center mt-5">
                  No cronjobs scheduled.
                </TableCell>
              </TableRow>
            )}

            {cronjobs.map((cronjob, index) => (
              <CronjobCard
                key={cronjob.id}
                index={index}
                cronjob={cronjob}
                users={users}
                onSumbit={handleSumbit}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
