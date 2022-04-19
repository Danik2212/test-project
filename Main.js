// ==UserScript==
// @name         Forge all
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      /.*forgeofempires.*/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=forgeofempires.com
// @require      https://unpkg.com/axios/dist/axios.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/core.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/md5.js
// @grant GM_setValue
// @grant GM_getValue
// @grant unsafeWindow

// ==/UserScript==

(async function() {
    'use strict';
    unsafeWindow.WORKER_ID = 1;
})();

$(document).ready(async function() { manageState() });

// 3 minute timeout
setTimeout(resetState, 180000);

var NEXT_ID = 20;

var SEND_FUNC = XMLHttpRequest.prototype.send;
var STOP_SEND_FUNC = function() {return false;}

/// STATE MANAGER

async function manageState(){
    
    console.log("Getting status..");
    var status = await getStatus();
    if ( status != 1 ){
        console.log( "Worker inactive... waiting for activation")
        await waitForStatusToBeActive();
    }
    console.log( "Worker active!");
    console.log("Getting state...");
    var state = await getState();
    console.log("State:" + state);

    while(1){
        var state = await getState();
        var pauseNeeded = await getPauseNeeded();
        if ( pauseNeeded && state == "disconnect"){
            await setStatus(0);
            await setPauseNeeded(0);
            await navigateTo( "https://fr0.forgeofempires.com/page/");
        }

        console.log("Executing " + state );
        await new Promise(r => setTimeout(r, 2000));
        if( state == "disconnect" ){
            if ( await logout() ){
                await setState("loggedout");
                continue;
            }
        }

        else if ( state == "loggedout" ){
            if ( await goToLoginPage() ){
                await setState("loginPage");
                continue;
            }
        }

        else if ( state == "loginPage" ){
            var nextAccount = await getNextAccount();
            await setAccountId( nextAccount.accountId);
            console.log(nextAccount);
            if ( nextAccount.accountId > 0 ){
                await setState("login");
                continue;
            }
            else{
                await setState("createAccount");
                continue;
            }
        }

        else if ( state == "login" ){
            var accountId = await getAccountId();
            console.log( accountId );
            var account = await getAccount(accountId);
            console.log( account );
            if ( login( account ) ){
                await setState("logToWorld");
                await reload()
            }
        }

        else if ( state == "createAccount" ){
            if ( await createNewAccount() ){
                await setState("inWorld");
                var redirect_url = await GM_getValue("redirect_url");
                console.log( redirect_url );
                await navigateTo( redirect_url );
            }
        }

        else if ( state == "logToWorld"){
            if ( await logToWorld() ){
                await setState("inWorld")
            }
        }

        else if ( state == "inWorld"){
            if ( await doStep() ){
                await setState("disconnect")
            }
        }

        await new Promise(r => setTimeout(r, 200));

    }
}

async function resetState(){
    await setState("disconnect")
    await reload();
}

async function waitForStatusToBeActive(){
    while(1){
        await new Promise(r => setTimeout(r, 5000));
        var status = await getStatus();
        if ( status == 1 ){
            return;
        }
        console.log("Waiting for worker to activate");

    }
}



/// CORE FUNCTIONS

async function axiosGet( url ){
    XMLHttpRequest.prototype.send = SEND_FUNC;
    try{
        var res = await axios.get(url);
        return res;
    }
    catch( err ){
        console.log( err );
        await new Promise(r => setTimeout(r, 20000));
    }

}

async function axiosPost( url, params, options ){
    XMLHttpRequest.prototype.send = SEND_FUNC;
    try{
        var res = await axios.post(url, params, options);
        return res;
    }
    catch( err ){
        console.log( err );
        await new Promise(r => setTimeout(r, 20000));
    }
}

async function navigateTo( url ){
    document.location = url;
    await new Promise(r => setTimeout(r, 100000));
} 

async function reload(){
    document.location.reload();
    await new Promise(r => setTimeout(r, 100000));
}

function getSignature( payload ){
    var payloadStr = JSON.stringify(payload).replaceAll(' ', '');
    var secret = getSecret()
    var userkey = getUserKey();
    var toEncode = userkey+secret+payloadStr

    var signature = substr(CryptoJS.MD5(toEncode).toString(),1,10)
    return signature
}

async function sendPost( payload ){
    var userkey = getUserKey();
    const url = "https://" + gameVars.world_id + ".forgeofempires.com/game/json?h=" + userkey;

    const options = {

        headers: {  'Accept': '*/*',
                    'client-identification': "version=1.228; requiredVersion=1.228; platform=bro; platformType=html5; platformVersion=web",
                    'signature' : getSignature( payload ) }
    }
    var res = await axiosPost(url, payload, options);
    XMLHttpRequest.prototype.send = STOP_SEND_FUNC;
    console.log( res );
    return res;
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

function getSecret(){
    var secret="ikTMs6KXmPIgazF3nLBmOW/DLOSyGtkQA9epfrN/MrNJIuCnY+kXNmeA9yEGMsGoODPGPG9oOCfxZxmr3RAWWg=="
    return secret;
}


/// SERVER CALLS

async function getNextAccount(){
    const url = "http://localhost:3000/accounts/ready/";

    var res = await axiosGet(url);

    return res.data;
}

async function getSettings(){
    const url = "http://localhost:3000/settings/";

    var res = await axiosGet(url);

    return res.data;
}

async function saveNewAccount(account){
    const url = "http://localhost:3000/accounts/create";

    var res = await axiosPost(url, account);

    return res.data.accountId;
}

async function getAccount(id){
    const url = "http://localhost:3000/accounts/account/" + id;

    var res = await axiosGet(url);

    return res.data;
}

async function updateAccount(account){
    const url = "http://localhost:3000/accounts/update";


    var res = await axiosPost(url, account);

    return res.data.accountId;
}

async function getStatus(){
    const url = "http://localhost:3000/worker/status/get/" + unsafeWindow.WORKER_ID;

    var res = await axiosGet(url);
    console.log( res );
    return res.data[0].status;
}

async function getState(){
    const url = "http://localhost:3000/worker/state/get/" + unsafeWindow.WORKER_ID;

    var res = await axiosGet(url);

    return res.data[0].state;
}

async function getAccountId(){
    const url = "http://localhost:3000/worker/accountId/get/" + unsafeWindow.WORKER_ID;

    var res = await axiosGet(url);

    return res.data[0].accountId;
}

async function getPauseNeeded(){
    const url = "http://localhost:3000/worker/pause/get/" + unsafeWindow.WORKER_ID;

    var res = await axiosGet(url);

    return res.data[0].pause;
}


async function setStatus( status){
    const url = "http://localhost:3000/worker/status/set/";

    var params = {
        "id": unsafeWindow.WORKER_ID,
        "status": status
    }
    var res = await axiosPost(url, params);

    return res.data;
}

async function setState( state ){
    const url = "http://localhost:3000/worker/state/set/";

    var params = {
        "id": unsafeWindow.WORKER_ID,
        "state": state
    }
    var res = await axiosPost(url, params);

    return res.data;
}

async function setAccountId( accountId ){
    const url = "http://localhost:3000/worker/accountId/set/";

    var params = {
        "id": unsafeWindow.WORKER_ID,
        "accountId": accountId
    }
    var res = await axiosPost(url, params);

    return res.data;
}

async function setPauseNeeded( state ){
    const url = "http://localhost:3000/worker/pause/set/";

    var params = {
        "id": unsafeWindow.WORKER_ID,
        "pause": state
    }
    var res = await axiosPost(url, params);

    return res.data;
}




/// LOGOUT

async function logout( ){
    if ( document.location.href != 'https://fr0.forgeofempires.com/page/'){
        await navigateTo( 'https://fr0.forgeofempires.com/page/' );
        return false;
    }

    if ( document.getElementsByClassName("playername")[0].textContent.length > 0 )
    {
        document.getElementsByName("csrf")[0].form.submit();
    }
    else
    {
        return true;
    }
}


/// LOGIN AND ACCOUNT CREATION

async function goToLoginPage(){
    if ( document.location.href != 'https://fr.forgeofempires.com/'){
        await navigateTo( 'https://fr.forgeofempires.com/' );
        return false;
    }else{
        return true;
    }

}


async function login( nextAccount ){
    if ( nextAccount.step == 0 ){
        await setState("inWorld");
        await navigateTo( nextAccount.redirect_url );
        return 
    }
    else if ( document.location.href != 'https://fr.forgeofempires.com/' )
    {
        await navigateTo( 'https://fr.forgeofempires.com/' );
        return false;
    }

    var username = nextAccount.name;
    var password = nextAccount.password;
    console.log( nextAccount );
    var payload = "registration[nickname]=" + username + "&registration[password]=" + password + "&registration[acceptTerms]=1&registration[accepted3rdPartyPixels]=1"
    var encodedPayload = encodeURI( payload );
    var res = await sendAccountCreationPost( encodedPayload );
    if ( res.data.success == false ){
        await reload();
    }
    return true;
}


async function createNewAccount(){
    var settings = await getSettings();

    if ( document.location.href != settings.url )
    {
        await navigateTo( settings.url );
        return false;
    }

    var username = getRandomUsername();
    var password = getRandomPassword();
    var payload = "registration[nickname]=" + username + "&registration[password]=" + password + "&registration[acceptTerms]=1&registration[accepted3rdPartyPixels]=1"
    var encodedPayload = encodeURI( payload );
    var res = await sendAccountCreationPost( encodedPayload );

    if ( res.data.success == false ){
        await navigateTo( settings.url );
    }
    var account = {
        name: username,
        password: password,
        step: 0,
        world: settings.world,
        type: settings.type,
        readyOn: new Date().toISOString().slice(0, 19).replace('T', ' '),
        redirect_url: res.data.redirect_url,
        locked: 1
    }
    var accountId = await saveNewAccount(account);
    await setAccountId( accountId);
    await GM_setValue("redirect_url", res.data.redirect_url);
    console.log( res.data.redirect_url );
    console.log( res.data );

    return true;
}

async function sendAccountCreationPost( payload ){
    const url = "https://fr.forgeofempires.com/glps/registration";

    const options = {
        headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
                 }
    }
    var res = await axiosPost(url, payload, options);
    return res;
}


/// LOGIN TO WORLD

async function logToWorld(){
    // if gameVars exist we are now in the game
    if( typeof gameVars !== 'undefined'  ){
        return true;
    }
    if ( document.location.href != 'https://fr0.forgeofempires.com/page/' )
    {
        await navigateTo( 'https://fr0.forgeofempires.com/page/' );
        return false;
    }

    // Check if logged in
    while(1){
        if ( document.getElementsByClassName("playername")[0] )
        {
            if ( document.getElementsByClassName("playername")[0].textContent.length == 0 ){
                await resetState();
            }
            break;
        }
    }

    var settings = await getSettings();
    while(1){
        if (  document.getElementsByName("play")[0] )
        {
            document.getElementsByName("play")[0].click();
            break;
        }
        await new Promise(r => setTimeout(r, 1000));
    }

    while(1){
        if (  document.getElementsByClassName("world_select_button")[0] )
        {
            break;
        }
        await new Promise(r => setTimeout(r, 100));
    }

    var buttons = document.getElementsByClassName("world_select_button");
    for (let button of buttons){
        console.log( button.getAttribute("value") )
        if ( button.getAttribute("value") == "fr" +settings.world){

            button.click();
        }
    };
}


/// DO STEPS

async function doStep(){
    var inc = 0;
    while(1){
        await new Promise(r => setTimeout(r, 1000));
        if( typeof gameVars != 'undefined'  ){
            break;
        }
        inc++;
        if ( inc > 10){
            await resetState();
        }
    }

    var accountId = await getAccountId();
    console.log( accountId );
    var account = await getAccount(accountId);
    console.log( account );

    var step = account.step;
    var funcName = "step" + step;
    await eval(funcName).apply();


    account.step = (step - 0) + 1;
    var next = new Date();
    next.setUTCHours( next.getUTCHours() + 10 );
    account.readyOn = next.toISOString().slice(0, 19).replace('T', ' ');
    await updateAccount(account);
    return true;

}


/// HIGH LEVEL FUNCTIONS

async function getBuildingInfo(){
    var payload = [{"__class__":"ServerRequest","requestData":[],"requestClass":"StartupService","requestMethod":"getData","requestId": getNextId()}]
    return await sendPost( payload )
}

async function getArmyInfo(){
    var payload = [{"__class__":"ServerRequest","requestData":[{"__class__":"ArmyContext","content":"main"}],"requestClass":"ArmyUnitManagementService","requestMethod":"getArmyInfo","requestId":getNextId()}]
    return await sendPost( payload )
}

async function acceptAll50Diamonds(){
    var payload = [{"__class__":"ServerRequest","requestData":[],"requestClass":"FriendService","requestMethod":"startup","requestId":getNextId()}]
    var res = await sendPost( payload );
    var friends = res.data[1]['responseData']['invitation_reward_groups'][0].friends;
    for (const friend of friends) {
        payload = [{"__class__":"ServerRequest","requestData":[friend.player.player_id,1],"requestClass":"FriendService","requestMethod":"collectInvitationReward","requestId":getNextId()}]
        res = await sendPost( payload );
    };

}





// First Login

