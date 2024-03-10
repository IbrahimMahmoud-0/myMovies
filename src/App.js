import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "9d526342";
// const query = "sfsd";

export default function App() {
  const [query, setQuery] = useState("");
  // const tempQuery = "interstellar";
  const [selectedId, setSelectedId] = useState(null);
  // const [watched, setWatched] = useState([]);

  const { movies, isLoading, error } = useMovies(query);

  const [watched, setWatched] = useLocalStorageState([], "watched");
  function handleMovieSelection(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <NavBar movies={movies}>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main movies={movies}>
        <Box>
          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
          {!isLoading && !error && (
            <MoviesList
              handleMovieSelection={handleMovieSelection}
              movies={movies}
            />
          )}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              key={selectedId}
              selectedId={selectedId}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function Loader() {
  return <div className="loader"></div>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>🛑</span> {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Search({ query, setQuery }) {
  const inputElement = useRef(null);

  useKey("enter", function () {
    if (document.activeElement === inputElement.current) return;
    inputElement.current.focus();
    setQuery("");
  });

  // useEffect(
  //   function () {
  //     function callback(e) {
  //       if (document.activeElement === inputElement.current) return;
  //       if (e.code === "Enter") {
  //         inputElement.current.focus();
  //         setQuery("");
  //       }
  //     }

  //     document.addEventListener("keydown", callback);

  //     return () => document.removeEventListener("keydown", callback);
  //   },
  //   [setQuery]
  // );

  return (
    <input
      ref={inputElement}
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setisOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setisOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MoviesList({ movies, handleMovieSelection }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          onSelectMovie={handleMovieSelection}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li role="button" onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [currentMovie, setCurrentMovie] = useState({});
  const [isLoading, setisLoading] = useState(false);
  const [error, setError] = useState("");
  const [userRating, setUserRating] = useState("");
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  const countRef = useRef(0);

  useEffect(
    function () {
      if (!userRating) return;
      countRef.current++;
    },
    [userRating]
  );

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
    Plot: plot,
  } = currentMovie;

  // useEffect(
  //   function () {
  //     function callback(e) {
  //       if (e.code === "Escape") {
  //         onCloseMovie();
  //       }
  //     }

  //     document.addEventListener("keydown", callback);
  //     return function () {
  //       document.removeEventListener("keydown", callback);
  //     };
  //   },
  //   [onCloseMovie]
  // );
  useKey("escape", onCloseMovie);

  useEffect(() => {
    async function getMovieDetails() {
      try {
        setisLoading(true);
        setError("");
        const response = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        if (!response.ok) throw new Error("Something went wrong");
        const responseData = await response.json();
        if (responseData.Response === "False")
          throw new Error("Movie not found");
        setCurrentMovie(responseData);
        setisLoading(false);
      } catch (e) {
        setError(e.message);
      } finally {
        setisLoading(false);
      }
    }

    getMovieDetails();
  }, [selectedId]);

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return () => {
        document.title = "usePopcorn";
        // console.log(`clean up for ${title}`);
      };
    },
    [title]
  );
  // const [avgRating, setAvgRating] = useState(0);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };
    onAddWatched(newWatchedMovie);
    // setAvgRating(Number((avgRating + userRating) / 2));
    // onCloseMovie();
  }

  return (
    <>
      {isLoading && <div className="loader"></div>}
      {error && <ErrorMessage message={error} />}
      {!isLoading && !error && (
        <div className="details">
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt="none" />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB rating
              </p>
            </div>
          </header>
          {/* <p>{avgRating}</p> */}
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={"24"}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated this movie {watchedUserRating}
                  <span>⭐</span>
                </p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </div>
      )}
    </>
  );
}

/** ---------------------------------------------------- */

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(1)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          &minus;
        </button>
      </div>
    </li>
  );
}
