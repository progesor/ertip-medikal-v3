import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroBlock({
  heading,
  subheading,
  backgroundImage,
  buttons,
}: any) {
  const bgUrl =
    typeof backgroundImage === "object" && backgroundImage?.url
      ? backgroundImage.url
      : null;

  return (
    <section className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden bg-primary text-primary-foreground">
      {/* Arkaplan Görseli */}
      {bgUrl && (
        <Image
          src={bgUrl}
          alt={heading}
          fill
          className="object-cover opacity-40 mix-blend-overlay"
          priority
          unoptimized
        />
      )}

      {/* İçerik */}
      <div className="container relative z-10 px-4 flex flex-col items-center text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl">
          {heading}
        </h1>
        {subheading && (
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl leading-relaxed">
            {subheading}
          </p>
        )}

        {/* Butonlar */}
        {buttons && buttons.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {buttons.map((btn: any, idx: number) => (
              <Button
                key={idx}
                size="lg"
                variant={idx === 0 ? "default" : "outline"}
                asChild
                className={
                  idx !== 0 ? "text-text-main bg-background hover:bg-surface-muted" : ""
                }
              >
                <Link href={btn.link || "#"}>{btn.label}</Link>
              </Button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
