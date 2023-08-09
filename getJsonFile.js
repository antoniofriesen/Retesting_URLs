'use strict'

import fs from 'fs';

// This asynchronous function reads URLs from a specified JSON file.
async function readUrlsFromFile(JSONfile) {
    try {
        // Read the content of the JSON file asynchronously.
        const data = await fs.promises.readFile(JSONfile, 'utf8');

        // Parse the JSON data to obtain an array of URLs.
        const urls = JSON.parse(data);

        // Return the array of URLs obtained from the JSON file.
        return urls
    } catch (error) {
        console.error(error);
    }
}

export default readUrlsFromFile