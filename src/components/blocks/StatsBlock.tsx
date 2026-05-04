type StatItem = {
  label?: string;
  value?: string;
};

function getStatsGridClass(count: number) {
  if (count <= 1) return "mx-auto max-w-3xl grid-cols-1";
  if (count === 2) return "mx-auto max-w-4xl grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "mx-auto max-w-5xl grid-cols-1 md:grid-cols-3";
  if (count === 4) return "mx-auto max-w-7xl grid-cols-2 lg:grid-cols-4";
  return "mx-auto max-w-7xl [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]";
}

export function StatsBlock({ stats }: { stats?: StatItem[] }) {
  if (!stats || stats.length === 0) return null;

  const count = stats.length;
  const featured = count === 1;

  return (
    <section className="bg-primary py-16 text-primary-foreground">
      <div className={`container grid gap-6 px-4 text-center ${getStatsGridClass(count)}`}>
        {stats.map((stat, index) => (
          <div
            key={index}
            className={
              featured
                ? "rounded-[var(--radius-2xl)] border border-primary-foreground/15 bg-primary-foreground/10 px-8 py-10 shadow-xl shadow-surface-inverse/10"
                : "rounded-[var(--radius-xl)] border border-primary-foreground/10 bg-primary-foreground/5 px-5 py-7 shadow-sm shadow-surface-inverse/5"
            }
          >
            <div className={featured ? "text-5xl font-black md:text-7xl" : "text-4xl font-black md:text-5xl"}>
              {stat.value}
            </div>
            <div
              className={
                featured
                  ? "mx-auto mt-4 max-w-xl text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 md:text-base"
                  : "mt-3 text-sm font-medium uppercase tracking-wider text-primary-foreground/80"
              }
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
