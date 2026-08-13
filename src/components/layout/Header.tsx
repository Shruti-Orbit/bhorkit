import { MainHeader } from "./MainHeader";
import { MobileHeader } from "./MobileHeader";
import { TopBar } from "./TopBar";

export function Header() {
  return (
    <header className="relative z-50 w-full bg-bhor-surface">
      <TopBar />
      <MainHeader />
      <MobileHeader />
    </header>
  );
}
