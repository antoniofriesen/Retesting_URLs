'use strict'

import axios from 'axios';
import fs from 'fs';

// This function takes an array of URLs and a timeout value as input.
export async function testUrls(urls, timeout) {
    try {
        // Record the start time of the testing process.
        const start = performance.now();

        // Arrays to store the results and URLs that need to be retested.
        const results = [];
        const retest = [];

        // Split the input URLs into chunks of 100 URLs each.
        const chunks = chunkArray(urls, 100);
        const numChunks = chunks.length;

        // Log the number of URLs and chunks being tested.
        console.log(`Testing ${urls.length} URLs in ${numChunks} chunks of 100 URLs each.`);

        // Loop through each chunk of URLs for testing.
        for (let i = 0; i < numChunks; i++) {
            const chunk = chunks[i];

            // Create an array of promises, each representing an HTTP request to a URL.
            const promises = chunk.map(async (url) => {
                try {
                    // Attempt to make an HTTP GET request to the URL with the specified timeout.
                    const response = await axios.get(url, { timeout });
                    // Check the HTTP response status and handle accordingly.
                    if (response.status >= 300) {
                        return { url, status: response.status };
                    } else {
                        return null;
                    }
                } catch (error) {
                    // Handle different types of errors and associate appropriate status codes.
                    if (error.code === 'ECONNABORTED') {
                        return { url, status: 408 };
                    } else if (error.response && error.response.status) {
                        return { url, status: error.response.status };
                    } else {
                        return { url, status: 502 };
                    }
                }
            });

            // Wait for all promises in the current chunk to resolve and collect the results.
            const chunkResults = await Promise.all(promises);

            // Filter and store the results in the respective arrays.
            results.push(...chunkResults.filter((result) => result !== null && result.status !== 408));

            // push URLs with 408 status code to retest array
            retest.push(...chunkResults.filter((result) => result !== null && result.status === 408));

            // Write the results to a JSON file after each chunk is processed.
            await fs.promises.writeFile('results.json', JSON.stringify(results, null, 2), 'utf8');
    
            // Calculate and display progress of testing.
            const progress = ((i + 1) / numChunks) * 100;
            process.stdout.write(`Testing chunk ${i + 1} of ${numChunks}. Progress: ${progress.toFixed(2)}%\r`);
        }

        // Record the end time of the testing process and calculate the total testing time.
        const end = performance.now();
        const totalTestingTime = end - start;

        // Convert total testing time to hours, minutes, and seconds.
        const totalSeconds = Math.floor(totalTestingTime / 1_000);
        const hours = Math.floor(totalSeconds / 3_600);
        const minutes = Math.floor((totalSeconds % 3_600) / 60);
        const seconds = totalSeconds % 60;

        // Display testing completion message along with total testing time.
        console.log(`\nTesting complete. Total testing time: ${hours} hours, ${minutes} minutes, ${seconds} seconds.`);

        // Display the number of URLs that need to be retested due to 408 status code.
        console.log(`\nNumber of urls with status code 408: ${retest.length}.`);

        return retest;
    } catch (error) {
        console.error(error);
    }
}

// This function takes an array and a size as input and splits the array into smaller chunks.
function chunkArray(array, size) {
    // Initialize an array to store the chunks.
    const chunks = [];

    // Use the `slice` method to extract a portion of the array, starting from index `i`
    // and ending at index `i + size`. This creates a chunk of the specified size.
    for (let i = 0; i < array.length; i += size) {
        // Push the chunk into the `chunks` array.
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

// This function retests URLs that had a status code of 408 during the initial testing.
export async function retestUrls(retest) {
    try {
        // Record the start time of the retesting process.
        const start = performance.now();

        // Load the existing results from the 'results.json' file into the 'results' array.
        const results = JSON.parse(await fs.promises.readFile('results.json', 'utf8'));

        // Set an initial timeout value for HTTP requests during retesting.
        let timeout = 15_000;

         // Continue retesting as long as there are URLs to retest and the timeout limit is not exceeded.
        while (retest.length > 0 && timeout <= 300_000) {
            // Split the retest URLs into chunks of 100 URLs each.
            const chunks = chunkArray(retest, 100);
            const numChunks = chunks.length;

            // Log the number of URLs being retested and the number of chunks.
            console.log(`Retesting ${retest.length} URLs in ${numChunks} chunks of 100 URLs each.`);

            // Loop through each chunk of retest URLs for retesting.
            for (let i = 0; i < numChunks; i++) {
                const chunk = chunks[i];

                // Create an array of promises for retesting each URL.
                const promises = chunk.map(async ({ url }) => {
                    try {
                        // Attempt to retest the URL with the specified timeout.
                        const response = await axios.get(url, { timeout });
                        if (response.status >= 300 && response.status !== 408) {
                            results.push({ url, status: response.status });
                            return url;
                        } else {
                            return null;
                        }
                    } catch (error) {
                        // Handle different error scenarios during retesting.
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

                // Wait for all retest promises to resolve and update the 'retest' array.
                const chunkResults = await Promise.all(promises);
                retest = retest.filter((result) => chunkResults.includes(result.url));

                // Write updated results to 'results.json' file after each chunk.
                await fs.promises.writeFile('results.json', JSON.stringify(results, null, 2), 'utf8');

                // Calculate and display progress of retesting.
                const progress = ((i + 1) / numChunks) * 100;
                process.stdout.write(`Retesting chunk ${i + 1} of ${numChunks} with timeout ${timeout}. Progress: ${progress.toFixed(2)}%\r`);
            }

            // Display retesting completion message and the number of remaining URLs for retesting.
            console.log(`\nRetesting complete. ${retest.length} URLs remaining.`);

            // Increase the timeout for subsequent retesting rounds.
            timeout += 15_000;
        }

        // Convert total retesting time to hours, minutes, and seconds.
        const end = performance.now();
        const totalRetestingTime = end - start;
        const totalSeconds = Math.floor(totalRetestingTime / 1_000);
        const hours = Math.floor(totalSeconds / 3_600);
        const minutes = Math.floor((totalSeconds % 3_600) / 60);
        const seconds = totalSeconds % 60;

        // Display retesting completion message along with total retesting time.
        console.log(`\nAll retesting complete. Total retesting time: ${hours} hours, ${minutes} minutes, ${seconds} seconds.`);
    } catch (error) {
        console.error(error);
    }
}

export default testUrls