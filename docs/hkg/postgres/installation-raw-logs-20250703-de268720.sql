-- PostgreSQL Raw Log Insert Statements
-- Installation Event UUID: de268720-c912-483c-bdcd-0e68da47f8d7
-- Timestamp: 2025-07-03T05:27:43Z

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS installation_events (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE,
    event_type VARCHAR(255),
    project_id VARCHAR(255),
    command TEXT,
    status VARCHAR(100),
    working_directory TEXT,
    user_agent VARCHAR(255),
    platform VARCHAR(50),
    node_version VARCHAR(50),
    npm_version VARCHAR(50),
    raw_output TEXT,
    error_output TEXT,
    exit_code INTEGER,
    duration_ms INTEGER,
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS dependency_conflicts (
    id UUID PRIMARY KEY,
    installation_event_id UUID REFERENCES installation_events(id),
    timestamp TIMESTAMP WITH TIME ZONE,
    conflict_type VARCHAR(100),
    package_name VARCHAR(255),
    found_version VARCHAR(50),
    required_version VARCHAR(50),
    conflicting_package VARCHAR(255),
    resolution_strategy VARCHAR(100),
    resolved BOOLEAN,
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS package_changes (
    id UUID PRIMARY KEY,
    installation_event_id UUID REFERENCES installation_events(id),
    timestamp TIMESTAMP WITH TIME ZONE,
    package_file_path TEXT,
    change_type VARCHAR(50), -- added, removed, changed
    package_name VARCHAR(255),
    old_version VARCHAR(50),
    new_version VARCHAR(50),
    metadata JSONB
);

-- Insert main installation event
INSERT INTO installation_events (
    id,
    timestamp,
    event_type,
    project_id,
    command,
    status,
    working_directory,
    user_agent,
    platform,
    node_version,
    npm_version,
    raw_output,
    error_output,
    exit_code,
    duration_ms,
    metadata
) VALUES (
    'de268720-c912-483c-bdcd-0e68da47f8d7',
    '2025-07-03T05:27:43Z',
    'npm_install',
    'hello-word-j',
    'npm install',
    'failed_initially_then_resolved',
    '/home/robin/CascadeProjects/Hello-Word-J',
    'Claude Code CLI',
    'linux',
    '>=18',
    'latest',
    'npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
npm error
npm error While resolving: hello-word-j-root@1.0.0
npm error Found: react@18.3.1
npm error node_modules/react
npm error   react@"^18.2.0" from the root project
npm error
npm error Could not resolve dependency:
npm error peer react@"^19.1.0" from react-native@0.80.1
npm error node_modules/react-native
npm error   peer react-native@">=0.14.0" from react-native-sqlite-storage@6.0.1
npm error   node_modules/react-native-sqlite-storage
npm error     react-native-sqlite-storage@"^6.0.1" from the root project',
    'ERESOLVE unable to resolve dependency tree',
    1,
    NULL,
    '{
        "conflict_resolution": "legacy_peer_deps",
        "packages_audited": 1286,
        "vulnerabilities": 5,
        "vulnerability_severity": "moderate",
        "multi_platform": true,
        "architecture": "monorepo"
    }'::jsonb
);

-- Insert successful resolution event
INSERT INTO installation_events (
    id,
    timestamp,
    event_type,
    project_id,
    command,
    status,
    working_directory,
    user_agent,
    platform,
    node_version,
    npm_version,
    raw_output,
    error_output,
    exit_code,
    duration_ms,
    metadata
) VALUES (
    gen_random_uuid(),
    '2025-07-03T05:27:45Z',
    'npm_install_resolution',
    'hello-word-j',
    'npm install --legacy-peer-deps',
    'successful',
    '/home/robin/CascadeProjects/Hello-Word-J',
    'Claude Code CLI',
    'linux',
    '>=18',
    'latest',
    'removed 3 packages, and audited 1286 packages in 1s

214 packages are looking for funding
  run `npm fund` for details

5 moderate severity vulnerabilities

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.',
    NULL,
    0,
    1000,
    '{
        "packages_removed": 3,
        "packages_audited": 1286,
        "vulnerabilities": 5,
        "vulnerability_severity": "moderate",
        "funding_packages": 214,
        "resolution_method": "legacy_peer_deps"
    }'::jsonb
);

