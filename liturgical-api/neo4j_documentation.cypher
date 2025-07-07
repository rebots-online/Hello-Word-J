// Liturgical API Architecture Documentation in Neo4j
// Rock 'Em Sock 'Em Priorities™ System Documentation

// Clear existing nodes (use with caution in production)
MATCH (n) DETACH DELETE n;

// =====================================
// 1. CREATE CORE ARCHITECTURE NODES
// =====================================

// Project Root
CREATE (project:Project {
  name: "Liturgical API",
  description: "Traditional Latin Mass text generation with Julian Day-based priority system",
  version: "1.0.0",
  uuid: "550e8400-e29b-41d4-a716-446655440000",
  architecture: "Rock Em Sock Em Priorities™",
  created: datetime()
});

// Core Components
CREATE (julianConverter:Component {
  name: "Julian Day Converter",
  type: "Algorithm",
  description: "Converts Gregorian dates to Julian Day Numbers for precise date arithmetic",
  file: "liturgical-engine.js",
  function: "toJulianDay()",
  complexity: "O(1)"
});

CREATE (easterCalc:Component {
  name: "Easter Calculator", 
  type: "Algorithm",
  description: "Butcher's algorithm implementation for calculating Easter date",
  file: "liturgical-engine.js",
  function: "calculateEaster()",
  accuracy: "Astronomically precise",
  algorithm: "Meeus/Jones/Butcher"
});

CREATE (priorityEngine:Component {
  name: "Priority Resolution Engine",
  type: "Core Logic",
  description: "Four-tier hierarchical fallback system for liturgical text resolution",
  file: "liturgical-engine.js", 
  function: "findBestText()",
  priorities: ["Temporal", "Sanctoral", "Commune", "Ordinary"]
});

CREATE (database:Component {
  name: "Complete Liturgical Database",
  type: "Data Store",
  file: "complete-liturgical-database.db",
  size: "1.14 MB",
  records: 2248,
  format: "SQLite"
});

// =====================================
// 2. CREATE PRIORITY HIERARCHY
// =====================================

// Priority Levels (Rock 'Em Sock 'Em system)
CREATE (p1:Priority {
  level: 1,
  name: "Temporal",
  description: "Moveable feasts based on Easter calculation",
  color: "🏆",
  calculation: "Easter + offset days",
  examples: ["Easter Sunday", "Ash Wednesday", "Pentecost"]
});

CREATE (p2:Priority {
  level: 2, 
  name: "Sanctoral",
  description: "Fixed saints days and major feasts",
  color: "🥇",
  calculation: "Fixed calendar date (Julian Day lookup)",
  examples: ["Christmas", "Epiphany", "St. Joseph"]
});

CREATE (p3:Priority {
  level: 3,
  name: "Commune", 
  description: "Fallback texts for categories of saints",
  color: "🥈",
  calculation: "Commune type mapping",
  examples: ["Martyrs", "Confessors", "Virgins"]
});

CREATE (p4:Priority {
  level: 4,
  name: "Ordinary",
  description: "Absolute fallback - always available",
  color: "🥉", 
  calculation: "Static text lookup",
  examples: ["Kyrie", "Gloria", "Credo"]
});

// =====================================
// 3. CREATE DATABASE TABLES STRUCTURE
// =====================================

// Database Tables
CREATE (massOrdinary:Table {
  name: "mass_ordinary",
  type: "Core",
  records: 5,
  description: "Invariable parts of the Mass",
  columns: ["part_type", "latin_text", "seasonal_variants", "rubrical_notes"]
});

CREATE (sanctoralFeasts:Table {
  name: "sanctoral_feasts", 
  type: "Calendar",
  records: 285,
  description: "Fixed feast days and saint commemorations",
  primaryKey: "month_day",
  columns: ["month_day", "celebration_name", "rank", "color", "commune_type"]
});

CREATE (sanctoralTexts:Table {
  name: "sanctoral_texts",
  type: "Texts",
  records: "Variable",
  description: "Proper texts for saint feast days",
  columns: ["month_day", "liturgy_type", "part_type", "latin_text"]
});

