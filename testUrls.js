'use strict'

import axios from 'axios';
import fs from 'fs';

export async function testUrls(urls, timeout) {
  try {
    const start = performance.now();
    const results = [];
    const retest = [];
    const chunks = chunkArray(urls, 100);
    const numChunks = chunks.length;
    console.log(`Testing ${urls.length} URLs in ${numChunks} chunks of 100 URLs each.`);

    for (let i = 0; i < numChunks; i++) {
      const chunk = chunks[i];
      const promises = chunk.map(async (url) => {
    try {
      const response = await axios.get(url, { timeout });
      if (response.status >= 300) {
        return { url, status: response.status };
      } else {
        return null;
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        return { url, status: 408 };
      } else if (error.response && error.response.status) {
        return { url, status: error.response.status };
      } else {
        return { url, status: 502 };
      }
    }
  });

      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults.filter((result) => result !== null && result.status !== 408));
      retest.push(...chunkResults.filter((result) => result !== null && result.status === 408)); // push URLs with 408 status code to retest array
      await fs.promises.writeFile('results.json', JSON.stringify(results, null, 2), 'utf8');

      const progress = ((i + 1) / numChunks) * 100;
      process.stdout.write(`Testing chunk ${i + 1} of ${numChunks}. Progress: ${progress.toFixed(2)}%\r`);
    }

    const end = performance.now();
    const totalTestingTime = end - start;
    const totalSeconds = Math.floor(totalTestingTime / 1_000);
    const hours = Math.floor(totalSeconds / 3_600);
    const minutes = Math.floor((totalSeconds % 3_600) / 60);
    const seconds = totalSeconds % 60;

    console.log(`\nTesting complete. Total testing time: ${hours} hours, ${minutes} minutes, ${seconds} seconds.`);
    console.log(`\nNumber of urls with status code 408: ${retest.length}.`);

    return retest;
  } catch (error) {
    console.error(error);
  }
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export async function retestUrls(retest) {
  try {
    const start = performance.now();
    const results = JSON.parse(await fs.promises.readFile('results.json', 'utf8'));
    let timeout = 15_000;

    while (retest.length > 0 && timeout <= 300_000) {
      const chunks = chunkArray(retest, 100);
      const numChunks = chunks.length;
      console.log(`Retesting ${retest.length} URLs in ${numChunks} chunks of 100 URLs each.`);

      for (let i = 0; i < numChunks; i++) {
        const chunk = chunks[i];
        const promises = chunk.map(async ({ url }) => {
          try {
            const response = await axios.get(url, { timeout });
            if (response.status >= 300 && response.status !== 408) {
              results.push({ url, status: response.status });
              return url;
            } else {
              return null;
            }
          } catch (error) {
            if (error.code === 'ECONNABORTED') {
              return url;
            } else if (error.response && error.response.status) {
              if (error.response.status >= 300 && error.response.status !== 408) {
                results.push({ url, status: error.response.status });
                return url;
              } else {
                return null;
              }
            } else {
              return null;
            }
          }
        });

        const chunkResults = await Promise.all(promises);
        retest = retest.filter((result) => chunkResults.includes(result.url));
        await fs.promises.writeFile('results.json', JSON.stringify(results, null, 2), 'utf8');

        const progress = ((i + 1) / numChunks) * 100;
        process.stdout.write(`Retesting chunk ${i + 1} of ${numChunks} with timeout ${timeout}. Progress: ${progress.toFixed(2)}%\r`);
      }

      console.log(`\nRetesting complete. ${retest.length} URLs remaining.`);
      timeout += 15_000;
    }

    const end = performance.now();
    const totalRetestingTime = end - start;
    const totalSeconds = Math.floor(totalRetestingTime / 1_000);
    const hours = Math.floor(totalSeconds / 3_600);
    const minutes = Math.floor((totalSeconds % 3_600) / 60);
    const seconds = totalSeconds % 60;

    console.log(`\nAll retesting complete. Total retesting time: ${hours} hours, ${minutes} minutes, ${seconds} seconds.`);
  } catch (error) {
    console.error(error);
  }
}

export default testUrls