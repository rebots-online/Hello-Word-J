// Neo4j Cypher Script for Installation Event Documentation
// UUID: de268720-c912-483c-bdcd-0e68da47f8d7
// Date: 2025-07-03T05:27:43Z
// Event: NPM Dependency Installation with React Version Conflict Resolution

// Create Project Node
CREATE (project:Project {
  id: "hello-word-j",
  name: "SanctissiMissa (Hello Word)",
  type: "liturgical_application",
  architecture: "multi_platform",
  uuid: "de268720-c912-483c-bdcd-0e68da47f8d7",
  timestamp: "2025-07-03T05:27:43Z"
})

// Create Package Structure Nodes
CREATE (root_pkg:Package {
  id: "root_package",
  name: "hello-word-j-root",
  version: "1.0.0",
  type: "root",
  path: "/package.json",
  manager: "npm"
})

CREATE (rn_pkg:Package {
  id: "helloword_package", 
  name: "HelloWord",
  version: "0.1.0",
  type: "react_native",
  path: "/HelloWord/package.json",
  manager: "npm"
})

// Create Installation Event Node
CREATE (install_event:InstallationEvent {
  id: "npm_install_20250703",
  uuid: "de268720-c912-483c-bdcd-0e68da47f8d7",
  timestamp: "2025-07-03T05:27:43Z",
  command: "npm install",
  status: "resolved_with_legacy_peer_deps",
  conflict_type: "react_version_mismatch"
})

// Create Dependency Conflict Node
CREATE (react_conflict:DependencyConflict {
  id: "react_version_conflict",
  conflict_type: "peer_dependency",
  found_version: "18.3.1",
  required_version: "^19.1.0",
  package: "react-native@0.80.1",
  resolution: "legacy_peer_deps"
})

// Create Resolution Strategy Node
CREATE (resolution:ResolutionStrategy {
  id: "legacy_peer_deps_resolution",
  strategy: "legacy_peer_deps",
  command: "npm install --legacy-peer-deps",
  outcome: "successful",
  warnings: "version_compatibility_warnings"
})

// Create Relationships
CREATE (project)-[:CONTAINS]->(root_pkg)
CREATE (project)-[:CONTAINS]->(rn_pkg)
CREATE (install_event)-[:TARGETS]->(root_pkg)
CREATE (install_event)-[:TARGETS]->(rn_pkg)
CREATE (install_event)-[:ENCOUNTERED]->(react_conflict)
CREATE (react_conflict)-[:RESOLVED_BY]->(resolution)
CREATE (project)-[:EXPERIENCED]->(install_event)

// Create Dependency Relationship Mapping
CREATE (react_dep:Dependency {
  id: "react_dependency",
  name: "react",
  version: "^18.2.0",
  type: "dependency"
})

CREATE (react_native_dep:Dependency {
  id: "react_native_dependency", 
  name: "react-native",
  version: "0.80.1",
  type: "peer_dependency"
})

CREATE (root_pkg)-[:DEPENDS_ON]->(react_dep)
CREATE (react_native_dep)-[:REQUIRES]->(react_dep)
CREATE (react_conflict)-[:INVOLVES]->(react_dep)
CREATE (react_conflict)-[:INVOLVES]->(react_native_dep)

// Create Architecture Nodes for Multi-Platform Structure
CREATE (web_platform:Platform {
  id: "web_platform",
  name: "Web",
  technology: "Vite + React",
  build_tool: "vite"
})

CREATE (mobile_platform:Platform {
  id: "mobile_platform", 
  name: "Mobile",
  technology: "React Native",
  build_tool: "metro"
})

CREATE (root_pkg)-[:SERVES]->(web_platform)
CREATE (rn_pkg)-[:SERVES]->(mobile_platform)

// Installation Success Metrics
CREATE (install_metrics:InstallationMetrics {
  id: "install_success_metrics",
  root_packages_added: 0,
  root_packages_removed: 3,
  root_packages_changed: 0,
  root_packages_audited: 1286,
  rn_packages_added: 2,
  rn_packages_removed: 4,
  rn_packages_changed: 36,
  rn_packages_audited: 1289,
  vulnerabilities: 5,
  vulnerability_severity: "moderate"
})

CREATE (install_event)-[:GENERATED]->(install_metrics)

RETURN project, install_event, resolution, install_metrics;