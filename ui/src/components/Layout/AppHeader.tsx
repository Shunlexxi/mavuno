import { Button } from "../ui/button";
import { SidebarTrigger } from "../ui/sidebar";
import { Wallet, User } from "lucide-react";

export function AppHeader() {

  return (
    <header className="sticky top-0 h-16 border-b border-border bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-semibold text-lg">Mavuno</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {}}
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </Button>
        <Button variant="ghost" size="sm">
          <User className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
