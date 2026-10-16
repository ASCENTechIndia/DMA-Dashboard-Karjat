import { useEffect, useRef } from "react";
import * as echarts from "echarts";

export function useEChart(optionFactory, deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return undefined;
    const chart = echarts.init(ref.current);
    chart.setOption(optionFactory());
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, deps);

  return ref;
}

export default useEChart;
