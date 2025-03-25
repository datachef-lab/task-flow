"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Task, User } from "@/db/schema";
import { format } from "date-fns";
import { Textarea } from "../ui/textarea";
import { useUser } from "@clerk/nextjs";

type TaskFormProps = {
  task?: Task;
  onSubmit: (task: Partial<Task> | Task) => Promise<void>;
};

export function TaskForm({ task, onSubmit }: TaskFormProps) {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [createdUser, setCreatedUsers] = useState<User>();

  const [formData, setFormData] = useState<Partial<Task>>({
    description: task?.description || "",
    dueDate: task?.dueDate
      ? format(new Date(task.dueDate), "yyyy-MM-dd")
      : undefined,
    priorityType: task?.priorityType || "normal",
    assignedUserId: task?.assignedUserId || null,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data.users);

      const tmpUser = (data.users as User[]).find(
        (ele) => ele.email === clerkUser?.emailAddresses[0].emailAddress
      );
      setCreatedUsers(tmpUser!);
      setFormData((prev) => ({
        ...prev,
        createdUserId: tmpUser!.id as number,
      }));
    };

    fetchUsers();
  }, []);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { name: string; value: string | number | null } }
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Convert the form data to match the API expectations
    const submitData = {
      ...formData,
      assignedUserId: formData.assignedUserId
        ? Number(formData.assignedUserId)
        : null,
      dueDate: formData.dueDate
        ? new Date(formData.dueDate).toISOString()
        : null,
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error("Failed to submit task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          value={formData.dueDate || ""}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priorityType">Priority</Label>
        <Select
          name="priorityType"
          value={formData.priorityType}
          onValueChange={(value) =>
            handleChange({ target: { name: "priorityType", value } })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignedUserId">Assign To</Label>
        <Select
          name="assignedUserId"
          value={formData.assignedUserId?.toString()}
          onValueChange={(value) =>
            handleChange({
              target: {
                name: "assignedUserId",
                value: value ? Number(value) : null,
              },
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait..." : task ? "Update Task" : "Create Task"}
      </Button>
    </form>
  );
}
