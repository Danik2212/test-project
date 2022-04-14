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


async function login(){
    var world = 1;
    var payload = 'json={"world_id":"fr'+world+'"}';
    var encodedPayload = encodeURI(payload);
    var res = await sendLoginPost( encodedPayload );
    console.log( res );
}

async function sendLoginPost( payload ){

    var url = "fr0.forgeofempires.com/start/index?action=play_now_login"
    const options = {
        headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
    }
    var data = await axios.post(url, payload, options);
    return data;
}