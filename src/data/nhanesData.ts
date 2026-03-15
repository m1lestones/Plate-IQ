/**
 * Population-level reference data from CDC NHANES 2021–2023
 * Used to contextualize per-meal nutrient flags with real American health outcomes.
 *
 * Primary sources:
 *   NCHS Data Brief No. 511 — Hypertension (Aug 2021–Aug 2023, n=6,084)
 *   NCHS Data Brief No. 515 — Cholesterol  (Aug 2021–Aug 2023, n=5,498)
 *   NCHS Data Brief No. 516 — Diabetes     (Aug 2021–Aug 2023, n=2,938)
 *   NHANES dietary recall and follow-up analyses (various n)
 */

export interface NhanesPopulationStat {
  stat: string       // Population-level finding to display
  source: string     // Display label for citation
  url: string        // Link to source
  sampleSize: string // e.g. "n=6,084"
  surveyYear: string // e.g. "2021–2023"
}

// Keyed by condition → nutrient key (matches FoodNutrients keys in types.ts)
export const NHANES_CONTEXT: Record<string, Record<string, NhanesPopulationStat>> = {
  hypertension: {
    sodium_mg: {
      stat: '47.7% of US adults have hypertension; 87% exceed the 2,300mg/day sodium limit — and higher sodium-to-potassium ratio is associated with up to 4× higher odds of hypertension in NHANES analyses',
      source: 'NCHS Data Brief No. 511 (2021–2023)',
      url: 'https://www.cdc.gov/nchs/products/databriefs/db511.htm',
      sampleSize: 'n=6,084',
      surveyYear: '2021–2023',
    },
    potassium_mg: {
      stat: 'Potassium is an under-consumed nutrient of public health concern; adults in the highest potassium intake quartile show 62% lower odds of hypertension compared to the lowest quartile in NHANES analyses',
      source: 'NCHS Data Brief No. 511 (2021–2023)',
      url: 'https://www.cdc.gov/nchs/products/databriefs/db511.htm',
      sampleSize: 'n=6,084',
      surveyYear: '2021–2023',
    },
  },

  high_cholesterol: {
    saturated_fat_g: {
      stat: '11.3% of US adults aged 20+ have high total cholesterol (≥240 mg/dL); reducing saturated fat and increasing soluble fiber are the primary dietary strategies for LDL reduction cited by current clinical guidelines',
      source: 'NCHS Data Brief No. 515 (2021–2023)',
      url: 'https://www.cdc.gov/nchs/products/databriefs/db515.htm',
      sampleSize: 'n=5,498',
      surveyYear: '2021–2023',
    },
    cholesterol_mg: {
      stat: '11.3% of US adults have high total cholesterol (≥240 mg/dL); the 2020–2025 Dietary Guidelines advise keeping dietary cholesterol as low as possible within a healthy eating pattern',
      source: 'NCHS Data Brief No. 515 (2021–2023)',
      url: 'https://www.cdc.gov/nchs/products/databriefs/db515.htm',
      sampleSize: 'n=5,498',
      surveyYear: '2021–2023',
    },
    fiber_g: {
      stat: 'Fewer than 10% of US adults meet recommended fiber intake; each additional 5g/day of soluble fiber is associated with an ~5.6 mg/dL reduction in LDL cholesterol in clinical analyses',
      source: 'NCHS Data Brief No. 515 (2021–2023)',
      url: 'https://www.cdc.gov/nchs/products/databriefs/db515.htm',
      sampleSize: 'n=5,498',
      surveyYear: '2021–2023',
    },
  },

  type2_diabetes: {
    carbs_g: {
      stat: '15.8% of US adults have diabetes (diagnosed or undiagnosed) and 38% have prediabetes; high carbohydrate intake is associated with elevated post-meal blood glucose in adults with impaired glucose metabolism',
      source: 'NCHS Data Brief No. 516 (2021–2023)',
      url: 'https://www.cdc.gov/nchs/products/databriefs/db516.htm',
      sampleSize: 'n=2,938',
      surveyYear: '2021–2023',
    },
    added_sugar_g: {
      stat: '71.4% of US adults consume ≥10% of daily calories from added sugar; consuming ≥25% of calories from added sugar is associated with 2.75× higher cardiovascular mortality risk in NHANES follow-up data',
      source: 'NCHS Data Brief No. 516 (2021–2023)',
      url: 'https://www.cdc.gov/nchs/products/databriefs/db516.htm',
      sampleSize: 'n=2,938',
      surveyYear: '2021–2023',
    },
    fiber_g: {
      stat: 'Higher dietary fiber intake is independently associated with lower all-cause and cardiovascular mortality in adults with diabetes and prediabetes across multiple NHANES cohort analyses',
      source: 'NCHS Data Brief No. 516 (2021–2023)',
      url: 'https://www.cdc.gov/nchs/products/databriefs/db516.htm',
      sampleSize: 'n=2,938',
      surveyYear: '2021–2023',
    },
  },

  stroke_risk: {
    sodium_mg: {
      stat: 'The highest vs. lowest sodium-to-potassium intake ratio is associated with 2.15× higher ischemic heart disease mortality in NHANES III follow-up data (median 14.8-year follow-up, n=12,267)',
      source: 'CDC NHANES 2021–2023',
      url: 'https://wwwn.cdc.gov/nchs/nhanes/continuousnhanes/default.aspx?Cycle=2021-2023',
      sampleSize: 'n=12,267',
      surveyYear: '2021–2023',
    },
    saturated_fat_g: {
      stat: '47.7% of US adults have hypertension, 11.3% have high cholesterol, and 15.8% have diabetes — combined cardiovascular risk factors to which high saturated fat diets contribute through elevated LDL',
      source: 'NCHS Data Briefs 511, 515, 516 (2021–2023)',
      url: 'https://www.cdc.gov/nchs/products/databriefs/db515.htm',
      sampleSize: 'n=5,498',
      surveyYear: '2021–2023',
    },
    potassium_mg: {
      stat: 'High sodium-to-potassium ratio is associated with 31% higher stroke prevalence in women and 2× higher risk in overweight adults; adequate potassium intake is linked to 20% lower all-cause mortality in NHANES follow-up analyses',
      source: 'CDC NHANES 2021–2023',
      url: 'https://wwwn.cdc.gov/nchs/nhanes/continuousnhanes/default.aspx?Cycle=2021-2023',
      sampleSize: 'n=7,141',
      surveyYear: '2021–2023',
    },
  },
}
