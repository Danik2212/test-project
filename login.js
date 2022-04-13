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

function login(){

    if ( document.getElementsByClassName("playername")[0].textContent.length > 0 )
    {
        // You are logged in now
        console.log( "Logged in now");
        return;
    }

    var userName = ". Dan";
    var password = "Jenny123"
    var form = document.getElementById("login_userid").form;

    form[0].value = userName
    form[1].value = password
    form[3].click();
}

login();