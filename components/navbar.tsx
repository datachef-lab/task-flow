import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useAuth } from "@/components/providers/auth-provider";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="ml-auto flex items-center space-x-4">
          {user && (
            <>
              <NotificationBell />
              <ModeToggle />
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 