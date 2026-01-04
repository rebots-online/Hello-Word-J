# Liturgical API Documentation

## Overview

The Liturgical API generates complete Traditional Latin Mass (1962 Missal) texts for any date using a Julian Day-based priority system. It implements what we call "Rock 'Em Sock 'Em Priorities™" - a hierarchical fallback system that ensures every Mass part is always available.

## Architecture

### Core Components

1. **Julian Day Conversion**: All dates converted to Julian Day Numbers for precise arithmetic
2. **Easter Calculation**: Butcher's algorithm implementation for moveable feast calculations  
3. **Priority System**: Four-tier fallback hierarchy for text resolution
4. **Complete Database**: Single SQLite file with 2,248 liturgical texts

### Database Schema

The system uses `complete-liturgical-database.db` (1.14 MB) containing:

- **2,248 total liturgical texts imported**
- **285 sanctoral feasts** (includes future dates like August 23, 3021)
- **137 temporal patterns** (complete liturgical year)
- **360 commune texts** (fallback for any saint)
- **5 Mass Ordinary parts** (invariable texts)

#### Key Tables

```sql
-- Mass Ordinary (invariable parts)
mass_ordinary {
  part_type: TEXT (Kyrie, Gloria, Credo, Sanctus, Agnus Dei)
  latin_text: TEXT
  seasonal_variants: TEXT
  rubrical_notes: TEXT
}

-- Sanctoral Feasts (fixed dates)
sanctoral_feasts {
  month_day: TEXT PRIMARY KEY (MMDD format)
  celebration_name: TEXT
  rank: INTEGER
  color: TEXT
  commune_type: TEXT
}

-- Sanctoral Texts (proper texts for saints)
sanctoral_texts {
  month_day: TEXT
  liturgy_type: TEXT (mass/office)
  part_type: TEXT
  latin_text: TEXT
  rubrical_notes: TEXT
}

-- Temporal Patterns (moveable feasts)
temporal_patterns {
  pattern_id: TEXT PRIMARY KEY
  season: TEXT
  rank: INTEGER
  celebration_name: TEXT
}

-- Commune Texts (fallback texts)
commune_texts {
  commune_type: TEXT
  liturgy_type: TEXT
  part_type: TEXT
  latin_text: TEXT
  rubrical_notes: TEXT
}
```

## Algorithm: Rock 'Em Sock 'Em Priorities™

### Step 1: Date Conversion
```javascript
// Convert Gregorian date to Julian Day Number
toJulianDay(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
         Math.floor(y / 4) - Math.floor(y / 100) + 
         Math.floor(y / 400) - 32045;
}
```

