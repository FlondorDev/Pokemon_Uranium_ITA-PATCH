import * as fs from 'fs';
import * as readline from 'readline';
const translate = require('@iamtraction/google-translate');

if (!fs.existsSync('translated')) fs.mkdirSync('translated');
const files = fs.readdirSync('data')
const regex = /\\[^\\[]+\[\d+\]|\\[A-Za-z]/gm;

const translateFn = (text: string) => {
    return async () => {
        const map: string[] = [];
        let count = 0;
        for (const match of text.slice().matchAll(regex)) {
            const replacementText = `[bmg${count}]`
            map.push(match[0]);
            text = text.replace(match[0], replacementText);
            count++;
        }
    
        return translate(text, {
            from: 'en',
            to: 'it'
        }).then((v: any) => {
            map.forEach((value) => {
                v.text = v.text.replace(/\[(\s|)bmg\d+(\s|)\]/, value);
            });
            return v;
        })
            .catch((err: any) => {
                console.log(err);
                process.exit();
            });
    }
}

const main = async () => {
    for (const file of files) {
        const spareText: string[] = [];
        let count = 0;
        let fileLineType = 2;
        let lastFile = fs.createWriteStream(`translated/${file}`);
        const promisesArray: (() => Promise<any>)[][] = []
        let currentArray = 0;
        await new Promise((resolve) => {
            let lineCount = 0;
            const lineReader = readline.createInterface({
                input: fs.createReadStream(`data/${file}`)
            });

            lineReader.on('line', (line) => {
                if (lineCount === 0 && Number.isInteger(+line)) {
                    fileLineType = 3;
                }
                if (lineCount % fileLineType == fileLineType - 1) {
                    if (!promisesArray[currentArray]) {
                        promisesArray.push([]);
                    }
                    if (promisesArray[currentArray].length <= 100) {
                        promisesArray[currentArray].push(translateFn(line));
                        if (promisesArray[currentArray].length > 100) {
                            currentArray++;
                        }
                    }
                } else {
                    spareText.push(line);
                }
                lineCount++;
            });

            lineReader.on('close', function () {
                console.log('done');
                resolve(true);
            });
        });

        for (const promises of promisesArray) {
            const prom = promises.map(p => {
                return p();
            })
            await Promise.allSettled(prom).then((v) => {
                v.forEach(d => {
                    if (d.status == 'fulfilled') {
                        lastFile.write(`${spareText[count]}\n`);
                        if (fileLineType === 3) {
                            count++;
                            lastFile.write(`${spareText[count]}\n`);
                        }
                        lastFile.write(`${d.value.text}\n`);
                    } else {
                        console.log(d);
                        process.exit();
                    }
                    count++;
                })
            });
            await new Promise((resolve)=>{
                setTimeout(()=> {
                    resolve(true);
                },8000);
            })
        }

        if (lastFile && !lastFile.closed) {
            lastFile.close();
        }
    }

}

main()