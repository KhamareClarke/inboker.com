export function Stats() {
  const stats = [
    { value: '92%', label: 'Providers see fewer no-shows in 30 days' },
    { value: '38%', label: 'Average lift in first-visit bookings' },
    { value: '<5 min', label: 'Time to go from signup to live' },
  ];

  return (
    <div className="border-y bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 py-12">
      <div className="container mx-auto max-w-screen-xl px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