async function step0(){
    // Close window
    await sendPost( [{"__class__":"ServerRequest","requestData":["age_outlook","close"],"requestClass":"TrackingService","requestMethod":"trackPopupAction","requestId": getNextId() }] );

    // Click accept
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"welcome","commandNr":0,"type":"buttonClick","target":"RAGU_BUBBLE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId() }] );

    // Click build
    await sendPost( [{"__class__":"ServerRequest","requestData":[],"requestClass":"InventoryService","requestMethod":"getGreatBuildings","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"residential","commandNr":0,"type":"buttonClick","target":"HUD_CONSTRUCTION_MENU_BUTTON"}],"requestClass":"TutorialService","requestMethod":"track","requestId": getNextId() }]);

    // Click on hut
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"residential","commandNr":1,"type":"buttonClick","target":"HUD_CONSTRUCTION_MENU_HUT_OPTION"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Place hut
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"residential","commandNr":2,"type":"cityClick","target":"ISO_SCENE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["residential","1.0.24","first_session"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );

    // Click ok
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"population","commandNr":0,"type":"buttonClick","target":"RAGU_BUBBLE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["population","1.0.24","first_session"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );

    // Collect coins
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"coins","commandNr":0,"type":"cityClick","target":"ISO_SCENE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click ok
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"coins","commandNr":1,"type":"buttonClick","target":"RAGU_BUBBLE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["coins","1.0.24","first_session"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );

    // Click build
    await sendPost( [{"__class__":"ServerRequest","requestData":[],"requestClass":"InventoryService","requestMethod":"getGreatBuildings","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"hunter","commandNr":0,"type":"buttonClick","target":"HUD_CONSTRUCTION_MENU_BUTTON"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"ConnectionState","state":2,"componentId":"socketServer","connectedTime":1483,"reconnects":0}],"requestClass":"LogService","requestMethod":"logState","requestId":getNextId()}] );

    // Click the hammer
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"hunter","commandNr":1,"type":"buttonClick","target":"HUD_CONSTRUCTION_MENU_PRODUCTION_TAB"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click the building
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"hunter","commandNr":2,"type":"buttonClick","target":"HUD_CONSTRUCTION_MENU_HUNTER_OPTION"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Place the building
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"hunter","commandNr":3,"type":"cityClick","target":"ISO_SCENE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["hunter","1.0.24","first_session"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );

    // Click build
    await sendPost( [{"__class__":"ServerRequest","requestData":[],"requestClass":"InventoryService","requestMethod":"getGreatBuildings","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"connection","commandNr":0,"type":"buttonClick","target":"HUD_CONSTRUCTION_MENU_BUTTON"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click move
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"connection","commandNr":1,"type":"buttonClick","target":"HUD_TOOLS_MENU_MOVE_BUTTON"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Select building
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"connection","commandNr":2,"type":"cityClick","target":"ISO_SCENE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Place building
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"connection","commandNr":3,"type":"cityClick","target":"ISO_SCENE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["connection","1.0.24","first_session"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );

    // Open building
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"produce","commandNr":0,"type":"cityClick","target":"ISO_SCENE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Start production
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"produce","commandNr":1,"type":"mouseClick","target":"PRODUCTION_WINDOW_OPTION_0"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click ok
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"produce","commandNr":2,"type":"buttonClick","target":"RAGU_BUBBLE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["produce","1.0.24","first_session"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );

    // Click research
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"City","fps":29,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"research","commandNr":0,"type":"buttonClick","target":"HUD_RESEARCH_MENU_BUTTON"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"LoadTimePerformance","module":"Research","loadTime":1960}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()}] );

    // Click ok
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"research","commandNr":1,"type":"buttonClick","target":"RAGU_BUBBLE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click maison
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"research","commandNr":2,"type":"mouseClick","target":"RESEARCH_STILT_HOUSES_TECHNOLOGY"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click use all pf
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"research","commandNr":3,"type":"mouseClick","target":"RESEARCH_SPEND_FORGE_POINTS"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"research","commandNr":4,"type":"buttonClick","target":"RESEARCH_TECHNOLOGY_RESEARCHED_WINDOW_OK_BUTTON"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Maybe wait a bit here?

    // Click collecter
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"research","commandNr":5,"type":"closeWindow","target":"CELEBRATE_NEW_AGE_WINDOW"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click ok
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"research","commandNr":6,"type":"buttonClick","target":"RAGU_BUBBLE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click return to city
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"Research","fps":29,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"research","commandNr":7,"type":"moduleUnloaded","target":""}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["research","1.0.24","first_session"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[],"requestClass":"TimerService","requestMethod":"getTimers","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[],"requestClass":"AnnouncementsService","requestMethod":"fetchAllAnnouncements","requestId":getNextId()}] );

    // Click build
    await sendPost( [{"__class__":"ServerRequest","requestData":[],"requestClass":"InventoryService","requestMethod":"getGreatBuildings","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"happiness","commandNr":0,"type":"buttonClick","target":"HUD_CONSTRUCTION_MENU_BUTTON"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click tree
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"happiness","commandNr":1,"type":"buttonClick","target":"HUD_CONSTRUCTION_MENU_DECORATION_TAB"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click memorial
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"happiness","commandNr":2,"type":"buttonClick","target":"HUD_CONSTRUCTION_MENU_MEMORIAL_OPTION"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Place memorial
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"happiness","commandNr":3,"type":"cityClick","target":"ISO_SCENE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click ok
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"happiness","commandNr":4,"type":"buttonClick","target":"RAGU_BUBBLE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["happiness","1.0.24","first_session"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"ConnectionState","state":2,"componentId":"socketServer","connectedTime":2110,"reconnects":0}],"requestClass":"LogService","requestMethod":"logState","requestId":getNextId()}] );

    // Open quest window
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"quests","commandNr":0,"type":"mouseClick","target":"HUD_QUEST_MANAGER"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click ok
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"quests","commandNr":1,"type":"buttonClick","target":"RAGU_BUBBLE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click build
    await sendPost( [{"__class__":"ServerRequest","requestData":[],"requestClass":"InventoryService","requestMethod":"getGreatBuildings","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"quests","commandNr":2,"type":"buttonClick","target":"HUD_CONSTRUCTION_MENU_BUTTON"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click house
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"quests","commandNr":3,"type":"buttonClick","target":"HUD_CONSTRUCTION_MENU_RESIDENCE_TAB"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click maison sur pilloti
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"quests","commandNr":4,"type":"buttonClick","target":"HUD_CONSTRUCTION_MENU_STILT_HOUSE_OPTION"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Place house
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"quests","commandNr":5,"type":"cityClick","target":"ISO_SCENE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Open quest
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"quests","commandNr":6,"type":"mouseClick","target":"HUD_QUEST_MANAGER"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Collect quest
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"quests","commandNr":7,"type":"buttonClick","target":"QUEST_COMPLETED_BUTTON"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["quests","1.0.24","first_session"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );

    // Click ok
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"premium","commandNr":0,"type":"buttonClick","target":"RAGU_BUBBLE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click build
    await sendPost( [{"__class__":"ServerRequest","requestData":[],"requestClass":"InventoryService","requestMethod":"getGreatBuildings","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"premium","commandNr":1,"type":"buttonClick","target":"HUD_CONSTRUCTION_MENU_BUTTON"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click maison longue
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"premium","commandNr":2,"type":"buttonClick","target":"HUD_CONSTRUCTION_MENU_LONG_HOUSE_OPTION"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Place maison longue
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.24","stepId":"premium","commandNr":3,"type":"cityClick","target":"ISO_SCENE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["premium","1.0.24","first_session"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );

    // Click ok
    await sendPost( [{"__class__":"ServerRequest","requestData":["end","1.0.24","first_session"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );

    // Open research
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"City","fps":28,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"LoadTimePerformance","module":"Research","loadTime":143}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()}] );

    // Buy potteries
    await sendPost( [{"__class__":"ServerRequest","requestData":["pottery",3],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}] );

    // Buy lances
    await sendPost( [{"__class__":"ServerRequest","requestData":["spears",3],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["welcome","1.0.8","battle"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );

    // Collect quest
    await sendPost( [{"__class__":"ServerRequest","requestData":[71],"requestClass":"QuestService","requestMethod":"advanceQuest","requestId":getNextId()}] );

    // Return to city
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"Research","fps":28,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[],"requestClass":"TimerService","requestMethod":"getTimers","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[],"requestClass":"AnnouncementsService","requestMethod":"fetchAllAnnouncements","requestId":getNextId()}] );

    // Click ok from general
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"welcome","commandNr":0,"type":"buttonClick","target":"RAGU_BUBBLE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    //  MIGHT BE BUGGED HERE

    // Click map
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"City","fps":27,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[],"requestClass":"CampaignService","requestMethod":"start","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"clickOnCampaignMap","commandNr":0,"type":"buttonClick","target":"HUD_CAMPAIGN_MAP_MENU_BUTTON"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["clickOnCampaignMap","1.0.8","battle"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"clickOnCampaignMap","commandNr":1,"type":"moduleLoaded","target":"CAMPAIGN_MAP"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"LoadTimePerformance","module":"Campaign","loadTime":3850}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()}] );

    // Click on 0
    await sendPost( [{"__class__":"ServerRequest","requestData":[[0,1],3],"requestClass":"CampaignService","requestMethod":"moveScoutToProvince","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"scoutProvince","commandNr":0,"type":"mouseClick","target":"SCOUT_BUTTON"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["scoutProvince","1.0.8","battle"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[1],"requestClass":"CampaignService","requestMethod":"scout","requestId":getNextId()}] );

    // Click on the territory
    await sendPost( [{"__class__":"ServerRequest","requestData":[1],"requestClass":"CampaignService","requestMethod":"getProvinceData","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"enterProvince","commandNr":1,"type":"mouseClick","target":"PROVINCE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["enterProvince","1.0.8","battle"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );

    // Click on the first land
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"selectSector","commandNr":0,"type":"mouseClick","target":"SECTOR"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click attack
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"ArmyContext","content":"main"}],"requestClass":"ArmyUnitManagementService","requestMethod":"getArmyInfo","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"selectSector","commandNr":1,"type":"buttonClick","target":"ATTACK_SECTOR_ATTACK_BUTTON"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["selectSector","1.0.8","battle"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );

    // Select first unit
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"attackSector","commandNr":0,"type":"unitIconClicked","target":""}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Select second unit
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"attackSector","commandNr":1,"type":"unitIconClicked","target":""}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click attack
    await sendPost( [{"__class__":"ServerRequest","requestData":[[{"__class__":"ArmyPool","units":[2049,1],"type":"attacking"},{"__class__":"ArmyPool","units":[],"type":"defending"},{"__class__":"ArmyPool","units":[],"type":"arena_defending"}],{"__class__":"ArmyContext","content":"main"}],"requestClass":"ArmyUnitManagementService","requestMethod":"updatePools","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"attackSector","commandNr":2,"type":"mouseClick","target":"ARMY_MANAGEMENT_ATTACK_BUTTON"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["attackSector","1.0.8","battle"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"Campaign","fps":28,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"CampaignBattleType","attackerPlayerId":0,"defenderPlayerId":0,"type":"campaign","currentWaveId":0,"totalWaves":0,"provinceId":1,"sectorId":1},false],"requestClass":"BattlefieldService","requestMethod":"startByBattleType","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"startBattle","commandNr":0,"type":"moduleLoaded","target":"BATTLE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"LoadTimePerformance","module":"Battle","loadTime":4551}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()}] );

    // Click first spot
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"startBattle","commandNr":1,"type":"battleCommandIssued","target":"BATTLEFIELD_HEX_MAP"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[225497978,{"__class__":"BattleStep","unitId":2,"path":[{"__class__":"Position","x":1,"y":7},{"__class__":"Position","x":2,"y":7},{"__class__":"Position","x":3,"y":7},{"__class__":"Position","x":4,"y":6},{"__class__":"Position","x":5,"y":6},{"__class__":"Position","x":6,"y":6}],"attackedUnitId":0,"dealtDamage":0,"attackedUnitHitpoints":0,"unitHitpoints":0,"receivedDamage":0,"round":0,"additionalStep":false,"wasCriticalHit":false,"wasPoisoned":false,"tookPoisonDamage":false,"appliedAbilities":null},0],"requestClass":"BattlefieldService","requestMethod":"submitMove","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"startBattle","commandNr":2,"type":"enemyMoveFinished","target":""}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"ConnectionState","state":2,"componentId":"socketServer","connectedTime":317,"reconnects":0}],"requestClass":"LogService","requestMethod":"logState","requestId":getNextId()}] );

    // Click ok
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"startBattle","commandNr":3,"type":"buttonClick","target":"RAGU_BUBBLE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    //Click second spot
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"startBattle","commandNr":4,"type":"battleCommandIssued","target":"BATTLEFIELD_HEX_MAP"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[225497978,{"__class__":"BattleStep","unitId":2050,"path":[{"__class__":"Position","x":0,"y":7},{"__class__":"Position","x":1,"y":7},{"__class__":"Position","x":2,"y":7},{"__class__":"Position","x":3,"y":7},{"__class__":"Position","x":4,"y":7}],"attackedUnitId":0,"dealtDamage":0,"attackedUnitHitpoints":0,"unitHitpoints":0,"receivedDamage":0,"round":0,"additionalStep":false,"wasCriticalHit":false,"wasPoisoned":false,"tookPoisonDamage":false,"appliedAbilities":null},0],"requestClass":"BattlefieldService","requestMethod":"submitMove","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"startBattle","commandNr":5,"type":"enemyMoveFinished","target":""}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click first unit
    await sendPost( [{"__class__":"ServerRequest","requestData":[225497978,{"__class__":"BattleStep","unitId":2,"path":[{"__class__":"Position","x":6,"y":7}],"attackedUnitId":-2,"dealtDamage":0,"attackedUnitHitpoints":0,"unitHitpoints":0,"receivedDamage":0,"round":0,"additionalStep":false,"wasCriticalHit":false,"wasPoisoned":false,"tookPoisonDamage":false,"appliedAbilities":null},0],"requestClass":"BattlefieldService","requestMethod":"submitMove","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"startBattle","commandNr":6,"type":"battleCommandIssued","target":"BATTLEFIELD_HEX_MAP"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"startBattle","commandNr":7,"type":"enemyUnitDied","target":""}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click ok
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"startBattle","commandNr":8,"type":"buttonClick","target":"RAGU_BUBBLE"}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );

    // Click on the last unit
    await sendPost( [{"__class__":"ServerRequest","requestData":[225497978,{"__class__":"BattleStep","unitId":2050,"path":[{"__class__":"Position","x":5,"y":7},{"__class__":"Position","x":6,"y":7},{"__class__":"Position","x":7,"y":7}],"attackedUnitId":-1,"dealtDamage":0,"attackedUnitHitpoints":0,"unitHitpoints":0,"receivedDamage":0,"round":0,"additionalStep":false,"wasCriticalHit":false,"wasPoisoned":false,"tookPoisonDamage":false,"appliedAbilities":null},0],"requestClass":"BattlefieldService","requestMethod":"submitMove","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[],"requestClass":"AnnouncementsService","requestMethod":"fetchAllAnnouncements","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"TutorialFlowTracking","version":"1.0.8","stepId":"startBattle","commandNr":9,"type":"battleFinished","target":""}],"requestClass":"TutorialService","requestMethod":"track","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["startBattle","1.0.8","battle"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["end","1.0.8","battle"],"requestClass":"TutorialService","requestMethod":"updateStep","requestId":getNextId()}] );

    // Click ok
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"Battle","fps":29,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[],"requestClass":"CampaignService","requestMethod":"start","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"LoadTimePerformance","module":"Campaign","loadTime":1041}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[1],"requestClass":"CampaignService","requestMethod":"getProvinceData","requestId":getNextId()}] );

    // Go back to home
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"Campaign","fps":29,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":["main"],"requestClass":"CityMapService","requestMethod":"getEntities","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[],"requestClass":"TimerService","requestMethod":"getTimers","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[],"requestClass":"AnnouncementsService","requestMethod":"fetchAllAnnouncements","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["08de241b-4641-4e03-ba58-4b4661f886f6","city"],"requestClass":"CrmService","requestMethod":"markContentSeen","requestId":getNextId()}] );

    // Close window
    await sendPost( [{"__class__":"ServerRequest","requestData":["08de241b-4641-4e03-ba58-4b4661f886f6","city",null],"requestClass":"CrmService","requestMethod":"rejectContent","requestId":getNextId()}] );

    // Open inventory
    await sendPost( [{"__class__":"ServerRequest","requestData":[],"requestClass":"InventoryService","requestMethod":"getGreatBuildings","requestId":getNextId()}] );

    // Place caserne
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"CityMapMilitaryEntity","id":35,"player_id":0,"cityentity_id":"M_BronzeAge_JavelinerBarracks","type":"military","x":8,"y":16,"connected":1,"state":{"__class__":"ConstructionState","next_state_transition_in":20,"next_state_transition_at":1649790624,"invested_forge_points":0,"forge_points_for_level_up":0,"pausedAt":0,"socialInteractionStartedAt":0},"level":0,"max_level":0,"unitSlots":[]}],"requestClass":"CityMapService","requestMethod":"placeBuilding","requestId":getNextId()}] );

    // Place potterie
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"CityMapEntity","id":36,"player_id":0,"cityentity_id":"P_BronzeAge_Pottery","type":"production","x":11,"y":18,"connected":1,"state":{"__class__":"ConstructionState","next_state_transition_in":20,"next_state_transition_at":1649790660,"invested_forge_points":0,"forge_points_for_level_up":0,"pausedAt":0,"socialInteractionStartedAt":0},"level":0,"max_level":0}],"requestClass":"CityMapService","requestMethod":"placeBuilding","requestId":getNextId()}] );

    // Place maison 1
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"CityMapEntity","id":37,"player_id":0,"cityentity_id":"R_BronzeAge_Residential3","type":"residential","x":22,"y":13,"connected":1,"state":{"__class__":"ConstructionState","next_state_transition_in":10,"next_state_transition_at":1649790675,"invested_forge_points":0,"forge_points_for_level_up":0,"pausedAt":0,"socialInteractionStartedAt":0},"level":0,"max_level":0}],"requestClass":"CityMapService","requestMethod":"placeBuilding","requestId":getNextId()}] );
    //await sendPost( [{"__class__":"ServerRequest","requestData":[37,0],"requestClass":"CityProductionService","requestMethod":"startProduction","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[],"requestClass":"CityMapService","requestMethod":"refreshConstructedEntities","requestId":getNextId()}] );

    // Place maison 2
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"CityMapEntity","id":38,"player_id":0,"cityentity_id":"R_BronzeAge_Residential3","type":"residential","x":20,"y":11,"connected":1,"state":{"__class__":"ConstructionState","next_state_transition_in":10,"next_state_transition_at":1649790691,"invested_forge_points":0,"forge_points_for_level_up":0,"pausedAt":0,"socialInteractionStartedAt":0},"level":0,"max_level":0}],"requestClass":"CityMapService","requestMethod":"placeBuilding","requestId":getNextId()}] );
    //await sendPost( [{"__class__":"ServerRequest","requestData":[38,0],"requestClass":"CityProductionService","requestMethod":"startProduction","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[],"requestClass":"CityMapService","requestMethod":"refreshConstructedEntities","requestId":getNextId()}] );

    // Place memorial 1
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"CityMapEntity","id":39,"player_id":0,"cityentity_id":"D_StoneAge_Statue","type":"decoration","x":19,"y":8,"connected":1,"state":{"__class__":"ConstructionState","next_state_transition_in":2,"next_state_transition_at":1649790752,"invested_forge_points":0,"forge_points_for_level_up":0,"pausedAt":0,"socialInteractionStartedAt":0},"level":0,"max_level":0}],"requestClass":"CityMapService","requestMethod":"placeBuilding","requestId":getNextId()}] );

    // Place memorial 2
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"CityMapEntity","id":40,"player_id":0,"cityentity_id":"D_StoneAge_Statue","type":"decoration","x":21,"y":8,"connected":1,"state":{"__class__":"ConstructionState","next_state_transition_in":2,"next_state_transition_at":1649790775,"invested_forge_points":0,"forge_points_for_level_up":0,"pausedAt":0,"socialInteractionStartedAt":0},"level":0,"max_level":0}],"requestClass":"CityMapService","requestMethod":"placeBuilding","requestId":getNextId()}] );

    console.log( "Waiting 20s");
    // wait for building to be completed ( 20s )
    await new Promise(r => setTimeout(r, 20000));

    // Start 5 min prod
    await sendPost( [{"__class__":"ServerRequest","requestData":[36,1],"requestClass":"CityProductionService","requestMethod":"startProduction","requestId":getNextId()}] );

    // Start unit prod
    await sendPost( [{"__class__":"ServerRequest","requestData":[35,0],"requestClass":"CityProductionService","requestMethod":"startProduction","requestId":getNextId()}] );

    // Collect quest
    await sendPost( [{"__class__":"ServerRequest","requestData":[73],"requestClass":"QuestService","requestMethod":"advanceQuest","requestId":getNextId()}] );

    // Wait for unit to be ready
    console.log( "Waiting 20s");
    await new Promise(r => setTimeout(r, 20000));

    // Collect unit
    await sendPost( [{"__class__":"ServerRequest","requestData":[[35]],"requestClass":"CityProductionService","requestMethod":"pickupProduction","requestId":getNextId()}] );

    // Collect quest
    await sendPost( [{"__class__":"ServerRequest","requestData":[75],"requestClass":"QuestService","requestMethod":"advanceQuest","requestId":getNextId()}] );

    // Collect quest
    await sendPost( [{"__class__":"ServerRequest","requestData":[77],"requestClass":"QuestService","requestMethod":"advanceQuest","requestId":getNextId()}] );

    // Collect quest
    await sendPost( [{"__class__":"ServerRequest","requestData":[79],"requestClass":"QuestService","requestMethod":"advanceQuest","requestId":getNextId()}] );

    // Collect quest
    await sendPost( [{"__class__":"ServerRequest","requestData":[81],"requestClass":"QuestService","requestMethod":"advanceQuest","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"ConnectionState","state":2,"componentId":"socketServer","connectedTime":314,"reconnects":0}],"requestClass":"LogService","requestMethod":"logState","requestId":getNextId()}] );

    // Collect quest
    await sendPost( [{"__class__":"ServerRequest","requestData":[83],"requestClass":"QuestService","requestMethod":"advanceQuest","requestId":getNextId()}] );

    // Click buy PF
    await sendPost( [{"__class__":"ServerRequest","requestData":[["forgePoints"]],"requestClass":"ResourceShopService","requestMethod":"getContexts","requestId":getNextId()}] );
    await sendPost( [{"__class__":"ServerRequest","requestData":["forge_point_package"],"requestClass":"InventoryService","requestMethod":"getItemsByType","requestId":getNextId()}] );

    // Buy 1 pf
    await sendPost( [{"__class__":"ServerRequest","requestData":["strategy_points0",{"__class__":"Resources","resources":{"money":200}}],"requestClass":"ResourceShopService","requestMethod":"buyOffer","requestId":getNextId()}] );

    // Collect quest
    await sendPost( [{"__class__":"ServerRequest","requestData":[85],"requestClass":"QuestService","requestMethod":"advanceQuest","requestId":getNextId()}] );

    // Open research
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"City","fps":28,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"LoadTimePerformance","module":"Research","loadTime":548}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()}] );

    // Buy wheel
    await sendPost( [{"__class__":"ServerRequest","requestData":["wheel",4],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}] );

    // Collect quest
    await sendPost( [{"__class__":"ServerRequest","requestData":[87],"requestClass":"QuestService","requestMethod":"advanceQuest","requestId":getNextId()}] );

    // Start second unit
    await sendPost( [{"__class__":"ServerRequest","requestData":[35,1],"requestClass":"CityProductionService","requestMethod":"startProduction","requestId":getNextId()}] );

    console.log( "Done")
}


