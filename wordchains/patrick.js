/*globals console*/

var hitWords = [];

var main = function (command, arg1, arg2) {
    if (command === "words" && arg1 && arg2) {
       var start = new Date();
       var path = findPath(arg1, arg2);
       var end = new Date();
       if (path)  {
            console.log(path.join('\n'));
            console.log((path.length - 1) + ' steps.');
       } else {
            console.log('sorry, there is no chain between "' + arg1 + '" and "' + arg2 + '"');
       }
       console.log('It took ' + (end-start) + ' milliseconds.');
    } else if (command === "test") {
        runUnitTests();
    } else {
        console.log("Usage:\n- node patrick.js words this that\n- node patrick.js test");
    }
};





var findPath = function (source, target) {


    var availableWords = {};

    /*
        Most common letters first. This could be futher optimzied by
        having a separate array for each position in the word (e.g.,
        the letter 'e' is the most common letter, but hardly ever
        the first letter.)
    */
    var letters = 'ETAOINSRHLDCUMFPGWYBVKXJQZ'.toLowerCase().split("");

    var loadWordsOfLength = function (length) {
        var words =  {};
        var data = require('fs').readFileSync("./words");
        data.toString().split('\n').forEach(function(word) {
            if (length === word.length) words[word] = true;
        });
        return words;
    };

    var tryWord = function (word) {
        if (availableWords[word]) {
            availableWords[word] = false;
            hitWords.push(word);
            return true;
        }
        return false;
    };

    var search = function (source, target) {
        return searchExactMatch(source, target) || searchDirectSteps(source, target) || searchIndirectSteps(source, target);
    };

    var searchExactMatch = function (source, target) {
        if (source === target) {
            return [source];
        }
        return false;
    };

    var searchDirectSteps = function(source, target) {

        var i;
        var path;
        var step;
        for (i = 0; i < source.length; i++) {
            step = replaceLetter(source, i, target.charAt(i));
            if (tryWord(step)) {
                path = search(step, target);
                if(path) {
                    return [source].concat(path);
                }

            }
        }

        return false;

    };


    var searchIndirectSteps = function(source, target) {

        var i;
        var letterIndex;
        var path;
        var step;

        for (i = 0; i < source.length; i++) {
            for (letterIndex = 0; letterIndex < letters.length; letterIndex++) {
                step = replaceLetter(source, i, letters[letterIndex]);
                if (tryWord(step)) {
                    path = search(step, target);
                    if(path) {
                        return [source].concat(path);
                    }
                }
            }

        }

        return false;

    };

    var last = function (a) {
        return  a.slice(-1)[0];
    };

    function replaceLetter(word,index,letter) {
        return word.substr(0,index) + letter + word.substr(index+1);
    }

    availableWords = loadWordsOfLength(source.length);
    tryWord(source);

    return search(source, target);
};


var runUnitTests = function () {

    var isNeighboringPair = function (a,b) {
        if (a.length !== b.length) return false;
        var diffs = 0;
        var i;
        for (i = 0; i < a.length; i++) {
            if(a.charAt(i) !== b.charAt(i)) {
                diffs++;
            }
        }
        return diffs === 1;
    };


    var isValidChain = function(chain) {
        var i = chain.length;
        for (i = 0; i < chain.length -1; i++) {
            if(!isNeighboringPair(chain[i], chain[i+1])) {
                return false;
            }
        }
        return true;
    };

    var assertEquals = function (name, expected, actual) {
        if (expected.toString() === actual.toString()) {
            console.log(name +  ": passed");
        } else {
            console.log(name + ': failed -- expected', actual, 'to equal', expected);
        }
    };

    assertEquals('same word', ['cut'], findPath('cut', 'cut'));
    assertEquals('one word away', ['cut', 'cat'], findPath('cut', 'cat'));
    assertEquals('two words away', ['hot', 'cot', 'cat'], findPath('hot', 'cat'));
    assertEquals('three words away', ['hop', 'cop', 'cap', 'cat'], findPath('hop', 'cat'));
    assertEquals('three words away, indirectly', ['find', 'wind', 'wird', 'word'], findPath('find', 'word'));
    assertEquals('"reading" can\'t be connected to "distant"', false, findPath('reading', 'distant'));
    assertEquals('beach,keach,ketch is deemed to be a valid chain', true, isValidChain(['beach', 'keach', 'ketch']));
    assertEquals('beach,keach,pitch is not deemed to be a valid chain', false, isValidChain(['beach', 'keach', 'pitch']));
    assertEquals('beach -> sandy produces a valid chain', true, isValidChain( findPath('beach', 'sandy') ) );
    assertEquals('return -> sender produces a valid chain', true, isValidChain( findPath('return', 'sender') ) );
};


main.apply(null, process.argv.splice(2));

