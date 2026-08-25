"use client";

import { Headers } from "../atoms";
import { BestSellingChart, LimitStock, StatsCards } from "../molecules";

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <Headers />

      <main className="max-w-350 mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BestSellingChart />
          </div>

          <LimitStock />
        </div>
      </main>
    </div>
  );
}
