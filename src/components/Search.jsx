import { ReactComponent as SearchIcon } from "../assets/search.svg";

export const Search = ({ getMatches, getLocation, handleInput, city }) => {
    const search = () => getMatches();
    const selectCity = city => getLocation(city._links["city:item"].href);
    window.onkeydown = e => e.key === "Enter" ? search() : null;
    return (
        <div className="form">
            <input
                className="city-name"
                onChange={handleInput}
                value={city.name}
            />
            <ul className="city-list">
                {
                    city.matches.map(
                        (c, i) =>
                            <li
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