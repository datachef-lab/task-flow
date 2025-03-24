"use client";

import { LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserButton, useUser } from "@clerk/nextjs";

export function UserNav() {
  const { user } = useUser();

  return (
    <>
      <UserButton />
    </>
    // <DropdownMenu>
    //   <DropdownMenuTrigger asChild>
    //     <Button variant="ghost" className="relative h-8 w-8 rounded-full">
    //       <Avatar className="h-8 w-8">
    //         <AvatarImage src={user?.imageUrl} alt="@user" />
    //         <AvatarFallback>JD</AvatarFallback>
    //       </Avatar>
    //     </Button>
    //   </DropdownMenuTrigger>
    //   <DropdownMenuContent className="w-56" align="end" forceMount>
    //     <DropdownMenuLabel className="font-normal">
    //       <div className="flex flex-col space-y-1">
    //         <p className="text-sm font-medium leading-none">John Doe</p>
    //         <p className="text-xs leading-none text-muted-foreground">
    //           john.doe@example.com
    //         </p>
    //       </div>
    //     </DropdownMenuLabel>
    //     <DropdownMenuSeparator />
    //     <DropdownMenuGroup>
    //       <DropdownMenuItem>
    //         <User className="mr-2 h-4 w-4" />
    //         <span>Profile</span>
    //         <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
    //       </DropdownMenuItem>
    //       <DropdownMenuItem>
    //         <Settings className="mr-2 h-4 w-4" />
    //         <span>Settings</span>
    //         <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
    //       </DropdownMenuItem>
    //     </DropdownMenuGroup>
    //     <DropdownMenuSeparator />
    //     <DropdownMenuItem>
    //       <LogOut className="mr-2 h-4 w-4" />
    //       <span>Log out</span>
    //       <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
  );
}
