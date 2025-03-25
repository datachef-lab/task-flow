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
import { Trash2 } from "lucide-react";

type TaskFormProps = {
  task?: Task;
  type?: "add" | "edit";
  onSubmit: (formData: Partial<Task>, files?: FileList) => Promise<void>;
};

type TaskFile = {
  name: string;
  path: string;
  type: string;
};

export function TaskForm({ task, type, onSubmit }: TaskFormProps) {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [createdUser, setCreatedUsers] = useState<User>();
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

  const [formData, setFormData] = useState<Partial<Task>>({
    description: task?.description || "",
    dueDate: task?.dueDate
      ? format(new Date(task.dueDate), "yyyy-MM-dd")
      : undefined,
    priorityType: task?.priorityType || "normal",
    assignedUserId: task?.assignedUserId || null,
  });
  const [files, setFiles] = useState<FileList | null>(null);

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

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleFileDelete = async (fileName: string) => {
    if (!task) return;

    setFilesToDelete((prev) => [...prev, fileName]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, delete any files marked for deletion
      if (task && filesToDelete.length > 0) {
        for (const fileName of filesToDelete) {
          const response = await fetch(`/api/tasks/${task.id}/files`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName }),
          });

          if (!response.ok) {
            throw new Error(`Failed to delete file: ${fileName}`);
          }
        }
      }

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

      await onSubmit(submitData, files || undefined);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Failed to submit task: ${errorMessage}`);
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
          placeholder="Description"
          required
        />
      </div>
      {type === "edit" && (
        <div className="space-y-2">
          <Label htmlFor="description">Remarks</Label>
          <Textarea
            id="remarks"
            name="remarks"
            value={formData.remarks || ""}
            onChange={handleChange}
            placeholder="Remarks"
            required
          />
        </div>
      )}

      {type === "add" && (
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
      )}

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

      {type === "add" && (
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
      )}

      {/* Display existing files */}
      {task?.files && (task.files as TaskFile[]).length > 0 && (
        <div className="space-y-2">
          <Label>Existing Files</Label>
          <div className="space-y-2">
            {(task.files as TaskFile[]).map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded"
              >
                <span className="text-sm">{file.name}</span>
                {!filesToDelete.includes(file.name) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileDelete(file.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="files">Upload Files</Label>
        <Input
          id="files"
          name="files"
          type="file"
          onChange={handleFilesChange}
          multiple
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait..." : task ? "Update Task" : "Create Task"}
      </Button>
    </form>
  );
}