async function step1(){
    // CLose event window??
    //await sendPost( [{"__class__":"ServerRequest","requestData":["878a8b94-4db9-4ece-a082-50980b8238cb","login",null],"requestClass":"CrmService","requestMethod":"rejectContent","requestId":getNextId()}]);

    // Open research
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"City","fps":29,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()}]);
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"LoadTimePerformance","module":"Research","loadTime":1474}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()}]);

    // Research batiment
    await sendPost( [{"__class__":"ServerRequest","requestData":["construction",5],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}]);

    // Collect quest
    await sendPost( [{"__class__":"ServerRequest","requestData":[89],"requestClass":"QuestService","requestMethod":"advanceQuest","requestId":getNextId()}]);

    //Put pf in fronde
    await sendPost( [{"__class__":"ServerRequest","requestData":["slingshots",5],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}]);

    //Finish fronde
    await sendPost( [{"__class__":"ServerRequest","requestData":["slingshots"],"requestClass":"ResearchService","requestMethod":"payTechnology","requestId":getNextId()}]);

    // Go back to the city
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"Research","fps":29,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[],"requestClass":"TimerService","requestMethod":"getTimers","requestId":getNextId()}]);
    await sendPost( [{"__class__":"ServerRequest","requestData":[],"requestClass":"AnnouncementsService","requestMethod":"fetchAllAnnouncements","requestId":getNextId()}]);
    await sendPost( [{"__class__":"ServerRequest","requestData":["501ed34e-97d2-4099-8950-0db49632ce1e","city"],"requestClass":"CrmService","requestMethod":"markContentSeen","requestId":getNextId()}]);

    // Close window
    await sendPost( [{"__class__":"ServerRequest","requestData":["501ed34e-97d2-4099-8950-0db49632ce1e","city",null],"requestClass":"CrmService","requestMethod":"rejectContent","requestId":getNextId()}]);

    //Collect coins
    await sendPost( [{"__class__":"ServerRequest","requestData":[[1,38,37,33,30,34,5]],"requestClass":"CityProductionService","requestMethod":"pickupProduction","requestId":getNextId()}]);

    console.log("Done");
}

async function step2(){
    //Collect coins
    await sendPost( [{"__class__":"ServerRequest","requestData":[[1,38,37,33,30,34,5]],"requestClass":"CityProductionService","requestMethod":"pickupProduction","requestId":getNextId()}]);

    //Open research
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"City","fps":29,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"LoadTimePerformance","module":"Research","loadTime":182}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()}]);

    //Put 5 points in chalet
    await sendPost( [{"__class__":"ServerRequest","requestData":["chalets",5],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}]);

    //Finish research
    await sendPost( [{"__class__":"ServerRequest","requestData":["chalets"],"requestClass":"ResearchService","requestMethod":"payTechnology","requestId":getNextId()}]);

    //Put 5 points in culture
    await sendPost( [{"__class__":"ServerRequest","requestData":["cultivation",5],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}]);

}