CREATE (temporalPatterns:Table {
  name: "temporal_patterns",
  type: "Calendar", 
  records: 137,
  description: "Moveable feast patterns based on Easter",
  primaryKey: "pattern_id",
  columns: ["pattern_id", "season", "rank", "celebration_name"]
});

CREATE (temporalTexts:Table {
  name: "temporal_texts",
  type: "Texts",
  records: "Variable", 
  description: "Texts for moveable feasts and seasons",
  columns: ["pattern_id", "liturgy_type", "part_type", "latin_text"]
});

CREATE (communeTexts:Table {
  name: "commune_texts",
  type: "Texts",
  records: 360,
  description: "Fallback texts organized by saint categories",
  columns: ["commune_type", "liturgy_type", "part_type", "latin_text"]
});

// =====================================
// 4. CREATE MASS PARTS STRUCTURE  
// =====================================

// Mass Ordinary Parts (Invariable)
CREATE (kyrie:MassPart {
  name: "Kyrie",
  type: "Ordinary",
  order: 1,
  description: "Lord, have mercy",
  latin: "Kyrie eleison",
  variability: "Invariable"
});

CREATE (gloria:MassPart {
  name: "Gloria", 
  type: "Ordinary",
  order: 2,
  description: "Glory to God in the highest",
  latin: "Gloria in excelsis Deo",
  variability: "Invariable"
});

CREATE (credo:MassPart {
  name: "Credo",
  type: "Ordinary", 
  order: 8,
  description: "Nicene Creed",
  latin: "Credo in unum Deum",
  variability: "Invariable"
});

CREATE (sanctus:MassPart {
  name: "Sanctus",
  type: "Ordinary",
  order: 12,
  description: "Holy, Holy, Holy", 
  latin: "Sanctus, Sanctus, Sanctus",
  variability: "Invariable"
});

CREATE (agnusDei:MassPart {
  name: "Agnus Dei",
  type: "Ordinary",
  order: 15,
  description: "Lamb of God",
  latin: "Agnus Dei",
  variability: "Invariable"
});

// Mass Proper Parts (Variable)
CREATE (introit:MassPart {
  name: "Introit",
  type: "Proper",
  order: 3,
  description: "Entrance antiphon",
  variability: "Varies by feast/season"
});

CREATE (collect:MassPart {
  name: "Collect", 
  type: "Proper",
  order: 4,
  description: "Opening prayer",
  variability: "Varies by feast/season"
});

CREATE (epistle:MassPart {
  name: "Epistle",
  type: "Proper", 
  order: 5,
  description: "First reading",
  variability: "Varies by feast/season"
});

CREATE (gradual:MassPart {
  name: "Gradual",
  type: "Proper",
  order: 6, 
  description: "Responsorial chant",
  variability: "Varies by feast/season"
});

CREATE (gospel:MassPart {
  name: "Gospel",
  type: "Proper",
  order: 7,
  description: "Gospel reading", 
  variability: "Varies by feast/season"
});

CREATE (offertory:MassPart {
  name: "Offertory",
  type: "Proper",
  order: 9,
  description: "Offertory antiphon",
  variability: "Varies by feast/season"
});

CREATE (secret:MassPart {
  name: "Secret", 
  type: "Proper",
  order: 10,
  description: "Prayer over gifts",
  variability: "Varies by feast/season"
});

CREATE (communion:MassPart {
  name: "Communion",
  type: "Proper",
  order: 13,
  description: "Communion antiphon",
  variability: "Varies by feast/season"
});

CREATE (postcommunion:MassPart {
  name: "Postcommunion",
  type: "Proper", 
  order: 14,
  description: "Prayer after communion",
  variability: "Varies by feast/season"
});

// =====================================
// 5. CREATE RELATIONSHIPS 
// =====================================

// Project relationships
MATCH (project:Project), (julianConverter:Component), (easterCalc:Component), (priorityEngine:Component), (database:Component)
CREATE (project)-[:CONTAINS]->(julianConverter),
       (project)-[:CONTAINS]->(easterCalc),
       (project)-[:CONTAINS]->(priorityEngine),
       (project)-[:CONTAINS]->(database);

