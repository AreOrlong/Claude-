import type { ToolCategory } from '@/types'

export interface FeedSpeedRow {
  material: string
  sfm: number
  chipLoad: number  // in/tooth for mills; ipr for drills/turning
}

// Generalized carbide starting values (mid-range, adjust for HSS ~50%, coated +20%)
const BASELINE: Partial<Record<ToolCategory, FeedSpeedRow[]>> = {
  milling: [
    { material: 'Aluminum',        sfm: 700,  chipLoad: 0.003  },
    { material: 'Mild Steel',      sfm: 320,  chipLoad: 0.0015 },
    { material: 'Stainless Steel', sfm: 150,  chipLoad: 0.001  },
    { material: 'Cast Iron',       sfm: 280,  chipLoad: 0.0012 },
    { material: 'Plastic / Nylon', sfm: 600,  chipLoad: 0.003  },
  ],
  drilling: [
    { material: 'Aluminum',        sfm: 400,  chipLoad: 0.005  },
    { material: 'Mild Steel',      sfm: 150,  chipLoad: 0.003  },
    { material: 'Stainless Steel', sfm: 75,   chipLoad: 0.0015 },
    { material: 'Cast Iron',       sfm: 130,  chipLoad: 0.0025 },
    { material: 'Plastic / Nylon', sfm: 350,  chipLoad: 0.004  },
  ],
  cutting: [
    { material: 'Aluminum',        sfm: 600,  chipLoad: 0.003  },
    { material: 'Mild Steel',      sfm: 280,  chipLoad: 0.0015 },
    { material: 'Stainless Steel', sfm: 130,  chipLoad: 0.001  },
    { material: 'Cast Iron',       sfm: 250,  chipLoad: 0.0012 },
    { material: 'Plastic / Nylon', sfm: 500,  chipLoad: 0.003  },
  ],
  turning: [
    { material: 'Aluminum',        sfm: 1000, chipLoad: 0.008  },
    { material: 'Mild Steel',      sfm: 450,  chipLoad: 0.005  },
    { material: 'Stainless Steel', sfm: 200,  chipLoad: 0.003  },
    { material: 'Cast Iron',       sfm: 350,  chipLoad: 0.004  },
    { material: 'Plastic / Nylon', sfm: 800,  chipLoad: 0.008  },
  ],
  grinding: [
    { material: 'Aluminum',        sfm: 4500, chipLoad: 0.001  },
    { material: 'Mild Steel',      sfm: 4000, chipLoad: 0.001  },
    { material: 'Stainless Steel', sfm: 3500, chipLoad: 0.0008 },
    { material: 'Cast Iron',       sfm: 3500, chipLoad: 0.001  },
  ],
}

export function getBaselineFeeds(category: ToolCategory): FeedSpeedRow[] {
  return BASELINE[category] ?? []
}

// RPM = (SFM × 3.82) / diameter_inches  (where 3.82 ≈ 12/π)
export function calcRPM(sfm: number, diameterMm: number): number {
  return Math.round((sfm * 3.82) / (diameterMm / 25.4))
}

// Feed (IPM) = RPM × chip_load × flutes
export function calcFeed(rpm: number, chipLoad: number, flutes: number): number {
  return Math.round(rpm * chipLoad * flutes * 10) / 10
}
