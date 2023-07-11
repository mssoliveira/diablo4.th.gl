import { useEffect, useState } from "react";
import useSWR from "swr";
import { getRecentEvents } from "../lib/events";
import Helltide from "./helltide";
import Legion from "./legion";
import WanderingDeath from "./wanderingDeath";

export default function Timers() {
  const [time, setTime] = useState(Date.now);
  const { data, mutate } = useSWR("/api/events/recent", getRecentEvents, {
    refreshInterval: 60000,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setTime(Date.now());
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [time]);

  return (
    <>
      <Helltide onRefreshRecentEvents={mutate} time={time} />
      <WanderingDeath
        recentEvents={data}
        onRefreshRecentEvents={mutate}
        time={time}
      />
      <Legion recentEvents={data} onRefreshRecentEvents={mutate} time={time} />
    </>
  );
}
