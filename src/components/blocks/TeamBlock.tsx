import Image from "next/image";
import Link from "next/link";
import { Linkedin, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type TeamMember = {
  name?: string;
  role?: string;
  image?: {
    url?: string;
  } | number | null;
  linkedin?: string;
};

type TeamLayoutMode = "auto" | "featured" | "grid";

function resolveLayout(mode: TeamLayoutMode | undefined, count: number) {
  if (mode && mode !== "auto") return mode;
  return count === 1 ? "featured" : "grid";
}

function getGridClass(count: number, layout: TeamLayoutMode) {
  if (layout === "featured") return "mx-auto max-w-4xl grid-cols-1";
  if (count === 2) return "mx-auto max-w-4xl grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "mx-auto max-w-6xl grid-cols-1 md:grid-cols-3";
  return "mx-auto max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
}

function TeamImage({
  member,
  featured = false,
}: {
  member: TeamMember;
  featured?: boolean;
}) {
  const avatarUrl =
    typeof member.image === "object" && member.image?.url
      ? member.image.url
      : null;

  if (!avatarUrl) {
    return (
      <div className="flex h-full min-h-72 items-center justify-center bg-surface-muted text-primary">
        <UserRound className={featured ? "h-20 w-20" : "h-14 w-14"} />
      </div>
    );
  }

  return (
    <Image
      src={avatarUrl}
      alt={member.name || "Ekip üyesi"}
      fill
      className="object-cover grayscale transition-transform duration-500 group-hover:scale-105 group-hover:grayscale-0"
      sizes={featured ? "(max-width: 768px) 100vw, 45vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
      quality={75}
    />
  );
}

function TeamCard({
  member,
  featured = false,
}: {
  member: TeamMember;
  featured?: boolean;
}) {
  if (featured) {
    return (
      <Card className="group overflow-hidden rounded-[var(--radius-3xl)] border-border bg-surface shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-surface-inverse/5">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative min-h-80 bg-surface-muted">
            <TeamImage member={member} featured />
          </div>
          <CardContent className="flex flex-col justify-center p-8 text-center md:p-12 md:text-left">
            <h3 className="mb-2 text-3xl font-black text-text-main">{member.name}</h3>
            {member.role && (
              <p className="mb-6 text-sm font-bold uppercase tracking-wider text-primary">
                {member.role}
              </p>
            )}
            {member.linkedin && (
              <Link
                href={member.linkedin}
                target="_blank"
                className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-text-muted shadow-sm transition-colors duration-300 hover:bg-info hover:text-info-foreground md:mx-0"
                aria-label={`${member.name || "Ekip üyesi"} LinkedIn profili`}
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            )}
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden rounded-2xl border-border bg-surface shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-surface-inverse/5">
      <div className="relative aspect-square overflow-hidden bg-surface-muted">
        <TeamImage member={member} />
      </div>
      <CardContent className="relative bg-surface p-6 text-center">
        <h3 className="mb-1 text-xl font-bold text-text-main">{member.name}</h3>
        {member.role && (
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-primary">
            {member.role}
          </p>
        )}

        {member.linkedin && (
          <Link
            href={member.linkedin}
            target="_blank"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-text-muted shadow-sm transition-colors duration-300 hover:bg-info hover:text-info-foreground"
            aria-label={`${member.name || "Ekip üyesi"} LinkedIn profili`}
          >
            <Linkedin className="h-5 w-5" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export function TeamBlock({
  title,
  members,
  layoutMode = "auto",
}: {
  title?: string;
  members?: TeamMember[];
  layoutMode?: TeamLayoutMode;
}) {
  if (!members || members.length === 0) return null;

  const resolvedLayout = resolveLayout(layoutMode, members.length);

  return (
    <section className="bg-background py-24">
      <div className="container mx-auto max-w-7xl px-4">
        {title && (
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-text-main md:text-4xl">
              {title}
            </h2>
            <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-primary" />
          </div>
        )}

        <div className={`grid gap-8 ${getGridClass(members.length, resolvedLayout)}`}>
          {members.map((member, index) => (
            <TeamCard
              key={index}
              member={member}
              featured={resolvedLayout === "featured"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
