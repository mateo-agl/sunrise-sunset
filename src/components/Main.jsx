import { Chart } from "./MainComponents/Chart";
import { List } from "./MainComponents/List";

export const Main = ({ city: { fullName, times, timeZone } }) => {
    return (
        <div id="chart-cont">
            <h1 id="title">{fullName}</h1>
            <Chart />
            <List times={times} timeZone={timeZone} />
        </div>
    );
}