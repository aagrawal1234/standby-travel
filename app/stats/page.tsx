import { FadeIn } from "@/components/FadeIn";
import { PlaneButton } from "@/components/PlaneButton";

const passports = [
  {
    name: "anand",
    flights: "29",
    distance: "62,194 mi",
    time: "5d 19h",
    airports: "17",
    airlines: "2",
  },
  {
    name: "kristy",
    flights: "57",
    distance: "102,132 mi",
    time: "9d 21h",
    airports: "20",
    airlines: "1",
  },
];

export default function StatsPage() {
  return (
    <FadeIn className="relative min-h-dvh overflow-hidden px-5 py-20 sm:px-8">
      <PlaneButton href="/" variant="back" ariaLabel="back home" />

      <main className="mx-auto flex min-h-[calc(100dvh-10rem)] w-full max-w-5xl flex-col justify-center gap-14">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {passports.map((passport) => (
            <section key={passport.name} className="w-full">
              <div className="mb-8 flex items-baseline justify-between border-b border-[#d7c8b7]/70 pb-3">
                <h1 className="text-3xl font-medium tracking-normal text-[#2d2b27]">
                  {passport.name}
                </h1>
                <p className="text-sm text-[#8b8177]">2026</p>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                <div className="col-span-2">
                  <p className="mb-1 text-xs font-medium text-[#8b8177]">
                    flights
                  </p>
                  <p className="text-7xl font-semibold leading-none text-[#262522]">
                    {passport.flights}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <p className="mb-1 text-xs font-medium text-[#8b8177]">
                    distance
                  </p>
                  <p className="text-3xl font-medium text-[#262522]">
                    {passport.distance}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <p className="mb-1 text-xs font-medium text-[#8b8177]">
                    flight time
                  </p>
                  <p className="text-3xl font-medium text-[#262522]">
                    {passport.time}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-[#8b8177]">
                    airports
                  </p>
                  <p className="text-3xl font-medium text-[#262522]">
                    {passport.airports}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-[#8b8177]">
                    airlines
                  </p>
                  <p className="text-3xl font-medium text-[#262522]">
                    {passport.airlines}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
    </FadeIn>
  );
}
