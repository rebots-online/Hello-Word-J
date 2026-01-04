# Dynamic Liturgical Calendar Engine Architecture

## Core Principle
**Any arbitrary date → Complete liturgical day calculation**
No pre-calculated entries, pure algorithmic determination of liturgical properties.

## Architecture Components

### 1. Calendar Calculation Core
```
DateInput → LiturgicalCalculationEngine → CompleteLiturgicalDay
```

**Responsibilities**:
- Easter calculation for any year (Gregorian algorithm)
- Moveable feast calculation relative to Easter
- Fixed feast recognition
- Precedence resolution between competing celebrations
- Season determination
- Liturgical color assignment
- Rank calculation

### 2. Text Assembly Engine
```
LiturgicalDay → TextAssemblyEngine → CompleteOffice/Mass
```

**Responsibilities**:
- Dynamic text selection from Divinum Officium patterns
- Proper vs Common text resolution
- Seasonal text variations
- Commemoration insertion
- Rubrical instruction generation

### 3. Divinum Officium Integration Layer
```
LiturgicalProperties → DivinumOfficiumFetcher → RawLiturgicalTexts
```

**Responsibilities**:
- Real-time file fetching from GitHub repository
- Pattern-based file selection (Sancti/MM-DD.txt, Tempora/Season-Week-Day.txt)
- Fallback to Commune when Proper unavailable
- Caching for performance

### 4. Precedence Resolution Engine
```
[CompetingCelebrations] → PrecedenceEngine → PrimaryCelebration + [Commemorations]
```

**Responsibilities**:
- Rank-based precedence (1-9 scale)
- Octave handling
- Vigil resolution
- Transfer rules for displaced feasts
- Commemoration vs omission decisions

### 5. Temporal Mapping System
```
Date → TemporalMapper → SeasonProperties + WeekProperties + DayProperties
```

**Responsibilities**:
- Season boundary calculation
- Week-in-season determination
- Weekday vs Sunday differentiation
- Ember/Rogation day detection
- Vigil identification

## Data Flow Architecture

```
Input: Date (YYYY-MM-DD)
    ↓
[Calendar Calculation Core]
    ↓
LiturgicalDay Properties:
    - Season (Advent, Lent, Easter, etc.)
    - Week in Season
    - Primary Celebration
    - Rank
    - Color
    - Competing Celebrations
    ↓
[Precedence Resolution Engine]
    ↓
Resolved Celebration:
    - Primary Celebration
    - Commemorations List
    - Transfer Notes
    ↓
[Text Assembly Engine]
    ↓
File Patterns:
    - Sancti/MM-DD.txt (for saint days)
    - Tempora/Season-Week-Day.txt (for temporal)
    - Commune/Type.txt (for commons)
    ↓
[Divinum Officium Integration]
    ↓
Raw Texts by Section:
    - [Ant Vespera], [Lectio1], [Oratio], etc.
    ↓
[Office/Mass Assembly]
    ↓
Complete Liturgical Day:
    - All 8 canonical hours
    - Complete Mass (Ordinary + Proper)
    - Rubrical instructions
```

## Algorithm Specifications

### Easter Calculation (Gregorian)
```javascript
function calculateEaster(year) {
    // Gregorian Easter algorithm
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}
```

### Moveable Feast Calculation
```javascript
function calculateMoveableFeasts(easter) {
    return {
        ashWednesday: addDays(easter, -46),
        palmSunday: addDays(easter, -7),
        holyThursday: addDays(easter, -3),
        goodFriday: addDays(easter, -2),
        holySaturday: addDays(easter, -1),
        easterSunday: easter,
        ascension: addDays(easter, 39),
        pentecost: addDays(easter, 49),
        trinityS unday: addDays(easter, 56),
        corpusChristi: addDays(easter, 60)
    };
}
```

### Season Determination
```javascript
function determineSeason(date, moveableFeasts) {
    // Advent: 4 Sundays before Christmas
    // Christmas: Dec 25 - Jan 13
    // Lent: Ash Wednesday - Easter Vigil
    // Easter: Easter - Pentecost
    // Ordinary Time: Rest of year
}
```

### Precedence Resolution
```javascript
function resolvePrecedence(celebrations) {
    // Sort by rank (9 = highest)
    // Apply octave rules
    // Handle vigils
    // Determine commemorations vs omissions
    return {
        primary: highestRankCelebration,
        commemorations: lowerRankCelebrations,
        transferred: displacedCelebrations
    };
}
```

### Text Assembly Pattern
```javascript
function assembleTexts(liturgicalDay) {
    const patterns = [
        `Sancti/${formatDate(liturgicalDay.date)}.txt`,
        `Tempora/${liturgicalDay.season}${liturgicalDay.week}-${liturgicalDay.dayOfWeek}.txt`,
        `Commune/${liturgicalDay.communeType}.txt`
    ];
    
    for (const pattern of patterns) {
        const texts = fetchFromDivinumOfficium(pattern);
        if (texts) return texts;
    }
}
```

## Storage Architecture in Neo4j/hKG

### Core Entities
- **LiturgicalCalculationEngine**: Central computation node
- **EasterCalculation**: Easter algorithm component
- **MoveableFeastCalculation**: Moveable feast algorithm
- **SeasonDetermination**: Season boundary logic
- **PrecedenceResolution**: Rank-based precedence rules
- **TextAssembly**: Dynamic text selection logic
- **DivinumOfficiumIntegration**: External source integration

### Key Relationships
- LiturgicalCalculationEngine → USES → EasterCalculation
- LiturgicalCalculationEngine → USES → MoveableFeastCalculation
- LiturgicalCalculationEngine → USES → SeasonDetermination
- PrecedenceResolution → RESOLVES → CompetingCelebrations
- TextAssembly → FETCHES_FROM → DivinumOfficiumIntegration
- LiturgicalCalculationEngine → PRODUCES → CompleteLiturgicalDay

### Algorithm Storage
Each algorithm component stored as Neo4j node with:
- Implementation pseudocode
- Input/output specifications
- Dependency relationships
- Performance requirements
- Test cases

## Implementation Requirements

### Performance Targets
- **Calculation Time**: < 100ms for any date
- **Text Assembly**: < 500ms including network fetch
- **Caching Strategy**: LRU cache for frequently accessed dates
- **Offline Capability**: Graceful degradation when Divinum Officium unavailable

### Accuracy Requirements
- **100% Easter Accuracy**: Matches official Catholic calendar for any year
- **Precedence Compliance**: Follows 1962 rubrical rules exactly
- **Text Fidelity**: Exact match with divinumofficium.com output
- **Season Boundaries**: Precise liturgical season calculations

### Extensibility Points
- **Calendar Variants**: Support for 1570, 1955, 1960 forms
- **Regional Additions**: Local saint calendars
- **Language Support**: Multiple language text assembly
- **Custom Rules**: Configurable precedence modifications

## Validation Strategy

### Reference Implementation
Compare against divinumofficium.com for random sample of 365 dates across multiple years

### Edge Case Testing
- Leap years
- Year boundaries (Dec 31 → Jan 1)
- Rare precedence conflicts
- Easter boundary years (early/late Easter)
- Octave overlaps

### Performance Benchmarking
- Calculation speed for 1000 random dates
- Memory usage patterns
- Cache hit rates
- Network dependency resilience

This architecture ensures the electronic Breviary/Missal can calculate complete liturgical days for ANY arbitrary date through pure algorithmic computation, with no dependency on pre-calculated data.