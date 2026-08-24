export default function LoadingProductPage() {
  return (
    <main className="flex flex-1 flex-col bg-bhor-cream px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1512px] gap-8 md:grid-cols-[55%_45%]">
        <div className="aspect-[4/3] animate-pulse rounded-bhor-lg bg-bhor-peach" />
        <div className="space-y-4">
          <div className="h-4 w-28 animate-pulse rounded-bhor-sm bg-bhor-primary-soft" />
          <div className="h-10 w-3/4 animate-pulse rounded-bhor-sm bg-bhor-primary-soft" />
          <div className="h-20 animate-pulse rounded-bhor-sm bg-bhor-primary-soft" />
          <div className="h-12 animate-pulse rounded-bhor-sm bg-bhor-primary-soft" />
        </div>
      </div>
    </main>
  );
}
