import { useState, useEffect, useCallback } from "react";
import { TimelinePost } from "@/types";
import { timelineService } from "@/services/timelineService";
import { TimelineFilters, CreateTimelinePostRequest } from "@/types/api";
import { Hex } from "viem";

interface UseTimelineState {
  posts: TimelinePost[];
  loading: boolean;
  error: string | null;
}

interface UseTimelineReturn extends UseTimelineState {
  refetch: () => Promise<void>;
  createPost: (
    address: string,
    postData: CreateTimelinePostRequest
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
      address: Hex,
      postData: CreateTimelinePostRequest
    ): Promise<TimelinePost | null> => {
      try {
        const response = await timelineService.createTimelinePost(
          address,
          postData
        );

        if (response.success) {
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

  const deletePost = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await timelineService.deleteTimelinePost(id);

      if (response.success) {
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
