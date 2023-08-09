'use strict'

import readUrlsFromFile from "./getJsonFile.js"
import { testUrls,retestUrls } from "./testUrls.js"

async function main(JSONfile, timeout) {
    try {
        console.log(`Testing URLs in ${JSONfile} with timeout ${timeout / 1000} s`);
        const urls2Test = await readUrlsFromFile(JSONfile);
        const data = await testUrls(urls2Test, timeout);
        await retestUrls(data);
        // console.log('urls2Test: ', urls2Test);
    } catch (error) {
        console.error(error);
    }
}

main('test.json', 1_000)