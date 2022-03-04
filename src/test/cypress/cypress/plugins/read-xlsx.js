const fs = require('fs');
const XLSX = require('xlsx');

const read = ({file, sheet}) => {
   const buff = fs.readFileSync(file);
   const workbook = XLSX.read(buff, { type: 'buffer' });
   return XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
}

const list = ({dir, sheet}) => {
   return fs.readdirSync(dir);

}

const deleteFile = ({filename}) => {
   fs.unlink(filename, (err) => {
      if (err) throw err;
   });
   return null;
}

module.exports = {
   read,
   list, 
   deleteFile
}