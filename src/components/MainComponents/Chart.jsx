import { useRef, useEffect } from "react";
import { buildAxes } from "../../d3";

export const Chart = () => {
  const ref = useRef();
  
  useEffect(() => buildAxes(ref.current), []);

  return (
    <svg id="chart" ref={ref}/>
  )
};