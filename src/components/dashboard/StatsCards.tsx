'use client';

import { Package, FolderOpen, Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { interactiveSubtleProps, staggerContainer, staggerItem } from '@/components/motion/variants';

interface StatsCardsProps {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

export function StatsCards({
  totalItems,
  totalCollections,
  favoriteItems,
  favoriteCollections,
}: StatsCardsProps) {
  const stats = [
    { label: 'Total Items', value: totalItems, Icon: Package, accent: '#4f46e5' },
    { label: 'Collections', value: totalCollections, Icon: FolderOpen, accent: '#8b5cf6' },
    { label: 'Favorite Items', value: favoriteItems, Icon: Heart, accent: '#ec4899' },
    { label: 'Favorite Collections', value: favoriteCollections, Icon: Star, accent: '#f59e0b' },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
    >
      {stats.map(({ label, value, Icon, accent }) => (
        <motion.div key={label} variants={staggerItem}>
          <motion.div
            {...interactiveSubtleProps}
            className="ring-highlight h-full rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-sm shadow-ambient transition-shadow hover:shadow-lifted sm:p-5"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <span className="text-xs font-medium leading-snug text-muted-foreground sm:text-sm">
                {label}
              </span>
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl sm:h-10 sm:w-10"
                style={{ backgroundColor: `${accent}1f`, color: accent }}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">{value}</p>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}
