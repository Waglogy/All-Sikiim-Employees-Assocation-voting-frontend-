'use client';

import { useState, useEffect } from 'react';
import { getElectoralVotes, ApiError, ElectoralVoter, ElectoralPagination } from '@/lib/api';
import { generateElectoralRollPDF } from '@/lib/electoralPdfGenerator';
import styles from './ElectoralListModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ElectoralListModal({ isOpen, onClose }: Props) {
  const [voters, setVoters] = useState<ElectoralVoter[]>([]);
  const [pagination, setPagination] = useState<ElectoralPagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchVoters(1);
    } else {
      // Reset state when modal closes
      setVoters([]);
      setPagination(null);
      setCurrentPage(1);
      setError(null);
    }
  }, [isOpen]);

  const fetchVoters = async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getElectoralVotes(page);
      setVoters(data.voters);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load electoral list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && pagination && page <= pagination.total_pages) {
      fetchVoters(page);
      // Scroll to top of modal content
      const modalContent = document.querySelector(`.${styles.modalContent}`);
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (!pagination) return;

    setIsDownloading(true);
    setError(null);

    try {
      // Fetch all voters by making requests for all pages
      const allVoters: ElectoralVoter[] = [];
      const totalPages = pagination.total_pages;

      for (let page = 1; page <= totalPages; page++) {
        const data = await getElectoralVotes(page);
        allVoters.push(...data.voters);
      }

      // Generate PDF with all voters
      generateElectoralRollPDF(allVoters, pagination.total_items);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to download electoral roll. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Electoral List</h2>
          <div className={styles.headerActions}>
            <button
              className={styles.downloadBtn}
              onClick={handleDownloadPDF}
              disabled={!pagination || isDownloading}
              aria-label="Download electoral roll as PDF"
            >
              {isDownloading ? (
                <>
                  <div className={styles.downloadSpinner}></div>
                  Downloading...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download PDF
                </>
              )}
            </button>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {pagination && (
          <div className={styles.summary}>
            <span>Total Voters: <strong>{pagination.total_items.toLocaleString()}</strong></span>
            <span>Page {pagination.current_page} of {pagination.total_pages}</span>
          </div>
        )}

        {error && (
          <div className="alert-error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div className={styles.modalContent}>
          {isLoading && voters.length === 0 ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading voters...</p>
            </div>
          ) : (
            <div className={styles.votersGrid}>
              {voters.map((voter) => (
                <div key={voter.voter_id} className={styles.voterCard}>
                  <div className={styles.profileIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className={styles.voterInfo}>
                    <h3 className={styles.voterName}>{voter.name}</h3>
                    {voter.designation && (
                      <p className={styles.voterDesignation}>{voter.designation}</p>
                    )}
                    <div className={styles.voterDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>ID No:</span>
                        <span className={styles.detailValue}>{voter.id_no}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Form No:</span>
                        <span className={styles.detailValue}>{voter.form_no}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>SL No:</span>
                        <span className={styles.detailValue}>{voter.sl_no}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {pagination && pagination.total_pages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.has_previous_page || isLoading}
              aria-label="Previous page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Previous
            </button>
            
            <div className={styles.pageInfo}>
              <span>Page {pagination.current_page} of {pagination.total_pages}</span>
            </div>

            <button
              className={styles.pageBtn}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.has_next_page || isLoading}
              aria-label="Next page"
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
