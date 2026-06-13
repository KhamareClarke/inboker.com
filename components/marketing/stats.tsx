export function Stats() {
  const stats = [
    { value: '92%', label: 'Fewer no-shows', context: 'average across all plans' },
    { value: '38%', label: 'More bookings', context: 'within the first 30 days' },
    { value: '5 min', label: 'To go live', context: 'from signup, no code needed' },
    { value: '2,000+', label: 'UK businesses', context: 'active and growing' },
  ];

  return (
    <section className="bg-white border-y border-gray-100">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
          {stats.map((stat, i) => (
            <div key={i} className="py-10 px-6 sm:px-8 text-center flex flex-col items-center">
              <div className="font-display text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent leading-none mb-2">
                {stat.value}
              </div>
              <p className="text-[14px] font-semibold text-gray-800 mb-1">{stat.label}</p>
              <p className="text-[12px] text-gray-400">{stat.context}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
