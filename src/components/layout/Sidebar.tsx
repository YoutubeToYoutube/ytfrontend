import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  FileVideo
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import authService from "@/services/authService";

interface SidebarProps {
  className?: string; 
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  requiredRole?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const { user, hasRole } = useAuth()
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
  };

  const navItems: NavItem[] = [
    {
      title: "Tableau de bord",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      title: "Utilisateurs",
      href: "/users",
      icon: <Users className="h-5 w-5" />,
      // requiredRole: "ROLE_ADMIN"
    },
    {
      title: "Medias",
      href: "/categories",
      icon: <FileVideo className="h-5 w-5" />,
      // requiredRole: "ROLE_OPERATOR"
    },
    {
      title: "Paramètres",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />
    }
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.requiredRole || hasRole(item.requiredRole)
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center">
                <span className="text-xl font-bold">YT Frontend</span>
              </Link>
              {/* <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button> */}
            </div>
            <Separator className="my-4" />
            <nav className="flex-1">
              <div className="flex flex-col space-y-1">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      location.pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </div>
            </nav>
            <div className="mt-auto">
              <Separator className="my-4" />
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.role}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Déconnexion</span>
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden h-screen border-r bg-background md:flex md:w-64 md:flex-col",
          className
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-xl font-bold">YT Frontend</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-auto py-4">
            <div className="flex flex-col space-y-1 px-2">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </div>
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{user?.role}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 