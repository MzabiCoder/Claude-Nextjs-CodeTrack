'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface BillingContentProps {
  isPro: boolean;
  hasStripeCustomer: boolean;
  monthlyPriceId: string;
  yearlyPriceId: string;
}

export function BillingContent({ isPro, monthlyPriceId, yearlyPriceId }: BillingContentProps) {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  async function handleCheckout(priceId: string) {
    setLoading(true);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  async function handlePortal() {
    setLoading(true);
    const res = await fetch('/api/stripe/portal');
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  return (
    <div className="space-y-4">
      {success && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-500 flex items-center gap-2">
          <Check className="h-4 w-4" /> You&apos;re now on DevStash Pro. Enjoy!
        </div>
      )}
      {canceled && (
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Checkout canceled. Your plan was not changed.
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{isPro ? 'DevStash Pro' : 'DevStash Free'}</p>
            <p className="text-sm text-muted-foreground">
              {isPro ? 'Unlimited items and all features' : '50 items · 3 collections'}
            </p>
          </div>
          {isPro && (
            <span className="text-xs font-semibold text-primary border border-primary/30 bg-primary/10 rounded-full px-2.5 py-1">
              Active
            </span>
          )}
        </div>

        {isPro ? (
          <Button variant="outline" onClick={handlePortal} disabled={loading}>
            {loading ? 'Loading…' : 'Manage subscription'}
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleCheckout(monthlyPriceId)}
              disabled={loading}
            >
              {loading ? 'Loading…' : 'Upgrade — $8/month'}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCheckout(yearlyPriceId)}
              disabled={loading}
            >
              Upgrade — $72/year
              <span className="ml-1.5 text-[10px] font-semibold text-green-500">Save 25%</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
