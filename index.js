'use strict'

import readUrlsFromFile from "./getJsonFile.js"
import { testUrls,retestUrls } from "./testUrls.js"

// This asynchronous function is the main entry point of the program.
async function main(JSONfile, timeout) {
    try {
        // Display a message indicating that URL testing is starting for the given JSON file and timeout.
        console.log(`Testing URLs in ${JSONfile} with timeout ${timeout / 1000} s`);

        // Read the URLs to be tested from the specified JSON file.
        const urls2Test = await readUrlsFromFile(JSONfile);

        // Perform the initial URL testing using the provided timeout value.
        // The returned data contains URLs that need to be retested.
        const data = await testUrls(urls2Test, timeout);

        // Initiate the retesting process for URLs that initially had a status code of 408.
        await retestUrls(data);
    } catch (error) {
        console.error(error);
    }
}

main('test.json', 1_000)