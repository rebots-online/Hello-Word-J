/**
 * DatabaseImportProgress.tsx
 * UI component for showing liturgical database import progress
 * 
 * Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.
 */

import React from 'react';
import { ImportProgress, ImportResult } from '../core/services/LiturgicalDatabaseImporter';

interface DatabaseImportProgressProps {
  progress: ImportProgress | null;
  result: ImportResult | null;
  isVisible: boolean;
  onComplete?: () => void;
}

export const DatabaseImportProgress: React.FC<DatabaseImportProgressProps> = ({
  progress,
  result,
  isVisible,
  onComplete
}) => {
  if (!isVisible) return null;

  const getPhaseLabel = (phase: ImportProgress['phase']) => {
    switch (phase) {
      case 'downloading':
        return 'Downloading liturgical data...';
      case 'parsing':
        return 'Parsing database...';
      case 'importing':
        return `Importing ${progress?.table || 'data'}...`;
      case 'complete':
        return result?.success ? 'Import complete!' : 'Import failed';
      default:
        return 'Preparing...';
    }
  };

  const getPhaseIcon = (phase: ImportProgress['phase']) => {
    switch (phase) {
      case 'downloading':
        return '⬇️';
      case 'parsing':
        return '📄';
      case 'importing':
        return '💾';
      case 'complete':
        return result?.success ? '✅' : '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className="database-import-overlay">
      <div className="database-import-modal">
        <h2>{getPhaseIcon(progress?.phase || 'downloading')} Liturgical Data Import</h2>
        
        {progress && (
          <div className="progress-section">
            <p className="phase-label">{getPhaseLabel(progress.phase)}</p>
            
            {progress.phase !== 'complete' && (
              <>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                
                <p className="progress-stats">
                  {progress.current.toLocaleString()} / {progress.total.toLocaleString()} records
                  {' '}
                  ({progress.percentage}%)
                </p>
                
                {progress.table && (
                  <p className="current-table">Table: {progress.table}</p>
                )}
              </>
            )}
          </div>
        )}
        
        {result && (
          <div className="result-section">
            {result.success ? (
              <>
                <p className="success-message">
                  ✅ Successfully imported {result.totalRecords.toLocaleString()} records
                </p>
                <p className="tables-imported">
                  Tables: {result.tablesImported.join(', ')}
                </p>
                <button onClick={onComplete} className="complete-button">
                  Continue to App
                </button>
              </>
            ) : (
              <>
                <p className="error-message">
                  ❌ Import failed: {result.error}
                </p>
                <button onClick={() => window.location.reload()} className="retry-button">
                  Retry
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      <style>{`
        .database-import-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .database-import-modal {
          background: var(--bg-primary, #fff);
          border-radius: 12px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .database-import-modal h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
          text-align: center;
          color: var(--text-primary, #333);
        }
        
        .progress-section {
          margin-bottom: 1.5rem;
        }
        
        .phase-label {
          font-size: 1.1rem;
          margin-bottom: 1rem;
          color: var(--text-secondary, #666);
          text-align: center;
        }
        
        .progress-bar {
          width: 100%;
          height: 12px;
          background: var(--bg-tertiary, #e0e0e0);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #8BC34A);
          transition: width 0.3s ease;
          border-radius: 6px;
        }
        
        .progress-stats {
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-secondary, #666);
          margin: 0.5rem 0;
        }
        
        .current-table {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-tertiary, #999);
          margin: 0;
          font-style: italic;
        }
        
        .result-section {
          text-align: center;
        }
        
        .success-message {
          color: #4CAF50;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        
        .tables-imported {
          font-size: 0.9rem;
          color: var(--text-secondary, #666);
          margin-bottom: 1.5rem;
        }
        
        .error-message {
          color: #f44336;
          font-size: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .complete-button,
        .retry-button {
          padding: 0.75rem 2rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        
        .complete-button {
          background: #4CAF50;
          color: white;
        }
        
        .retry-button {
          background: #f44336;
          color: white;
        }
        
        .complete-button:hover,
        .retry-button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default DatabaseImportProgress;
