"use client";

import { Headers } from "@/app/components/atoms";
import {
  LimitStock,
  BestSellingChart,
  StatsCards,
} from "@/app/components/molecules";
type Props = {};

export default function Dashboard({}: Props) {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
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
