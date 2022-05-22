import os
import sys
from bs4 import BeautifulSoup

records = os.listdir("./records")

def readFile(path):
    """A function to return the file content

    Args:
      path: a string of file path

    Return:
      file content
    """
    f = open(path, 'r')
    return f.read()

def storeFile(path, content):
    """A function to store modified html file

    Args:
      path: a string of the path of the stored file
      content: the JSON record information
    """
    f = open(path, "w", encoding='utf=8')
    try:
        f.write(content)
        print("Success! " + path)
    except:
        print("Error to write")

def main():
  args = sys.argv[1:]
  try:
    htmlFile = args[0]
    record= args[1]
  except :
    print("Wrong input")


  # Create a beautifulsoup object
  soup = BeautifulSoup(readFile(htmlFile),features="html.parser")

  # Find the target html script tag
  script = soup.find('script', {'type': "application/ld+json"})

  jsonData = readFile(record)

  # Replace original content by the new data
  script.string.replace_with(jsonData)
  print(record.split(".")[-2])
  storeFile(record.split("/")[-1].split(".")[-2] + ".html", str(soup))

if __name__ == "__main__":
    main()
