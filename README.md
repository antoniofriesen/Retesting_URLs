# Purpose
this code tests and retests a list of URLs provided in an array.


## Procedure
1 - get the urls to be tested from file "test.json".
2 - test the urls using axios.
3 - reassign status code 408 to all urls that exceed timeout.
4 - save all urls with status code to a json file called "results.json"
5 - retest all urls with status code 408 till there are none left or max timeout is exceeded.

# TODO

## 24.04.2023

IMPLEMENTATION CHECKLIST

- [x] get the urls to be tested from file "urls2Test.json".
- [x] test the urls using axios.
- [x] reassign status code 408 to all urls that exceed timeout.
- [x] save all the urls with status code in an array called "retest"
- [x] creating a function called retestUrls, that has a while loop that retests all urls inside "retest"
- [x] while loop should reassigned the retested urls with status code != 408 accordingly.
- [x] after every run of the while loop timeout should be increased by 15 seconds
- [x] max timout = 300 seconds (5 min)
- [x] exit while loop after retest array is empty of max timeout exceeded.
- [x] if while loop is exited, but retest array is not empty save urls into results.json with status code 408
