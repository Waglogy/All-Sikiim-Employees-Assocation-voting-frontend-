'use client';

import { useState, useEffect } from 'react';
import {
  getPostsWithCandidates,
  addPost,
  deletePost,
  addCandidate,
  deleteCandidate,
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
  const [newCandidateName, setNewCandidateName] = useState('');
  const [addingCandidate, setAddingCandidate] = useState(false);

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
    const name = newCandidateName.trim();
    if (!token || !name) return;
    setAddingCandidate(true);
    setError(null);
    try {
      await addCandidate(token, postId, name);
      setNewCandidateName('');
      setNewCandidatePostId(null);
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
                          <span>{c.name}</span>
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
                      value={newCandidatePostId === post.id ? newCandidateName : ''}
                      onChange={(e) => {
                        setNewCandidatePostId(post.id);
                        setNewCandidateName(e.target.value);
                      }}
                      placeholder="New candidate name"
                      className={styles.inputSmall}
                      disabled={addingCandidate}
                    />
                    <button
                      type="submit"
                      className={styles.btnSecondary}
                      disabled={addingCandidate || (newCandidatePostId === post.id && !newCandidateName.trim())}
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
