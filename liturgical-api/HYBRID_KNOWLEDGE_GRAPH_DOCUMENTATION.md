# Hybrid Knowledge Graph (hKG) Documentation
## Liturgical API Multi-Store Architecture

## Overview

The Liturgical API implements a Hybrid Knowledge Graph (hKG) architecture that persists ALL state changes, task plans, and outcomes across three complementary data stores:

- **Qdrant**: Semantic vector storage for natural language queries
- **Neo4j**: Relational graph for ontological ERD structure  
- **PostgreSQL**: Raw chronological logs and audit trails

All representations share common ancestry-encoded UUIDv8 for coherent cross-system relationships.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Liturgical API Client                     │
├─────────────────────────────────────────────────────────────┤
│                    Express.js API Layer                     │
├─────────────────────────────────────────────────────────────┤
│               SQLite (Complete Liturgical DB)               │
│                     1.14 MB | 2,248 texts                  │
├─────────────────────────────────────────────────────────────┤
│                Hybrid Knowledge Graph (hKG)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Qdrant    │  │    Neo4j    │  │    PostgreSQL       │  │
│  │  Vectors    │  │   Graph     │  │   Audit Logs        │  │
│  │             │  │             │  │                     │  │
│  │ • Semantic  │  │ • Structure │  │ • Chronological     │  │
│  │ • Embeddings│  │ • Relations │  │ • Raw Events        │  │
│  │ • Similarity│  │ • Ontology  │  │ • State Changes     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Store Responsibilities

### 1. Qdrant (Semantic Vector Store)

**Purpose**: Natural language understanding and semantic search

