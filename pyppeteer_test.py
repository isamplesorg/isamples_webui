import os
import asyncio
import time
import sys
from pyppeteer import launch

async def main():
    # launch chromium browser in the background
    browser = await launch(executablePath="/usr/bin/google-chrome-stable", headless=True)
    # open a new tab in the browser
    page = await browser.newPage()
    filename = os.path.join(os.getcwd(), "build/index.html")
    print(f"filename is {filename}")
    file_url = f"file://{filename}"
    print(f"going to open {file_url}")
    # add URL to a new page and then open it
    await page.goto(file_url)
    time.sleep(10)
    selector = "ul.solr-search-fields"
    search_fields = await page.querySelector(selector)
    print(f"search fields are {search_fields}")
    sys.exit(1)
    if search_fields is None:
        print("Did not find solr search fields, build is bad!")
        raise SystemExit
    else:
        print("Success")
    # close the browser
    await browser.close()


print("Starting...")
asyncio.get_event_loop().run_until_complete(main())