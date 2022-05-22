# A simple webpage to render the JSON file to html page

The original JSON data would be stored in the `<script type="application/ld+json">`. The javascript would convert the content into html `table` when the window loads.

<hr/>
## Static files

[records folder](./records/) contains all JSON record examples.

[template.html](./template.html) contains the template html file.

[src folder](./src) contains all js and css files.

<hr />

## Bundle all JS, css, and html files
The current js, css files are in the different folders. We can use `webpack` to bundle all files into a single [index.html](./build/index.html) file and a single [index.js](./build/index.js) files.
```
npm run build
```

<hr/>

## Inject JSON data into html
[injectJSON.ipynb](injectJSON.ipynb) uses `BeautifulSoup` function in `bs4` library to modfiy the `html` file.

Utilties
```
python3 injectJSON.py path_to_html path_to_json_record
```
This command will print the result html file.
