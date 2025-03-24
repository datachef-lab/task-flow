"use client";

import React, { useEffect, useState } from "react";
import { TableCell } from "../ui/table";
import { User } from "@/db/schema";

export default function UserCell({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    setUser(data as User);
  };

  return <TableCell className="font-medium">{user?.name}</TableCell>;
}
