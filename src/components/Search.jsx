import { ReactComponent as SearchIcon } from "../assets/search.svg";

export const Search = ({ getMatches, getLocation, handleInput, city }) => {
    const search = () => getMatches();
    const selectCity = city => getLocation(city._links["city:item"].href);
    const handleEnter = e => e.key === "Enter" ? search() : null;
    return (
        <div className="search-cont">
            <input
                className="city-name"
                onChange={handleInput}
                value={city.name}
                placeholder="City name"
                onKeyDown={handleEnter}
            />
            <ul className="city-list">
                {
                    city.matches.map(
                        (c, i) =>
                            c === "No matches found"
                            ? <label className="no-city" key={i}>{c}</label>
                            : <li
                                className="city"
                                key={i}
                                onClick={() => selectCity(c)}
                            >
                                <label>{c.matching_full_name}</label>
                            </li>
                    )
                }
            </ul>
            <button 
                className="search-btn"
                onClick={search}
            >
                <SearchIcon className="search-icon"/>
            </button>
        </div>
    )
};