import { buildNavigation } from "@/src/data/navigation";
import { getShopCategories } from "@/src/lib/api/category.api";
import { AnnouncementBar } from "./AnnouncementBar";
import { MainHeader } from "./MainHeader";
import { MobileHeader } from "./MobileHeader";
import { TopBar } from "./TopBar";

export async function Header() {
  // Fetched here, on the server, so the menu is in the first paint and reflects
  // categories an admin has added, renamed or hidden.
  const navigation = buildNavigation(await getShopCategories());

  return (
    <header className="relative z-50 w-full bg-bhor-surface">
      <AnnouncementBar />
      <TopBar />
      <MainHeader navigation={navigation} />
      <MobileHeader navigation={navigation} />
    </header>
  );
}
