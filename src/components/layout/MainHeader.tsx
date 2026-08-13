import Image from "next/image";
import Link from "next/link";
import { AccountButton } from "../header/AccountButton";
import { CartButton } from "../header/CartButton";
import { Navbar } from "./Navbar";

export function MainHeader() {
  return (
    <div className="hidden border-b border-bhor-border bg-bhor-surface lg:block">
      <div className="mx-auto grid h-[90px] max-w-[1512px] grid-cols-[190px_1fr_132px] items-center px-6 xl:grid-cols-[240px_1fr_180px] xl:px-8 2xl:grid-cols-[260px_1fr_260px]">
        <Link
          href="/"
          className="flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bhor-primary"
        >
          <Image
            src="/images/logo/bhor-kit-logo.png"
            alt="BHORKIT — Begin Your Day Divine"
            width={1536}
            height={1024}
            priority
            className="h-auto w-[122px] xl:w-[134px]"
          />
        </Link>

        <Navbar />

        <div className="flex items-center justify-end gap-7">
          <AccountButton />
          <CartButton count={2} />
        </div>
      </div>
    </div>
  );
}