async function step3(){
    //Collect coins
    await sendPost( [{"__class__":"ServerRequest","requestData":[[1,38,37,33,30,34,5]],"requestClass":"CityProductionService","requestMethod":"pickupProduction","requestId":getNextId()}]);

    // Open research
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"City","fps":24,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"LoadTimePerformance","module":"Research","loadTime":84}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()}]);

    // Spend 6 points in equitation
    await sendPost( [{"__class__":"ServerRequest","requestData":["horseback_riding",6],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}]);

    // Finish equitation
    await sendPost( [{"__class__":"ServerRequest","requestData":["horseback_riding"],"requestClass":"ResearchService","requestMethod":"payTechnology","requestId":getNextId()}]);

    // 1 pf in culture
    await sendPost( [{"__class__":"ServerRequest","requestData":["cultivation",1],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}]);

    // Finish culture
    await sendPost( [{"__class__":"ServerRequest","requestData":["cultivation"],"requestClass":"ResearchService","requestMethod":"payTechnology","requestId":getNextId()}]);

    // Put 3 pfs in chaumiere
    await sendPost( [{"__class__":"ServerRequest","requestData":["thatched_houses",3],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}]);

    // Finish chaumiere and ask to not prompt for diamonds anymore
    await sendPost( [{"__class__":"ServerRequest","requestData":["thatched_houses"],"requestClass":"ResearchService","requestMethod":"buyInstantResearchAndUnlock","requestId":getNextId()}]);
    
}


async function step4(){
    //Collect coins
    await sendPost( [{"__class__":"ServerRequest","requestData":[[1,38,37,33,30,34,5]],"requestClass":"CityProductionService","requestMethod":"pickupProduction","requestId":getNextId()}]);

    // Open research
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"City","fps":28,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"LoadTimePerformance","module":"Research","loadTime":280}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()}]);

    // Put 8 pfs in phalanges
    await sendPost( [{"__class__":"ServerRequest","requestData":["phalanx",8],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}]);

    // Finish the phalanges
    await sendPost( [{"__class__":"ServerRequest","requestData":["phalanx"],"requestClass":"ResearchService","requestMethod":"payTechnology","requestId":getNextId()}]);

    // Put 2 pfs in forge
    await sendPost( [{"__class__":"ServerRequest","requestData":["smithery",2],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}]);

}

async function step5(){
    //Collect coins
    await sendPost( [{"__class__":"ServerRequest","requestData":[[1,38,37,33,30,34,5]],"requestClass":"CityProductionService","requestMethod":"pickupProduction","requestId":getNextId()}]);

    // Open research
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"City","fps":28,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"LoadTimePerformance","module":"Research","loadTime":239}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()}]);

    // Put 6 pfs in forge
    await sendPost( [{"__class__":"ServerRequest","requestData":["smithery",6],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}]);

    // Finish forge
    await sendPost( [{"__class__":"ServerRequest","requestData":["smithery"],"requestClass":"ResearchService","requestMethod":"payTechnology","requestId":getNextId()}]);

    // Put 4 pfs in voie
    await sendPost( [{"__class__":"ServerRequest","requestData":["paths",4],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}]);

}

async function step6(){
    //Collect coins
    await sendPost( [{"__class__":"ServerRequest","requestData":[[1,38,37,33,30,34,5]],"requestClass":"CityProductionService","requestMethod":"pickupProduction","requestId":getNextId()}]);

    // Open research
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"City","fps":27,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"LoadTimePerformance","module":"Research","loadTime":228}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()}]);

    // Put 3 pfs in voie
    await sendPost( [{"__class__":"ServerRequest","requestData":["paths",3],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}]);

    // Finish voie
    await sendPost( [{"__class__":"ServerRequest","requestData":["paths"],"requestClass":"ResearchService","requestMethod":"payTechnology","requestId":getNextId()}]);

    // Put 7 pfs in armes
    await sendPost( [{"__class__":"ServerRequest","requestData":["siege_weapons",7],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}]);
}

