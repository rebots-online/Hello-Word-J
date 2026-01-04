// Neo4j Documentation for Text Parsing Fix
// UUID: text-parsing-fix-20250703
// Date: 2025-07-03T06:00:00Z
// Issue: CLI using GitHub fetching instead of existing LiturgicalEngineFromDB

// Document the existing architecture
CREATE (db_engine:LiturgicalEngine {
  id: "liturgical_engine_from_db",
  name: "LiturgicalEngineFromDB",
  type: "database_driven_engine",
  file_path: "src/core/services/liturgicalEngineFromDB.ts",
  status: "implemented_and_working",
  database_size: "4MB",
  sections_count: 5924,
  functionality: "complete_mass_text_extraction"
})

CREATE (liturgical_db:Database {
  id: "liturgical_database",
  name: "liturgical-database.db",
  type: "sqlite",
  size: "4MB",
  location: "assets/liturgical-database.db",
  tables: ["sancti_files", "tempora_files", "liturgical_sections", "kalendar_entries"],
  content: "501_sancti_396_tempora_files_with_full_text_extraction"
})

CREATE (cli_tool:CLITool {
  id: "liturgical_cli",
  name: "liturgical-cli.js",
  type: "command_line_interface", 
  file_path: "scripts/liturgical-cli.js",
  issue: "using_github_fetching_instead_of_database",
  solution_needed: "replace_github_logic_with_database_engine"
})

CREATE (github_fetcher:ServiceComponent {
  id: "github_file_fetcher",
  name: "GitHub File Fetching Logic",
  type: "external_dependency",
  status: "should_be_replaced",
  issue: "slow_unreliable_placeholder_approach"
})

CREATE (web_app:WebApplication {
  id: "sanctissimissa_web_app",
  name: "SanctissiMissa Web App",
  type: "progressive_web_app",
  distribution_model: "database_included",
  offline_capability: "full_offline_with_embedded_db"
})

CREATE (android_app:MobileApplication {
  id: "sanctissimissa_android",
  name: "SanctissiMissa Android",
  type: "react_native_app",
  distribution_model: "database_included",
  offline_capability: "full_offline_with_embedded_db"
})

// Document relationships and data flow
CREATE (cli_tool)-[:SHOULD_USE]->(db_engine)
CREATE (cli_tool)-[:CURRENTLY_USES]->(github_fetcher)
CREATE (db_engine)-[:READS_FROM]->(liturgical_db)
CREATE (web_app)-[:WILL_INCLUDE]->(liturgical_db)
CREATE (android_app)-[:WILL_INCLUDE]->(liturgical_db)
CREATE (web_app)-[:USES]->(db_engine)
CREATE (android_app)-[:USES]->(db_engine)

// Document the problem and solution
CREATE (problem:Issue {
  id: "text_parsing_blocker",
  title: "Mass texts not extracted - CLI using wrong method",
  description: "CLI bypassing 4MB database with 5,924 sections, using slow GitHub fetching instead",
  severity: "critical_blocker",
  user_impact: "no_real_liturgical_content_displayed"
})

CREATE (solution:Solution {
  id: "use_database_engine",
  title: "Replace CLI GitHub logic with LiturgicalEngineFromDB",
  implementation: "modify_calculateRealLiturgicalData_function",
  benefits: ["fast_offline_operation", "real_mass_texts", "complete_liturgical_content"]
})

CREATE (problem)-[:RESOLVED_BY]->(solution)
CREATE (solution)-[:IMPLEMENTS]->(db_engine)

// Document distribution architecture
CREATE (distribution:DistributionStrategy {
  id: "embedded_database_distribution",
  strategy: "include_4mb_database_in_app_bundle",
  target_platforms: ["web_pwa", "android_apk"],
  offline_capability: "complete_liturgical_content_available_offline",
  no_external_dependencies: "users_dont_need_neo4j_or_network"
})

CREATE (web_app)-[:USES_STRATEGY]->(distribution)
CREATE (android_app)-[:USES_STRATEGY]->(distribution)
CREATE (liturgical_db)-[:DISTRIBUTED_VIA]->(distribution)

RETURN db_engine, liturgical_db, cli_tool, problem, solution, distribution;