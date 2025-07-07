# Year-Agnostic Electronic Breviarium Romanum & Missale Romanum Architecture

## Core Architectural Principle
**ZERO years in database. Pure algorithmic computation for ANY arbitrary year.**

Database stores liturgical patterns and texts only. Calculation engine applies Easter Computus and liturgical algorithms at runtime to generate complete liturgy for any date from 1583 to infinity.

## Critical Requirements

### No Year Dependencies
- Database contains NO dates, NO years, NO pre-calculated data
- All liturgical calculations performed algorithmically at runtime
- System works for year 2037, 2079, 3000, etc. without updates
- Complete independence from external sources after one-time text import

### Easter Computus Engine
```javascript
// Pure algorithmic Easter calculation for ANY year
function calculateEaster(year) {
    // Gregorian Easter algorithm (Gauss/Butcher/Meeus)
    // Input: Any year >= 1583
    // Output: Easter Date for that year
    // NO caching, pure mathematical computation
}
```

## Database Architecture (Pattern-Based, Year-Agnostic)

### 1. Temporal Patterns Table
```sql
CREATE TABLE temporal_patterns (
    pattern_id TEXT PRIMARY KEY,        -- "advent_week1_sunday", "lent_ash_wednesday"
    season TEXT NOT NULL,               -- advent, christmas, lent, easter, ordinary
    week_number INTEGER,                -- 1-7 within season
    day_type TEXT NOT NULL,             -- sunday, weekday, special_day
    celebration_name TEXT NOT NULL,
    rank INTEGER NOT NULL,              -- 1-9 precedence scale
    color TEXT NOT NULL,                -- liturgical color
    rubrics TEXT                        -- special rubrical notes
);
```

### 2. Temporal Texts Table
```sql
CREATE TABLE temporal_texts (
    pattern_id TEXT NOT NULL,           -- references temporal_patterns
    hour TEXT NOT NULL,                 -- matutinum, laudes, prima, etc.
    part_type TEXT NOT NULL,            -- antiphona, psalmus, lectio, etc.
    sequence INTEGER NOT NULL,          -- order within hour
    latin_text TEXT NOT NULL,
    rubrical_notes TEXT,
    FOREIGN KEY (pattern_id) REFERENCES temporal_patterns(pattern_id)
);
```

### 3. Sanctoral Feasts Table
```sql
CREATE TABLE sanctoral_feasts (
    month_day TEXT PRIMARY KEY,         -- "12-25", "03-19" (MM-DD format ONLY)
    celebration_name TEXT NOT NULL,
    rank INTEGER NOT NULL,
    color TEXT NOT NULL,
    commune_type TEXT,                  -- for commune fallback
    octave_days INTEGER DEFAULT 0,      -- number of octave days
    proper_texts BOOLEAN DEFAULT TRUE   -- whether has proper texts
);
```

### 4. Sanctoral Texts Table
```sql
CREATE TABLE sanctoral_texts (
    month_day TEXT NOT NULL,            -- "12-25", "03-19" (NO years!)
    hour TEXT NOT NULL,
    part_type TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    latin_text TEXT NOT NULL,
    rubrical_notes TEXT,
    FOREIGN KEY (month_day) REFERENCES sanctoral_feasts(month_day)
);
```

### 5. Commune Texts Table
```sql
CREATE TABLE commune_texts (
    commune_type TEXT NOT NULL,         -- martyrs, confessors, virgins, etc.
    hour TEXT NOT NULL,
    part_type TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    latin_text TEXT NOT NULL,
    rubrical_notes TEXT
);
```

### 6. Precedence Rules Table
```sql
CREATE TABLE precedence_rules (
    rule_id TEXT PRIMARY KEY,
    condition_type TEXT NOT NULL,       -- season, rank, octave, vigil
    condition_value TEXT NOT NULL,
    precedence_action TEXT NOT NULL,    -- primary, commemorate, transfer, omit
    rule_logic TEXT NOT NULL            -- algorithmic rule description
);
```

## Calculation Engine Architecture

