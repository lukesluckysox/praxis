import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="p-8 flex flex-col items-start gap-4">
      <p className="text-muted-foreground text-sm">Page not found.</p>
      <Link href="/">
        <Button size="sm" variant="outline">
          Return to the Laboratory
        </Button>
      </Link>
    </div>
  );
}
