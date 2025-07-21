

import './App.css'
import Search from "./components/Search.jsx";
import {useEffect, useState} from "react";
import {useDebounce} from "react-use";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {getTrendingMovies, updateSearchCount} from "./appWrite.js";


function App() {
    const [searchTerm ,setSearchTerm ] = useState("")
    const [errorMessage, setErrorMessage] = useState('')
    const [movieList, setMovieList] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [trendingMovies, setTrendingMovies] = useState([])
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const API_URL = "https://api.themoviedb.org/3"
    const API_OPTIONS = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${API_KEY}`,
        }

    }




    // prevent  too many API requests

  useDebounce(()=>setDebouncedSearchTerm(searchTerm), 1000,[searchTerm])

    const loadTrendingMovies = async () => {
        try {
            const trendingMovies = await getTrendingMovies();
            setTrendingMovies(trendingMovies);
        }catch (e){
            console.log(e.message);
        }

    }


    const fetchData = async (query='') => {

        setIsLoading(true)
        setErrorMessage("")
        try {
            const endpoint = query ? `${API_URL}/search/movie?query=${encodeURIComponent(query)}` : `${API_URL}/discover/movie?sort_by=popularity.desc`;
            const response = await fetch(endpoint, API_OPTIONS)
           if(!response.ok)
           {
               throw Error(response.statusText)
           }
            const data = await response.json()
            if(data.response === 'false')
            {
                setErrorMessage(data.error || 'error fetching movie')
                setMovieList([]);
                return;

            }
            setMovieList(data.results || []);
            if(query && data.results.length > 0)
            {
                updateSearchCount(query,data.results[0])
            }


        }catch (error) {

            setErrorMessage(error)

        }finally{

            setIsLoading(false)
        }


    }
    useEffect(() => {
    fetchData(debouncedSearchTerm);


    },[debouncedSearchTerm])

    useEffect(()=> {
        loadTrendingMovies();

    },[])
  return (
     <main >
         <div  className="pattern" />
        <div className="wrapper">
            <header>

                <img src="../public/hero.png" alt="Hero banner"/>
            <h1>Find <span className="text-gradient">Movies</span> You'll enjoy without the Hassle </h1>
                <Search  searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </header>


            {trendingMovies.length > 0 && (<section className='trending'>
                <h2>Trending Movies</h2>
            <ul>  {trendingMovies.map((movie,index) => (
                <li key={movie.$id}>
                    <p>{index+1}</p>
                    <img alt={movie.title} src={movie.poster_url}/>

                </li>
            ))}</ul>

            </section>)}
            <section className="all-movies">

                <h2 className="my-10">All Movies</h2>

                {isLoading ? (
                    <Spinner  />
                ) : errorMessage ? (<p className='text-red-500'>{errorMessage}</p>) : (<ul> {movieList.map((movie) => (

                    <MovieCard  key={movie.id} movie={movie}/>
                ))}</ul> )}


            </section>


        </div>

     </main>

  )
}

export default App
