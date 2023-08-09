'use strict'

import fs from 'fs';

async function readUrlsFromFile(JSONfile) {
  try {
    const data = await fs.promises.readFile(JSONfile, 'utf8');
    const urls = JSON.parse(data);
    return urls
    // Do something with the URLs
  } catch (error) {
    console.error(error);
  }
}

export default readUrlsFromFile