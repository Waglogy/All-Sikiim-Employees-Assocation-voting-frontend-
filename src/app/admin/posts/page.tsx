'use client';

import { useState, useEffect } from 'react';
import {
  getPostsWithCandidates,
  addPost,
  deletePost,
  addCandidate,
  deleteCandidate,
  getVoterBySerial,
  ApiError,
  PostWithCandidates,
} from '@/lib/api';
import { getAdminToken } from '@/lib/auth';
import styles from './posts.module.css';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostWithCandidates[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newPostTitle, setNewPostTitle] = useState('');
  const [addingPost, setAddingPost] = useState(false);

  const [newCandidatePostId, setNewCandidatePostId] = useState<number | null>(null);
  const [newCandidateVoterSlNo, setNewCandidateVoterSlNo] = useState('');
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateImage, setNewCandidateImage] = useState<File | null>(null);
  const [addingCandidate, setAddingCandidate] = useState(false);
  const [lookupVoterLoading, setLookupVoterLoading] = useState(false);

  const fetchPosts = async () => {
    const token = getAdminToken();
    if (!token) return;
    setError(null);
    try {
      const res = await getPostsWithCandidates();
      setPosts(res.posts ?? []);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAdminToken();
    const title = newPostTitle.trim();
    if (!token || !title) return;
    setAddingPost(true);
    setError(null);
    try {
      await addPost(token, title, true);
      setNewPostTitle('');
      showSuccess('Post added.');
      await fetchPosts();
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to add post.');
    } finally {
      setAddingPost(false);
    }
  };

  const handleLookupVoter = async () => {
    const token = getAdminToken();
    const voterSlNo = newCandidateVoterSlNo.trim();
    if (!token || !voterSlNo) return;
    setLookupVoterLoading(true);
    setError(null);
    try {
      const res = await getVoterBySerial(token, voterSlNo);
      setNewCandidateName(res.name ?? '');
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Voter not found.');
    } finally {
      setLookupVoterLoading(false);
    }
  };

  const handleDeletePost = async (postId: number, title: string) => {
    const token = getAdminToken();
    if (!token || !confirm(`Delete post "${title}"? This will remove all candidates and votes for this post.`)) return;
    setError(null);
    try {
      await deletePost(token, postId);
      showSuccess('Post deleted.');
      await fetchPosts();
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to delete post.');
    }
  };

  const handleAddCandidate = async (e: React.FormEvent, postId: number) => {
    e.preventDefault();
    const token = getAdminToken();
    const voterSlNo = newCandidateVoterSlNo.trim();
    const name = newCandidateName.trim();
    if (!token || !voterSlNo || !name) return;
    setAddingCandidate(true);
    setError(null);
    try {
      await addCandidate(token, postId, voterSlNo, name, newCandidateImage ?? undefined);
      setNewCandidateVoterSlNo('');
      setNewCandidateName('');
      setNewCandidatePostId(null);
      setNewCandidateImage(null);
      showSuccess('Candidate added.');
      await fetchPosts();
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to add candidate.');
    } finally {
      setAddingCandidate(false);
    }
  };

  const handleDeleteCandidate = async (postId: number, candidateId: number, name: string) => {
    const token = getAdminToken();
    if (!token || !confirm(`Delete candidate "${name}"?`)) return;
    setError(null);
    try {
      await deleteCandidate(token, postId, candidateId);
      showSuccess('Candidate deleted.');
      await fetchPosts();
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to delete candidate.');
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>Posts & Candidates</h1>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Posts & Candidates</h1>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className={styles.success} role="status">
          {success}
        </div>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Add post</h2>
        <form onSubmit={handleAddPost} className={styles.form}>
          <input
            type="text"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            placeholder="Post title"
            className={styles.input}
            disabled={addingPost}
          />
          <button type="submit" className={styles.btnPrimary} disabled={addingPost || !newPostTitle.trim()}>
            {addingPost ? 'Adding...' : 'Add post'}
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Posts</h2>
        {posts.length === 0 ? (
          <p className={styles.empty}>No posts yet. Add one above.</p>
        ) : (
          <div className={styles.postList}>
            {posts.map((post) => (
              <div key={post.id} className={styles.postCard}>
                <div className={styles.postHeader}>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id, post.title)}
                    className={styles.btnDanger}
                    title="Delete post"
                  >
                    Delete post
                  </button>
                </div>
                <div className={styles.candidates}>
                  <p className={styles.candidatesLabel}>Candidates:</p>
                  {post.candidates?.length ? (
                    <ul className={styles.candidateList}>
                      {post.candidates.map((c) => (
                        <li key={c.id} className={styles.candidateItem}>
                          <span className={styles.candidateRow}>
                            {c.image_url ? (
                              <img
                                src={c.image_url}
                                alt=""
                                className={styles.candidateThumb}
                              />
                            ) : (
                              <span className={styles.candidatePlaceholder}>
                                {c.name.charAt(0)}
                              </span>
                            )}
                            <span>{c.name}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCandidate(post.id, c.id, c.name)}
                            className={styles.btnDangerSmall}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.noCandidates}>No candidates</p>
                  )}
                  <form
                    onSubmit={(e) => handleAddCandidate(e, post.id)}
                    className={styles.addCandidateForm}
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newCandidatePostId === post.id ? newCandidateVoterSlNo : ''}
                      onChange={(e) => {
                        if (newCandidatePostId !== post.id) setNewCandidateImage(null);
                        setNewCandidatePostId(post.id);
                        setNewCandidateVoterSlNo(e.target.value);
                      }}
                      onBlur={() => {
                        if (newCandidatePostId === post.id && newCandidateVoterSlNo.trim()) {
                          handleLookupVoter();
                        }
                      }}
                      placeholder="Voter SL No."
                      className={styles.inputSmall}
                      disabled={addingCandidate}
                      title="Voter serial number (voters.vtr_sl_no) - required"
                    />
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={handleLookupVoter}
                      disabled={addingCandidate || lookupVoterLoading || !newCandidateVoterSlNo.trim() || newCandidatePostId !== post.id}
                      title="Fetch voter name from electoral roll"
                    >
                      {lookupVoterLoading ? '…' : 'Lookup'}
                    </button>
                    <input
                      type="text"
                      value={newCandidatePostId === post.id ? newCandidateName : ''}
                      onChange={(e) => {
                        if (newCandidatePostId !== post.id) setNewCandidateImage(null);
                        setNewCandidatePostId(post.id);
                        setNewCandidateName(e.target.value);
                      }}
                      placeholder="Candidate name"
                      className={styles.inputSmall}
                      disabled={addingCandidate}
                    />
                    <label className={styles.fileLabel}>
                      <span className={styles.fileLabelText}>Photo (optional)</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className={styles.fileInput}
                        onChange={(e) => {
                          if (newCandidatePostId !== post.id) setNewCandidateName('');
                          setNewCandidatePostId(post.id);
                          const file = e.target.files?.[0];
                          setNewCandidateImage(file ?? null);
                        }}
                        disabled={addingCandidate}
                      />
                      {newCandidatePostId === post.id && newCandidateImage && (
                        <span className={styles.fileName}>{newCandidateImage.name}</span>
                      )}
                    </label>
                    <button
                      type="submit"
                      className={styles.btnSecondary}
                      disabled={addingCandidate || (newCandidatePostId === post.id && (!newCandidateVoterSlNo.trim() || !newCandidateName.trim()))}
                    >
                      Add candidate
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
