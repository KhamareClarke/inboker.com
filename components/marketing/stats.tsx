import { TrendingDown, TrendingUp, Zap, Globe } from 'lucide-react';

export function Stats() {
  const stats = [
    { value: '92%', label: 'Fewer no-shows in 30 days', color: 'from-blue-600 to-cyan-600', bg: 'bg-blue-50 border-blue-100', iconBg: 'bg-blue-100 text-blue-600', icon: TrendingDown },
    { value: '38%', label: 'Lift in first-visit bookings', color: 'from-emerald-600 to-teal-600', bg: 'bg-emerald-50 border-emerald-100', iconBg: 'bg-emerald-100 text-emerald-600', icon: TrendingUp },
    { value: '5 min', label: 'From signup to live', color: 'from-violet-600 to-indigo-600', bg: 'bg-violet-50 border-violet-100', iconBg: 'bg-violet-100 text-violet-600', icon: Zap },
    { value: '2,000+', label: 'Businesses worldwide', color: 'from-orange-500 to-amber-500', bg: 'bg-amber-50 border-amber-100', iconBg: 'bg-amber-100 text-amber-600', icon: Globe },
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`rounded-2xl border p-6 sm:p-7 text-center ${stat.bg} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${stat.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className={`text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                  {stat.value}
                </div>
                <p className="text-[13px] text-gray-500 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
