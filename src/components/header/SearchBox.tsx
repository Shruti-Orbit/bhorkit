import { Search } from "lucide-react";

export function SearchBox() {
  return (
    <button
      type="button"
      aria-label="Search"
      className="flex h-11 w-11 items-center justify-center text-bhor-text transition-colors hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
    >
      <Search className="h-6 w-6" aria-hidden />
    </button>
  );
}
