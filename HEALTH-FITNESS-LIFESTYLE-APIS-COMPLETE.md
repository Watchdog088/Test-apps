# Health, Fitness & Lifestyle APIs — Implementation Complete

**Date:** May 19, 2026  
**Status:** ✅ All 4 APIs Implemented & Tested

---

## Summary

Four Health, Fitness & Lifestyle APIs have been integrated into ConnectHub-SPA as dedicated service modules. All services are fully functional, documented, and pushed to GitHub.

---

## APIs Implemented

### 1. 💪 Wger Workout Manager API
| Field | Value |
|-------|-------|
| **File** | `ConnectHub-SPA/src/services/wger-service.js` |
| **Base URL** | `https://wger.de/api/v2/` |
| **API Key** | ❌ Not required |
| **Cost** | Free & Open Source |
| **Rate Limit** | Generous public rate limits |

**Functions:**
- `searchExercises(term, opts)` — Search exercises by name
- `getExercises(opts)` — Get paginated exercise list with filtering by category/muscle/equipment
- `getExercise(id)` — Get single exercise by ID
- `getExerciseInfo(id)` — Full exercise info with images/videos
- `getExerciseCategories()` — All categories (Abs, Arms, Back, Chest, Legs, etc.)
- `getMuscles()` — All muscle groups for filtering
- `getEquipment()` — All equipment types
- `searchIngredients(name, opts)` — Search nutritional ingredients
- `getIngredient(id)` — Single ingredient details
- `getNutritionalValues(id, amount)` — Nutritional data at given weight

**Constants exported:** `EXERCISE_CATEGORIES`, `EQUIPMENT_TYPES`

---

### 2. 🧘 Meditopia Mindfulness Service
| Field | Value |
|-------|-------|
| **File** | `ConnectHub-SPA/src/services/meditopia-service.js` |
| **Base URL** | Built-in library + ZenQuotes API |
| **API Key** | ❌ Not required |
| **Cost** | Free |

> **Note:** Meditopia does not publish a public API. This service provides full mindfulness functionality using:
> - A curated built-in session library (8 guided sessions)
> - ZenQuotes.io free API for inspirational quotes
> - localStorage-based session and mood tracking
> - Integration hooks ready for when Meditopia opens a partner API

**Functions:**
- `getTodayQuote()` — Today's inspirational quote from ZenQuotes
- `getRandomQuote()` — Random inspirational quote
- `getQuotes(count)` — Multiple quotes
- `logSession(session)` — Log a completed meditation session
- `getSessions()` — Get all logged sessions
- `logMood(mood, note)` — Log mood entry (1-5 scale)
- `getMoodLog()` — Get mood log history
- `getMeditationStreak()` — Calculate consecutive days streak
- `getTotalMinutes()` — Total minutes meditated
- `getSessionsByCategory(category)` — Filter sessions by category
- `getSessionById(id)` — Get session by ID
- `searchSessionsByTag(tag)` — Search by tag

**Constants exported:** `MEDITATION_SESSIONS` (8 sessions), `SLEEP_SOUNDS`, `BREATHING_PATTERNS` (5 patterns), `MOOD_OPTIONS`

**Session Categories:** breathing, body-scan, mindfulness, sleep, focus, anxiety, compassion

---

### 3. 🥗 USDA FoodData Central API
| Field | Value |
|-------|-------|
| **File** | `ConnectHub-SPA/src/services/usda-food-service.js` |
| **Base URL** | `https://api.nal.usda.gov/fdc/v1/` |
| **API Key** | ✅ Required (free at api.data.gov/signup) |
| **Env Var** | `VITE_USDA_API_KEY` |
| **Rate Limit** | 1,000 req/hr (free tier) |
| **Demo Mode** | Uses `DEMO_KEY` (30 req/hr, no signup needed) |

**Functions:**
- `searchFoods(query, opts)` — Full search across Foundation, SR Legacy, Branded databases
- `quickSearchFoods(query, limit)` — Lightweight search for autocomplete
- `getFoodDetails(fdcId, format, nutrients)` — Full nutrient data for one food
- `getMultipleFoods(fdcIds, format)` — Batch lookup up to 20 foods
- `getNutrients()` — All available USDA nutrients
- `searchBrandedFoods(query, brandOwner)` — Search packaged/branded foods
- `extractNutrient(food, nutrientId)` — Extract specific nutrient from food object
- `buildNutritionSummary(food)` — Build clean {calories, protein, fat, carbs, fiber, sodium} object
- `calcDailyValues(summary)` — Calculate % daily values vs 2,000 calorie diet

**Constants exported:** `NUTRIENT_IDS` (14 common nutrients), `POPULAR_FOODS` (10 reference foods with FDC IDs)

