import { Card } from "react-bootstrap";
import { Chart } from "./MainComponents/Chart";
import { List } from "./MainComponents/List";

export const Main = ({ city: { fullName, times, timeZone } }) => (
    <Card className="py-4 mt-4 mx-auto shadow rounded-1">
        <h1 className="mx-auto">{fullName}</h1>
        <Chart />
        <List times={times} timeZone={timeZone} />
    </Card>
)