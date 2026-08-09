import { useEffect, useRef, useState } from "react";
import { MapPin, Users, BookOpen, Award } from "lucide-react";

const STATS = [
  { icon: MapPin, value: 11, suffix: "", label: "Zones couvertes" },
  { icon: Users, value: 150, suffix: "+", label: "Encadreurs qualifiés" },
  { icon: BookOpen, value: 20, suffix: "+", label: "Matières enseignées" },
  { icon: Award, value: 98, suffix: "%", label: "Parents satisfaits" },
];

function useCountUp(target: number, start: boolean, duration = 1800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - t0) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);

  return value;
}

function Counter({
  target,
  suffix,
  start,
}: {
  target: number;
  suffix: string;
  start: boolean;
}) {
  const value = useCountUp(target, start);
  return (
    <p className="text-2xl font-bold text-white md:text-3xl">
      {value}
      {suffix}
    </p>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStart(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-[#fba100] py-12">
      <div
        ref={ref}
        className="container mx-auto grid grid-cols-2 gap-6 px-4 lg:grid-cols-4 lg:divide-x lg:divide-border"
      >
        {STATS.map(({ icon: Icon, value, suffix, label }) => (
          <div
            key={label}
            className="flex min-w-0 items-center justify-center gap-3 px-2"
          >
            <Icon className="h-8 w-8 shrink-0 text-primary" />
            <div className="min-w-0">
              <Counter target={value} suffix={suffix} start={start} />
              <p className="truncate text-xs text-white md:text-sm">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