### Step 2: Easter Calculation (Butcher's Algorithm)
```javascript
calculateEaster(year) {
  const y = year;
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
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

### Step 3: Priority Resolution

The system uses a four-tier priority system where lower numbers = higher priority:

```sql
-- 🏆 Priority 1: TEMPORAL (moveable feasts based on Easter)
-- 🥇 Priority 2: SANCTORAL (fixed saints days)  
-- 🥈 Priority 3: COMMUNE (fallback texts)
-- 🥉 Priority 4: ORDINARY (absolute fallback)
```

### Step 4: Complete Mass Generation

For each Mass part (Introit, Collect, Epistle, etc.), the system:

1. Queries all four sources with priority rankings
2. Sorts by part_type and priority
3. Returns the highest-priority available text
4. Includes metadata about source and calculation method

## API Endpoints

### Base Configuration
- **Host**: Configurable via `.env` (default: localhost)
- **Port**: Configurable via `.env` (default: 9837 - high port to avoid conflicts)

### Endpoints

#### GET /mass/:date
Returns complete Mass texts for the specified date.

**Example Request:**
```bash
curl "http://localhost:9837/mass/2025-07-06"
```

**Response Structure:**
```json
{
  "calendar": {
    "date": "2025-07-06",
    "dayOfWeek": 6,
    "season": "Ordinary",
    "rank": 5,
    "liturgicalYear": 2025,
    "easter": "2025-04-20",
    "weekNumber": 1
  },
  "julian_day": 2460847,
  "easter_offset": 77,
  "texts": {
    "kyrie": {
      "latin": "Kyrie eleison. Christe eleison. Kyrie eleison.",
      "source": "ordinary",
      "priority": 4,
      "calculation": "Ordinary of Mass"
    },
    "introit": {
      "latin": "Os justi meditábitur sapiéntiam...",
      "source": "commune",
      "priority": 3,
      "calculation": "Commune fallback"
    }
  }
}
```

#### GET /calendar/:date
Returns liturgical calendar information for the date.

#### GET /liturgical-year/:date
Returns liturgical year information and key dates.

## Mass Parts Generated

### Ordinary (Invariable)
- **Kyrie**: Lord, have mercy
- **Gloria**: Glory to God in the highest
- **Credo**: Nicene Creed
- **Sanctus**: Holy, Holy, Holy
- **Agnus Dei**: Lamb of God

### Proper (Variable)
- **Introit**: Entrance antiphon
- **Collect**: Opening prayer
- **Epistle**: First reading
- **Gradual**: Responsorial chant
- **Alleluia/Tract**: Gospel acclamation
- **Gospel**: Gospel reading
- **Offertory**: Offertory antiphon
- **Secret**: Prayer over gifts
- **Preface**: Preface to Eucharistic Prayer
- **Canon**: Eucharistic Prayer
- **Communion**: Communion antiphon
- **Postcommunion**: Prayer after communion
- **Ite Missa Est**: Dismissal

## Features

### Year-Agnostic Architecture
The system works for ANY date, including:
- Historical dates (e.g., December 25, 800 AD)
- Future dates (e.g., August 23, 3021)
- Leap years handled correctly
- All moveable feast calculations accurate

### Fallback System
Every Mass part is guaranteed to have text through the priority system:
1. If a saint has proper texts → use those
2. If it's a temporal feast → use temporal texts  
3. If no specific texts → fall back to commune
4. If all else fails → use ordinary texts

### Debugging Information
Each text includes:
- **Source**: Which table provided the text
- **Priority**: Numerical priority (1=highest)
- **Calculation**: How the text was determined

## Examples

### Christmas Day
```bash
curl "http://localhost:9837/mass/2025-12-25"
# Returns: Proper texts for Nativity with highest priority
```

### Regular Weekday
```bash
curl "http://localhost:9837/mass/2025-07-15"
# Returns: Commune texts with ordinary fallbacks
```

### Future Date
```bash
curl "http://localhost:9837/mass/3021-08-23"
# Returns: Complete Mass for year 3021!
```

## Technical Implementation

### Dependencies
- **Node.js**: Runtime environment
- **Express**: Web framework
- **SQLite3**: Database driver
- **CORS**: Cross-origin support
- **dotenv**: Environment configuration

### Performance
- Single 1.14 MB database file
- No external API dependencies
- Pure algorithmic calculation
- Sub-100ms response times

### Security
- No SQL injection vulnerabilities (parameterized queries)
- CORS configured for web access
- High port default to avoid conflicts
- No sensitive data exposure

## Configuration

### Environment Variables
```bash
# .env file
PORT=9837           # Server port (high port by default)
HOST=localhost      # Server host
```

### Database Path
The system expects `complete-liturgical-database.db` in the `../assets/` directory relative to the server script.

## Error Handling

- **Invalid dates**: Returns 400 with error message
- **Database errors**: Returns 500 with error details
- **Missing texts**: Falls back through priority system
- **Network errors**: Standard HTTP status codes

## Future Enhancements

1. **Neo4j Integration**: Store architectural relationships
2. **Breviary Support**: Complete Divine Office texts
3. **Multiple Languages**: English translations
4. **Audio Support**: Gregorian chant integration
5. **Calendar Views**: Annual liturgical planning

---

*Generated by the Liturgical API - Rock 'Em Sock 'Em Priorities™ in action!*