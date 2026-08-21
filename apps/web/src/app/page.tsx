import { fetchPortfolio } from "@/lib/api/portfolio";
import { PortfolioClient } from "@/components/views/PortfolioClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const payload = await fetchPortfolio();

  return <PortfolioClient payload={payload} />;
}
