import * as fs from 'fs';
import * as readline from 'readline';
const translate = require('@iamtraction/google-translate');

if (!fs.existsSync('translated')) fs.mkdirSync('translated');
const files = fs.readdirSync('translated').sort((a, b)=> {
    a = a.split('.')[0];
    b = b.split('.')[0];
    if(a.startsWith('Map') && !b.startsWith('Map')){
        return -1
    }else if(a.startsWith('Map') && b.startsWith('Map')){
        return (+a.split('p')[1]) - (+b.split('p')[1])
    }else if(!a.startsWith('Map') && b.startsWith('Map')){
        return 1
    }
    return +a - (+b)
})

const main = async () => {
    let output = fs.createWriteStream(`resources/intl_translated.txt`);
    for (const file of files) {
        output.write(`[${file.split('.')[0]}]\n`)
        await new Promise((resolve) => {

            const lineReader = readline.createInterface({
                input: fs.createReadStream(`translated/${file}`)
            });

            lineReader.on('line', (line) => {
               output.write(`${line}\n`);
            });

            lineReader.on('close', function () {
                console.log('done');
                resolve(true);
            });
        });
    }

}

main()