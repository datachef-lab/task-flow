"use client";

import React, { useEffect, useState } from "react";
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
import { Edit, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Cronjob, User } from "@/db/schema";

type CronjobFormProps = {
  type: "add" | "edit";
  cronjob?: Cronjob;
  users: User[];
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    type: "add" | "edit",
    cronjob: Cronjob
  ) => Promise<void>;
};

export default function CronjobForm({
  type,
  cronjob,
  users,
  onSubmit,
}: CronjobFormProps) {
  const [givenCronjob, setGivenCronjob] = useState<Cronjob | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  if (users.length === 0) {
    return null;
  }

  useEffect(() => {
    if (type === "add") {
      setGivenCronjob({
        creationTime: new Date().toISOString(),
        createdAt: new Date(),
        id: 0,
        interval: "daily",
        priorityType: "medium",
        taskDescription: "",
        userId: users[0].id,
        updatedAt: new Date(),
      });
    } else if (cronjob) {
      setGivenCronjob(cronjob);
    }
  }, [type, cronjob, users]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setGivenCronjob((prev) => (prev ? { ...prev, [id]: value } : null));
  };

  const handleSelectChange = (field: keyof Cronjob, value: string | number | Date) => {
    setGivenCronjob((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const formatTimeForInput = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleSumbit = async (e: React.FormEvent<HTMLFormElement>) => {
    await onSubmit(e, type, givenCronjob!);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {type === "add" ? (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Cronjob
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSumbit}>
          <DialogHeader>
            <DialogTitle>
              {type === "add" ? "Create New Cronjob" : "Edit Cronjob"}
            </DialogTitle>
            <DialogDescription>
              {type === "add"
                ? "Set up an automated recurring task."
                : "Update the existing cronjob details."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="taskDescription">Task Description</Label>
              <Textarea
                id="taskDescription"
                value={givenCronjob?.taskDescription || ""}
                onChange={handleChange}
                placeholder="Enter task description"
                className="min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="userId">Assignee</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("userId", Number(value))
                  }
                >
                  <SelectTrigger id="userId">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priorityType">Priority</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("priorityType", value)
                  }
                >
                  <SelectTrigger id="priorityType">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">NORMAL</SelectItem>
                    <SelectItem value="medium">MEDIUM</SelectItem>
                    <SelectItem value="high">HIGH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="creationTime">Creation Time</Label>
                <Input
                  type="time"
                  id="creationTime"
                  name="creationTime"
                  value={
                    givenCronjob?.creationTime
                      ? formatTimeForInput(new Date(givenCronjob.creationTime))
                      : ""
                  }
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value
                      .split(":")
                      .map(Number);
                    if (givenCronjob) {
                      const updatedDate = new Date(givenCronjob.creationTime);
                      updatedDate.setHours(hours);
                      updatedDate.setMinutes(minutes);
                      handleSelectChange("creationTime", updatedDate);
                    }
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interval">Interval</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("interval", value)
                  }
                >
                  <SelectTrigger id="interval">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {type === "add" ? "Create Cronjob" : "Update Cronjob"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
