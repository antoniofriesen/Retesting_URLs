# URL Testing Tool

## Description
The URL Testing Tool is a utility designed to assess the accessibility of a list of URLs provided in a JSON file. It performs initial tests on the URLs, categorizing their response statuses, and conducts retests on those that exceed the specified timeout. The results are saved in a structured format, allowing for easy review and analysis of URL performance.

## Features
- Tests URLs from a JSON file using Axios.
- Handles timeout errors by reassigning a status code of `408` for requests that exceed the timeout limit.
- Automatically retests URLs with a `408` status until they succeed or the maximum timeout is reached.
- Saves the results in a JSON file for easy access and further analysis.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/antoniofriesen/Retesting_URLs.git
   ```

2. **Install dependencies:**
   Ensure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Prepare your input file:**
   Create a JSON file named `urls2Test.json` containing an array of URLs to be tested.

## Usage

1. **Run the application:**
   Execute the script using Node.js:
   ```bash
   node index.js
   ```

2. **Review the results:**
   After execution, check the `results.json` file for the status codes of the tested URLs.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug reports.

## License
This project is licensed under the MIT License.

