import { useRef, useEffect } from "react";
import { buildAxes, buildSunGraph } from "../d3";

export const Chart = () => {
    const ref = useRef();
    
    useEffect(() => {
      buildAxes(ref.current);
      navigator.geolocation.getCurrentPosition(buildSunGraph);
    }, [])
    return (
        <svg id="chart" ref={ref}/>
    )
};