**Data Structure**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "vector": [0.1, 0.2, -0.3, ...], // 384-dimension embeddings
  "payload": {
    "text": "Kyrie eleison. Christe eleison. Kyrie eleison.",
    "part_type": "Kyrie",
    "liturgy_type": "mass", 
    "source": "ordinary",
    "priority": 4,
    "julian_day": 2460847,
    "feast_name": "Ordinary Time",
    "language": "latin",
    "created": "2025-01-06T12:00:00Z",
    "project_uuid": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Collections**:
- `liturgical_texts`: All Mass/Office texts with embeddings
- `feast_descriptions`: Natural language feast explanations
- `rubrical_notes`: Ceremonial instructions
- `seasonal_variations`: Temporal adaptations
- `prayer_intentions`: Semantic prayer categories

**Queries Supported**:
```python
# Semantic similarity search
client.search(
    collection_name="liturgical_texts",
    query_vector=embed("Lord have mercy"),
    limit=5,
    filter=models.Filter(
        must=[
            models.FieldCondition(
                key="liturgy_type",
                match=models.MatchValue(value="mass")
            )
        ]
    )
)

# Feast day exploration
client.search(
    collection_name="feast_descriptions", 
    query_vector=embed("Christmas celebration"),
    limit=10
)
```

### 2. Neo4j (Relational Graph Store)

**Purpose**: Structural relationships and ontological modeling

**Node Types**:
```cypher
// Core Architecture
(:Project)-[:CONTAINS]->(:Component)
(:Component)-[:IMPLEMENTS]->(:Algorithm)

// Liturgical Structure  
(:Feast)-[:HAS_TEXTS]->(:MassPart)
(:Season)-[:CONTAINS]->(:Feast)
(:MassPart)-[:PROVIDED_BY]->(:Priority)

// Temporal Relationships
(:Date)-[:CALCULATES_TO]->(:JulianDay)
(:JulianDay)-[:OFFSET_FROM]->(:Easter)
(:Easter)-[:DETERMINES]->(:Season)

// Priority Hierarchy
(:Priority {level: 1})-[:HIGHER_THAN]->(:Priority {level: 2})
```

**Key Relationships**:
```cypher
// Priority cascade modeling
MATCH (temporal:Priority {level: 1})-[:HIGHER_THAN*]->(ordinary:Priority {level: 4})
RETURN temporal, ordinary

// Feast dependency chains  
MATCH (easter:Feast {name: "Easter"})-[:DETERMINES]->(:Season)-[:CONTAINS]->(:Feast)
RETURN easter

// Mass part availability mapping
MATCH (part:MassPart)-[:CAN_BE_PROVIDED_BY]->(priority:Priority)
RETURN part.name, priority.level
ORDER BY priority.level
```

**Example Queries**:
```cypher
// Find all texts available for a specific priority level
MATCH (p:Priority {level: 3})<-[:PROVIDES_TEXTS_AT_PRIORITY]-(t:Table)
RETURN p.name, t.name, t.records

// Map complete priority cascade for any Mass part
MATCH (part:MassPart {name: "Introit"})
MATCH (part)-[:CAN_BE_PROVIDED_BY]->(priority:Priority)
RETURN part.name, priority.level, priority.description
ORDER BY priority.level

// Trace Easter calculation dependencies
MATCH path = (date:Date)-[:CALCULATES_TO]->(:JulianDay)-[:ENABLES]->(:EasterCalculation)
RETURN path
```

### 3. PostgreSQL (Audit Log Store)

**Purpose**: Chronological event logging and state change tracking

**Schema Design**:
```sql
-- Event log table
CREATE TABLE liturgical_events (
    id SERIAL PRIMARY KEY,
    event_uuid UUID DEFAULT gen_random_uuid(),
    project_uuid UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Request context
    request_date DATE,
    julian_day INTEGER,
    easter_offset INTEGER,
    
    -- Resolution details
    priority_used INTEGER,
    source_table VARCHAR(50),
    fallback_chain TEXT[],
    
    -- Performance metrics
    query_duration_ms INTEGER,
    cache_hit BOOLEAN,
    
    -- Raw data
    request_payload JSONB,
    response_payload JSONB,
    
    -- Audit fields
    created_by VARCHAR(100),
    session_id VARCHAR(100),
    
    CONSTRAINT valid_priority CHECK (priority_used BETWEEN 1 AND 4)
);

-- Index for performance
CREATE INDEX idx_liturgical_events_date ON liturgical_events(request_date);
CREATE INDEX idx_liturgical_events_uuid ON liturgical_events(project_uuid);
CREATE INDEX idx_liturgical_events_timestamp ON liturgical_events(event_timestamp);
CREATE INDEX idx_liturgical_events_payload ON liturgical_events USING GIN(request_payload);

-- Mass part resolution tracking
CREATE TABLE mass_part_resolutions (
    id SERIAL PRIMARY KEY,
    event_uuid UUID REFERENCES liturgical_events(event_uuid),
    part_name VARCHAR(50) NOT NULL,
    resolved_priority INTEGER NOT NULL,
    resolved_source VARCHAR(50) NOT NULL,
    latin_text TEXT,
    fallback_used BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance analytics
CREATE TABLE api_performance (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_requests INTEGER DEFAULT 0,
    avg_response_time_ms NUMERIC(10,2),
    cache_hit_rate NUMERIC(5,2),
    priority_1_usage INTEGER DEFAULT 0,
    priority_2_usage INTEGER DEFAULT 0, 
    priority_3_usage INTEGER DEFAULT 0,
    priority_4_usage INTEGER DEFAULT 0,
    unique_dates_requested INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(date)
);

-- State change tracking
CREATE TABLE system_state_changes (
    id SERIAL PRIMARY KEY,
    change_uuid UUID DEFAULT gen_random_uuid(),
    project_uuid UUID NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    component_affected VARCHAR(100),
    old_state JSONB,
    new_state JSONB,
    change_description TEXT,
    changed_by VARCHAR(100),
    change_timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

**Sample Queries**:
```sql
-- Daily usage analytics
SELECT 
    date,
    total_requests,
    avg_response_time_ms,
    cache_hit_rate,
    (priority_4_usage::FLOAT / total_requests * 100) as fallback_percentage
FROM api_performance 
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;

-- Priority usage analysis
SELECT 
    priority_used,
    COUNT(*) as usage_count,
    AVG(query_duration_ms) as avg_duration,
    (COUNT(*)::FLOAT / SUM(COUNT(*)) OVER () * 100) as percentage
FROM liturgical_events 
WHERE event_timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY priority_used
ORDER BY priority_used;

-- Most requested dates
SELECT 
    request_date,
    COUNT(*) as request_count,
    easter_offset,
    MODE() WITHIN GROUP (ORDER BY source_table) as most_common_source
FROM liturgical_events
WHERE request_date IS NOT NULL
GROUP BY request_date, easter_offset
ORDER BY request_count DESC
LIMIT 20;

-- System health monitoring
SELECT 
    event_type,
    COUNT(*) as event_count,
    MAX(event_timestamp) as last_occurrence,
    AVG(query_duration_ms) as avg_duration
FROM liturgical_events
WHERE event_timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY event_type
ORDER BY event_count DESC;
```

## UUIDv8 Ancestry Encoding

All three systems use a common UUIDv8 format that encodes ancestry relationships:

```
UUIDv8 Structure: xxxxxxxx-xxxx-8xxx-xxxx-xxxxxxxxxxxx
                  |      | |  | |  | |
                  |      | |  | |  | └─ Random component
                  |      | |  | |  └─── Project hierarchy  
                  |      | |  | └────── Component type
                  |      | |  └──────── Subsystem identifier
                  |      | └─────────── Version (8 = UUIDv8)
                  |      └───────────── Timestamp component
                  └──────────────────── Project root UUID
```

**Example Inheritance**:
```
Project:        550e8400-e29b-41d4-a716-446655440000
├─ Component:   550e8400-e29b-41d4-a717-446655440001  
├─ Algorithm:   550e8400-e29b-41d4-a718-446655440002
└─ API Call:    550e8400-e29b-41d4-a719-446655440003
```

## Integration Implementation

### Node.js Integration Layer

```javascript
// hkg-manager.js - Hybrid Knowledge Graph Manager
class HybridKnowledgeGraph {
  constructor() {
    this.qdrant = new QdrantClient({ url: process.env.QDRANT_URL });
    this.neo4j = neo4j.driver(process.env.NEO4J_URL);
    this.postgres = new Pool({ connectionString: process.env.POSTGRES_URL });
    this.projectUUID = process.env.PROJECT_UUID;
  }

  async logMassRequest(date, result, performance) {
    const eventUUID = this.generateChildUUID();
    
    // 1. Log to PostgreSQL (audit trail)
    await this.postgres.query(`
      INSERT INTO liturgical_events (
        event_uuid, project_uuid, event_type, request_date,
        julian_day, easter_offset, priority_used, source_table,
        query_duration_ms, request_payload, response_payload
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      eventUUID, this.projectUUID, 'mass_request', date,
      result.julian_day, result.easter_offset, result.highest_priority,
      result.primary_source, performance.duration, 
      { date }, result
    ]);

    // 2. Store in Qdrant (semantic vectors)
    for (const [partName, partData] of Object.entries(result.texts)) {
      if (partData && partData.latin) {
        const vector = await this.embedText(partData.latin);
        await this.qdrant.upsert(this.projectUUID, {
          points: [{
            id: this.generateChildUUID(),
            vector: vector,
            payload: {
              text: partData.latin,
              part_type: partName,
              source: partData.source,
              priority: partData.priority,
              julian_day: result.julian_day,
              request_date: date,
              event_uuid: eventUUID,
              project_uuid: this.projectUUID
            }
          }]
        });
      }
    }

    // 3. Update Neo4j (structural relationships)
    const session = this.neo4j.session();
    await session.run(`
      MATCH (project:Project {uuid: $projectUUID})
      CREATE (request:APIRequest {
        uuid: $eventUUID,
        date: date($date),
        julian_day: $julianDay,
        easter_offset: $easterOffset,
        timestamp: datetime()
      })
      CREATE (project)-[:HAS_REQUEST]->(request)
    `, {
      projectUUID: this.projectUUID,
      eventUUID: eventUUID,
      date: date,
      julianDay: result.julian_day,
      easterOffset: result.easter_offset
    });
    
    await session.close();
    
    return eventUUID;
  }

  generateChildUUID() {
    // Generate UUIDv8 with ancestry encoding
    const base = this.projectUUID.split('-')[0];
    const timestamp = Date.now().toString(16).padStart(8, '0');
    const random = crypto.randomBytes(8).toString('hex');
    return `${base}-${timestamp.slice(0,4)}-8${timestamp.slice(4,7)}-a${random.slice(0,3)}-${random.slice(3)}`;
  }
}
```

### Semantic Search Implementation

```javascript
// semantic-search.js
class LiturgicalSemanticSearch {
  async findSimilarTexts(query, filters = {}) {
    const queryVector = await this.embedText(query);
    
    const results = await this.qdrant.search(this.projectUUID, {
      vector: queryVector,
      limit: 10,
      filter: {
        must: [
          { key: "liturgy_type", match: { value: "mass" } },
          ...Object.entries(filters).map(([key, value]) => ({
            key, match: { value }
          }))
        ]
      }
    });

    return results.map(result => ({
      text: result.payload.text,
      part_type: result.payload.part_type,
      similarity: result.score,
      source: result.payload.source,
      julian_day: result.payload.julian_day
    }));
  }

  async findFeastsByDescription(description) {
    const queryVector = await this.embedText(description);
    
    const results = await this.qdrant.search("feast_descriptions", {
      vector: queryVector,
      limit: 5
    });

    return results.map(result => ({
      feast_name: result.payload.feast_name,
      description: result.payload.description,
      date: result.payload.date,
      similarity: result.score
    }));
  }
}
```

## Query Examples Across All Systems

### 1. Complete System State Query

```javascript
// Get complete state for July 6, 2025
async function getCompleteSystemState(date) {
  const julianDay = toJulianDay(new Date(date));
  
  // PostgreSQL: Get audit trail
  const auditEvents = await postgres.query(`
    SELECT * FROM liturgical_events 
    WHERE request_date = $1 
    ORDER BY event_timestamp DESC
  `, [date]);

  // Neo4j: Get structural relationships  
  const session = neo4j.session();
  const structure = await session.run(`
    MATCH (request:APIRequest {julian_day: $julianDay})
    MATCH (request)-[:FOR_PRIORITY]->(priority:Priority)
    MATCH (priority)<-[:PROVIDES_TEXTS_AT_PRIORITY]-(table:Table)
    RETURN request, priority, table
  `, { julianDay });

  // Qdrant: Get semantic context
  const semanticContext = await qdrant.search("liturgical_texts", {
    filter: {
      must: [{ key: "julian_day", match: { value: julianDay } }]
    },
    limit: 20
  });

  return {
    audit_trail: auditEvents.rows,
    structural_context: structure.records,
    semantic_context: semanticContext
  };
}
```

### 2. Priority Effectiveness Analysis

```sql
-- PostgreSQL: Analyze priority system effectiveness
WITH priority_stats AS (
  SELECT 
    priority_used,
    COUNT(*) as usage_count,
    AVG(query_duration_ms) as avg_duration,
    COUNT(CASE WHEN cache_hit THEN 1 END) as cache_hits
  FROM liturgical_events 
  WHERE event_timestamp >= NOW() - INTERVAL '30 days'
  GROUP BY priority_used
)
SELECT 
  p.priority_used,
  p.usage_count,
  p.avg_duration,
  (p.cache_hits::FLOAT / p.usage_count * 100) as cache_hit_rate,
  (p.usage_count::FLOAT / SUM(p.usage_count) OVER () * 100) as percentage_of_total
FROM priority_stats p
ORDER BY p.priority_used;
```

```cypher
-- Neo4j: Map priority cascade effectiveness
MATCH (p:Priority)<-[:PROVIDES_TEXTS_AT_PRIORITY]-(t:Table)
OPTIONAL MATCH (p)<-[:RESOLVED_AT_PRIORITY]-(resolution)
RETURN p.level, p.name, t.name, COUNT(resolution) as resolutions_count
ORDER BY p.level
```

### 3. Semantic Liturgical Discovery

```python
# Qdrant: Find liturgically related content
search_results = qdrant_client.search(
    collection_name="liturgical_texts",
    query_vector=embed("sacrifice and offering"),
    filter=models.Filter(
        should=[
            models.FieldCondition(key="part_type", match=models.MatchValue(value="Offertory")),
            models.FieldCondition(key="part_type", match=models.MatchValue(value="Secret")),
            models.FieldCondition(key="part_type", match=models.MatchValue(value="Canon"))
        ]
    ),
    limit=15
)
```

## Performance Optimization

### Caching Strategy
- **L1 Cache**: In-memory LRU for recent Mass requests
- **L2 Cache**: Redis for daily liturgical calculations  
- **L3 Cache**: PostgreSQL materialized views for analytics

### Indexing Strategy
- **Qdrant**: Vector indices optimized for semantic similarity
- **Neo4j**: Composite indices on (:Priority)-[:LEVEL], (:MassPart)-[:TYPE]
- **PostgreSQL**: B-tree on dates, GIN on JSONB payloads

### Sharding Strategy
- **By Year**: Partition PostgreSQL tables by liturgical year
- **By Collection**: Separate Qdrant collections for Mass vs Office
- **By Subgraph**: Neo4j enterprise sharding by liturgical season

## Monitoring and Observability

### Health Checks
```javascript
async function systemHealthCheck() {
  const health = {
    qdrant: await checkQdrantHealth(),
    neo4j: await checkNeo4jHealth(), 
    postgres: await checkPostgresHealth(),
    coherence: await checkUUIDCoherence()
  };
  
  return {
    status: Object.values(health).every(h => h.status === 'healthy') ? 'healthy' : 'degraded',
    components: health,
    timestamp: new Date().toISOString()
  };
}
```

### Metrics Collection
- **Request latency**: P50, P95, P99 across all stores
- **Priority distribution**: Usage patterns by priority level
- **Cache effectiveness**: Hit rates and eviction patterns
- **Data coherence**: UUID ancestry validation across systems

---

*This Hybrid Knowledge Graph architecture ensures the Liturgical API maintains comprehensive state tracking, semantic understanding, and structural relationships while providing audit trails for all liturgical text resolutions.*