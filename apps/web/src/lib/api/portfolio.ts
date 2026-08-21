import { apiFetch } from "./client";
import type { PortfolioPayload } from "@/lib/portfolio/types";

export async function fetchPortfolio(): Promise<PortfolioPayload> {
  return apiFetch<PortfolioPayload>("/api/portfolio", { server: true });
}
