import { useState, useEffect, useCallback } from "react";
import { TimelinePost } from "../types";
import { timelineService } from "../services/timelineService";
import { TimelineFilters, CreateTimelinePostRequest } from "../types/api";

interface UseTimelineState {
  posts: TimelinePost[];
  loading: boolean;
  error: string | null;
}

interface UseTimelineReturn extends UseTimelineState {
  refetch: () => Promise<void>;
  createPost: (
    farmerId: string,
    postData: CreateTimelinePostRequest
  ) => Promise<TimelinePost | null>;
  updatePost: (
    id: string,
    updates: Partial<Pick<TimelinePost, "likes" | "comments">>
  ) => Promise<TimelinePost | null>;
  deletePost: (id: string) => Promise<boolean>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useTimeline(filters?: TimelineFilters): UseTimelineReturn {
  const [state, setState] = useState<UseTimelineState>({
    posts: [],
    loading: true,
    error: null,
  });
  const [hasMore, setHasMore] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);

  const limit = filters?.limit || 10;

  const fetchPosts = useCallback(
    async (offset: number = 0, append: boolean = false) => {
      try {
        if (!append) {
          setState((prev) => ({ ...prev, loading: true, error: null }));
        }

        const response = await timelineService.getTimelinePosts({
          ...filters,
          limit,
          offset,
        });

        if (response.success) {
          setState((prev) => ({
            ...prev,
            posts: append ? [...prev.posts, ...response.data] : response.data,
            loading: false,
          }));

          // Check if we have more posts
          setHasMore(response.data.length === limit);
          setCurrentOffset(offset + response.data.length);
        } else {
          setState((prev) => ({
            ...prev,
            error: response.message || "Failed to fetch timeline posts",
            loading: false,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
          loading: false,
        }));
      }
    },
    [filters, limit]
  );

  const createPost = useCallback(
    async (
      farmerId: string,
      postData: CreateTimelinePostRequest
    ): Promise<TimelinePost | null> => {
      try {
        const response = await timelineService.createTimelinePost(
          farmerId,
          postData
        );

        if (response.success) {
          // Add the new post to the beginning of the list
          setState((prev) => ({
            ...prev,
            posts: [response.data, ...prev.posts],
          }));
          return response.data;
        } else {
          setState((prev) => ({
            ...prev,
            error: response.message || "Failed to create post",
          }));
          return null;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create post";
        setState((prev) => ({ ...prev, error: errorMessage }));
        return null;
      }
    },
    []
  );

  const updatePost = useCallback(
    async (
      id: string,
      updates: Partial<Pick<TimelinePost, "likes" | "comments">>
    ): Promise<TimelinePost | null> => {
      try {
        const response = await timelineService.updateTimelinePost(id, updates);

        if (response.success) {
          // Update the post in the list
          setState((prev) => ({
            ...prev,
            posts: prev.posts.map((post) =>
              post.id === id ? response.data : post
            ),
          }));
          return response.data;
        } else {
          setState((prev) => ({
            ...prev,
            error: response.message || "Failed to update post",
          }));
          return null;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update post";
        setState((prev) => ({ ...prev, error: errorMessage }));
        return null;
      }
    },
    []
  );

  const deletePost = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await timelineService.deleteTimelinePost(id);

      if (response.success) {
        // Remove the post from the list
        setState((prev) => ({
          ...prev,
          posts: prev.posts.filter((post) => post.id !== id),
        }));
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to delete post",
        }));
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete post";
      setState((prev) => ({ ...prev, error: errorMessage }));
      return false;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (hasMore && !state.loading) {
      await fetchPosts(currentOffset, true);
    }
  }, [hasMore, state.loading, currentOffset, fetchPosts]);

  const refetch = useCallback(async () => {
    setCurrentOffset(0);
    setHasMore(true);
    await fetchPosts(0, false);
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    ...state,
    refetch,
    createPost,
    updatePost,
    deletePost,
    loadMore,
    hasMore,
  };
}

interface UseTimelinePostState {
  post: TimelinePost | null;
  loading: boolean;
  error: string | null;
}

interface UseTimelinePostReturn extends UseTimelinePostState {
  refetch: () => Promise<void>;
  likePost: () => Promise<void>;
  incrementComments: () => Promise<void>;
}

export function useTimelinePost(id: string): UseTimelinePostReturn {
  const [state, setState] = useState<UseTimelinePostState>({
    post: null,
    loading: true,
    error: null,
  });

  const fetchPost = useCallback(async () => {
    if (!id) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await timelineService.getTimelinePostById(id);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          post: response.data,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to fetch post",
          loading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        loading: false,
      }));
    }
  }, [id]);

  const likePost = useCallback(async () => {
    if (!state.post) return;

    const newLikes = state.post.likes + 1;

    // Optimistic update
    setState((prev) => ({
      ...prev,
      post: prev.post ? { ...prev.post, likes: newLikes } : null,
    }));

    try {
      await timelineService.updateTimelinePost(id, { likes: newLikes });
    } catch (error) {
      // Revert on error
      setState((prev) => ({
        ...prev,
        post: prev.post ? { ...prev.post, likes: prev.post.likes - 1 } : null,
        error: "Failed to like post",
      }));
    }
  }, [id, state.post]);

  const incrementComments = useCallback(async () => {
    if (!state.post) return;

    const newComments = state.post.comments + 1;

    // Optimistic update
    setState((prev) => ({
      ...prev,
      post: prev.post ? { ...prev.post, comments: newComments } : null,
    }));

    try {
      await timelineService.updateTimelinePost(id, { comments: newComments });
    } catch (error) {
      // Revert on error
      setState((prev) => ({
        ...prev,
        post: prev.post
          ? { ...prev.post, comments: prev.post.comments - 1 }
          : null,
        error: "Failed to update comments",
      }));
    }
  }, [id, state.post]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return {
    ...state,
    refetch: fetchPost,
    likePost,
    incrementComments,
  };
}
