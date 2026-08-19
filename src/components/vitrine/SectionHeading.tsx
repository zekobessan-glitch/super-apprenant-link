interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={`${align === "center" ? "text-center mx-auto max-w-2xl" : "max-w-2xl"} ${className}`}
    >
      <div className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
        <p data-eyebrow className="text-xs font-bold not-italic text-[#fba100]">
          {eyebrow}
        </p>
        <span className="inline-block h-px w-12 bg-[#fba100]" />
      </div>
      <h2 className="mt-3 text-2xl md:text-4xl font-bold text-[#004d00]">{title}</h2>
      {description ? (
        <p className="mt-3 text-sm md:text-base text-black leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}
