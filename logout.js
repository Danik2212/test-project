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


function getCSRFFromCookie(){
    var regex = new RegExp(".* csrf=([0-9a-zA-Z_-]+)", "")
    var m = regex.exec(document.cookie);
    return m[1];
    //'metricsUvId=8fa91c2b-d787-4a83-9e2c-2ca75a481509; _fbp=fb.1.1649781854002.783183512; _clck=mcbevq|1|f0k|0; ig_conv_last_site=https://fr3.forgeofempires.com/game/index; _uetsid=c9298620ba7f11ec91df6b030942420e; _uetvid=c9299040ba7f11ecb39eb791fbabdffd; _clsk=103utrc|1649785707613|2|0|a.clarity.ms/collect'
}



function checkState(){
    if ( window.localStorage.getItem('state') == 'login'){
        // Select the world and log in
        selectWorld();
        window.localStorage.setItem('state', 'inGame');
    }

    if ( window.localStorage.getItem('state') == 'inGame'){
        logout();
        window.localStorage.setItem('state', 'logout');
        // Go to login/create account
        document.location = document.location = 'https://fr.forgeofempires.com/';
    }
    // Weird state, try to reset it
    else{
        window.localStorage.setItem('state', 'inGame');
        window.location = 'https://fr0.forgeofempires.com/page'
    }
}

function logout( ){
    if ( document.getElementsByClassName("playername")[0].textContent.length > 0 )
    {
        document.getElementsByName("csrf")[0].form.submit();
    }
}

function selectWorld(){
    
}

checkState();