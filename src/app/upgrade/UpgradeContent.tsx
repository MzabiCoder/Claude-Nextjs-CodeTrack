'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FREE_FEATURES = [
  { text: '50 items', included: true },
  { text: '3 collections', included: true },
  { text: 'Snippets, prompts, commands, notes, links', included: true },
  { text: 'Instant search', included: true },
  { text: 'File & image uploads', included: false },
  { text: 'AI features', included: false },
  { text: 'Data export', included: false },
];

const PRO_FEATURES = [
  'Unlimited items',
  'Unlimited collections',
  'All item types',
  'File & image uploads',
  'AI auto-tagging',
  'AI code explanation',
  'Prompt optimizer',
  'Data export (JSON/ZIP)',
  'Priority support',
];

interface UpgradeContentProps {
  monthlyPriceId: string;
  yearlyPriceId: string;
}

export function UpgradeContent({ monthlyPriceId, yearlyPriceId }: UpgradeContentProps) {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: yearly ? yearlyPriceId : monthlyPriceId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3">
          <span className={`text-sm font-medium transition-colors ${!yearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            role="switch"
            aria-checked={yearly}
            aria-label="Toggle yearly billing"
            onClick={() => setYearly(y => !y)}
            className={`relative w-10 h-[22px] rounded-full border transition-colors ${
              yearly ? 'bg-primary border-primary' : 'bg-muted border-border'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                yearly ? 'translate-x-[18px]' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${yearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
            <span className="text-[11px] font-semibold text-green-500 bg-green-500/10 border border-green-500/25 rounded-full px-1.5 py-px">
              Save 25%
            </span>
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free */}
        <div className="bg-card border border-border rounded-2xl p-7">
          <h3 className="text-xl font-bold mb-3">Free</h3>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-extrabold tracking-tight">$0</span>
            <span className="text-muted-foreground text-sm">forever</span>
          </div>
          <div className="h-4 mb-5" aria-hidden />
          <div className="w-full mb-6 rounded-md border border-border px-4 py-2 text-sm text-center text-muted-foreground">
            Current plan
          </div>
          <ul className="flex flex-col gap-3">
            {FREE_FEATURES.map((f) => (
              <li key={f.text} className={`flex items-center gap-2.5 text-sm ${f.included ? '' : 'text-muted-foreground'}`}>
                {f.included
                  ? <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  : <X className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />}
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro */}
        <div className="relative bg-card border-2 border-primary rounded-2xl p-7 shadow-[0_0_0_1px_hsl(var(--primary)/0.3),0_12px_40px_hsl(var(--primary)/0.1)]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold tracking-widest uppercase bg-primary text-primary-foreground rounded-full px-3 py-1">
            Most Popular
          </div>
          <h3 className="text-xl font-bold mb-3">Pro</h3>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-extrabold tracking-tight">
              {yearly ? '$72' : '$8'}
            </span>
            <span className="text-muted-foreground text-sm">
              {yearly ? '/year' : '/month'}
            </span>
          </div>
          <p className="text-muted-foreground text-xs mb-5 h-4">
            {yearly ? 'Just $6/month — save 25%' : ''}
          </p>
          <Button className="w-full mb-6" onClick={handleUpgrade} disabled={loading}>
            {loading ? 'Redirecting…' : `Upgrade — ${yearly ? '$72/year' : '$8/month'}`}
          </Button>
          <ul className="flex flex-col gap-3">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
