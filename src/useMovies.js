import { useState, useEffect } from "react";

const KEY = "9d526342";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    // callback?.();
    if (!query) return;
    const controller = new AbortController();
    async function fetchMovies() {
      try {
        setisLoading(true);
        setError("");
        const response = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal: controller.signal }
        );

        if (!response.ok) throw new Error("Something went wrong! ");
        const dataRespone = await response.json();
        if (dataRespone.Response === "False")
          throw new Error("Movie not found");
        setMovies(dataRespone.Search);
        setError("");
      } catch (e) {
        if (e.name !== "AbortError") {
          setError(e.message);
        }
      } finally {
        setisLoading(false);
      }
    }
    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }
    fetchMovies();
    return () => controller.abort();
  }, [query]);

  return { movies, isLoading, error };
}