// Priority hierarchy relationships
MATCH (p1:Priority {level: 1}), (p2:Priority {level: 2}), (p3:Priority {level: 3}), (p4:Priority {level: 4})
CREATE (p1)-[:HIGHER_PRIORITY_THAN]->(p2),
       (p2)-[:HIGHER_PRIORITY_THAN]->(p3), 
       (p3)-[:HIGHER_PRIORITY_THAN]->(p4);

// Database table relationships
MATCH (database:Component), 
      (massOrdinary:Table), (sanctoralFeasts:Table), (sanctoralTexts:Table),
      (temporalPatterns:Table), (temporalTexts:Table), (communeTexts:Table)
CREATE (database)-[:CONTAINS_TABLE]->(massOrdinary),
       (database)-[:CONTAINS_TABLE]->(sanctoralFeasts),
       (database)-[:CONTAINS_TABLE]->(sanctoralTexts),
       (database)-[:CONTAINS_TABLE]->(temporalPatterns),
       (database)-[:CONTAINS_TABLE]->(temporalTexts),
       (database)-[:CONTAINS_TABLE]->(communeTexts);

// Table to Priority mapping
MATCH (temporalTexts:Table), (p1:Priority {level: 1})
CREATE (temporalTexts)-[:PROVIDES_TEXTS_AT_PRIORITY]->(p1);

MATCH (sanctoralTexts:Table), (p2:Priority {level: 2})
CREATE (sanctoralTexts)-[:PROVIDES_TEXTS_AT_PRIORITY]->(p2);

MATCH (communeTexts:Table), (p3:Priority {level: 3})
CREATE (communeTexts)-[:PROVIDES_TEXTS_AT_PRIORITY]->(p3);

MATCH (massOrdinary:Table), (p4:Priority {level: 4})
CREATE (massOrdinary)-[:PROVIDES_TEXTS_AT_PRIORITY]->(p4);

// Mass part relationships to priorities
MATCH (kyrie:MassPart), (gloria:MassPart), (credo:MassPart), (sanctus:MassPart), (agnusDei:MassPart), (p4:Priority {level: 4})
CREATE (kyrie)-[:ALWAYS_AVAILABLE_AT]->(p4),
       (gloria)-[:ALWAYS_AVAILABLE_AT]->(p4),
       (credo)-[:ALWAYS_AVAILABLE_AT]->(p4), 
       (sanctus)-[:ALWAYS_AVAILABLE_AT]->(p4),
       (agnusDei)-[:ALWAYS_AVAILABLE_AT]->(p4);

MATCH (introit:MassPart), (collect:MassPart), (epistle:MassPart), (gradual:MassPart), (gospel:MassPart),
      (offertory:MassPart), (secret:MassPart), (communion:MassPart), (postcommunion:MassPart),
      (p1:Priority {level: 1}), (p2:Priority {level: 2}), (p3:Priority {level: 3})
CREATE (introit)-[:CAN_BE_PROVIDED_BY]->(p1),
       (introit)-[:CAN_BE_PROVIDED_BY]->(p2),
       (introit)-[:CAN_BE_PROVIDED_BY]->(p3),
       (collect)-[:CAN_BE_PROVIDED_BY]->(p1),
       (collect)-[:CAN_BE_PROVIDED_BY]->(p2), 
       (collect)-[:CAN_BE_PROVIDED_BY]->(p3),
       (epistle)-[:CAN_BE_PROVIDED_BY]->(p1),
       (epistle)-[:CAN_BE_PROVIDED_BY]->(p2),
       (epistle)-[:CAN_BE_PROVIDED_BY]->(p3),
       (gradual)-[:CAN_BE_PROVIDED_BY]->(p1),
       (gradual)-[:CAN_BE_PROVIDED_BY]->(p2),
       (gradual)-[:CAN_BE_PROVIDED_BY]->(p3),
       (gospel)-[:CAN_BE_PROVIDED_BY]->(p1),
       (gospel)-[:CAN_BE_PROVIDED_BY]->(p2),
       (gospel)-[:CAN_BE_PROVIDED_BY]->(p3),
       (offertory)-[:CAN_BE_PROVIDED_BY]->(p1),
       (offertory)-[:CAN_BE_PROVIDED_BY]->(p2),
       (offertory)-[:CAN_BE_PROVIDED_BY]->(p3),
       (secret)-[:CAN_BE_PROVIDED_BY]->(p1),
       (secret)-[:CAN_BE_PROVIDED_BY]->(p2),
       (secret)-[:CAN_BE_PROVIDED_BY]->(p3),
       (communion)-[:CAN_BE_PROVIDED_BY]->(p1),
       (communion)-[:CAN_BE_PROVIDED_BY]->(p2),
       (communion)-[:CAN_BE_PROVIDED_BY]->(p3),
       (postcommunion)-[:CAN_BE_PROVIDED_BY]->(p1),
       (postcommunion)-[:CAN_BE_PROVIDED_BY]->(p2),
       (postcommunion)-[:CAN_BE_PROVIDED_BY]->(p3);

