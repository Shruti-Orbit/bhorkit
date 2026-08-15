type HeroControlsProps = {
  currentSlide: number;
  slideCount: number;
  onSelect: (index: number) => void;
};

export function HeroControls({
  currentSlide,
  slideCount,
  onSelect,
}: HeroControlsProps) {
  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-5 flex items-center justify-center sm:inset-x-6 md:bottom-8">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-bhor-surface/80 px-3 py-2 shadow-bhor-soft backdrop-blur-sm">
        {Array.from({ length: slideCount }).map((_, index) => {
          const isActive = index === currentSlide;

          return (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={isActive ? "true" : undefined}
              onClick={() => onSelect(index)}
              className={`h-1.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary ${
                isActive ? "w-7 bg-bhor-primary" : "w-2 bg-bhor-border hover:bg-bhor-gold-light"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
