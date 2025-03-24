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
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Edit, Plus } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { User } from "@/db/schema";

type UserFormProps = {
  type: "add" | "edit";
  user?: User;
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    type: "add" | "edit",
    user: User
  ) => Promise<void>;
};

export default function UserForm({ type, user, onSubmit }: UserFormProps) {
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [givenUser, setGivenUser] = useState<User | null>(null);

  useEffect(() => {
    if (type === "add") {
      setGivenUser({
        name: "",
        email: "",
        disabled: false,
        whatsappNumber: "",
        isAdmin: false,
        id: 0,
        createdAt: new Date(),
        updatedAt: null,
      });
    } else {
      setGivenUser(user as User);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGivenUser((prev) => ({ ...prev!, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    await onSubmit(e, type, givenUser as User);
    setOpenForm(false);
    if (type === "add") {
      setGivenUser({
        name: "",
        email: "",
        disabled: false,
        whatsappNumber: "",
        isAdmin: false,
        id: 0,
        createdAt: new Date(),
        updatedAt: null,
      });
    }
  };

  return (
    <Dialog open={openForm} onOpenChange={setOpenForm}>
      <DialogTrigger asChild>
        {type === "add" ? (
          <Button onClick={() => setOpenForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        ) : (
          <Button onClick={() => setOpenForm(true)} variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {type === "add" ? "Add New User" : `Edit: ${givenUser?.name}`}
            </DialogTitle>
            <DialogDescription>
              {type === "add"
                ? "Create a new user account."
                : "Update the user details."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={givenUser?.name}
                onChange={handleChange}
                placeholder="Enter name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={givenUser?.email}
                onChange={handleChange}
                type="email"
                placeholder="Enter email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
              <Input
                id="whatsappNumber"
                name="whatsappNumber"
                value={givenUser?.whatsappNumber}
                onChange={handleChange}
                placeholder="Enter WhatsApp number"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="admin"
                checked={!!givenUser?.isAdmin}
                onCheckedChange={(checked) =>
                  setGivenUser((prev) => ({
                    ...prev!,
                    isAdmin: checked as boolean,
                  }))
                }
              />

              <Label htmlFor="admin">Admin User</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {type === "add" ? "Create User" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
