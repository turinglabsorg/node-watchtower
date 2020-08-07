const request = require('request')
const exec = require('child_process')
require('dotenv').config()

async function call(method, params = []) {
    return new Promise(response => {
        var rpcport = process.env.RPCPORT
        if(process.env.TESTNET !== undefined && process.env.RPCPORT_TESTNET !== undefined){
          if(process.env.TESTNET === 'true'){
            rpcport = process.env.RPCPORT_TESTNET
          }
        }
        var rpcuser = process.env.RPCUSER
        var rpcpassword = process.env.RPCPASSWORD
        var rpcendpoint = 'http://'+ process.env.RPCADDRESS +':' + rpcport
        if(process.env.DEBUG === "full"){
            console.log('Connecting to ' + rpcendpoint + ' WITH ' +rpcuser+'/'+rpcpassword)
        }
        let req = {
            url: rpcendpoint,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(rpcuser + ":" + rpcpassword).toString("base64")
            },
            body: JSON.stringify({
                id: Math.floor((Math.random() * 100000) + 1),
                params: params,
                method: method
            })
        };
        request(req, function (err, res, body) {
            try {
                if(process.env.DEBUG === "full"){
                    console.log(body)
                }
                response(JSON.parse(body))
            } catch (err) {
                response(body)
            }
        });
    })
}

function checknode(){
    console.log('RUNNING GETINFO CALL')
    call('getinfo').then( async function(info){
        if(info !== undefined && info['result'] !== null && info['result'] !== undefined && info['result']['blocks'] >= 0){
          console.log('Node is running', info['result'])
        }else{
            console.log('NODE IS OFFLINE, TRYING TO RUN IT AT', process.env.NODE_PROCESS)
            try{
                exec.exec(process.env.NODE_PROCESS,{
                    stdio: 'ignore',
                    detached: true
                }).unref()
            }catch(e){
                console.log('ERROR ON LAUNCH', e)
            }
        }
    })
}

checknode()
setInterval(function(){
    checknode()
}, 60000)