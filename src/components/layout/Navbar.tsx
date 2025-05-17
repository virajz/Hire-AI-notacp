
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Search, User } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-highlight">HireAI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-highlight">
              Dashboard
            </Link>
            <Link to="/candidates" className="text-sm font-medium hover:text-highlight">
              Candidates
            </Link>
            <Link to="/shortlist" className="text-sm font-medium hover:text-highlight">
              Shortlist
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Quick search..."
              className="pl-8 pr-2 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-highlight w-[200px]"
            />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">User menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
