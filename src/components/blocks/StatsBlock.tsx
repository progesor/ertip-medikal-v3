export function StatsBlock({ stats }: any) {
  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats?.map((stat: any, i: number) => (
          <div key={i} className="space-y-2">
            <div className="text-4xl md:text-5xl font-black">{stat.value}</div>
            <div className="text-primary-foreground/80 font-medium uppercase tracking-wider text-sm">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
