// node script.js to run code

const axios = require('axios');
const cheerio = require('cheerio');
const url = "https://en.wikipedia.org/wiki/Special:Random";
let pages = [];
console.log(fetchData(url));

async function fetchData(urlLink){
    // make http call to url
    let response = await axios(urlLink).catch((err) => console.log(err));

    if(response.status !== 200){
        console.log("Error occurred while fetching data");
        return;
    }

    const html = response.data;
    const $ = cheerio.load(html);
    let paragraph = $(".mw-parser-output > p").not(".mw-empty-elt").html();
    setTimeout(() => { 
        let link = findLink(paragraph);
        if (link == null)
            return "No path to Philosophy";
        let title = link.substring(("https://en.wikipedia.org/wiki/").length, link.length);
        console.log(title);
        if (!pages.includes(title))
            pages.push(title);
        else
            return "Infinite loop; no path to Philosophy";
        if (link != "https://en.wikipedia.org/wiki/Philosophy") 
            return fetchData(link);
        else
            return "Philosophy";
     }, 500);
}

function findLink(string) {
    string = removeParentheses(string);
    string = removeSup(string);
    let link = ""; 
    for (let i = 0; i<string.length-9; i++) {
        if (string.substring(i, i+9) == "<a href=\"") {
            for (let j = i+9; j<string.length; j++) {
                if (string.charAt(j) == "\"")
                    return "https://en.wikipedia.org"+link;
                link += string.charAt(j);
            }
        }
    }
    return null;
}

function removeParentheses(string) {
    let count = 0;
    let start = -1;
    let link = false;
    for (let i = 0; i<string.length-9; i++) {
        if (string.substring(i, i+9) == "<a href=\"")
            link = true;
        else if (string.substring(i, i+3) == "/a>")
            link = false;
        if (string.charAt(i) == "(" && !link) {
            count++;
            if (count == 1)
                start = i;
        }
        else if (string.charAt(i) == ")" && !link) {
            count--;
            if (count == 0) {
                return removeParentheses(string.substring(0, start) + string.substring(i+1, string.length));
            }
        }
    }
    return string;
}
function removeSup(string) {
    let start = -1; 
    for (let i = 0; i<string.length-5; i++) {
        if (string.substring(i, i+4) == "<sup")
            start = i;
        else if (string.substring(i, i+5) == "/sup>")
            return removeSup(string.substring(0, start) + string.substring(i+4, string.length));
    }
    return string;
}