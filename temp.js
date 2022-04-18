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
    var accountId = await GM_getValue("accountId");
    console.log( accountId );
    var account = await getAccount(accountId);
    console.log( account );

    var password = account.password;
    await sendPost( [{"__class__":"ServerRequest","requestData":[password],"requestClass":"SettingsService","requestMethod":"markForDeletion","requestId":getNextId()}]);
}