### 1. Easter Computus Engine
```javascript
class EasterComputusEngine {
    calculateEaster(year) {
        // Gregorian Easter algorithm for ANY year
        // Returns: Date object for Easter Sunday
    }
    
    calculateMoveableFeasts(easterDate) {
        // Calculate all moveable feasts relative to Easter
        // Returns: Object with all moveable feast dates
    }
}
```

### 2. Liturgical Pattern Mapper
```javascript
class LiturgicalPatternMapper {
    mapDateToPattern(date) {
        // Input: Any date (YYYY-MM-DD)
        // 1. Calculate Easter for that year
        // 2. Determine liturgical season algorithmically
        // 3. Calculate week within season
        // 4. Generate pattern_id for database lookup
        // Returns: pattern_id (e.g., "lent_week3_wednesday")
    }
}
```

### 3. Precedence Resolution Engine
```javascript
class PrecedenceResolutionEngine {
    resolvePrecedence(date, temporalPattern, sanctoralFeast) {
        // Apply algorithmic precedence rules
        // Consider ranks, octaves, vigils
        // Return primary celebration + commemorations
    }
}
```

### 4. Text Assembly Engine
```javascript
class TextAssemblyEngine {
    assembleCompleteLiturgy(resolvedCelebration) {
        // Fetch texts from database using patterns
        // Apply seasonal variations
        // Generate complete Office and Mass
    }
}
```

## Data Flow (Year-Agnostic)

```
Input: Any Date (YYYY-MM-DD)
    ↓
[Easter Computus Engine]
    Calculate Easter for year(date) at runtime
    ↓
[Liturgical Pattern Mapper]
    Determine season, week, day type
    Generate pattern_id
    ↓
[Database Pattern Lookup]
    temporal_patterns: Get temporal celebration
    sanctoral_feasts: Get feast for MM-DD
    ↓
[Precedence Resolution Engine]
    Apply algorithmic precedence rules
    Determine primary vs commemorations
    ↓
[Text Assembly Engine]
    Fetch texts by pattern/MM-DD
    Apply commune fallbacks if needed
    Generate complete liturgy
    ↓
Output: Complete Liturgical Day for ANY year
```

## One-Time Import Strategy

### Phase 1: Complete Temporal Import
- Import ALL Divinum Officium temporal files
- Extract patterns for all seasons, weeks, day types
- Store by liturgical pattern, never by specific dates
- Cover complete temporal cycle (Advent through Ordinary Time)

### Phase 2: Complete Sanctoral Import
- Import ALL sancti files (01-01 through 12-31)
- Store by MM-DD pattern for any year lookup
- Extract proper texts and commune references

### Phase 3: Commune Import
- Import all commune files for fallback texts
- Store by saint class/type

### Phase 4: Precedence Rules Import
- Extract and codify all liturgical precedence rules
- Store as algorithmic logic, not specific cases

## Validation Methodology

### Runtime Testing
```javascript
// Test calculation for any arbitrary year
const testDates = [
    "2025-04-20",  // Easter 2025
    "2037-04-05",  // Easter 2037  
    "2079-04-15",  // Easter 2079
    "3000-03-28"   // Easter 3000
];

for (const date of testDates) {
    const ourResult = liturgicalEngine.calculateLiturgicalDay(date);
    const divinumResult = fetchFromDivinumOfficium(date);
    compareResults(ourResult, divinumResult);
}
```

### Validation Criteria
- 100% Easter calculation accuracy for any year
- Exact match with divinumofficium.com for celebration names
- Correct liturgical colors and ranks
- Proper precedence resolution
- Complete text assembly

## Performance Requirements
- Easter calculation: < 1ms for any year
- Complete liturgical day calculation: < 100ms
- Database size: Complete liturgical library in single SQLite file
- Memory usage: Minimal, all calculation at runtime

## Extensibility
- Calendar variants (1570, 1955, 1960): Add pattern variants
- Regional calendars: Add local sanctoral patterns
- Language support: Add translation tables

## Result
Self-contained electronic Breviary/Missal that works for ANY year through pure algorithmic computation. Never needs updates. Completely independent after initial text import. Works for year 2037, 2079, or 3000 with same accuracy as 2025.