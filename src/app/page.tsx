import WalletCard from "@/components/WalletCard";
import ProfitLossCard from "@/components/ProfitLossCard";
import { getWalletSnapshot } from "@/app/actions/wallet";

export default async function Page() {
  const snapshot = await getWalletSnapshot();

  return (
    <main className="min-h-screen bg-[#8B3A18] p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WalletCard balance={snapshot.balance} symbol={snapshot.tokenSymbol} />
        <ProfitLossCard />
      </div>
    </main>
  );
}
