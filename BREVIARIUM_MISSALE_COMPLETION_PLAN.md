# Breviarium Romanum & Missale Romanum Completion Plan

## Current Status
- ✅ Research-grade morphological analysis
- ✅ Jerome signature detection
- ✅ Theological archaeology framework
- ✅ 58 calendar days with office texts
- ❌ **Missing**: Complete liturgical year coverage
- ❌ **Missing**: Mass texts (0 entries)
- ❌ **Missing**: Rubrical calculation engine

## Priority 1: Essential Liturgical Function

### 1. Complete Temporal Cycle Import
```bash
# Import all seasonal files from Divinum Officium
node scripts/import-complete-temporal-cycle.js

# Expected result:
- Advent: 28 days (4 weeks × 7 days)
- Christmastide: 13 days 
- Time after Epiphany: Variable
- Septuagesima: 21 days
- Lent: 42 days (6 weeks)
- Paschaltide: 50 days
- Time after Pentecost: Variable (24 weeks)
# Total: ~365 days complete coverage
```

### 2. Mass Ordinary Texts
```sql
-- Add fundamental Mass texts used daily:
INSERT INTO mass_texts (part_type, latin, english) VALUES
('Kyrie', 'Kyrie eleison. Christe eleison. Kyrie eleison.', 'Lord have mercy...'),
('Gloria', 'Gloria in excelsis Deo...', 'Glory to God in the highest...'),
('Credo', 'Credo in unum Deum...', 'I believe in one God...'),
('Sanctus', 'Sanctus, Sanctus, Sanctus...', 'Holy, Holy, Holy...'),
('Agnus_Dei', 'Agnus Dei, qui tollis...', 'Lamb of God, who takes away...');
```

### 3. Major Saints Import
```bash
# Import high-ranking feasts (Totum Duplex, Duplex)
node scripts/import-major-saints.js

# Target: ~100 major feast days
# Includes: Christmas, Easter, Pentecost, Assumption, etc.
```

### 4. Basic Calendar Engine
```javascript
// Essential functions for liturgical calculation:
class LiturgicalCalendar {
    calculateEaster(year) { /* Gregorian Easter algorithm */ }
    getMovableFeasts(year) { /* Ash Wednesday, Ascension, etc. */ }
    getLiturgicalDay(date) { /* Return rank, color, celebration */ }
    resolvePrecedence(date) { /* Handle competing celebrations */ }
}
```

## Priority 2: Complete Breviarium Function

### 5. Complete Hour Structure
```sql
-- Organize office texts by canonical hours:
ALTER TABLE office_texts ADD COLUMN canonical_hour TEXT;
UPDATE office_texts SET canonical_hour = 
    CASE 
        WHEN hour LIKE '%Matutinum%' THEN 'Matutinum'
        WHEN hour LIKE '%Laudes%' THEN 'Laudes'
        WHEN hour LIKE '%Prima%' THEN 'Prima'
        -- etc for all 8 hours
    END;
```

### 6. Psalm Cycle Implementation
```sql
-- Add psalm structure:
CREATE TABLE psalms (
    id INTEGER PRIMARY KEY,
    psalm_number INTEGER,
    latin_text TEXT,
    tone INTEGER,
    seasonal_antiphons TEXT -- JSON
);

CREATE TABLE psalm_assignments (
    hour TEXT,
    day_of_week INTEGER,
    psalm_id INTEGER,
    seasonal_variations TEXT
);
```

### 7. Lesson System
```sql
-- Add biblical and patristic readings:
CREATE TABLE lessons (
    id INTEGER PRIMARY KEY,
    lesson_number INTEGER, -- 1-9 for Matutinum
    source_type TEXT, -- 'biblical', 'patristic', 'hagiographical'
    latin_text TEXT,
    source_reference TEXT, -- Book, chapter, verse OR Father, work
    seasonal_usage TEXT -- When this lesson is used
);
```

## Priority 3: Complete Missale Function

### 8. Mass Proper Texts
```bash
# Import all Mass propers from Divinum Officium
node scripts/import-mass-propers.js

# For each liturgical day, import:
# - Introitus, Graduale, Alleluia, Offertorium, Communio
# - Collecta, Secreta, Postcommunio  
# - Proper Preface (if any)
```

### 9. Lectionary Integration
```sql
-- Link with biblical texts:
CREATE TABLE lectionary (
    date TEXT,
    reading_type TEXT, -- 'epistle', 'gospel'
    book TEXT,
    chapter INTEGER,
    verse_start INTEGER,
    verse_end INTEGER,
    latin_text TEXT,
    seasonal_variation TEXT
);
```

### 10. Votive Masses
```sql
-- Special intention Masses:
INSERT INTO textual_corpora (name, corpus_type) 
VALUES ('Votive Masses', 'votive');

-- Then import texts for:
-- Trinity, Sacred Heart, BVM, Angels, Dead, etc.
```

## User Interface Requirements

### Breviary Interface
```javascript
// Daily Office generation:
function generateOffice(date, hour) {
    const liturgicalDay = getLiturgicalDay(date);
    const properTexts = getProperTexts(date, hour);
    const psalms = getPsalmsForHour(hour, date);
    const lessons = getLessons(date, hour);
    
    return assembleOffice({
        date, hour, liturgicalDay,
        antiphons: properTexts.antiphons,
        psalms: psalms,
        lessons: lessons,
        responsories: properTexts.responsories,
        prayer: properTexts.prayer
    });
}
```

### Missal Interface  
```javascript
// Daily Mass generation:
function generateMass(date, massType = 'sung') {
    const liturgicalDay = getLiturgicalDay(date);
    const proper = getMassProper(date);
    const ordinary = getMassOrdinary();
    
    return assembleMass({
        introitus: proper.introitus,
        kyrie: ordinary.kyrie,
        gloria: ordinary.gloria,
        collecta: proper.collecta,
        epistle: proper.epistle,
        gradual: proper.gradual,
        gospel: proper.gospel,
        credo: ordinary.credo,
        offertory: proper.offertory,
        secreta: proper.secreta,
        preface: proper.preface,
        canon: ordinary.canon,
        communion: proper.communion,
        postcommunion: proper.postcommunion
    });
}
```

## Implementation Timeline

### Month 1-2: Foundation
- Complete temporal cycle import
- Mass ordinary texts
- Basic calendar calculation

### Month 3-4: Breviary Core
- Major saints import
- Hour structure organization
- Psalm assignments

### Month 5-6: Missal Core  
- Mass proper texts import
- Lectionary integration
- Basic text assembly

### Month 7-12: Completion
- Complete sanctoral cycle
- Votive masses
- Rubrical engine
- User interface

## Success Metrics

### Phase 1 Complete:
- ✅ Generate any day's Office and Mass for entire liturgical year
- ✅ Proper precedence calculation
- ✅ Seasonal text variation

### Phase 2 Complete:
- ✅ Full saint day coverage
- ✅ Commemoration handling
- ✅ Votive options

### Phase 3 Complete:
- ✅ Match functionality of printed Breviarium/Missale
- ✅ Historical variant options
- ✅ Regional customizations

## Data Sources Required

1. **Divinum Officium**: Complete Tempora, Sancti, Commune files
2. **1962 Missale Romanum**: Mass proper texts
3. **Vulgate**: Biblical readings integration  
4. **Martyrology**: Complete saint information
5. **Rubrical directories**: Precedence rules
6. **Liber Usualis**: Chant notation (future)

The current database provides an excellent research foundation. Adding these liturgical components will transform it into a practical daily-use Breviarium and Missale while preserving the advanced theological archaeology capabilities.