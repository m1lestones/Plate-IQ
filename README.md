# PlateIQ

PlateIQ is an AI-powered food wellness dashboard. Snap or upload a photo of your meal and get an instant nutrition breakdown, NOVA processing classification, and personalized food insights — no manual logging required.

Built as an 8-day capstone project by Victor Castillo & Juan Franco.

---

## The Problem

55% of American calories come from ultra-processed foods, yet most nutrition apps only count calories. PlateIQ shifts the focus to food *quality* — what you're actually eating and how it affects your health.

---

## Features

- **Photo scanning** — capture a meal with your camera or upload an image
- **Nutrition dashboard** — macro donut chart, micronutrient coverage bars, ingredient breakdown
- **NOVA processing gauge** — color-coded scale (green → red) showing how processed your food is
- **Portion controls** — adjust serving size (S / M / L or custom grams) with real-time recalculation
- **AI wellness insights** — personalized food swap suggestions powered by Claude
- **Offline / demo mode** — pre-cached meals keep the app functional without live API access

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Data Viz | Recharts |
| Food AI | Claude Vision API |
| Nutrition Data | USDA FoodData Central API |
| Health Context | CDC PLACES API |
| Camera | Browser MediaDevices API |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## How It Works

1. User captures or uploads a meal photo
2. Claude Vision identifies foods and estimates portions (structured JSON)
3. USDA FoodData Central fills in detailed nutrition data
4. Dashboard renders macros, micros, and NOVA score
5. Second Claude call generates personalized wellness commentary
6. Portion adjustment triggers real-time recalculation

---

## Project Status

8-day build — feature freeze Day 5, Days 6–8 reserved for polish and demo prep.

| Day | Focus |
|---|---|
| 1–2 | Setup, camera/upload flow, Claude Vision integration |
| 3–4 | Nutrition dashboard, NOVA gauge, USDA API |
| 5 | AI insights, portion controls, demo mode |
| 6–8 | Polish, responsive QA, presentation prep |
