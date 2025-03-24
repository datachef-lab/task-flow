"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import {
  createUser,
  getAllUsers,
  updateUser,
} from "@/lib/services/user-service";
import UserForm from "./user-form";
import { User } from "@/db/schema";

export default function UserSettings() {
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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    type: "add" | "edit",
    user: User
  ) => {
    e.preventDefault();
    console.log("fired");

    try {
      if (type === "add") {
        const newUser = await createUser(user);
        if (newUser == null) {
          toast.error("User already exist.");
          return;
        }
        toast.success("New user has been created successfully.");
      } else {
        await updateUser(user.id, user);
        toast.success("User details updated successfully.");
      }
      const { users } = await getAllUsers();
      setUsers(users);
    } catch (error) {
      toast.error("Failed to process the request.");
    } finally {
      await fetchUsers();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage users and their permissions.
            </CardDescription>
          </div>
          <UserForm type="add" onSubmit={handleSubmit} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-5">
                  No users. Add the user.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.whatsappNumber}</TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge>Admin</Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.disabled ? (
                      <Badge variant="destructive">Disabled</Badge>
                    ) : (
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <UserForm
                        type="edit"
                        onSubmit={handleSubmit}
                        user={user}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
