import { ChevronLeft, ChevronRight } from "lucide-react";

type HeroControlsProps = {
  currentSlide: number;
  slideCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
};

export function HeroControls({
  currentSlide,
  slideCount,
  onPrevious,
  onNext,
  onSelect,
}: HeroControlsProps) {
  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-5 flex items-center justify-center gap-3 sm:inset-x-6 md:bottom-8">
      <button
        type="button"
        aria-label="Previous slide"
        onClick={onPrevious}
        className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-bhor-border bg-bhor-surface text-bhor-text transition-colors hover:border-bhor-primary hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>

      <div className="pointer-events-auto flex items-center gap-2">
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

      <button
        type="button"
        aria-label="Next slide"
        onClick={onNext}
        className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-bhor-border bg-bhor-surface text-bhor-text transition-colors hover:border-bhor-primary hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