// Algorithm relationships  
MATCH (julianConverter:Component), (easterCalc:Component), (priorityEngine:Component)
CREATE (julianConverter)-[:FEEDS_INTO]->(easterCalc),
       (easterCalc)-[:ENABLES]->(priorityEngine);

// =====================================
// 6. CREATE SAMPLE DATA EXAMPLES
// =====================================

// Example feast days
CREATE (christmas:Feast {
  name: "Nativity of Our Lord",
  date: "12-25",
  julian_fixed: true,
  rank: 9,
  color: "White",
  priority_level: 2,
  has_proper_texts: true
});

CREATE (easter2025:Feast {
  name: "Easter Sunday", 
  year: 2025,
  date: "2025-04-20",
  julian_day: 2460487,
  rank: 9,
  color: "White",
  priority_level: 1,
  calculation: "Butcher algorithm result"
});

CREATE (ordinaryTime:Season {
  name: "Ordinary Time",
  type: "Temporal",
  priority_level: 3,
  default_rank: 5,
  color: "Green"
});

// Example API call documentation
CREATE (apiCall:Example {
  name: "July 6, 2025 Mass Request",
  endpoint: "/mass/2025-07-06",
  julian_day: 2460847,
  easter_offset: 77,
  season: "Ordinary",
  rank: 5,
  result_priority: 3,
  result_source: "commune"
});

// =====================================
// 7. CREATE QUERIES FOR VALIDATION
// =====================================

// Query to show the complete priority hierarchy
MATCH (p:Priority)
RETURN p.level, p.name, p.description, p.color
ORDER BY p.level;

// Query to show all Mass parts and their variability
MATCH (m:MassPart)
RETURN m.name, m.type, m.order, m.variability
ORDER BY m.order;

// Query to show the Rock 'Em Sock 'Em priority chain
MATCH path = (p1:Priority)-[:HIGHER_PRIORITY_THAN*]->(p4:Priority)
WHERE p1.level = 1 AND p4.level = 4
RETURN path;

// Query to show which tables provide texts at each priority
MATCH (t:Table)-[:PROVIDES_TEXTS_AT_PRIORITY]->(p:Priority)
RETURN p.level, p.name, t.name, t.records
ORDER BY p.level;

// =====================================
// 8. METADATA AND VERSIONING
// =====================================

CREATE (metadata:Metadata {
  system: "Liturgical API Rock Em Sock Em Priorities™",
  version: "1.0.0",
  created: datetime(),
  total_nodes: "50+",
  total_relationships: "100+", 
  database_size: "1.14 MB",
  total_texts: 2248,
  supported_date_range: "Any date (including 3021 AD)",
  architecture_pattern: "Priority-based fallback with Julian Day arithmetic",
  author: "Robin & Claude",
  license: "Traditional Catholic Open Source"
});

MATCH (project:Project), (metadata:Metadata)
CREATE (project)-[:HAS_METADATA]->(metadata);

// =====================================
// VERIFICATION QUERIES
// =====================================

// Count all nodes by type
MATCH (n)
RETURN labels(n) as NodeType, count(n) as Count
ORDER BY Count DESC;

// Show the complete system architecture
MATCH (project:Project)-[:CONTAINS]->(component:Component)
RETURN project.name, component.name, component.type, component.description;

// Show priority system validation
MATCH (p:Priority)
OPTIONAL MATCH (p)<-[:PROVIDES_TEXTS_AT_PRIORITY]-(t:Table)
RETURN p.level, p.name, collect(t.name) as ProvidingTables
ORDER BY p.level;