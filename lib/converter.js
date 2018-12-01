/*--------------------------------------------*/
/* CRUD - Read  All users                     */
/*--------------------------------------------*/

function convertMessage(req,res) {    

    let gmessage = '0200F020000000000000E040000000000000';

    var docs = {};
    docs.message = gmessage;
    
    var i = 0 ;     
    // MTI
    var len = 4;
    docs.mti = gmessage.slice(i, i+len).toString();     
    var i = i + len;     

    // PBM
    var len = 16;
    docs.pbm = gmessage.slice(i, i+len).toString();  
    var bitmaps = hexToBin(docs.pbm);

    var i = i + len;  
    
    //SBM
    var len = 16;
    docs.sbm = gmessage.slice(i, i+len).toString(); 
    var i = i + len;

    var receivedFields = [];
    for(j=0;j<bitmaps.length;j++) {
        if (bitmaps[j] == '1'){
            receivedFields.push(j+1);
        }
    }   

    docs.availableFields = receivedFields;
    
    return res.status(200).json(docs);

} 

function hexToBin(hexaString) {
    
    let bitmaps = '';
    let mapping = {
        '0': '0000',
        '1': '0001',
        '2': '0010',
        '3': '0011',
        '4': '0100',
        '5': '0101',
        '6': '0110',
        '7': '0111',
        '8': '1000',
        '9': '1001',
        'a': '1010',
        'b': '1011',
        'c': '1100',
        'd': '1101',
        'e': '1110',
        'f': '1111',
        'A': '1010',
        'B': '1011',
        'C': '1100',
        'D': '1101',
        'E': '1110',
        'F': '1111',
      };
   
    for (let i = 0; i < hexaString.length; i++){
        bitmaps += mapping[hexaString[i]];
    }
    return bitmaps;
}


exports.convertMessage= convertMessage;