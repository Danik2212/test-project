<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN""http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<head>
    <title>Forge of Empires</title>

    <meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,requiresActiveX=true"/>
    <meta name="description" content="Forge of Empires, un jeu par navigateur gratuit."/>

    <link rel="shortcut icon" href="https://foefr.innogamescdn.com/favicon.ico?946cdd8b" type="image/x-icon"/>
    <link rel="apple-touch-icon" href="https://foefr.innogamescdn.com/apple-touch-icon.png"/>

            <link href="https://foefr.innogamescdn.com/cache/merged-game-ca249956.css" rel="stylesheet" type="text/css"/>
    
    <script type="text/javascript">
        window.addEventListener ("touchmove", function (event) { event.preventDefault (); }, false);
        if (typeof window.devicePixelRatio != 'undefined' && window.devicePixelRatio > 2) {
            var meta = document.getElementById ("viewport");
            meta.setAttribute ('content', 'width=device-width, initial-scale=' + (2 / window.devicePixelRatio) + ', user-scalable=no');
        }
    </script>

    <script type="text/javascript">
        if (window.addEventListener === undefined && window.attachEvent !== undefined) {
            window.addEventListener = function addEventListener(event, callback) {
                window.attachEvent('on' + event, callback);
            };

            window.removeEventListener = function removeEventListener(event, callback) {
                window.detachEvent('on' + event, callback);
            };
        }
    </script>

            <script type="text/javascript" crossorigin="anonymous" src="https://foefr.innogamescdn.com/cache/merged-3rd-party-818a5bbc.js"></script>
            <script type="text/javascript" crossorigin="anonymous" src="https://foefr.innogamescdn.com/cache/merged-game-4f86dad2.js"></script>
        
            <script type="text/javascript">
            Sentry.init({
                dsn: 'https://d628e2f279d84df28c555e271a5bf879:4b062cd84e7e43a986862449e9d32cbc@foe-sentry-events.innogames.de/9',
                release: '1.227-0d8c207cd97',
                environment: 'fr',
                autoSessionTracking: false,
                defaultIntegrations: [
                    new Sentry.Integrations.InboundFilters(),
                    new Sentry.Integrations.FunctionToString(),
                    new Sentry.Integrations.LinkedErrors(),
                    new Sentry.Integrations.UserAgent(),
                    new Sentry.Integrations.Breadcrumbs({
                        xhr: false,
                        dom: false,
                    }),
                ],
                ignoreErrors: [
                    // Errors in scripts from other origins
                    "Uncaught JS error: message=`Script error.`, position=`:0:0`",
                ],
                denyUrls: [
                    // Chrome extensions
                    /extensions\//i,
                    /^chrome:\/\//i,
                    /^chrome-extension:\/\//i,
                ],
            });

            Sentry.setUser({
                id: 11042606,
                username: 'Carrefour Archer',
            });
            Sentry.setExtra('world_id', 'fr21');
        </script>
    
    <script type="text/javascript">
        function onTranslationsLoaded(catalog) {
            trackLoadingProcess('translations_loaded');
            window.gettextCatalog = catalog;
            var scriptref = document.createElement('script');
            scriptref.addEventListener('load', onGameLoaded);
            scriptref.setAttribute('type', 'text/javascript');
            scriptref.setAttribute('src', 'https://foefr.innogamescdn.com/cache/ForgeHX-b5ecfaf1.js');
            scriptref.setAttribute('crossorigin', 'anonymous');
            document.body.appendChild(scriptref);
        }

        function onGameLoaded() {
            trackLoadingProcess('game_loaded');
            startFoe("openfl-content", 0x0E1E2D, 0);
        }

        function startPreloader() {
            preloadFoe('https://foefr.innogamescdn.com/lang/fr_FR/client_lang-fa8196808239ae8975a914835d5c5255.mo', onTranslationsLoaded);
        }

        function killPreloader() {
            document.getElementById('preloader').outerHTML = '';
        }

        function removeSupportButton() {
                        $("#support-button").fadeOut(function() { $(this).remove() });
                    }
    </script>

    <script type="text/javascript">
        $.ajaxSetup({
            headers:{
                "Client-Identification": "platformType=html5"
            }
        });

        var gameInfo = {};
        var isInternetExplorer = false;
        var isFirefoxBrowser = false;
        var startTime = new Date().getTime();

        function getStartTime() {
           return startTime;
        }

        trackLoadingProcess('javascript');
        getBrowser();

        function isFacebookCanvas() {
            return (/^iframe_canvas/).test(window.name);
        }

        if (isFacebookCanvas()) {
            window.innoPaymentFacebookCanvas = new InnoPaymentFacebookCanvasLib();
            window.innoPaymentFacebookCanvas.init({appId: 771018329675917});

            $.cookie('canvas', 1, {path: '/'});
        } else {
            $.cookie('canvas', null, {path: '/'});
        }

        function getIP() {
            return "87.196.73.208";
        }

        var clientStrings = [
                {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
                {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
                {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
                {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
                {s:'Windows Vista', r:/Windows NT 6.0/},
                {s:'Windows Server 2003', r:/Windows NT 5.2/},
                {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
                {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
                {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
                {s:'Windows 98', r:/(Windows 98|Win98)/},
                {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
                {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
                {s:'Windows CE', r:/Windows CE/},
                {s:'Windows 3.11', r:/Win16/},
                {s:'Android', r:/Android/},
                {s:'Open BSD', r:/OpenBSD/},
                {s:'Sun OS', r:/SunOS/},
                {s:'Linux', r:/(Linux|X11)/},
                {s:'iOS', r:/(iPhone|iPad|iPod)/},
                {s:'Mac OS X', r:/Mac OS X/},
                {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
                {s:'QNX', r:/QNX/},
                {s:'UNIX', r:/UNIX/},
                {s:'BeOS', r:/BeOS/},
                {s:'OS/2', r:/OS\/2/},
                {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
            ];

        function getOS() {
            var userAgent = navigator.userAgent;
            var os = "Unknown";

            for (var id in clientStrings) {
                var cs = clientStrings[id];
                if (cs.r.test(userAgent)) {
                    os = cs.s;
                    break;
                }
            }

            var osVersion = "";

            if (/Windows/.test(os)) {
                return os;
            } else  if (os == 'Mac OS X') {
                osVersion = /Mac OS X (10[\.\_\d]+)/.exec(userAgent)[1];
                if (osVersion) {
                    osVersion = osVersion.replace(/_/g, ".");
                }
            }

            return os + " " + osVersion;
        }

        function getBrowser() {
            var userAgent = navigator.userAgent;
            var isFirefox = userAgent.search(/Firefox/) != -1;
            var isIE = getIEVersion(userAgent);
            var isOpera = getOperaVersion(userAgent);
            var isChrome = userAgent.search(/Chrome/) != -1;
            var isSafari = userAgent.search(/Safari/) != -1;

            var result = "";
            if (isIE) {
                result = "MSIE " + isIE;
                isInternetExplorer = true;
            } else if (isOpera) {
                result = "Opera " + isOpera;
            } else if (isFirefox) {
                result = userAgent.match(/Firefox\/[0-9\.]*/)[0];
                isFirefoxBrowser = true;
            } else if (isChrome) {
                result = userAgent.match(/Chrome\/[0-9\.]*/)[0];
            } else if (isSafari) {
                result = "Safari " + userAgent.match(/Version\/[0-9\.]*/)[0];
            }

            return result;
        }

        function getIEVersion(userAgent) {
            // IE 10 or older
            if (userAgent.search(/MSIE/) != -1) {
                return userAgent.match(/MSIE ([0-9\.]*)/)[1];
            }

            // IE 11
            if (userAgent.search(/Trident\//) != -1) {
                return userAgent.match(/rv:([0-9\.]*)/)[1];
            }

            // IE 12 => return version number
            if (userAgent.search(/Edge\//) != -1) {
                return userAgent.match(/Edge\/([0-9\.]*)/)[1];
            }

            return false;
        }

        function getOperaVersion(userAgent) {
            if (userAgent.search(/Opera/) != -1) {
                return userAgent.match(/Version\/([0-9\.]*)/)[1];
            } else if (userAgent.search(/OPR/) != -1) {
                return userAgent.match(/OPR\/([0-9\.]*)/)[1];
            }
            return false;
        }

        function showPayment(tab) {
            $.get('/game/payment', {
                tab: tab
            }, function (iframe) {
                showIframe(iframe);
                window.addEventListener('message', onPaymentMessage);
            });
        }

        function onPaymentMessage(e) {
            if ('CloseCashshop' === e.data) {
                hideIframe(true);
                window.removeEventListener('message', onPaymentMessage);
            }
        }

        function showIframe(iframe) {
            if (hasPaymentIframe()) {
                return;
            }
            $('<iframe id="payment" allowtransparency="true" scrolling="no" frameBorder="0" style="position: absolute; display: block; height: ' + iframe.height + 'px !important; top: 50%; margin-top: -' + parseInt(iframe.height / 2) + 'px; width: ' + iframe.width + 'px !important; left: 50%; margin-left: -' + parseInt(iframe.width / 2) + 'px; border:none;">').appendTo('#imageContent');
            if (!iframe.isNewShop) {
                $('<div id="closePopup" onClick="hideIframe()"></div>').appendTo('#imageContent');
            }
            $('<div id="shieldLoader"></div>').appendTo('#imageContent');

            $('#payment').on('load', function () {
                $('#shieldLoader').remove();
            });
            $('#payment').attr('src', iframe.url);

            showScreenshot();
        }

        function hasPaymentIframe() {
            return $('iframe#payment').length > 0;
        }

        function hasFocus() {
            return document.hasFocus();
        }

        function shareOnFacebook(url) {
            window.open("https://www.facebook.com/sharer/sharer.php?u=" + url, "share", "height=550, width=550, toolbar=no, scrollbars=no");
        }

        var warningHeight = '40px';
        function initLowerPerformanceMode(changeViewportSize) {
            if (hasWarning()) return;

                        showWarning('Le jeu est actuellement en mode faibles performances. Veuillez vérifier si les pilotes de votre carte graphique sont à jour ou si l&#039;accélération matérielle est désactivée dans les paramètres de votre navigateur. Pour une meilleure performance, nous vous conseillons de jouer sur une taille de zone de jeu plus petite. <a href="#" id="reduce-viewport-size" class="html5Link">Cliquer ici</a> pour modifier la taille de la zone de jeu ou utilisez le Menu Propriétés. Rendez-vous sur notre <a href="https://fr0.forgeofempires.com/page/redirect/html5-help/" target="_blank" id="html5-help" class="html5Link">base de connaissances</a> si vous avez besoin d&#039;aide.');
            document.getElementById("reduce-viewport-size").onclick = function() {
                changeViewportSize(determineBestViewportSizeVariant());
                removeWarning();
                return false;
            }
                    }

                function determineBestViewportSizeVariant() {
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;
            var i = availableViewportSizes.length - 1;
            while (i >= 0) {
                var size = availableViewportSizes[i];
                if (windowWidth >= size.width && windowHeight >= size.height) {
                    return i + 1;
                }
                i--;
            }
            return 1;
        }
        
        function hasWarning() {
            return $('.warning').length > 0;
        }

        function removeWarning() {
            $('.warning').remove();
            $('#game-container').removeClass("with-warning");
        }

        var warningHeight = 45;
        function showWarning(message) {
            $('<div class="warning" style="height: ' + warningHeight + 'px"><div class="closePopup" onClick="removeWarning()"></div><span style="height: ' + warningHeight+ 'px;">' + message + '</span></div>').appendTo('#container');
            $('#game-container').addClass("with-warning");
        }

        function showScreenshot() {
            $('#imageContent').show();
            document.getElementById('openfl-content').iFrameOpened();
        }

        function hideScreenshot() {
            $('#foe_clan_forum, #payment, #abort, #closeForumPopup, #closePopup').remove();
            $('#imageContent').hide();
            document.getElementById('openfl-content').iFrameClosed();
        }

        
        function hideIframe() {
            hideScreenshot();
            $('#container').attr('onClick', null);

            return false;
        }

        function hideForumIframe() {
            hideScreenshot();
            $('#container').attr('onClick', null);

            return false;
        }

        function trackLoadingProcess(step) {
            $.get('/game/tracking?action=track_loading_process&step=' + step);
        }

        var domElementName = "openfl-content";
        var gameVars = {
            'basepath': 'https://foefr.innogamescdn.com/',
            'domElementName': domElementName,
            'gatewayUrl': 'https://fr21.forgeofempires.com/game/json?h=phC3QEj2PlEn0RPxts12UJ_E',
            'socketGatewayUrl': (location.protocol === 'https:' ? 'wss' : 'ws') + '://fr21.forgeofempires.com/socket/',
            'sentryCheckUrl': '',
            'socket_token': 'XCQ2jE_MU7S6vpuQruFq7pX6XQJTIODicm0yzy1zXk5BfDFi3X24RcjCve3uNiX-JY5XhvMECg2LWyAVVJMh8XNVeknALe2BVSkAj43X2a_pzYmc0wcI8oNgki6I6m9CrPbqHbZlimGqVq_t94Wc-l4XhTlvw0dHArh43fVcxS5K-kAIK1Do3xTrE93wWq6NmL1X623rMciR1EpaLXH4EA',
            'market_id': 'fr',
            'sound': 'false',
            'locale': 'fr_FR',
            'langHash': 'fa8196808239ae8975a914835d5c5255',
            'world_id': 'fr21',
            'world_name': 'Vingrid',
            'loading_screen_text': 'L%27emplacement+de+l%27%C3%A9claireur+sur+la+carte+de+campagne+est+sans+importance+pour+pouvoir+attaquer+des+provinces.',
            'loading_screen_type': 'Beginners',
            'is_facebook_canvas': isFacebookCanvas().toString(),
            'is_microsoft_store': 'false',
            'no_fps_cap': 'false',
            'show_fps': 'false',
            'performance_tracking_delay': '30',
            'performance_tracking_interval': '300',
            'logToSentryDirectly': '1',
            'verboseSentryLogging': '',
        };

        var track_startup_time = new TrackStartupTime();

        /**
         * @param {String} pixel_content
         */
        function showMarketingPixel(pixel_content) {
            var div = $('<div/>').hide();
            $(document.body).append(div);
            postscribe(div, pixel_content, {error: function(e) {console.error(e.msg);}});
        }

        function handleContextError() {
            $('#game_body').css('background', 'url(https://foefr.innogamescdn.com/assets/page/html5_fallback/foe_wallpaper-d8649e9a6.jpg) no-repeat center bottom fixed');
            $('.guide').show();
            $('#game-container').hide();
        }

        var availableViewportSizes = [
                        {width: 950, height: 600},
                        {width: 1280, height: 720},
                    ];

        function initViewportSizes() {
            var styleElement = document.createElement("style");
            document.head.appendChild(styleElement);
            var styleSheet = styleElement.sheet;
            for (var i = 0; i < availableViewportSizes.length; i++) {
                var size = availableViewportSizes[i];
                var selector = ".size" + (i + 1) + " #game-container-centered";
                var properties =
                    "width: " + size.width + "px;" +
                    "height: " + size.height + "px;";
                styleSheet.insertRule(selector + "{" + properties + "}", styleSheet.cssRules.length);
            }
        }

        function applyViewportSizeVariant(variant) {
            var gamediv = $("#game-container");
            gamediv.removeClass();
            gamediv.addClass("size" + variant);
        }

        $(window).on('load', function () {
            trackLoadingProcess('window_loaded');
        });

        $(function () {
            trackLoadingProcess('dom_loaded');

            initViewportSizes();

            foe.notificationApi.init('https://foefr.innogamescdn.com/');

            if (isInternetExplorer) {
                /**
                 *   In IE11 viewport height for some reason is on half pixel(e.g. 840.5px, see in DOM Inspector).
                 *   When you request a #container's clientHeight a rounded number in pixels is returned. In this case 841px.
                 *   The canvas created in openfl has size 841px and produces half pixel overflow which displays scrollbars.
                 *   We don't want those scrollbars when a window is bigger then min-width x min-height, hence the overflow is hidden
                 */
                $('#container').css('overflow', 'hidden');

                // For every player playing html5 game in IE11 display a banner that informs him that the browser doesn't provide optimal game experience.
                if (hasWarning()) removeWarning();
                showWarning('Votre navigateur n&#039;est pas compatible avec les fonctionnalités HTML5 modernes. Pour continuer à jouer à notre jeu sans problème, veuillez mettre à jour votre navigateur ou utiliser un autre navigateur.');
            }

            startPreloader();

            var content = "<!--\r\nStart of DoubleClick Floodlight Tag: Please do not remove\r\nActivity name of this tag: FOE FR NONE Active Users\r\nURL of the webpage where the tag is expected to be placed: http:\/\/om.forgeofempires.com\/foe\/fr\r\nThis tag must be placed between the <body> and <\/body> tags, as close as possible to the opening tag.\r\nCreation Date: 09\/19\/2014\r\n-->\r\n<iframe src=\"https:\/\/4216959.fls.doubleclick.net\/activityi;src=4216959;type=activsal;cat=foeFRnon;qty=1;cost=[Revenue];u2={PLAYER_ID};ord=[OrderID]?\" width=\"1\" height=\"1\" frameborder=\"0\" style=\"display:none\"><\/iframe>\r\n<!-- End of DoubleClick Floodlight Tag: Please do not remove -->\r\n\r\n\r\n\r\n<script type=\"application\/javascript\">\r\n    window.dotq = window.dotq || [];\r\n    window.dotq.push(\r\n    {\r\n        projectId: '10000',\r\n        properties: {\r\n        pixelId: '10004574',\r\n        qstrings: {         \r\n'et': 'custom', \r\n'ea': 'login_event'\r\n            }\r\n        }\r\n    });\r\n    <\/script>\r\n\r\n<img height=\"1\" width=\"1\" style=\"border-style:none;\" alt=\"\" src=\"\/\/googleads.g.doubleclick.net\/pagead\/viewthroughconversion\/974798281\/?value=0&amp;guid=ON&amp;script=0&amp;data=type%3Dingame%3Bpartner%3Dretargeting%3Bgame%3Dfoe\"\/>\r\n\r\n<img height=\"1\" width=\"1\" style=\"border-style:none;\" alt=\"\" src=\"\/\/googleads.g.doubleclick.net\/pagead\/viewthroughconversion\/933780018\/?value=0&amp;guid=ON&amp;script=0&amp;data=type%3Dingame%3Bpartner%3Dretargeting%3Bgame%3Dfoe\"\/>\r\n\r\n<img height=\"1\" width=\"1\" style=\"border-style:none;\" alt=\"\" src=\"\/\/googleads.g.doubleclick.net\/pagead\/viewthroughconversion\/968559567\/?value=0&amp;guid=ON&amp;script=0&amp;data=type%3Dingame%3Bpartner%3Dretargeting%3Bgame%3Dfoe\"\/>\r\n\r\n<img height=\"1\" width=\"1\" style=\"border-style:none;\" alt=\"\" src=\"\/\/googleads.g.doubleclick.net\/pagead\/viewthroughconversion\/973152926\/?value=0&amp;guid=ON&amp;script=0&amp;data=type%3Dingame%3Bpartner%3Dretargeting%3Bgame%3Dfoe\"\/>\r\n\r\n<!--\r\nAppNexus Global Active User FR\r\nCreation Date: 14.10.2016, JLI\r\n-->\r\n<script src=\"https:\/\/secure.adnxs.com\/px?id=776904&seg=6627929&t=1\" type=\"text\/javascript\"><\/script>\r\n\r\n<!--\r\nStart of DoubleClick Floodlight Tag: Please do not remove\r\nActivity name of this tag: FOE Global Active User and Unique Player ID\r\nURL of the webpage where the tag is expected to be placed: https:\/\/om.forgeofempires.com\/\r\nThis tag must be placed between the <body> and <\/body> tags, as close as possible to the opening tag.\r\nCreation Date: 05\/19\/2014\r\n-->\r\n<iframe src=\"https:\/\/4216959.fls.doubleclick.net\/activityi;src=4216959;type=activsal;cat=foeGLacs;qty=1;cost=[Revenue];u2={PLAYER_ID};ord=[OrderID]?\" width=\"1\" height=\"1\" frameborder=\"0\" style=\"display:none\"><\/iframe>\r\n<!-- End of DoubleClick Floodlight Tag: Please do not remove -->\r\n\r\n<!-- Google Code f\u00fcr Search-Remarketing-->\r\n<!--------------------------------------------------\r\nRemarketing-Tags d\u00fcrfen nicht mit personenbezogenen Daten verkn\u00fcpft oder auf Seiten platziert werden, die sensiblen Kategorien angeh\u00f6ren. Weitere Informationen und Anleitungen zur Einrichtung des Tags erhalten Sie unter: http:\/\/google.com\/ads\/remarketingsetup\r\n--------------------------------------------------->\r\n<div style=\"display:inline;\">\r\n<img height=\"1\" width=\"1\" style=\"border-style:none;\" alt=\"\" src=\"\/\/googleads.g.doubleclick.net\/pagead\/viewthroughconversion\/973263328\/?value=0&amp;guid=ON&amp;script=0\"\/>\r\n<\/div>\r\n\r\n\r\n\r\n<img height=\"1\" width=\"1\" style=\"border-style:none;\" alt=\"\" src=\"\/\/googleads.g.doubleclick.net\/pagead\/viewthroughconversion\/1015513042\/?value=0&amp;guid=ON&amp;script=0&amp;data=type%3Dingame\"\/>\r\n\r\n<img height=\"1\" width=\"1\" style=\"border-style:none;\" alt=\"\" src=\"\/\/googleads.g.doubleclick.net\/pagead\/viewthroughconversion\/1013420487\/?value=0&amp;guid=ON&amp;script=0&amp;data=type%3Dingame%3Bpartner%3Dretargeting%3Bgame%3Dfoe\"\/>\r\n\r\n<img height=\"1\" width=\"1\" style=\"border-style:none;\" alt=\"\" src=\"\/\/googleads.g.doubleclick.net\/pagead\/viewthroughconversion\/963216494\/?value=0&amp;guid=ON&amp;script=0&amp;data=type%3Dingame%3Bpartner%3Dretargeting%3Bgame%3Dfoe\"\/>\r\n\r\n<img height=\"1\" width=\"1\" style=\"border-style:none;\" alt=\"\" src=\"\/\/googleads.g.doubleclick.net\/pagead\/viewthroughconversion\/970075357\/?value=0&amp;guid=ON&amp;script=0&amp;data=type%3Dingame%3Bpartner%3Dretargeting%3Bgame%3Dfoe\"\/>\r\n\r\n<!--\r\nStart of DoubleClick Floodlight Tag: Please do not remove\r\nActivity name of this tag: FOE FR Login Counter\r\nURL of the webpage where the tag is expected to be placed: https:\/\/fr.forgeofempires.com\/\r\nThis tag must be placed between the <body> and <\/body> tags, as close as possible to the opening tag.\r\nCreation Date: 06\/03\/2016\r\n-->\r\n<script type=\"text\/javascript\">\r\nvar axel = Math.random() + \"\";\r\nvar a = axel * 10000000000000;\r\ndocument.write('<iframe src=\"https:\/\/4216959.fls.doubleclick.net\/activityi;src=4216959;type=login;cat=foefr0;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=1;num=' + a + '?\" width=\"1\" height=\"1\" frameborder=\"0\" style=\"display:none\"><\/iframe>');\r\n<\/script>\r\n<noscript>\r\n<iframe src=\"https:\/\/4216959.fls.doubleclick.net\/activityi;src=4216959;type=login;cat=foefr0;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=1;num=1?\" width=\"1\" height=\"1\" frameborder=\"0\" style=\"display:none\"><\/iframe>\r\n<\/noscript>\r\n<!-- End of DoubleClick Floodlight Tag: Please do not remove -->\r\n\r\n<img src=\"\/\/amplifypixel.outbrain.com\/pixel?mid=00663a47392e2ef74d6c5c7298eff6ba55\"><\/img>\r\n\r\n<script type=\"text\/javascript\">\r\n    window._tfa = window._tfa || [];\r\n    _tfa.push({ notify: 'mark',type: 'suppression' });\r\n<\/script>\r\n\r\n\r\n<!-- Google Code f\u00fcr GSP-Remarketing-Tag -->\r\n<!--------------------------------------------------\r\nRemarketing-Tags d\u00fcrfen nicht mit personenbezogenen Daten verkn\u00fcpft oder auf Seiten platziert werden, die sensiblen Kategorien angeh\u00f6ren. Weitere Informationen und Anleitungen zur Einrichtung des Tags erhalten Sie unter: http:\/\/google.com\/ads\/remarketingsetup\r\n--------------------------------------------------->\r\n<script type=\"text\/javascript\">\r\n\/* <![CDATA[ *\/\r\nvar google_conversion_id = 944646343;\r\nvar google_custom_params = window.google_tag_params;\r\nvar google_remarketing_only = true;\r\n\/* ]]> *\/\r\n<\/script>\r\n<script type=\"text\/javascript\" src=\"\/\/www.googleadservices.com\/pagead\/conversion.js\">\r\n<\/script>\r\n<noscript>\r\n<div style=\"display:inline;\">\r\n<img height=\"1\" width=\"1\" style=\"border-style:none;\" alt=\"\" src=\"\/\/googleads.g.doubleclick.net\/pagead\/viewthroughconversion\/944646343\/?guid=ON&amp;script=0\"\/>\r\n<\/div>\r\n<\/noscript>\r\n\r\n<img height=\"1\" width=\"1\" style=\"border-style:none;\" alt=\"\" src=\"\/\/googleads.g.doubleclick.net\/pagead\/viewthroughconversion\/944646343\/?value=0&amp;guid=ON&amp;script=0&amp;data=type%3Dingame%3Bpartner%3Dretargeting%3Bgame%3Dfoe\"\/>\r\n\r\n<img src=\"\/\/amplifypixel.outbrain.com\/pixel?mid=0017c60c5690726bf0eb929fb2fecd7c15\"><\/img>\r\n\r\n<style>.pub_300x250{display:none}<\/style>\r\n\r\n<!-- Facebook Activity Pixel -->\r\n<script>\r\n!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?\r\nn.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;\r\nn.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;\r\nt.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,\r\ndocument,'script','\/\/connect.facebook.net\/en_US\/fbevents.js');\r\n\r\nfbq('init', '147723879184250');\r\nfbq('track', \"ViewContent\");<\/script>\r\n<noscript><img height=\"1\" width=\"1\" style=\"display:none\"\r\nsrc=\"https:\/\/www.facebook.com\/tr?id=147723879184250&ev=ViewContent&noscript=1\"\r\n\/><\/noscript>\r\n<!-- End Facebook Activity Pixel -->\r\n\r\n\r\n\r\n\r\n<script>\r\n(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:\"12098506\"};o.q=w[u],w[u]=new UET(o),w[u].push(\"pageLoad\")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!==\"loaded\"&&s!==\"complete\"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,\"script\",\"\/\/bat.bing.com\/bat.js\",\"uetq\");window.uetq = window.uetq || [];\r\nwindow.uetq.push('event', 'ingame', {'event_category': 'retargeting', 'event_label': 'foe', 'event_value': '1'});\r\n<\/script>\r\n";
            if (content) {
                var div = $('<div/>').hide();
                $(document.body).append(div);
                postscribe(div, content, {error: function(e) {console.error(e.msg);}});
            }
        });
    </script>

    	<style>
		#support-button {
			background: url('https://foefr.innogamescdn.com/assets/page/html5_fallback/page_btn_support-4b7007ebb.png');
			border: none;
			width: 204px;
			height: 78px;
            cursor: pointer;
            position: absolute;
            right: 148px;
            top: 0px;
            z-index: 200;
            color: #f2dba9;
            text-align: center;
            padding-left: 35px;
            font-family: Arial, sans-serif;
            font-weight: bold;
            font-size: 22px;
		}
		#support-button:hover {
			background-position-x: 1px;
			background-position-y: -78px;
		}
		#support-button:active {
			background-position-x: 1px;
			background-position-y: -156px;
		}
	</style>
    <script>
        function goToSupportPage() {
            window.open(getSupportUrl(), "_blank");
        }
    </script>
    </head>
<body id="game_body">
    <div id="container">
        <div id="preloader" style="position: absolute; width: 100%; height: 100%; z-index: 120; background: #0E1E2D;">
            <div><img src="https://foefr.innogamescdn.com/images/game/preload/PreloaderCompany.png" /></div>
            <div><img id="spinner" src="https://foefr.innogamescdn.com/images/game/preload/Preloader.png" /></div>
        </div>
                <button id="support-button" onclick="goToSupportPage()">Assistance</button>
                <div id="game-container" class="size0">
            <div id="game-container-centered">
                <div id="game-container-inner">
                    <div id="openfl-content"></div>
                    <div id="viewport-frame"></div>
                    <img id="foe-logo" loading="lazy" src="https://foefr.innogamescdn.com/images/game/frame/performance_logo_foe.png" />
                </div>
            </div>
        </div>
        <div id="imageContent" style="position: absolute; width: 100%; height: 100%; z-index: 150; background-color: rgba(10, 10, 10, 0.4); display: none;"></div>
        <div class="guide">
            <div class="paperScroll">
                <div class="paperScrollContent">
                    <p style="font-size: 16px; font-weight: bold">
                        Une erreur s&#039;est produite                    </p>
                    <img style="align-self: center" src="https://foefr.innogamescdn.com/assets/page/html5_fallback/icon_error-4554e00ed.png" />
                    <p style="font-size: 14px;">
                        Le jeu n&#039;a pas pu être chargé correctement. Essayez de relancer le jeu !<br>
                        Rendez-vous sur notre <a href="https://fr0.forgeofempires.com/page/redirect/html5-help/" target="_blank" id="html5-help" class="html5Link">base de connaissances</a> si vous avez besoin d&#039;aide.                    </p>
                    <a href="." class="startButton">Recharger le jeu</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
