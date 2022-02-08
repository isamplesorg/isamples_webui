// Purpose: This file is to export iSamples customized UI functions
// Suggestions: In this file, we would create several HTML DOM nodes. Using jQuery might be a good idea.
//              Currently, let us check if these work.

// find the current records list
function findTargetElement(node){

    // these are arbitrary paths based on the HTML node tree.
    let listGroup = node.getElementsByClassName("list-group");
    let recordList = listGroup[listGroup.length-1].getElementsByClassName('list-group-item');
    return recordList;
}

// covert field to link
// Please put convertToLink behind highlight function or the highlight function
// will overrite the text node
function convertToLink(field, link, node){
    
    let recordsList = findTargetElement(node);

    for (let record of recordsList){
        // get current record's fields list
        let fieldsNode = record.getElementsByTagName('li');
        for(let fieldNode of fieldsNode){

            // if the current field is our demand, convert it to link
            if(fieldNode.getElementsByTagName('label')[0].innerHTML === field ){

                // childNodes: https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes
                // the value of field is pure string or DOM element
                let oldNode = fieldNode.childNodes[1];
                
                // if there is no value, break.
                if (oldNode.textContent === ""){
                    break;
                }

                // create a new link element
                let newNode = document.createElement('a')
                newNode.setAttribute('href', link + oldNode.textContent);
                // 1) if the childNode is the textNode, we need to use textContent
                // 2) if the childNode is a object, we need to use innerHTML (text, and HTML tags)
                if (oldNode.nodeType === Node.TEXT_NODE){
                    newNode.innerHTML = oldNode.textContent;
                }else{
                    newNode.innerHTML = oldNode.innerHTML;
                }
                
                // replaceChild: https://developer.mozilla.org/en-US/docs/Web/API/Node/replaceChild
                fieldNode.replaceChild(newNode, oldNode);
            }
        }
    }
}

// similar to the function above
function highlight(field, search, node){
    if(search.value === undefined){
        return
    }
    search = search.value;

    let recordsList = findTargetElement(node);

    for (let record of recordsList){
        // get current record's fields list
        let fieldsNode = record.getElementsByTagName('li');
        for(let fieldNode of fieldsNode){

            // if the current field is our demand, convert it to link
            if(fieldNode.getElementsByTagName('label')[0].innerHTML === field ){
                // childNodes: https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes
                // the value of field is pure string or DOM element
                let oldNode = fieldNode.childNodes[1];
                if (oldNode.textContent === ""){
                    break;
                }

                // if the childNode is not the textNode, we need to move down one node
                // the current node is link <a> node. We don't need to change it.
                if (oldNode.nodeType !== Node.TEXT_NODE){
                    fieldNode = oldNode
                    oldNode = oldNode.childNodes[0]
                }
                
                // create a new link element
                let newNode = document.createElement('span')
                // replace "&", "|", "(", ")", "*", "'", """ and duplicated whitespace with only one whitespace
                let searchWords = search.replaceAll(/\&|\*|\(|\)|\||\"|\'/g,"").replaceAll(/\s+/g," ").split(" ");
                // initialize the newText
                let newValue = oldNode.textContent;
                searchWords.map((value) => {
                    let regex = new RegExp(value, "gi");
                    let highlightText = "<span style='background-color:yellow;'>" + value + "</span>";
                    newValue = newValue.replaceAll(regex, highlightText);
                  })
                newNode.innerHTML = newValue;
                
                // replaceChild: https://developer.mozilla.org/en-US/docs/Web/API/Node/replaceChild
                fieldNode.replaceChild(newNode, oldNode);
            }
        }
    }
}

export {convertToLink, highlight};