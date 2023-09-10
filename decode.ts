import * as fs from 'fs';
import * as readline from 'readline';

if(!fs.existsSync('data')) fs.mkdirSync('data');

let lastFile: fs.WriteStream;

const lineReader = readline.createInterface({
    input: fs.createReadStream('resources/intl.txt')
});

lineReader.on('line', function (line) {
    if (line.startsWith('#')) return;
    if (/^\[.*\]/.test(line)) {
        if(lastFile && !lastFile.closed){
            lastFile.close();
        }
        lastFile = fs.createWriteStream(`data/${line.substring(1, line.length - 1)}.txt`);
        return
    }
    lastFile.write(`${line}\n`);
});

lineReader.on('close', function () {
    if(lastFile && !lastFile.closed){
        lastFile.close();
    }
    console.log('done');
});