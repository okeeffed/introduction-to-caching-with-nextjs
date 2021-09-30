// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { performance } from "perf_hooks";
import redis from "redis";
import util from "util";

const redisPort = 6379;
const client = redis.createClient(redisPort);
const key = "example-key";

// Promisify the get command so we can use async/await.
client.get = util.promisify(client.get);

export default async function handler(req, res) {
  try {
    const startTime = performance.now();
    const response = await client.get(key);

    if (response) {
      // This value is considered fresh for ten seconds (s-maxage=5).
      // If a request is repeated within the next 5 seconds, the previously
      // cached value will still be fresh. If the request is repeated before 10 seconds,
      // the cached value will be stale but still render (stale-while-revalidate=10).
      //
      // In the background, a revalidation request will be made to populate the cache
      // with a fresh value. If you refresh the page, you will see the new value.
      res.setHeader("Cache-Control", "public, max-age=5, immutable");
      res.setHeader("X-Cache", "HIT");
      res.status(200).json(JSON.parse(response));
    } else {
      // Waiting 1 second to simulate a slow response from another DB query
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // As a contrived example, let's say this is the expected result from the database
      const data = { name: "John Doe" };

      // Here we are caching the result for 15 seconds to Redis
      client.setex(key, 15, JSON.stringify(data));

      // Set the cache-header
      res.setHeader("Cache-Control", "public, max-age=5, immutable");
      res.setHeader("X-Cache", "MISS");
      res.status(200).json(data);
    }

    const endTime = performance.now();
    console.log(`Call took ${endTime - startTime} milliseconds`);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}
