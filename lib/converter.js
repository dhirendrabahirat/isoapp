/*--------------------------------------------*/
/* CRUD - Read  All users                     */
/*--------------------------------------------*/

function convertMessage(req,res) {    

   // let gmessage = '0200F020000000000000E04000000000000019486786123456789123r00000000000000010090086';
    
     var schema = {
        "header" :[
            {"fieldId":"0", "fieldName":"MTID", "fieldAttr":"M", "fieldText":"Message_Type_Id", "varLen":0 , "maxLen":4 , "fieldType":"CHAR"},
            {"fieldId":"1", "fieldName":"PBMP", "fieldAttr":"M", "fieldText":"Primary_Bitmap",  "varLen":0 , "maxLen":16, "fieldType":"CHAR"},
            {"fieldId":"2", "fieldName":"SBMP", "fieldAttr":"C", "fieldText":"Secondary_Bitmap","varLen":0 , "maxLen":16, "fieldType":"CHAR"}
        ],        
        "data":[
            {"fieldId":"2", "fieldName":"PANB", "fieldAttr":"M", "fieldText":"PAN",             "varLen":2 , "maxLen":19 ,"fieldType":"NUM"},
            {"fieldId":"3", "fieldName":"PROC", "fieldAttr":"M", "fieldText":"Processing Code", "varLen":0 , "maxLen":6 , "fieldType":"NUM"},
            {"fieldId":"4", "fieldName":"LAMT", "fieldAttr":"M", "fieldText":"LCY Amount",      "varLen":0 , "maxLen":12, "fieldType":"NUM"},
            {"fieldId":"7", "fieldName":"TDAT", "fieldAttr":"M", "fieldText":"Txn Date&Time",   "varLen":0 , "maxLen":10, "fieldType":"NUM"},
            {"fieldId":"11","fieldName":"STAN", "fieldAttr":"M", "fieldText":"STAN",            "varLen":0 , "maxLen":6,  "fieldType":"CHAR"}, 
            {"fieldId":"12","fieldName":"LTIM", "fieldAttr":"M", "fieldText":"Local Time",      "varLen":0 , "maxLen":6,  "fieldType":"NUM"}
          ]       
    };

    // Define Valid MTIs
    var MTISchema = {
        "header": "Valid Message Type Identifiers ",
        "data":['0200','0210','0400','0410','0800','0810']
    };

    // Container for message converter 
    var docs = {};
    
    // Read Input
    let gmessage = req.body.isomessage;
    docs.Incoming_Message = gmessage;
    
    //------------------------------------ 
    //Extract Header Elements (MTI + PBM)    
    //------------------------------------ 
    var headerObj = {};
    var i = 0;
    var err = false;    

    for(h=0; h<schema.header.length;h++) {
        // Mandatory
        if (schema.header[h].fieldAttr == 'M') 
        {
            var len = parseInt(schema.header[h].maxLen);                
            headerObj[schema.header[h].fieldText] = gmessage.slice(i, i+len).toString();          
            var i = i + len; 
        }
        // Conditional
        if (schema.header[h].fieldAttr == 'C') {
            var isValid = checkCondition(schema.header[h],headerObj);    
            if (isValid) { 
                var len = parseInt(schema.header[h].maxLen);      
                headerObj[schema.header[h].fieldText] = gmessage.slice(i, i+len).toString();
                i = i + len;
            }
        }
    }
      

    //------------------------------------ 
    // Validate Header Elements (MTI)    
    //------------------------------------ 
    var isValidMTI = MTISchema.data.indexOf(headerObj.Message_Type_Id);
    if (isValidMTI < 0) {
        docs.fieldID = 'MTI';
        docs.value = docs.Message_Type_Id;
        docs.validation = "Failed";
        return res.status(400).json(docs);
    } 

    // Move header elements to container
    docs.Header = headerObj;


    //------------------------------------
    // Convert Bitmaps (HEX to BIN)
    //------------------------------------
    var pbm_binary = hexToBin(headerObj.Primary_Bitmap);     
    var sbm_binary = (typeof headerObj.Secondary_Bitmap != 'undefined') ? hexToBin(headerObj.Secondary_Bitmap) : '';
    var bitmaps = pbm_binary + sbm_binary;


    //------------------------------------
    // Extract Data Elements
    //------------------------------------
    var dataObj = [];
    var onBits = [];
    var httpStatus = 200; 
    var pos;

    for(j=0;j<bitmaps.length;j++) {

        if (bitmaps[j] === '1') {

            var elementObj = {};
            var flen = 0;
            var fvalue = '';    
            var x = j+1;
            onBits.push(x); 

            // search element position in schema (using fieldId property)
            pos = schema.data.map(function(e) { return e.fieldId; }).indexOf(x.toString()); 
          
            if(pos > -1) 
            {
                // variable length field   
                if (schema.data[pos].varLen > 0) {                                              
                    len = parseInt(schema.data[pos].varLen);
                    flen = parseInt(gmessage.slice(i, (i+len)));
                    i = parseInt(i + len);
                    fvalue = gmessage.slice(i, (i+flen)).toString();                
                    i = parseInt(i + flen);                
                } else {
                // fixed length field                                                               
                    len = schema.data[pos].maxLen;
                    fvalue = gmessage.slice(i, i+len).toString();
                    i = parseInt(i + len);
                } 

                var err = validateBit(schema.data[pos],fvalue);
                httpStatus = (err) ? 400 : httpStatus;

                elementObj.fieldId = schema.data[pos].fieldId;
                elementObj.text =  schema.data[pos].fieldText;
                elementObj.value = fvalue; 
                elementObj.validation = (err) ? 'Error' : 'Success';                    
                dataObj.push(elementObj);
                              
            }
        }
    }
   
    // Move data elements to container
    docs.Data = dataObj;    

    //------------------------------------
    // Format Tailer Elements
    //------------------------------------
    var tailerObj = {};
    tailerObj.Received_Bits = onBits;    
    // Move Tailor elements to container
    docs.Tailer = tailerObj;

        
    // SEND RESPONSE 
    return res.status(httpStatus).json(docs);

} 

//------------------------------------
// Hex to Binary conversion
//------------------------------------
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

//---------------------------------------
// checkConditions for conditional field
//---------------------------------------
function checkCondition(fieldObj,headerObj) {
    //Check SBM present or not
    if(fieldObj.fieldName == "SBMP")  {
        var bitmaps = hexToBin(headerObj.Primary_Bitmap);
        return (bitmaps.slice(0,1).toString() == '1') ? true : false;  
    }        

    return;
}

//------------------------------------
// Helper function - validateFields 
//------------------------------------
function validateBit(fieldObj,fvaluex) {

    var verr = (fieldObj.fieldType === "NUM" && isNaN(fvaluex)) ? true : false ;
    return verr;
    
}

exports.convertMessage = convertMessage;