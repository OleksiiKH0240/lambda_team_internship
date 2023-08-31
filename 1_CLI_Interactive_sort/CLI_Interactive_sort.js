import PromptSync from "prompt-sync";

const prompt = PromptSync();

let inputStr = "";

while (true){

    inputStr = prompt("Hello, Enter 10 words or numbers deviding them in spaces:");

    let values = inputStr.split(" ");

    console.log("How would you like to sort your values:");
    console.log("1. sort words in alphabetic order");
    console.log("2. sort numbers in ascending order");
    console.log("3. sort numbers in descending order");
    console.log("4. sort words in ascending order of letters's quantity in word");
    console.log("5. show only unique words");
    console.log("6. show only unique numbers");
    console.log("select (1 - 5) option or 'exit' and press ENTER");

    inputStr = prompt("");
    if (inputStr == "exit"){
        break;
    }

    let words, numbers;
    words = values.filter((value) => isNaN(value.trim()) && value.trim() != "");
    numbers = values.filter((value) => !isNaN(value.trim()) && value.trim() != "");
    switch (inputStr){
        case "1":
            words = words.sort();
            console.log(words);
            break;
        
        case "2":
            
            numbers = numbers.sort();
            console.log(numbers);
            break;
        
        case "3":
            numbers = numbers.sort((a, b) => b - a);
            console.log(numbers);
            break;
        
        case "4":
            words = words.sort((a, b) => a.length - b.length);
            console.log(words);
            break;
        
        case "5":
            let uniqueWords = [... new Set(words)];

            console.log(uniqueWords);
            break;
        
        case "6":
            let uniqueNumbers = [... new Set(numbers)];
            console.log(uniqueNumbers);
            break;

    }

    // console.log(values);
}