**Setup:**
```
# Add to ConnectHub-SPA/.env
VITE_USDA_API_KEY=your_key_here
# Get free key at: https://api.data.gov/signup/
```

---

### 4. 💊 OpenFDA API
| Field | Value |
|-------|-------|
| **File** | `ConnectHub-SPA/src/services/openfda-service.js` |
| **Base URL** | `https://api.fda.gov/` |
| **API Key** | ❌ Optional (1,000 req/day free without key) |
| **Env Var** | `VITE_OPENFDA_API_KEY` (optional — raises to 120,000/day) |
| **Rate Limit** | 40 req/min without key; 240 req/min with key |

**Databases Covered:**
- Drug labels (package inserts / FDA label database)
- Drug adverse events (FAERS — FDA Adverse Event Reporting System)
- Drug enforcement / recalls
- Food enforcement / recalls
- Medical device adverse events
- Dietary supplement events (CFSAN AERS)

**Functions:**
- `searchDrugLabels(query, opts)` — Search FDA drug labels
- `getDrugByBrandName(brandName)` — Find drug by brand name (e.g. "Tylenol")
- `getDrugByIngredient(ingredient)` — Find drugs by active ingredient (e.g. "acetaminophen")
- `searchDrugAdverseEvents(drugName, opts)` — Search FAERS adverse events
- `getTopAdverseReactions(drugName, limit)` — Count top adverse reactions for a drug
- `searchDrugRecalls(opts)` — Search drug recalls with status/class filtering
- `searchDrugRecallsByKeyword(keyword)` — Search recalls by product keyword
- `searchFoodRecalls(opts)` — Search FDA food recalls
- `getRecentFoodRecalls(limit)` — Get most recent food recalls
- `searchFoodRecallsByProduct(product)` — Search food recalls by product
- `searchDeviceEvents(deviceName, opts)` — Search medical device adverse events
- `searchSupplementEvents(productName, opts)` — Search dietary supplement events
- `countDrugRecallsByClass()` — Count recalls by Class I/II/III
- `countFoodRecallsByReason()` — Count food recalls by reason
- `countEventsByRoute(drugName)` — Count adverse events by route of administration
- `extractDrugInfo(label)` — Extract clean drug info object from label
- `extractRecallInfo(recall)` — Extract clean recall info object

**Constants exported:** `RECALL_CLASSIFICATIONS`, `RECALL_STATUSES`

---

## Test Page

**File:** `test-health-fitness-apis.html`

Interactive test dashboard with 4 panels:
- **Wger** — Exercise search + category browser
- **Meditopia** — Session cards, mood logger, quote fetcher
- **USDA** — Food search with nutrient bars + popular foods list
- **OpenFDA** — Drug label lookup, food recalls, drug recalls

Open: `file:///c:/Users/Jnewball/Test-apps/Test-apps/test-health-fitness-apis.html`

---

## .env Setup (ConnectHub-SPA)

Add these to `ConnectHub-SPA/.env`:
```env
# USDA FoodData Central (free at api.data.gov/signup)
VITE_USDA_API_KEY=your_key_here

# OpenFDA (optional — increases rate limit)
VITE_OPENFDA_API_KEY=your_key_here

# Meditopia (when they publish a public API)
VITE_MEDITOPIA_API_KEY=your_key_here
```

---

## App Feature Enablement

| Feature | API Used |
|---------|----------|
| Workout library & exercise search | Wger |
| Muscle group filtering | Wger |
| Calorie/nutrition tracking | USDA FoodData Central |
| Food barcode lookup | USDA (Branded foods) |
| Guided meditation sessions | Meditopia service |
| Breathing exercises | Meditopia (BREATHING_PATTERNS) |
| Mood logging | Meditopia (localStorage) |
| Daily inspirational quotes | ZenQuotes (via Meditopia service) |
| Drug information lookup | OpenFDA |
| Food safety / recall alerts | OpenFDA (food enforcement) |
| Drug recall alerts | OpenFDA (drug enforcement) |
| Dietary supplement safety | OpenFDA (food events) |

---

## GitHub

All 6 files committed and pushed to:  
`https://github.com/Watchdog088/Test-apps.git` (main branch)

**Files added:**
1. `ConnectHub-SPA/src/services/wger-service.js`
2. `ConnectHub-SPA/src/services/meditopia-service.js`
3. `ConnectHub-SPA/src/services/usda-food-service.js`
4. `ConnectHub-SPA/src/services/openfda-service.js`
5. `test-health-fitness-apis.html`
6. `HEALTH-FITNESS-LIFESTYLE-APIS-COMPLETE.md`
