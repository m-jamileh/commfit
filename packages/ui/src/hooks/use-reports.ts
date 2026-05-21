"use client";
import { useQuery } from "@tanstack/react-query";
import { mockTechnicians, mockEquipment } from "../lib/mock-data";

export interface MonthlyJobsData {
  month: string;
  pm: number;
  sr: number;
  disinfecting: number;
  install: number;
  total: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  invoiced: number;
}

export interface TechPerformanceData {
  techName: string;
  jobsCompleted: number;
  avgRating: number;
}

export interface EquipmentHealthData {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
}

function getMonthLabel(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return d.toLocaleDateString("en-US", { month: "short" });
}

export function useMonthlyJobsReport() {
  return useQuery({
    queryKey: ["reports", "monthly-jobs"],
    queryFn: async (): Promise<MonthlyJobsData[]> => {
      await new Promise((r) => setTimeout(r, 100));
      const months: MonthlyJobsData[] = [];
      for (let i = 11; i >= 0; i--) {
        months.push({
          month: getMonthLabel(i),
          pm: Math.floor(Math.random() * 18) + 8,
          sr: Math.floor(Math.random() * 8) + 2,
          disinfecting: Math.floor(Math.random() * 12) + 4,
          install: Math.floor(Math.random() * 3),
          total: 0,
        });
      }
      months.forEach((m) => { m.total = m.pm + m.sr + m.disinfecting + m.install; });
      return months;
    },
  });
}

export function useRevenueReport() {
  return useQuery({
    queryKey: ["reports", "revenue"],
    queryFn: async (): Promise<RevenueData[]> => {
      await new Promise((r) => setTimeout(r, 100));
      const months: RevenueData[] = [];
      for (let i = 11; i >= 0; i--) {
        const base = 45000 + Math.floor(Math.random() * 30000);
        months.push({
          month: getMonthLabel(i),
          revenue: base,
          invoiced: base + Math.floor(Math.random() * 15000),
        });
      }
      return months;
    },
  });
}

export function useTechPerformanceReport() {
  return useQuery({
    queryKey: ["reports", "tech-performance"],
    queryFn: async (): Promise<TechPerformanceData[]> => {
      await new Promise((r) => setTimeout(r, 100));
      return mockTechnicians.map((t) => ({
        techName: `${t.firstName} ${t.lastName}`,
        jobsCompleted: Math.floor(Math.random() * 30) + 10,
        avgRating: Math.round((4.2 + Math.random() * 0.8) * 10) / 10,
      }));
    },
  });
}

export function useEquipmentHealthReport() {
  return useQuery({
    queryKey: ["reports", "equipment-health"],
    queryFn: async (): Promise<EquipmentHealthData> => {
      await new Promise((r) => setTimeout(r, 80));
      const counts = { excellent: 0, good: 0, fair: 0, poor: 0 };
      mockEquipment.forEach((e) => {
        counts[e.condition]++;
      });
      return counts;
    },
  });
}