async function step7(){
    // Collect coins
    await sendPost( [{"__class__":"ServerRequest","requestData":[[1,38,37,33,30,34,5]],"requestClass":"CityProductionService","requestMethod":"pickupProduction","requestId":getNextId()}]);

    // Open research
    await sendPost( [{"__class__":"ServerRequest","requestData":[{"__class__":"FPSPerformance","module":"City","fps":29,"vram":0}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[{"__class__":"LoadTimePerformance","module":"Research","loadTime":237}],"requestClass":"LogService","requestMethod":"logPerformanceMetrics","requestId":getNextId()}]);

    // Put 2 pfs in armes
    await sendPost( [{"__class__":"ServerRequest","requestData":["siege_weapons",2],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}]);

    // Finish armes
    await sendPost( [{"__class__":"ServerRequest","requestData":["siege_weapons"],"requestClass":"ResearchService","requestMethod":"payTechnology","requestId":getNextId()}]);

    // 8 pfs in maisonettes
    await sendPost( [{"__class__":"ServerRequest","requestData":["rooftilehouses",8],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}]);

    // Click on buy pfs
    await sendPost( [{"__class__":"ServerRequest","requestData":[["forgePoints"]],"requestClass":"ResourceShopService","requestMethod":"getContexts","requestId":getNextId()}]);
    await sendPost( [{"__class__":"ServerRequest","requestData":["forge_point_package"],"requestClass":"InventoryService","requestMethod":"getItemsByType","requestId":getNextId()}]);

    // Buy pfs
    await sendPost( [{"__class__":"ServerRequest","requestData":["strategy_points0",{"__class__":"Resources","resources":{"money":250}}],"requestClass":"ResourceShopService","requestMethod":"buyOffer","requestId":getNextId()}]);
    await sendPost( [{"__class__":"ServerRequest","requestData":["strategy_points0",{"__class__":"Resources","resources":{"money":300}}],"requestClass":"ResourceShopService","requestMethod":"buyOffer","requestId":getNextId()}]);
    await sendPost( [{"__class__":"ServerRequest","requestData":["strategy_points0",{"__class__":"Resources","resources":{"money":350}}],"requestClass":"ResourceShopService","requestMethod":"buyOffer","requestId":getNextId()}]);
    await sendPost( [{"__class__":"ServerRequest","requestData":["strategy_points0",{"__class__":"Resources","resources":{"money":400}}],"requestClass":"ResourceShopService","requestMethod":"buyOffer","requestId":getNextId()}]);

    // Put 4 pfs in the maisonette
    await sendPost( [{"__class__":"ServerRequest","requestData":["rooftilehouses",4],"requestClass":"ResearchService","requestMethod":"spendForgePoints","requestId":getNextId()}]);

    // Use 50 diamonds to finish maisonette
    await sendPost( [{"__class__":"ServerRequest","requestData":["rooftilehouses"],"requestClass":"ResearchService","requestMethod":"buyInstantResearchAndUnlock","requestId":getNextId()}]);
    await sendPost( [{"__class__":"ServerRequest","requestData":[],"requestClass":"QuestService","requestMethod":"getUpdates","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[],"requestClass":"QuestService","requestMethod":"getUpdates","requestId":getNextId()}]);
    
    // Click settings
    await sendPost( [{"__class__":"ServerRequest","requestData":[],"requestClass":"SettingsService","requestMethod":"fetchAnonymizedEmail","requestId":getNextId()},{"__class__":"ServerRequest","requestData":[],"requestClass":"SettingsService","requestMethod":"getDataUsageLink","requestId":getNextId()}]);
    await sendPost( [{"__class__":"ServerRequest","requestData":[],"requestClass":"SettingsService","requestMethod":"getSettingsOptions","requestId":getNextId()}]);

    // Delete account
    var accountId = await getAccountId();
    console.log( accountId );
    var account = await getAccount(accountId);
    console.log( account );

    var password = account.password;
    await sendPost( [{"__class__":"ServerRequest","requestData":[password],"requestClass":"SettingsService","requestMethod":"markForDeletion","requestId":getNextId()}]);
}

function getRandomUsername(){
    var names = ["Aaren","Aarika","Abagael","Abagail","Abbe","Abbey","Abbi","Abbie","Abby","Abbye","Abigael","Abigail","Abigale","Abra","Ada","Adah","Adaline","Adan","Adara","Adda","Addi","Addia","Addie","Addy","Adel","Adela","Adelaida","Adelaide","Adele","Adelheid","Adelice","Adelina","Adelind","Adeline","Adella","Adelle","Adena","Adey","Adi","Adiana","Adina","Adora","Adore","Adoree","Adorne","Adrea","Adria","Adriaens","Adrian","Adriana","Adriane","Adrianna","Adrianne","Adriena","Adrienne","Aeriel","Aeriela","Aeriell","Afton","Ag","Agace","Agata","Agatha","Agathe","Aggi","Aggie","Aggy","Agna","Agnella","Agnes","Agnese","Agnesse","Agneta","Agnola","Agretha","Aida","Aidan","Aigneis","Aila","Aile","Ailee","Aileen","Ailene","Ailey","Aili","Ailina","Ailis","Ailsun","Ailyn","Aime","Aimee","Aimil","Aindrea","Ainslee","Ainsley","Ainslie","Ajay","Alaine","Alameda","Alana","Alanah","Alane","Alanna","Alayne","Alberta","Albertina","Albertine","Albina","Alecia","Aleda","Aleece","Aleen","Alejandra","Alejandrina","Alena","Alene","Alessandra","Aleta","Alethea","Alex","Alexa","Alexandra","Alexandrina","Alexi","Alexia","Alexina","Alexine","Alexis","Alfi","Alfie","Alfreda","Alfy","Ali","Alia","Alica","Alice","Alicea","Alicia","Alida","Alidia","Alie","Alika","Alikee","Alina","Aline","Alis","Alisa","Alisha","Alison","Alissa","Alisun","Alix","Aliza","Alla","Alleen","Allegra","Allene","Alli","Allianora","Allie","Allina","Allis","Allison","Allissa","Allix","Allsun","Allx","Ally","Allyce","Allyn","Allys","Allyson","Alma","Almeda","Almeria","Almeta","Almira","Almire","Aloise","Aloisia","Aloysia","Alta","Althea","Alvera","Alverta","Alvina","Alvinia","Alvira","Alyce","Alyda","Alys","Alysa","Alyse","Alysia","Alyson","Alyss","Alyssa","Amabel","Amabelle","Amalea","Amalee","Amaleta","Amalia","Amalie","Amalita","Amalle","Amanda","Amandi","Amandie","Amandy","Amara","Amargo","Amata","Amber","Amberly","Ambur","Ame","Amelia","Amelie","Amelina","Ameline","Amelita","Ami","Amie","Amii","Amil","Amitie","Amity","Ammamaria","Amy","Amye","Ana","Anabal","Anabel","Anabella","Anabelle","Analiese","Analise","Anallese","Anallise","Anastasia","Anastasie","Anastassia","Anatola","Andee","Andeee","Anderea","Andi","Andie","Andra","Andrea","Andreana","Andree","Andrei","Andria","Andriana","Andriette","Andromache","Andy","Anestassia","Anet","Anett","Anetta","Anette","Ange","Angel","Angela","Angele","Angelia","Angelica","Angelika","Angelina","Angeline","Angelique","Angelita","Angelle","Angie","Angil","Angy","Ania","Anica","Anissa","Anita","Anitra","Anjanette","Anjela","Ann","Ann-Marie","Anna","Anna-Diana","Anna-Diane","Anna-Maria","Annabal","Annabel","Annabela","Annabell","Annabella","Annabelle","Annadiana","Annadiane","Annalee","Annaliese","Annalise","Annamaria","Annamarie","Anne","Anne-Corinne","Anne-Marie","Annecorinne","Anneliese","Annelise","Annemarie","Annetta","Annette","Anni","Annice","Annie","Annis","Annissa","Annmaria","Annmarie","Annnora","Annora","Anny","Anselma","Ansley","Anstice","Anthe","Anthea","Anthia","Anthiathia","Antoinette","Antonella","Antonetta","Antonia","Antonie","Antonietta","Antonina","Anya","Appolonia","April","Aprilette","Ara","Arabel","Arabela","Arabele","Arabella","Arabelle","Arda","Ardath","Ardeen","Ardelia","Ardelis","Ardella","Ardelle","Arden","Ardene","Ardenia","Ardine","Ardis","Ardisj","Ardith","Ardra","Ardyce","Ardys","Ardyth","Aretha","Ariadne","Ariana","Aridatha","Ariel","Ariela","Ariella","Arielle","Arlana","Arlee","Arleen","Arlen","Arlena","Arlene","Arleta","Arlette","Arleyne","Arlie","Arliene","Arlina","Arlinda","Arline","Arluene","Arly","Arlyn","Arlyne","Aryn","Ashely","Ashia","Ashien","Ashil","Ashla","Ashlan","Ashlee","Ashleigh","Ashlen","Ashley","Ashli","Ashlie","Ashly","Asia","Astra","Astrid","Astrix","Atalanta","Athena","Athene","Atlanta","Atlante","Auberta","Aubine","Aubree","Aubrette","Aubrey","Aubrie","Aubry","Audi","Audie","Audra","Audre","Audrey","Audrie","Audry","Audrye","Audy","Augusta","Auguste","Augustina","Augustine","Aundrea","Aura","Aurea","Aurel","Aurelea","Aurelia","Aurelie","Auria","Aurie","Aurilia","Aurlie","Auroora","Aurora","Aurore","Austin","Austina","Austine","Ava","Aveline","Averil","Averyl","Avie","Avis","Aviva","Avivah","Avril","Avrit","Ayn","Bab","Babara","Babb","Babbette","Babbie","Babette","Babita","Babs","Bambi","Bambie","Bamby","Barb","Barbabra","Barbara","Barbara-Anne","Barbaraanne","Barbe","Barbee","Barbette","Barbey","Barbi","Barbie","Barbra","Barby","Bari","Barrie","Barry","Basia","Bathsheba","Batsheva","Bea","Beatrice","Beatrisa","Beatrix","Beatriz","Bebe","Becca","Becka","Becki","Beckie","Becky","Bee","Beilul","Beitris","Bekki","Bel","Belia","Belicia","Belinda","Belita","Bell","Bella","Bellanca","Belle","Bellina","Belva","Belvia","Bendite","Benedetta","Benedicta","Benedikta","Benetta","Benita","Benni","Bennie","Benny","Benoite","Berenice","Beret","Berget","Berna","Bernadene","Bernadette","Bernadina","Bernadine","Bernardina","Bernardine","Bernelle","Bernete","Bernetta","Bernette","Berni","Bernice","Bernie","Bernita","Berny","Berri","Berrie","Berry","Bert","Berta","Berte","Bertha","Berthe","Berti","Bertie","Bertina","Bertine","Berty","Beryl","Beryle","Bess","Bessie","Bessy","Beth","Bethanne","Bethany","Bethena","Bethina","Betsey","Betsy","Betta","Bette","Bette-Ann","Betteann","Betteanne","Betti","Bettina","Bettine","Betty","Bettye","Beulah","Bev","Beverie","Beverlee","Beverley","Beverlie","Beverly","Bevvy","Bianca","Bianka","Bibbie","Bibby","Bibbye","Bibi","Biddie","Biddy","Bidget","Bili","Bill","Billi","Billie","Billy","Billye","Binni","Binnie","Binny","Bird","Birdie","Birgit","Birgitta","Blair","Blaire","Blake","Blakelee","Blakeley","Blanca","Blanch","Blancha","Blanche","Blinni","Blinnie","Blinny","Bliss","Blisse","Blithe","Blondell","Blondelle","Blondie","Blondy","Blythe","Bobbe","Bobbee","Bobbette","Bobbi","Bobbie","Bobby","Bobbye","Bobette","Bobina","Bobine","Bobinette","Bonita","Bonnee","Bonni","Bonnibelle","Bonnie","Bonny","Brana","Brandais","Brande","Brandea","Brandi","Brandice","Brandie","Brandise","Brandy","Breanne","Brear","Bree","Breena","Bren","Brena","Brenda","Brenn","Brenna","Brett","Bria","Briana","Brianna","Brianne","Bride","Bridget","Bridgette","Bridie","Brier","Brietta","Brigid","Brigida","Brigit","Brigitta","Brigitte","Brina","Briney","Brinn","Brinna","Briny","Brit","Brita","Britney","Britni","Britt","Britta","Brittan","Brittaney","Brittani","Brittany","Britte","Britteny","Brittne","Brittney","Brittni","Brook","Brooke","Brooks","Brunhilda","Brunhilde","Bryana","Bryn","Bryna","Brynn","Brynna","Brynne","Buffy","Bunni","Bunnie","Bunny","Cacilia","Cacilie","Cahra","Cairistiona","Caitlin","Caitrin","Cal","Calida","Calla","Calley","Calli","Callida","Callie","Cally","Calypso","Cam","Camala","Camel","Camella","Camellia","Cami","Camila","Camile","Camilla","Camille","Cammi","Cammie","Cammy","Candace","Candi","Candice","Candida","Candide","Candie","Candis","Candra","Candy","Caprice","Cara","Caralie","Caren","Carena","Caresa","Caressa","Caresse","Carey","Cari","Caria","Carie","Caril","Carilyn","Carin","Carina","Carine","Cariotta","Carissa","Carita","Caritta","Carla","Carlee","Carleen","Carlen","Carlene","Carley","Carlie","Carlin","Carlina","Carline","Carlita","Carlota","Carlotta","Carly","Carlye","Carlyn","Carlynn","Carlynne","Carma","Carmel","Carmela","Carmelia","Carmelina","Carmelita","Carmella","Carmelle","Carmen","Carmencita","Carmina","Carmine","Carmita","Carmon","Caro","Carol","Carol-Jean","Carola","Carolan","Carolann","Carole","Carolee","Carolin","Carolina","Caroline","Caroljean","Carolyn","Carolyne","Carolynn","Caron","Carree","Carri","Carrie","Carrissa","Carroll","Carry","Cary","Caryl","Caryn","Casandra","Casey","Casi","Casie","Cass","Cassandra","Cassandre","Cassandry","Cassaundra","Cassey","Cassi","Cassie","Cassondra","Cassy","Catarina","Cate","Caterina","Catha","Catharina","Catharine","Cathe","Cathee","Catherin","Catherina","Catherine","Cathi","Cathie","Cathleen","Cathlene","Cathrin","Cathrine","Cathryn","Cathy","Cathyleen","Cati","Catie","Catina","Catlaina","Catlee","Catlin","Catrina","Catriona","Caty","Caye","Cayla","Cecelia","Cecil","Cecile","Ceciley","Cecilia","Cecilla","Cecily","Ceil","Cele","Celene","Celesta","Celeste","Celestia","Celestina","Celestine","Celestyn","Celestyna","Celia","Celie","Celina","Celinda","Celine","Celinka","Celisse","Celka","Celle","Cesya","Chad","Chanda","Chandal","Chandra","Channa","Chantal","Chantalle","Charil","Charin","Charis","Charissa","Charisse","Charita","Charity","Charla","Charlean","Charleen","Charlena","Charlene","Charline","Charlot","Charlotta","Charlotte","Charmain","Charmaine","Charmane","Charmian","Charmine","Charmion","Charo","Charyl","Chastity","Chelsae","Chelsea","Chelsey","Chelsie","Chelsy","Cher","Chere","Cherey","Cheri","Cherianne","Cherice","Cherida","Cherie","Cherilyn","Cherilynn","Cherin","Cherise","Cherish","Cherlyn","Cherri","Cherrita","Cherry","Chery","Cherye","Cheryl","Cheslie","Chiarra","Chickie","Chicky","Chiquia","Chiquita","Chlo","Chloe","Chloette","Chloris","Chris","Chrissie","Chrissy","Christa","Christabel","Christabella","Christal","Christalle","Christan","Christean","Christel","Christen","Christi","Christian","Christiana","Christiane","Christie","Christin","Christina","Christine","Christy","Christye","Christyna","Chrysa","Chrysler","Chrystal","Chryste","Chrystel","Cicely","Cicily","Ciel","Cilka","Cinda","Cindee","Cindelyn","Cinderella","Cindi","Cindie","Cindra","Cindy","Cinnamon","Cissiee","Cissy","Clair","Claire","Clara","Clarabelle","Clare","Claresta","Clareta","Claretta","Clarette","Clarey","Clari","Claribel","Clarice","Clarie","Clarinda","Clarine","Clarissa","Clarisse","Clarita","Clary","Claude","Claudelle","Claudetta","Claudette","Claudia","Claudie","Claudina","Claudine","Clea","Clem","Clemence","Clementia","Clementina","Clementine","Clemmie","Clemmy","Cleo","Cleopatra","Clerissa","Clio","Clo","Cloe","Cloris","Clotilda","Clovis","Codee","Codi","Codie","Cody","Coleen","Colene","Coletta","Colette","Colleen","Collen","Collete","Collette","Collie","Colline","Colly","Con","Concettina","Conchita","Concordia","Conni","Connie","Conny","Consolata","Constance","Constancia","Constancy","Constanta","Constantia","Constantina","Constantine","Consuela","Consuelo","Cookie","Cora","Corabel","Corabella","Corabelle","Coral","Coralie","Coraline","Coralyn","Cordelia","Cordelie","Cordey","Cordi","Cordie","Cordula","Cordy","Coreen","Corella","Corenda","Corene","Coretta","Corette","Corey","Cori","Corie","Corilla","Corina","Corine","Corinna","Corinne","Coriss","Corissa","Corliss","Corly","Cornela","Cornelia","Cornelle","Cornie","Corny","Correna","Correy","Corri","Corrianne","Corrie","Corrina","Corrine","Corrinne","Corry","Cortney","Cory","Cosetta","Cosette","Costanza","Courtenay","Courtnay","Courtney","Crin","Cris","Crissie","Crissy","Crista","Cristabel","Cristal","Cristen","Cristi","Cristie","Cristin","Cristina","Cristine","Cristionna","Cristy","Crysta","Crystal","Crystie","Cthrine","Cyb","Cybil","Cybill","Cymbre","Cynde","Cyndi","Cyndia","Cyndie","Cyndy","Cynthea","Cynthia","Cynthie","Cynthy","Dacey","Dacia","Dacie","Dacy","Dael","Daffi","Daffie","Daffy","Dagmar","Dahlia","Daile","Daisey","Daisi","Daisie","Daisy","Dale","Dalenna","Dalia","Dalila","Dallas","Daloris","Damara","Damaris","Damita","Dana","Danell","Danella","Danette","Dani","Dania","Danica","Danice","Daniela","Daniele","Daniella","Danielle","Danika","Danila","Danit","Danita","Danna","Danni","Dannie","Danny","Dannye","Danya","Danyelle","Danyette","Daphene","Daphna","Daphne","Dara","Darb","Darbie","Darby","Darcee","Darcey","Darci","Darcie","Darcy","Darda","Dareen","Darell","Darelle","Dari","Daria","Darice","Darla","Darleen","Darlene","Darline","Darlleen","Daron","Darrelle","Darryl","Darsey","Darsie","Darya","Daryl","Daryn","Dasha","Dasi","Dasie","Dasya","Datha","Daune","Daveen","Daveta","Davida","Davina","Davine","Davita","Dawn","Dawna","Dayle","Dayna","Ddene","De","Deana","Deane","Deanna","Deanne","Deb","Debbi","Debbie","Debby","Debee","Debera","Debi","Debor","Debora","Deborah","Debra","Dede","Dedie","Dedra","Dee","Dee Dee","Deeann","Deeanne","Deedee","Deena","Deerdre","Deeyn","Dehlia","Deidre","Deina","Deirdre","Del","Dela","Delcina","Delcine","Delia","Delila","Delilah","Delinda","Dell","Della","Delly","Delora","Delores","Deloria","Deloris","Delphine","Delphinia","Demeter","Demetra","Demetria","Demetris","Dena","Deni","Denice","Denise","Denna","Denni","Dennie","Denny","Deny","Denys","Denyse","Deonne","Desdemona","Desirae","Desiree","Desiri","Deva","Devan","Devi","Devin","Devina","Devinne","Devon","Devondra","Devonna","Devonne","Devora","Di","Diahann","Dian","Diana","Diandra","Diane","Diane-Marie","Dianemarie","Diann","Dianna","Dianne","Diannne","Didi","Dido","Diena","Dierdre","Dina","Dinah","Dinnie","Dinny","Dion","Dione","Dionis","Dionne","Dita","Dix","Dixie","Dniren","Dode","Dodi","Dodie","Dody","Doe","Doll","Dolley","Dolli","Dollie","Dolly","Dolores","Dolorita","Doloritas","Domeniga","Dominga","Domini","Dominica","Dominique","Dona","Donella","Donelle","Donetta","Donia","Donica","Donielle","Donna","Donnamarie","Donni","Donnie","Donny","Dora","Doralia","Doralin","Doralyn","Doralynn","Doralynne","Dore","Doreen","Dorelia","Dorella","Dorelle","Dorena","Dorene","Doretta","Dorette","Dorey","Dori","Doria","Dorian","Dorice","Dorie","Dorine","Doris","Dorisa","Dorise","Dorita","Doro","Dorolice","Dorolisa","Dorotea","Doroteya","Dorothea","Dorothee","Dorothy","Dorree","Dorri","Dorrie","Dorris","Dorry","Dorthea","Dorthy","Dory","Dosi","Dot","Doti","Dotti","Dottie","Dotty","Dre","Dreddy","Dredi","Drona","Dru","Druci","Drucie","Drucill","Drucy","Drusi","Drusie","Drusilla","Drusy","Dulce","Dulcea","Dulci","Dulcia","Dulciana","Dulcie","Dulcine","Dulcinea","Dulcy","Dulsea","Dusty","Dyan","Dyana","Dyane","Dyann","Dyanna","Dyanne","Dyna","Dynah","Eachelle","Eada","Eadie","Eadith","Ealasaid","Eartha","Easter","Eba","Ebba","Ebonee","Ebony","Eda","Eddi","Eddie","Eddy","Ede","Edee","Edeline","Eden","Edi","Edie","Edin","Edita","Edith","Editha","Edithe","Ediva","Edna","Edwina","Edy","Edyth","Edythe","Effie","Eileen","Eilis","Eimile","Eirena","Ekaterina","Elaina","Elaine","Elana","Elane","Elayne","Elberta","Elbertina","Elbertine","Eleanor","Eleanora","Eleanore","Electra","Eleen","Elena","Elene","Eleni","Elenore","Eleonora","Eleonore","Elfie","Elfreda","Elfrida","Elfrieda","Elga","Elianora","Elianore","Elicia","Elie","Elinor","Elinore","Elisa","Elisabet","Elisabeth","Elisabetta","Elise","Elisha","Elissa","Elita","Eliza","Elizabet","Elizabeth","Elka","Elke","Ella","Elladine","Elle","Ellen","Ellene","Ellette","Elli","Ellie","Ellissa","Elly","Ellyn","Ellynn","Elmira","Elna","Elnora","Elnore","Eloisa","Eloise","Elonore","Elora","Elsa","Elsbeth","Else","Elset","Elsey","Elsi","Elsie","Elsinore","Elspeth","Elsy","Elva","Elvera","Elvina","Elvira","Elwira","Elyn","Elyse","Elysee","Elysha","Elysia","Elyssa","Em","Ema","Emalee","Emalia","Emelda","Emelia","Emelina","Emeline","Emelita","Emelyne","Emera","Emilee","Emili","Emilia","Emilie","Emiline","Emily","Emlyn","Emlynn","Emlynne","Emma","Emmalee","Emmaline","Emmalyn","Emmalynn","Emmalynne","Emmeline","Emmey","Emmi","Emmie","Emmy","Emmye","Emogene","Emyle","Emylee","Engracia","Enid","Enrica","Enrichetta","Enrika","Enriqueta","Eolanda","Eolande","Eran","Erda","Erena","Erica","Ericha","Ericka","Erika","Erin","Erina","Erinn","Erinna","Erma","Ermengarde","Ermentrude","Ermina","Erminia","Erminie","Erna","Ernaline","Ernesta","Ernestine","Ertha","Eryn","Esma","Esmaria","Esme","Esmeralda","Essa","Essie","Essy","Esta","Estel","Estele","Estell","Estella","Estelle","Ester","Esther","Estrella","Estrellita","Ethel","Ethelda","Ethelin","Ethelind","Etheline","Ethelyn","Ethyl","Etta","Etti","Ettie","Etty","Eudora","Eugenia","Eugenie","Eugine","Eula","Eulalie","Eunice","Euphemia","Eustacia","Eva","Evaleen","Evangelia","Evangelin","Evangelina","Evangeline","Evania","Evanne","Eve","Eveleen","Evelina","Eveline","Evelyn","Evey","Evie","Evita","Evonne","Evvie","Evvy","Evy","Eyde","Eydie","Ezmeralda","Fae","Faina","Faith","Fallon","Fan","Fanchette","Fanchon","Fancie","Fancy","Fanechka","Fania","Fanni","Fannie","Fanny","Fanya","Fara","Farah","Farand","Farica","Farra","Farrah","Farrand","Faun","Faunie","Faustina","Faustine","Fawn","Fawne","Fawnia","Fay","Faydra","Faye","Fayette","Fayina","Fayre","Fayth","Faythe","Federica","Fedora","Felecia","Felicdad","Felice","Felicia","Felicity","Felicle","Felipa","Felisha","Felita","Feliza","Fenelia","Feodora","Ferdinanda","Ferdinande","Fern","Fernanda","Fernande","Fernandina","Ferne","Fey","Fiann","Fianna","Fidela","Fidelia","Fidelity","Fifi","Fifine","Filia","Filide","Filippa","Fina","Fiona","Fionna","Fionnula","Fiorenze","Fleur","Fleurette","Flo","Flor","Flora","Florance","Flore","Florella","Florence","Florencia","Florentia","Florenza","Florette","Flori","Floria","Florida","Florie","Florina","Florinda","Floris","Florri","Florrie","Florry","Flory","Flossi","Flossie","Flossy","Flss","Fran","Francene","Frances","Francesca","Francine","Francisca","Franciska","Francoise","Francyne","Frank","Frankie","Franky","Franni","Frannie","Franny","Frayda","Fred","Freda","Freddi","Freddie","Freddy","Fredelia","Frederica","Fredericka","Frederique","Fredi","Fredia","Fredra","Fredrika","Freida","Frieda","Friederike","Fulvia","Gabbey","Gabbi","Gabbie","Gabey","Gabi","Gabie","Gabriel","Gabriela","Gabriell","Gabriella","Gabrielle","Gabriellia","Gabrila","Gaby","Gae","Gael","Gail","Gale","Gale","Galina","Garland","Garnet","Garnette","Gates","Gavra","Gavrielle","Gay","Gaye","Gayel","Gayla","Gayle","Gayleen","Gaylene","Gaynor","Gelya","Gena","Gene","Geneva","Genevieve","Genevra","Genia","Genna","Genni","Gennie","Gennifer","Genny","Genovera","Genvieve","George","Georgeanna","Georgeanne","Georgena","Georgeta","Georgetta","Georgette","Georgia","Georgiana","Georgianna","Georgianne","Georgie","Georgina","Georgine","Geralda","Geraldine","Gerda","Gerhardine","Geri","Gerianna","Gerianne","Gerladina","Germain","Germaine","Germana","Gerri","Gerrie","Gerrilee","Gerry","Gert","Gerta","Gerti","Gertie","Gertrud","Gertruda","Gertrude","Gertrudis","Gerty","Giacinta","Giana","Gianina","Gianna","Gigi","Gilberta","Gilberte","Gilbertina","Gilbertine","Gilda","Gilemette","Gill","Gillan","Gilli","Gillian","Gillie","Gilligan","Gilly","Gina","Ginelle","Ginevra","Ginger","Ginni","Ginnie","Ginnifer","Ginny","Giorgia","Giovanna","Gipsy","Giralda","Gisela","Gisele","Gisella","Giselle","Giuditta","Giulia","Giulietta","Giustina","Gizela","Glad","Gladi","Gladys","Gleda","Glen","Glenda","Glenine","Glenn","Glenna","Glennie","Glennis","Glori","Gloria","Gloriana","Gloriane","Glory","Glyn","Glynda","Glynis","Glynnis","Gnni","Godiva","Golda","Goldarina","Goldi","Goldia","Goldie","Goldina","Goldy","Grace","Gracia","Gracie","Grata","Gratia","Gratiana","Gray","Grayce","Grazia","Greer","Greta","Gretal","Gretchen","Grete","Gretel","Grethel","Gretna","Gretta","Grier","Griselda","Grissel","Guendolen","Guenevere","Guenna","Guglielma","Gui","Guillema","Guillemette","Guinevere","Guinna","Gunilla","Gus","Gusella","Gussi","Gussie","Gussy","Gusta","Gusti","Gustie","Gusty","Gwen","Gwendolen","Gwendolin","Gwendolyn","Gweneth","Gwenette","Gwenneth","Gwenni","Gwennie","Gwenny","Gwenora","Gwenore","Gwyn","Gwyneth","Gwynne","Gypsy","Hadria","Hailee","Haily","Haleigh","Halette","Haley","Hali","Halie","Halimeda","Halley","Halli","Hallie","Hally","Hana","Hanna","Hannah","Hanni","Hannie","Hannis","Hanny","Happy","Harlene","Harley","Harli","Harlie","Harmonia","Harmonie","Harmony","Harri","Harrie","Harriet","Harriett","Harrietta","Harriette","Harriot","Harriott","Hatti","Hattie","Hatty","Hayley","Hazel","Heath","Heather","Heda","Hedda","Heddi","Heddie","Hedi","Hedvig","Hedvige","Hedwig","Hedwiga","Hedy","Heida","Heidi","Heidie","Helaina","Helaine","Helen","Helen-Elizabeth","Helena","Helene","Helenka","Helga","Helge","Helli","Heloise","Helsa","Helyn","Hendrika","Henka","Henrie","Henrieta","Henrietta","Henriette","Henryetta","Hephzibah","Hermia","Hermina","Hermine","Herminia","Hermione","Herta","Hertha","Hester","Hesther","Hestia","Hetti","Hettie","Hetty","Hilary","Hilda","Hildagard","Hildagarde","Hilde","Hildegaard","Hildegarde","Hildy","Hillary","Hilliary","Hinda","Holli","Hollie","Holly","Holly-Anne","Hollyanne","Honey","Honor","Honoria","Hope","Horatia","Hortense","Hortensia","Hulda","Hyacinth","Hyacintha","Hyacinthe","Hyacinthia","Hyacinthie","Hynda","Ianthe","Ibbie","Ibby","Ida","Idalia","Idalina","Idaline","Idell","Idelle","Idette","Ileana","Ileane","Ilene","Ilise","Ilka","Illa","Ilsa","Ilse","Ilysa","Ilyse","Ilyssa","Imelda","Imogen","Imogene","Imojean","Ina","Indira","Ines","Inesita","Inessa","Inez","Inga","Ingaberg","Ingaborg","Inge","Ingeberg","Ingeborg","Inger","Ingrid","Ingunna","Inna","Iolande","Iolanthe","Iona","Iormina","Ira","Irena","Irene","Irina","Iris","Irita","Irma","Isa","Isabel","Isabelita","Isabella","Isabelle","Isadora","Isahella","Iseabal","Isidora","Isis","Isobel","Issi","Issie","Issy","Ivett","Ivette","Ivie","Ivonne","Ivory","Ivy","Izabel","Jacenta","Jacinda","Jacinta","Jacintha","Jacinthe","Jackelyn","Jacki","Jackie","Jacklin","Jacklyn","Jackquelin","Jackqueline","Jacky","Jaclin","Jaclyn","Jacquelin","Jacqueline","Jacquelyn","Jacquelynn","Jacquenetta","Jacquenette","Jacquetta","Jacquette","Jacqui","Jacquie","Jacynth","Jada","Jade","Jaime","Jaimie","Jaine","Jami","Jamie","Jamima","Jammie","Jan","Jana","Janaya","Janaye","Jandy","Jane","Janean","Janeczka","Janeen","Janel","Janela","Janella","Janelle","Janene","Janenna","Janessa","Janet","Janeta","Janetta","Janette","Janeva","Janey","Jania","Janice","Janie","Janifer","Janina","Janine","Janis","Janith","Janka","Janna","Jannel","Jannelle","Janot","Jany","Jaquelin","Jaquelyn","Jaquenetta","Jaquenette","Jaquith","Jasmin","Jasmina","Jasmine","Jayme","Jaymee","Jayne","Jaynell","Jazmin","Jean","Jeana","Jeane","Jeanelle","Jeanette","Jeanie","Jeanine","Jeanna","Jeanne","Jeannette","Jeannie","Jeannine","Jehanna","Jelene","Jemie","Jemima","Jemimah","Jemmie","Jemmy","Jen","Jena","Jenda","Jenelle","Jeni","Jenica","Jeniece","Jenifer","Jeniffer","Jenilee","Jenine","Jenn","Jenna","Jennee","Jennette","Jenni","Jennica","Jennie","Jennifer","Jennilee","Jennine","Jenny","Jeralee","Jere","Jeri","Jermaine","Jerrie","Jerrilee","Jerrilyn","Jerrine","Jerry","Jerrylee","Jess","Jessa","Jessalin","Jessalyn","Jessamine","Jessamyn","Jesse","Jesselyn","Jessi","Jessica","Jessie","Jessika","Jessy","Jewel","Jewell","Jewelle","Jill","Jillana","Jillane","Jillayne","Jilleen","Jillene","Jilli","Jillian","Jillie","Jilly","Jinny","Jo","Jo Ann","Jo-Ann","Jo-Anne","Joan","Joana","Joane","Joanie","Joann","Joanna","Joanne","Joannes","Jobey","Jobi","Jobie","Jobina","Joby","Jobye","Jobyna","Jocelin","Joceline","Jocelyn","Jocelyne","Jodee","Jodi","Jodie","Jody","Joeann","Joela","Joelie","Joell","Joella","Joelle","Joellen","Joelly","Joellyn","Joelynn","Joete","Joey","Johanna","Johannah","Johna","Johnath","Johnette","Johnna","Joice","Jojo","Jolee","Joleen","Jolene","Joletta","Joli","Jolie","Joline","Joly","Jolyn","Jolynn","Jonell","Joni","Jonie","Jonis","Jordain","Jordan","Jordana","Jordanna","Jorey","Jori","Jorie","Jorrie","Jorry","Joscelin","Josee","Josefa","Josefina","Josepha","Josephina","Josephine","Josey","Josi","Josie","Josselyn","Josy","Jourdan","Joy","Joya","Joyan","Joyann","Joyce","Joycelin","Joye","Jsandye","Juana","Juanita","Judi","Judie","Judith","Juditha","Judy","Judye","Juieta","Julee","Juli","Julia","Juliana","Juliane","Juliann","Julianna","Julianne","Julie","Julienne","Juliet","Julieta","Julietta","Juliette","Julina","Juline","Julissa","Julita","June","Junette","Junia","Junie","Junina","Justina","Justine","Justinn","Jyoti","Kacey","Kacie","Kacy","Kaela","Kai","Kaia","Kaila","Kaile","Kailey","Kaitlin","Kaitlyn","Kaitlynn","Kaja","Kakalina","Kala","Kaleena","Kali","Kalie","Kalila","Kalina","Kalinda","Kalindi","Kalli","Kally","Kameko","Kamila","Kamilah","Kamillah","Kandace","Kandy","Kania","Kanya","Kara","Kara-Lynn","Karalee","Karalynn","Kare","Karee","Karel","Karen","Karena","Kari","Karia","Karie","Karil","Karilynn","Karin","Karina","Karine","Kariotta","Karisa","Karissa","Karita","Karla","Karlee","Karleen","Karlen","Karlene","Karlie","Karlotta","Karlotte","Karly","Karlyn","Karmen","Karna","Karol","Karola","Karole","Karolina","Karoline","Karoly","Karon","Karrah","Karrie","Karry","Kary","Karyl","Karylin","Karyn","Kasey","Kass","Kassandra","Kassey","Kassi","Kassia","Kassie","Kat","Kata","Katalin","Kate","Katee","Katerina","Katerine","Katey","Kath","Katha","Katharina","Katharine","Katharyn","Kathe","Katherina","Katherine","Katheryn","Kathi","Kathie","Kathleen","Kathlin","Kathrine","Kathryn","Kathryne","Kathy","Kathye","Kati","Katie","Katina","Katine","Katinka","Katleen","Katlin","Katrina","Katrine","Katrinka","Katti","Kattie","Katuscha","Katusha","Katy","Katya","Kay","Kaycee","Kaye","Kayla","Kayle","Kaylee","Kayley","Kaylil","Kaylyn","Keeley","Keelia","Keely","Kelcey","Kelci","Kelcie","Kelcy","Kelila","Kellen","Kelley","Kelli","Kellia","Kellie","Kellina","Kellsie","Kelly","Kellyann","Kelsey","Kelsi","Kelsy","Kendra","Kendre","Kenna","Keri","Keriann","Kerianne","Kerri","Kerrie","Kerrill","Kerrin","Kerry","Kerstin","Kesley","Keslie","Kessia","Kessiah","Ketti","Kettie","Ketty","Kevina","Kevyn","Ki","Kiah","Kial","Kiele","Kiersten","Kikelia","Kiley","Kim","Kimberlee","Kimberley","Kimberli","Kimberly","Kimberlyn","Kimbra","Kimmi","Kimmie","Kimmy","Kinna","Kip","Kipp","Kippie","Kippy","Kira","Kirbee","Kirbie","Kirby","Kiri","Kirsten","Kirsteni","Kirsti","Kirstin","Kirstyn","Kissee","Kissiah","Kissie","Kit","Kitti","Kittie","Kitty","Kizzee","Kizzie","Klara","Klarika","Klarrisa","Konstance","Konstanze","Koo","Kora","Koral","Koralle","Kordula","Kore","Korella","Koren","Koressa","Kori","Korie","Korney","Korrie","Korry","Kris","Krissie","Krissy","Krista","Kristal","Kristan","Kriste","Kristel","Kristen","Kristi","Kristien","Kristin","Kristina","Kristine","Kristy","Kristyn","Krysta","Krystal","Krystalle","Krystle","Krystyna","Kyla","Kyle","Kylen","Kylie","Kylila","Kylynn","Kym","Kynthia","Kyrstin","La Verne","Lacee","Lacey","Lacie","Lacy","Ladonna","Laetitia","Laina","Lainey","Lana","Lanae","Lane","Lanette","Laney","Lani","Lanie","Lanita","Lanna","Lanni","Lanny","Lara","Laraine","Lari","Larina","Larine","Larisa","Larissa","Lark","Laryssa","Latashia","Latia","Latisha","Latrena","Latrina","Laura","Lauraine","Laural","Lauralee","Laure","Lauree","Laureen","Laurel","Laurella","Lauren","Laurena","Laurene","Lauretta","Laurette","Lauri","Laurianne","Laurice","Laurie","Lauryn","Lavena","Laverna","Laverne","Lavina","Lavinia","Lavinie","Layla","Layne","Layney","Lea","Leah","Leandra","Leann","Leanna","Leanor","Leanora","Lebbie","Leda","Lee","Leeann","Leeanne","Leela","Leelah","Leena","Leesa","Leese","Legra","Leia","Leigh","Leigha","Leila","Leilah","Leisha","Lela","Lelah","Leland","Lelia","Lena","Lenee","Lenette","Lenka","Lenna","Lenora","Lenore","Leodora","Leoine","Leola","Leoline","Leona","Leonanie","Leone","Leonelle","Leonie","Leonora","Leonore","Leontine","Leontyne","Leora","Leshia","Lesley","Lesli","Leslie","Lesly","Lesya","Leta","Lethia","Leticia","Letisha","Letitia","Letizia","Letta","Letti","Lettie","Letty","Lexi","Lexie","Lexine","Lexis","Lexy","Leyla","Lezlie","Lia","Lian","Liana","Liane","Lianna","Lianne","Lib","Libbey","Libbi","Libbie","Libby","Licha","Lida","Lidia","Liesa","Lil","Lila","Lilah","Lilas","Lilia","Lilian","Liliane","Lilias","Lilith","Lilla","Lilli","Lillian","Lillis","Lilllie","Lilly","Lily","Lilyan","Lin","Lina","Lind","Linda","Lindi","Lindie","Lindsay","Lindsey","Lindsy","Lindy","Linea","Linell","Linet","Linette","Linn","Linnea","Linnell","Linnet","Linnie","Linzy","Lira","Lisa","Lisabeth","Lisbeth","Lise","Lisetta","Lisette","Lisha","Lishe","Lissa","Lissi","Lissie","Lissy","Lita","Liuka","Liv","Liva","Livia","Livvie","Livvy","Livvyy","Livy","Liz","Liza","Lizabeth","Lizbeth","Lizette","Lizzie","Lizzy","Loella","Lois","Loise","Lola","Loleta","Lolita","Lolly","Lona","Lonee","Loni","Lonna","Lonni","Lonnie","Lora","Lorain","Loraine","Loralee","Loralie","Loralyn","Loree","Loreen","Lorelei","Lorelle","Loren","Lorena","Lorene","Lorenza","Loretta","Lorette","Lori","Loria","Lorianna","Lorianne","Lorie","Lorilee","Lorilyn","Lorinda","Lorine","Lorita","Lorna","Lorne","Lorraine","Lorrayne","Lorri","Lorrie","Lorrin","Lorry","Lory","Lotta","Lotte","Lotti","Lottie","Lotty","Lou","Louella","Louisa","Louise","Louisette","Loutitia","Lu","Luce","Luci","Lucia","Luciana","Lucie","Lucienne","Lucila","Lucilia","Lucille","Lucina","Lucinda","Lucine","Lucita","Lucky","Lucretia","Lucy","Ludovika","Luella","Luelle","Luisa","Luise","Lula","Lulita","Lulu","Lura","Lurette","Lurleen","Lurlene","Lurline","Lusa","Luz","Lyda","Lydia","Lydie","Lyn","Lynda","Lynde","Lyndel","Lyndell","Lyndsay","Lyndsey","Lyndsie","Lyndy","Lynea","Lynelle","Lynett","Lynette","Lynn","Lynna","Lynne","Lynnea","Lynnell","Lynnelle","Lynnet","Lynnett","Lynnette","Lynsey","Lyssa","Mab","Mabel","Mabelle","Mable","Mada","Madalena","Madalyn","Maddalena","Maddi","Maddie","Maddy","Madel","Madelaine","Madeleine","Madelena","Madelene","Madelin","Madelina","Madeline","Madella","Madelle","Madelon","Madelyn","Madge","Madlen","Madlin","Madonna","Mady","Mae","Maegan","Mag","Magda","Magdaia","Magdalen","Magdalena","Magdalene","Maggee","Maggi","Maggie","Maggy","Mahala","Mahalia","Maia","Maible","Maiga","Maighdiln","Mair","Maire","Maisey","Maisie","Maitilde","Mala","Malanie","Malena","Malia","Malina","Malinda","Malinde","Malissa","Malissia","Mallissa","Mallorie","Mallory","Malorie","Malory","Malva","Malvina","Malynda","Mame","Mamie","Manda","Mandi","Mandie","Mandy","Manon","Manya","Mara","Marabel","Marcela","Marcelia","Marcella","Marcelle","Marcellina","Marcelline","Marchelle","Marci","Marcia","Marcie","Marcile","Marcille","Marcy","Mareah","Maren","Marena","Maressa","Marga","Margalit","Margalo","Margaret","Margareta","Margarete","Margaretha","Margarethe","Margaretta","Margarette","Margarita","Margaux","Marge","Margeaux","Margery","Marget","Margette","Margi","Margie","Margit","Margo","Margot","Margret","Marguerite","Margy","Mari","Maria","Mariam","Marian","Mariana","Mariann","Marianna","Marianne","Maribel","Maribelle","Maribeth","Marice","Maridel","Marie","Marie-Ann","Marie-Jeanne","Marieann","Mariejeanne","Mariel","Mariele","Marielle","Mariellen","Marietta","Mariette","Marigold","Marijo","Marika","Marilee","Marilin","Marillin","Marilyn","Marin","Marina","Marinna","Marion","Mariquilla","Maris","Marisa","Mariska","Marissa","Marita","Maritsa","Mariya","Marj","Marja","Marje","Marji","Marjie","Marjorie","Marjory","Marjy","Marketa","Marla","Marlane","Marleah","Marlee","Marleen","Marlena","Marlene","Marley","Marlie","Marline","Marlo","Marlyn","Marna","Marne","Marney","Marni","Marnia","Marnie","Marquita","Marrilee","Marris","Marrissa","Marsha","Marsiella","Marta","Martelle","Martguerita","Martha","Marthe","Marthena","Marti","Martica","Martie","Martina","Martita","Marty","Martynne","Mary","Marya","Maryann","Maryanna","Maryanne","Marybelle","Marybeth","Maryellen","Maryjane","Maryjo","Maryl","Marylee","Marylin","Marylinda","Marylou","Marylynne","Maryrose","Marys","Marysa","Masha","Matelda","Mathilda","Mathilde","Matilda","Matilde","Matti","Mattie","Matty","Maud","Maude","Maudie","Maura","Maure","Maureen","Maureene","Maurene","Maurine","Maurise","Maurita","Maurizia","Mavis","Mavra","Max","Maxi","Maxie","Maxine","Maxy","May","Maybelle","Maye","Mead","Meade","Meagan","Meaghan","Meara","Mechelle","Meg","Megan","Megen","Meggi","Meggie","Meggy","Meghan","Meghann","Mehetabel","Mei","Mel","Mela","Melamie","Melania","Melanie","Melantha","Melany","Melba","Melesa","Melessa","Melicent","Melina","Melinda","Melinde","Melisa","Melisande","Melisandra","Melisenda","Melisent","Melissa","Melisse","Melita","Melitta","Mella","Melli","Mellicent","Mellie","Mellisa","Mellisent","Melloney","Melly","Melodee","Melodie","Melody","Melonie","Melony","Melosa","Melva","Mercedes","Merci","Mercie","Mercy","Meredith","Meredithe","Meridel","Meridith","Meriel","Merilee","Merilyn","Meris","Merissa","Merl","Merla","Merle","Merlina","Merline","Merna","Merola","Merralee","Merridie","Merrie","Merrielle","Merrile","Merrilee","Merrili","Merrill","Merrily","Merry","Mersey","Meryl","Meta","Mia","Micaela","Michaela","Michaelina","Michaeline","Michaella","Michal","Michel","Michele","Michelina","Micheline","Michell","Michelle","Micki","Mickie","Micky","Midge","Mignon","Mignonne","Miguela","Miguelita","Mikaela","Mil","Mildred","Mildrid","Milena","Milicent","Milissent","Milka","Milli","Millicent","Millie","Millisent","Milly","Milzie","Mimi","Min","Mina","Minda","Mindy","Minerva","Minetta","Minette","Minna","Minnaminnie","Minne","Minni","Minnie","Minnnie","Minny","Minta","Miof Mela","Miquela","Mira","Mirabel","Mirabella","Mirabelle","Miran","Miranda","Mireielle","Mireille","Mirella","Mirelle","Miriam","Mirilla","Mirna","Misha","Missie","Missy","Misti","Misty","Mitzi","Modesta","Modestia","Modestine","Modesty","Moina","Moira","Moll","Mollee","Molli","Mollie","Molly","Mommy","Mona","Monah","Monica","Monika","Monique","Mora","Moreen","Morena","Morgan","Morgana","Morganica","Morganne","Morgen","Moria","Morissa","Morna","Moselle","Moyna","Moyra","Mozelle","Muffin","Mufi","Mufinella","Muire","Mureil","Murial","Muriel","Murielle","Myra","Myrah","Myranda","Myriam","Myrilla","Myrle","Myrlene","Myrna","Myrta","Myrtia","Myrtice","Myrtie","Myrtle","Nada","Nadean","Nadeen","Nadia","Nadine","Nadiya","Nady","Nadya","Nalani","Nan","Nana","Nananne","Nance","Nancee","Nancey","Nanci","Nancie","Nancy","Nanete","Nanette","Nani","Nanice","Nanine","Nannette","Nanni","Nannie","Nanny","Nanon","Naoma","Naomi","Nara","Nari","Nariko","Nat","Nata","Natala","Natalee","Natalie","Natalina","Nataline","Natalya","Natasha","Natassia","Nathalia","Nathalie","Natividad","Natka","Natty","Neala","Neda","Nedda","Nedi","Neely","Neila","Neile","Neilla","Neille","Nelia","Nelie","Nell","Nelle","Nelli","Nellie","Nelly","Nerissa","Nerita","Nert","Nerta","Nerte","Nerti","Nertie","Nerty","Nessa","Nessi","Nessie","Nessy","Nesta","Netta","Netti","Nettie","Nettle","Netty","Nevsa","Neysa","Nichol","Nichole","Nicholle","Nicki","Nickie","Nicky","Nicol","Nicola","Nicole","Nicolea","Nicolette","Nicoli","Nicolina","Nicoline","Nicolle","Nikaniki","Nike","Niki","Nikki","Nikkie","Nikoletta","Nikolia","Nina","Ninetta","Ninette","Ninnetta","Ninnette","Ninon","Nissa","Nisse","Nissie","Nissy","Nita","Nixie","Noami","Noel","Noelani","Noell","Noella","Noelle","Noellyn","Noelyn","Noemi","Nola","Nolana","Nolie","Nollie","Nomi","Nona","Nonah","Noni","Nonie","Nonna","Nonnah","Nora","Norah","Norean","Noreen","Norene","Norina","Norine","Norma","Norri","Norrie","Norry","Novelia","Nydia","Nyssa","Octavia","Odele","Odelia","Odelinda","Odella","Odelle","Odessa","Odetta","Odette","Odilia","Odille","Ofelia","Ofella","Ofilia","Ola","Olenka","Olga","Olia","Olimpia","Olive","Olivette","Olivia","Olivie","Oliy","Ollie","Olly","Olva","Olwen","Olympe","Olympia","Olympie","Ondrea","Oneida","Onida","Oona","Opal","Opalina","Opaline","Ophelia","Ophelie","Ora","Oralee","Oralia","Oralie","Oralla","Oralle","Orel","Orelee","Orelia","Orelie","Orella","Orelle","Oriana","Orly","Orsa","Orsola","Ortensia","Otha","Othelia","Othella","Othilia","Othilie","Ottilie","Page","Paige","Paloma","Pam","Pamela","Pamelina","Pamella","Pammi","Pammie","Pammy","Pandora","Pansie","Pansy","Paola","Paolina","Papagena","Pat","Patience","Patrica","Patrice","Patricia","Patrizia","Patsy","Patti","Pattie","Patty","Paula","Paule","Pauletta","Paulette","Pauli","Paulie","Paulina","Pauline","Paulita","Pauly","Pavia","Pavla","Pearl","Pearla","Pearle","Pearline","Peg","Pegeen","Peggi","Peggie","Peggy","Pen","Penelopa","Penelope","Penni","Pennie","Penny","Pepi","Pepita","Peri","Peria","Perl","Perla","Perle","Perri","Perrine","Perry","Persis","Pet","Peta","Petra","Petrina","Petronella","Petronia","Petronilla","Petronille","Petunia","Phaedra","Phaidra","Phebe","Phedra","Phelia","Phil","Philipa","Philippa","Philippe","Philippine","Philis","Phillida","Phillie","Phillis","Philly","Philomena","Phoebe","Phylis","Phyllida","Phyllis","Phyllys","Phylys","Pia","Pier","Pierette","Pierrette","Pietra","Piper","Pippa","Pippy","Polly","Pollyanna","Pooh","Poppy","Portia","Pris","Prisca","Priscella","Priscilla","Prissie","Pru","Prudence","Prudi","Prudy","Prue","Queenie","Quentin","Querida","Quinn","Quinta","Quintana","Quintilla","Quintina","Rachael","Rachel","Rachele","Rachelle","Rae","Raeann","Raf","Rafa","Rafaela","Rafaelia","Rafaelita","Rahal","Rahel","Raina","Raine","Rakel","Ralina","Ramona","Ramonda","Rana","Randa","Randee","Randene","Randi","Randie","Randy","Ranee","Rani","Rania","Ranice","Ranique","Ranna","Raphaela","Raquel","Raquela","Rasia","Rasla","Raven","Ray","Raychel","Raye","Rayna","Raynell","Rayshell","Rea","Reba","Rebbecca","Rebe","Rebeca","Rebecca","Rebecka","Rebeka","Rebekah","Rebekkah","Ree","Reeba","Reena","Reeta","Reeva","Regan","Reggi","Reggie","Regina","Regine","Reiko","Reina","Reine","Remy","Rena","Renae","Renata","Renate","Rene","Renee","Renell","Renelle","Renie","Rennie","Reta","Retha","Revkah","Rey","Reyna","Rhea","Rheba","Rheta","Rhetta","Rhiamon","Rhianna","Rhianon","Rhoda","Rhodia","Rhodie","Rhody","Rhona","Rhonda","Riane","Riannon","Rianon","Rica","Ricca","Rici","Ricki","Rickie","Ricky","Riki","Rikki","Rina","Risa","Rita","Riva","Rivalee","Rivi","Rivkah","Rivy","Roana","Roanna","Roanne","Robbi","Robbie","Robbin","Robby","Robbyn","Robena","Robenia","Roberta","Robin","Robina","Robinet","Robinett","Robinetta","Robinette","Robinia","Roby","Robyn","Roch","Rochell","Rochella","Rochelle","Rochette","Roda","Rodi","Rodie","Rodina","Rois","Romola","Romona","Romonda","Romy","Rona","Ronalda","Ronda","Ronica","Ronna","Ronni","Ronnica","Ronnie","Ronny","Roobbie","Rora","Rori","Rorie","Rory","Ros","Rosa","Rosabel","Rosabella","Rosabelle","Rosaleen","Rosalia","Rosalie","Rosalind","Rosalinda","Rosalinde","Rosaline","Rosalyn","Rosalynd","Rosamond","Rosamund","Rosana","Rosanna","Rosanne","Rose","Roseann","Roseanna","Roseanne","Roselia","Roselin","Roseline","Rosella","Roselle","Rosemaria","Rosemarie","Rosemary","Rosemonde","Rosene","Rosetta","Rosette","Roshelle","Rosie","Rosina","Rosita","Roslyn","Rosmunda","Rosy","Row","Rowe","Rowena","Roxana","Roxane","Roxanna","Roxanne","Roxi","Roxie","Roxine","Roxy","Roz","Rozalie","Rozalin","Rozamond","Rozanna","Rozanne","Roze","Rozele","Rozella","Rozelle","Rozina","Rubetta","Rubi","Rubia","Rubie","Rubina","Ruby","Ruperta","Ruth","Ruthann","Ruthanne","Ruthe","Ruthi","Ruthie","Ruthy","Ryann","Rycca","Saba","Sabina","Sabine","Sabra","Sabrina","Sacha","Sada","Sadella","Sadie","Sadye","Saidee","Sal","Salaidh","Sallee","Salli","Sallie","Sally","Sallyann","Sallyanne","Saloma","Salome","Salomi","Sam","Samantha","Samara","Samaria","Sammy","Sande","Sandi","Sandie","Sandra","Sandy","Sandye","Sapphira","Sapphire","Sara","Sara-Ann","Saraann","Sarah","Sarajane","Saree","Sarena","Sarene","Sarette","Sari","Sarina","Sarine","Sarita","Sascha","Sasha","Sashenka","Saudra","Saundra","Savina","Sayre","Scarlet","Scarlett","Sean","Seana","Seka","Sela","Selena","Selene","Selestina","Selia","Selie","Selina","Selinda","Seline","Sella","Selle","Selma","Sena","Sephira","Serena","Serene","Shae","Shaina","Shaine","Shalna","Shalne","Shana","Shanda","Shandee","Shandeigh","Shandie","Shandra","Shandy","Shane","Shani","Shanie","Shanna","Shannah","Shannen","Shannon","Shanon","Shanta","Shantee","Shara","Sharai","Shari","Sharia","Sharity","Sharl","Sharla","Sharleen","Sharlene","Sharline","Sharon","Sharona","Sharron","Sharyl","Shaun","Shauna","Shawn","Shawna","Shawnee","Shay","Shayla","Shaylah","Shaylyn","Shaylynn","Shayna","Shayne","Shea","Sheba","Sheela","Sheelagh","Sheelah","Sheena","Sheeree","Sheila","Sheila-Kathryn","Sheilah","Shel","Shela","Shelagh","Shelba","Shelbi","Shelby","Shelia","Shell","Shelley","Shelli","Shellie","Shelly","Shena","Sher","Sheree","Sheri","Sherie","Sherill","Sherilyn","Sherline","Sherri","Sherrie","Sherry","Sherye","Sheryl","Shina","Shir","Shirl","Shirlee","Shirleen","Shirlene","Shirley","Shirline","Shoshana","Shoshanna","Siana","Sianna","Sib","Sibbie","Sibby","Sibeal","Sibel","Sibella","Sibelle","Sibilla","Sibley","Sibyl","Sibylla","Sibylle","Sidoney","Sidonia","Sidonnie","Sigrid","Sile","Sileas","Silva","Silvana","Silvia","Silvie","Simona","Simone","Simonette","Simonne","Sindee","Siobhan","Sioux","Siouxie","Sisely","Sisile","Sissie","Sissy","Siusan","Sofia","Sofie","Sondra","Sonia","Sonja","Sonni","Sonnie","Sonnnie","Sonny","Sonya","Sophey","Sophi","Sophia","Sophie","Sophronia","Sorcha","Sosanna","Stace","Stacee","Stacey","Staci","Stacia","Stacie","Stacy","Stafani","Star","Starla","Starlene","Starlin","Starr","Stefa","Stefania","Stefanie","Steffane","Steffi","Steffie","Stella","Stepha","Stephana","Stephani","Stephanie","Stephannie","Stephenie","Stephi","Stephie","Stephine","Stesha","Stevana","Stevena","Stoddard","Storm","Stormi","Stormie","Stormy","Sue","Suellen","Sukey","Suki","Sula","Sunny","Sunshine","Susan","Susana","Susanetta","Susann","Susanna","Susannah","Susanne","Susette","Susi","Susie","Susy","Suzann","Suzanna","Suzanne","Suzette","Suzi","Suzie","Suzy","Sybil","Sybila","Sybilla","Sybille","Sybyl","Sydel","Sydelle","Sydney","Sylvia","Tabatha","Tabbatha","Tabbi","Tabbie","Tabbitha","Tabby","Tabina","Tabitha","Taffy","Talia","Tallia","Tallie","Tallou","Tallulah","Tally","Talya","Talyah","Tamar","Tamara","Tamarah","Tamarra","Tamera","Tami","Tamiko","Tamma","Tammara","Tammi","Tammie","Tammy","Tamqrah","Tamra","Tana","Tandi","Tandie","Tandy","Tanhya","Tani","Tania","Tanitansy","Tansy","Tanya","Tara","Tarah","Tarra","Tarrah","Taryn","Tasha","Tasia","Tate","Tatiana","Tatiania","Tatum","Tawnya","Tawsha","Ted","Tedda","Teddi","Teddie","Teddy","Tedi","Tedra","Teena","TEirtza","Teodora","Tera","Teresa","Terese","Teresina","Teresita","Teressa","Teri","Teriann","Terra","Terri","Terrie","Terrijo","Terry","Terrye","Tersina","Terza","Tess","Tessa","Tessi","Tessie","Tessy","Thalia","Thea","Theadora","Theda","Thekla","Thelma","Theo","Theodora","Theodosia","Theresa","Therese","Theresina","Theresita","Theressa","Therine","Thia","Thomasa","Thomasin","Thomasina","Thomasine","Tiena","Tierney","Tiertza","Tiff","Tiffani","Tiffanie","Tiffany","Tiffi","Tiffie","Tiffy","Tilda","Tildi","Tildie","Tildy","Tillie","Tilly","Tim","Timi","Timmi","Timmie","Timmy","Timothea","Tina","Tine","Tiphani","Tiphanie","Tiphany","Tish","Tisha","Tobe","Tobey","Tobi","Toby","Tobye","Toinette","Toma","Tomasina","Tomasine","Tomi","Tommi","Tommie","Tommy","Toni","Tonia","Tonie","Tony","Tonya","Tonye","Tootsie","Torey","Tori","Torie","Torrie","Tory","Tova","Tove","Tracee","Tracey","Traci","Tracie","Tracy","Trenna","Tresa","Trescha","Tressa","Tricia","Trina","Trish","Trisha","Trista","Trix","Trixi","Trixie","Trixy","Truda","Trude","Trudey","Trudi","Trudie","Trudy","Trula","Tuesday","Twila","Twyla","Tybi","Tybie","Tyne","Ula","Ulla","Ulrica","Ulrika","Ulrikaumeko","Ulrike","Umeko","Una","Ursa","Ursala","Ursola","Ursula","Ursulina","Ursuline","Uta","Val","Valaree","Valaria","Vale","Valeda","Valencia","Valene","Valenka","Valentia","Valentina","Valentine","Valera","Valeria","Valerie","Valery","Valerye","Valida","Valina","Valli","Vallie","Vally","Valma","Valry","Van","Vanda","Vanessa","Vania","Vanna","Vanni","Vannie","Vanny","Vanya","Veda","Velma","Velvet","Venita","Venus","Vera","Veradis","Vere","Verena","Verene","Veriee","Verile","Verina","Verine","Verla","Verna","Vernice","Veronica","Veronika","Veronike","Veronique","Vevay","Vi","Vicki","Vickie","Vicky","Victoria","Vida","Viki","Vikki","Vikky","Vilhelmina","Vilma","Vin","Vina","Vinita","Vinni","Vinnie","Vinny","Viola","Violante","Viole","Violet","Violetta","Violette","Virgie","Virgina","Virginia","Virginie","Vita","Vitia","Vitoria","Vittoria","Viv","Viva","Vivi","Vivia","Vivian","Viviana","Vivianna","Vivianne","Vivie","Vivien","Viviene","Vivienne","Viviyan","Vivyan","Vivyanne","Vonni","Vonnie","Vonny","Vyky","Wallie","Wallis","Walliw","Wally","Waly","Wanda","Wandie","Wandis","Waneta","Wanids","Wenda","Wendeline","Wendi","Wendie","Wendy","Wendye","Wenona","Wenonah","Whitney","Wileen","Wilhelmina","Wilhelmine","Wilie","Willa","Willabella","Willamina","Willetta","Willette","Willi","Willie","Willow","Willy","Willyt","Wilma","Wilmette","Wilona","Wilone","Wilow","Windy","Wini","Winifred","Winna","Winnah","Winne","Winni","Winnie","Winnifred","Winny","Winona","Winonah","Wren","Wrennie","Wylma","Wynn","Wynne","Wynnie","Wynny","Xaviera","Xena","Xenia","Xylia","Xylina","Yalonda","Yasmeen","Yasmin","Yelena","Yetta","Yettie","Yetty","Yevette","Ynes","Ynez","Yoko","Yolanda","Yolande","Yolane","Yolanthe","Yoshi","Yoshiko","Yovonnda","Ysabel","Yvette","Yvonne","Zabrina","Zahara","Zandra","Zaneta","Zara","Zarah","Zaria","Zarla","Zea","Zelda","Zelma","Zena","Zenia","Zia","Zilvia","Zita","Zitella","Zoe","Zola","Zonda","Zondra","Zonnya","Zora","Zorah","Zorana","Zorina","Zorine","Zsa Zsa","Zsazsa","Zulema","Zuzana"]
    var baseName = names[Math.floor(Math.random()*(names.length-1))];
    baseName = baseName.replaceAll("-", "");
    return baseName+Math.floor(Math.random()*99999);
}

function getRandomPassword(){
    var length = 8 + Math.floor(Math.random()*7),
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+!@#$%^&*()_+",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}