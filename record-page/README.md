# A simple webpage to render the JSON file to html page

The original JSON data would be stored in the `<script type="application/ld+json">`. The javascript would convert the content into html `table` when the window loads.

<hr/>

## Static files

[records folder](./records/) contains all JSON record examples.

[src folder](./src) contains all js and css files.

We use [jsdelivr](https://www.jsdelivr.com/?docs=gh) to link and execute the files hosted on GitHub so we don't need to use bundlejs since we only have one css file and one js file.

<hr/>

## Inject JSON data into html
[injectJSON.ipynb](injectJSON.ipynb) uses `BeautifulSoup` function in `bs4` library to modfiy the `html` file.

Utilties
```
python3 injectJSON.py path_to_html path_to_json_record
```
This command will print the result html file.
