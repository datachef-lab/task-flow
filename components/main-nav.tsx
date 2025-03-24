import Link from "next/link";
import { ListTodo } from "lucide-react";

export function MainNav() {
  return (
    <div className="flex items-center gap-6 md:gap-10">
      <Link href="/dashboard" className="flex items-center space-x-2">
        <ListTodo className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">TaskFlow</span>
      </Link>
      <nav className="flex gap-6">
        <Link
          href="/dashboard"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/activities"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Activities
        </Link>
        <Link
          href="/dashboard/settings"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Settings
        </Link>
      </nav>
    </div>
  );
}
