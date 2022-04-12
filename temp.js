

var core = document.createElement('script');
core.type = 'text/javascript';
core.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/core.js';
document.head.appendChild(core);

var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/md5.js';
document.head.appendChild(script);

var axiosscript = document.createElement('script');
axiosscript.type = 'text/javascript';
axiosscript.src = 'https://unpkg.com/axios/dist/axios.min.js';
document.head.appendChild(axiosscript);

var NEXT_ID = 20;



var userkey=getUserKey()
var secret="sPgzy/uPMZsDT9dbb1oMi0ajbIcni9t3po6fY9nJaCKm8ZkWKr9rCuOuaGFAhxmGhEBjvzH5EM/8sqQQzQsgPg=="
//var payload=[{"__class__":"ServerRequest","requestData":[],"requestClass":"InventoryService","requestMethod":"getGreatBuildings","requestId":28}]



function getSignature( payload ){
    var payloadStr = JSON.stringify(payload).replaceAll(' ', '');

    var toEncode = userkey+secret+payloadStr

    var signature = substr(CryptoJS.MD5(toEncode).toString(),1,10)
    return signature
}

function sendPost( payload ){
    const url = "https://fr21.forgeofempires.com/game/json?h=" + userkey;
    
    const options = {
        headers: { 'signature' : getSignature( payload ) }
    }
    axios.post(url, payload, options).then( data=>console.log( data )).catch(err=>console.log( err) )
}

function getNextId(){
    NEXT_ID++;
    if ( NEXT_ID > 254 ){
        NEXT_ID = 0;
    }
    return NEXT_ID;
}

function substr (a, b, c) {
    if (null == c) c = a.length;
    else if (0 >
        c)
        if (0 == b) c = a.length + c;
        else return "";
    return a.substr(b, c)
};


function getUserKey () {
    var regex = new RegExp(".*\\?h=([0-9a-zA-Z_-]+)(&|$)", "")
    var m = regex.exec(gameVars.gatewayUrl);
    return m[1];
}






/// ACCOUNT CREATION
function sendAccountCreationPost( payload ){
    const url = "https://fr21.forgeofempires.com/game/registration";
    
    const options = {
        headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
    }
    axios.post(url, payload, options).then( data=>console.log( data )).catch(err=>console.log( err) )
}

function createNewAccount(){
    var payload = "registration%5Bnickname%5D=Sage8214242&registration%5Bpassword%5D=22122212&registration%5BacceptTerms%5D=1&registration%5Baccepted3rdPartyPixels%5D=1"
    sendAccountCreationPost( payload );
}















/// HIGH LEVEL FUNCTIONS

function getBuildingInfo(){
    var payload = [{"__class__":"ServerRequest","requestData":[],"requestClass":"StartupService","requestMethod":"getData","requestId": getNextId()}]
    return sendPost( payload )
}

function getArmyInfo(){
    var payload = [{"__class__":"ServerRequest","requestData":[{"__class__":"ArmyContext","content":"main"}],"requestClass":"ArmyUnitManagementService","requestMethod":"getArmyInfo","requestId":getNextId()}]
    return sendPost( payload )
}

function testsend(){
    var payload = [{"__class__":"ServerRequest","requestData":["item"],"requestClass":"NoticeIndicatorService","requestMethod":"removeNoticeIndicators","requestId":getNextId()}]
    return sendPost( payload )
}
