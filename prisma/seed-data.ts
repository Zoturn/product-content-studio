import type { Prisma } from '@prisma/client';

export type ProductSeed = {
  slug: string;
  name: string;
  attributes: Prisma.InputJsonValue;
  description: string;
  seoTitle: string;
  seoDescription: string;
  status: 'DRAFT' | 'PUBLISHED';
};

// Pure data, deliberately separate from seed.ts: seed.ts also connects to the database and runs
// on import, which would make these fixtures untestable if they lived in the same module.
export const products: readonly ProductSeed[] = [
  {
    slug: 'wireless-mouse',
    name: 'Aurora Wireless Mouse',
    attributes: {
      color: 'Graphite',
      connectivity: 'Bluetooth 5.2 and 2.4GHz USB receiver',
      battery: 'Up to 70 days per charge',
      weight: '78 g',
      dpi: '800 to 4000, adjustable',
    },
    description:
      'A quiet, low-latency mouse built for long sessions at a desk or on the move. The ' +
      'contoured shape supports a relaxed grip, and the silent switches hold up over years of ' +
      'daily clicking without the click noise. Pairs with up to three devices and switches ' +
      'between them with a single button.',
    seoTitle: 'Aurora Wireless Mouse — Silent, Long-Battery Mouse',
    seoDescription:
      'Quiet wireless mouse with up to 70 days of battery, adjustable DPI, and three-device pairing.',
    status: 'PUBLISHED',
  },
  {
    slug: 'mechanical-keyboard',
    name: 'Cascade Mechanical Keyboard',
    attributes: {
      layout: 'Tenkeyless (TKL)',
      switches: 'Hot-swappable, tactile brown',
      backlight: 'Per-key RGB',
      connectivity: 'USB-C wired, detachable cable',
      weight: '820 g',
    },
    description:
      'A tenkeyless mechanical keyboard for people who type all day and want to feel every ' +
      'keystroke. Hot-swappable sockets mean switches can be replaced without a soldering iron, ' +
      'and the aluminium top plate keeps the frame from flexing under fast typing. Per-key ' +
      'lighting is controlled entirely on-board, no software required.',
    seoTitle: 'Cascade Mechanical Keyboard — Hot-Swap TKL',
    seoDescription:
      'Tenkeyless mechanical keyboard with hot-swappable tactile switches, per-key RGB, and an aluminium frame.',
    status: 'PUBLISHED',
  },
  {
    slug: 'smart-desk-lamp',
    name: 'Halo Smart Desk Lamp',
    attributes: {
      lightSource: 'LED, tunable white 2700K to 6500K',
      power: 'USB-C, 18W',
      control: 'Touch dial and companion app',
      armReach: '55 cm',
      brightnessLevels: '100, stepless',
    },
    description:
      'A desk lamp that adjusts its color temperature through the day, from warm light in the ' +
      'evening to a crisper white for focused work. The touch dial handles brightness by hand; ' +
      'the app adds schedules and a sunrise-style wake routine. Still being written up for the ' +
      'storefront, so it stays a draft until the copy is finished.',
    seoTitle: 'Halo Smart Desk Lamp — Tunable White LED',
    seoDescription:
      'Smart desk lamp with tunable white light from 2700K to 6500K, touch control, and app scheduling.',
    status: 'DRAFT',
  },
];
