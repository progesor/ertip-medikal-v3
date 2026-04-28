import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-8 overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
      <Link
        href="/"
        className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
      >
        <Home className="w-4 h-4" />
        <span>Anasayfa</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 shrink-0" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-primary transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-bold truncate max-w-[200px]">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
