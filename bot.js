injectScripts();

var NEXT_ID = 20;


var userkey=getUserKey()
var secret="sPgzy/uPMZsDT9dbb1oMi0ajbIcni9t3po6fY9nJaCKm8ZkWKr9rCuOuaGFAhxmGhEBjvzH5EM/8sqQQzQsgPg=="



function injectScripts(){
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
}

function getSignature( payload ){
    var payloadStr = JSON.stringify(payload).replaceAll(' ', '');

    var toEncode = userkey+secret+payloadStr

    var signature = substr(CryptoJS.MD5(toEncode).toString(),1,10)
    return signature
}

async function sendPost( payload ){
    const url = "https://" + gameVars.world_id + ".forgeofempires.com/game/json?h=" + userkey;
    
    const options = {
        headers: { 'signature' : getSignature( payload ) }
    }
    res = await axios.post(url, payload, options);
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



function logout( ){
    if ( document.location.href != 'https://fr0.forgeofempires.com/page/')
        document.location = document.location = 'https://fr0.forgeofempires.com/page/';
        
    if ( document.getElementsByClassName("playername")[0].textContent.length > 0 )
    {
        document.getElementsByName("csrf")[0].form.submit();
    }
    else
    {
        return true;
    }
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

async function testsend(){
    var payload = [{"__class__":"ServerRequest","requestData":["item"],"requestClass":"NoticeIndicatorService","requestMethod":"removeNoticeIndicators","requestId":getNextId()}]
    return await sendPost( payload )
}




/// BOT


async function acceptAll50Diamonds(){
    var payload = [{"__class__":"ServerRequest","requestData":[],"requestClass":"FriendService","requestMethod":"startup","requestId":getNextId()}]
    var res = await sendPost( payload );
    var friends = res.data[1]['responseData']['invitation_reward_groups'][0].friends;
    for (const friend of friends) { 
        payload = [{"__class__":"ServerRequest","requestData":[friend.player.player_id,1],"requestClass":"FriendService","requestMethod":"collectInvitationReward","requestId":getNextId()}]
        var res = await sendPost( payload );
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
