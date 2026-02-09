import WalletActions from "@/components/WalletActions";
import { getWalletTodaySummary } from "@/app/actions/WalletSummary";

type Props = {
  balance: number;
  symbol: string;
};

const DEMO_BALANCE = 984.42;
const DEMO_CHANGE = 23.43;
const DEMO_PERCENT = 5.2;

function formatComma(n: number) {
 
  return n.toFixed(2).replace(".", ",");
}

function WalletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.5 7.5C3.5 6.119 4.619 5 6 5H18a2 2 0 0 1 2 2v1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3.5 9.5h16.5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2.5 2.5 0 0 1-2.5-2.5v-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 14.5h2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CoinsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5c3.314 0 6 1.12 6 2.5S15.314 10 12 10 6 8.88 6 7.5 8.686 5 12 5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M18 7.5v4.2c0 1.38-2.686 2.5-6 2.5s-6-1.12-6-2.5V7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 14.2c.98.52 2.32.8 3.8.8 3.314 0 6-1.12 6-2.5V11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function WalletCard({ balance, symbol }: Props) {
  const summary = await getWalletTodaySummary();

  const isEmpty = balance === 0 && summary.change === 0 && summary.percent === 0;

  const displayBalance = isEmpty ? DEMO_BALANCE : balance;
  const displayChange = isEmpty ? DEMO_CHANGE : summary.change;
  const displayPercent = isEmpty ? DEMO_PERCENT : summary.percent;

  const positive = displayChange >= 0;
  const arrow = positive ? "⯅" : "⯆";
  const color = positive ? "text-green-600" : "text-red-600";
  const sign = positive ? "+" : "";

  return (
    <section className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-orange-500 text-white flex items-center justify-center">
            <WalletIcon />
          </div>

          <div>
            <div className="flex items-center gap-1">
              <div className="text-sm font-semibold text-gray-900">My Wallet</div>
              <div className="text-gray-400">
                <PencilIcon />
              </div>
            </div>
            <div className="text-xs text-gray-400">Joined Nov 2025</div>
          </div>
        </div>
        <div className="flex items-start gap-6">
          <div className="text-right">
            <div className="text-xs text-gray-400">Portfolio (Not USDC)</div>
            <div className="text-sm font-semibold text-gray-900">$3,361.42</div>
          </div>

          <div className="h-8 w-px bg-gray-200 mt-1" />

          <div className="text-right">
            <div className="text-xs text-gray-400">{symbol} + Portfolio</div>
            <div className="flex items-center justify-end gap-2 text-sm font-semibold text-gray-900">
              <span className="text-green-600">
                <CoinsIcon />
              </span>
              <span>$0,01</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <div className="text-4xl font-medium tracking-tight text-gray-900">
          {formatComma(displayBalance)} {symbol}
        </div>

        <div className={`mt-1 text-sm flex items-center gap-2 ${color}`}>
          <span>
            {sign}${displayChange.toFixed(2)}
          </span>
          <span>{arrow}</span>
          <span>{displayPercent.toFixed(1)}% Today</span>
        </div>
      </div>
      <WalletActions symbol={symbol} />
    </section>
  );
}