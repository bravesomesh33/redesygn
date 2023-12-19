const fs = require('fs').promises;

const read = async (filePath, maxLine) => {
    let stat, file;

    try {
        [stat, file] = await Promise.all([fs.stat(filePath), fs.open(filePath, 'r')]);

        let chars = 0;
        let linesCount = 0;
        let lines = [];
        let line = ""
        while(linesCount <= maxLine) {
            const bufferBytes = await file.read(Buffer.alloc(1), 0, 1, stat.size - 1 - chars);
            const nextCharacter = String.fromCharCode(bufferBytes.buffer[0]);
            
            if(nextCharacter === '\n') {
                linesCount++;
                lines.push(line);
                line = ""
            } else {
                line = nextCharacter + line;
            }
            chars++;
        }

        await file.close();
        return lines;
    } catch(error) {
        throw error;
    }
}

module.exports = read;