-- Insert HelloWord directory installation
INSERT INTO installation_events (
    id,
    timestamp,
    event_type,
    project_id,
    command,
    status,
    working_directory,
    user_agent,
    platform,
    node_version,
    npm_version,
    raw_output,
    error_output,
    exit_code,
    duration_ms,
    metadata
) VALUES (
    gen_random_uuid(),
    '2025-07-03T05:27:44Z',
    'npm_install_subproject',
    'hello-word-j-helloword',
    'cd HelloWord && npm install',
    'successful_with_warnings',
    '/home/robin/CascadeProjects/Hello-Word-J/HelloWord',
    'Claude Code CLI',
    'linux',
    '>=18',
    'latest',
    'added 2 packages, removed 4 packages, changed 36 packages, and audited 1289 packages in 3s

214 packages are looking for funding
  run `npm fund` for details

5 moderate severity vulnerabilities

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.',
    'npm warn ERESOLVE overriding peer dependency
npm warn While resolving: HelloWord@0.1.0
npm warn Found: @types/react@19.1.8
npm warn node_modules/@types/react
npm warn   dev @types/react@"^18.2.0" from the root project
npm warn   1 more (@types/react-test-renderer)
npm warn
npm warn Could not resolve dependency:
npm warn peerOptional @types/react@"^12.0.1" from @react-native/new-app-screen@0.73.0
npm warn node_modules/@react-native/new-app-screen
npm warn   @react-native/new-app-screen@"0.73.0" from the root project',
    0,
    3000,
    '{
        "packages_added": 2,
        "packages_removed": 4,
        "packages_changed": 36,
        "packages_audited": 1289,
        "vulnerabilities": 5,
        "vulnerability_severity": "moderate",
        "funding_packages": 214,
        "react_native_project": true
    }'::jsonb
);

-- Insert dependency conflict details
INSERT INTO dependency_conflicts (
    id,
    installation_event_id,
    timestamp,
    conflict_type,
    package_name,
    found_version,
    required_version,
    conflicting_package,
    resolution_strategy,
    resolved,
    metadata
) VALUES (
    gen_random_uuid(),
    'de268720-c912-483c-bdcd-0e68da47f8d7',
    '2025-07-03T05:27:43Z',
    'peer_dependency_version_mismatch',
    'react',
    '18.3.1',
    '^19.1.0',
    'react-native@0.80.1',
    'legacy_peer_deps',
    true,
    '{
        "error_code": "ERESOLVE",
        "dependency_chain": ["react-native-sqlite-storage@6.0.1", "react-native@0.80.1"],
        "resolution_risk": "potentially_broken_dependency",
        "compatibility_impact": "unknown"
    }'::jsonb
);

-- Insert package change tracking
INSERT INTO package_changes (
    id,
    installation_event_id,
    timestamp,
    package_file_path,
    change_type,
    package_name,
    old_version,
    new_version,
    metadata
) VALUES 
(gen_random_uuid(), 'de268720-c912-483c-bdcd-0e68da47f8d7', '2025-07-03T05:27:45Z', '/package.json', 'removed', 'unknown_package_1', 'unknown', NULL, '{"count": 3}'::jsonb),
(gen_random_uuid(), 'de268720-c912-483c-bdcd-0e68da47f8d7', '2025-07-03T05:27:44Z', '/HelloWord/package.json', 'added', 'unknown_package_1', NULL, 'unknown', '{"count": 2}'::jsonb),
(gen_random_uuid(), 'de268720-c912-483c-bdcd-0e68da47f8d7', '2025-07-03T05:27:44Z', '/HelloWord/package.json', 'removed', 'unknown_package_2', 'unknown', NULL, '{"count": 4}'::jsonb),
(gen_random_uuid(), 'de268720-c912-483c-bdcd-0e68da47f8d7', '2025-07-03T05:27:44Z', '/HelloWord/package.json', 'changed', 'unknown_package_3', 'unknown', 'unknown', '{"count": 36}'::jsonb);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_installation_events_timestamp ON installation_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_installation_events_project_id ON installation_events(project_id);
CREATE INDEX IF NOT EXISTS idx_dependency_conflicts_installation_event_id ON dependency_conflicts(installation_event_id);
CREATE INDEX IF NOT EXISTS idx_package_changes_installation_event_id ON package_changes(installation_event_id);

-- Add comments for documentation
COMMENT ON TABLE installation_events IS 'Raw logs of all NPM/package manager installation events';
COMMENT ON TABLE dependency_conflicts IS 'Detailed tracking of dependency conflicts and resolutions';
COMMENT ON TABLE package_changes IS 'Granular tracking of package additions, removals, and version changes';
COMMENT ON COLUMN installation_events.metadata IS 'JSONB field containing additional structured metadata about the installation';
COMMENT ON COLUMN dependency_conflicts.metadata IS 'JSONB field containing conflict-specific metadata and resolution details';
COMMENT ON COLUMN package_changes.metadata IS 'JSONB field containing change-specific metadata and batch operation details';