import axios from "axios";
import { useQuery } from "react-query";
import * as React from "react";

function CacheExample() {
  const { status, data } = useQuery(
    "nameData",
    () => axios.get("/api/cache-example").then(({ data }) => data),
    {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 60 * 1000 * 10, // 10 minutes
    }
  );

  switch (status) {
    case "loading":
      return <p>Loading...</p>;
    case "error":
      return <p>Error!</p>;
    case "success":
      return <p>Name: {data.name}</p>;
    default:
      return null;
  }
}

export default function Home() {
  const [showCacheExample, setShowCacheExample] = React.useState(true);
  const handleClick = React.useCallback(
    () => setShowCacheExample(!showCacheExample),
    [showCacheExample, setShowCacheExample]
  );

  return (
    <div>
      <h1>Caching example</h1>
      <button onClick={handleClick}>Toggle hide/show</button>
      {showCacheExample && <CacheExample />}
    </div>
  );
}
