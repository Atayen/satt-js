# satt-js

SaTT Javascript library allow you to manage ad campaigns  with a local or remote Ethereum node using web3.js 

## Get started  

    const satt = require('satt-js');
    const Web3 = require('web3');
    const web3WsUrl = 'ws://127.0.0.1:8546';
    
    var web3 = new Web3(web3WsUrl);
    var sattMgr = new satt(web3);
    sattMgr.createCampaign('test',new Date().getTime()+1000,new Date().getTime()+1000000)
    .then(function(c){console.log(c.toJSON())});


## CampaignManager

Constructor :` CampaignManager(web3)`
- web3 : web3.js instance, must be connected to a provider with 	eth_sendTransation,eth_sendRawTransaction,eth_getTransactionReceipt,eth_blockNumber,eth_call,eth_estimateGas,eth_gasPrice available RPC methods
---

`createCampaign (dataUrl, startDate, endDate, txOptions)`
*Creates a new campaign for an advertiser*

 - dataUrl (string) : off blockchain campaign description url
- startDate (int) : campaign start date (seconds unix timestamp)
- endDate  (int) : campaign end date (seconds unix timestamp)
-  txOptions (JSON) : transaction params 

returns campaign object in a promise once transaction mined 

---
`createCampaignYt(dataUrl, startDate, endDate, likeRatio, viewRatio, amount, txOptions)` 
*youtube one-time helper to create campaign, fund it ans set its ratios*
- dataUrl (string) : off blockchain campaign description url
- startDate (int) : campaign start date (seconds unix timestamp)
- endDate  (int) : campaign end date (seconds unix timestamp)
- likeRatio (big) : base unit amount of a like in  token
- viewRatio (big) : base unit amount of a view in  token
- amount (big) : SaTT amount credited to the campaign
- txOptions (JSON) : transaction params 

returns campaign object in a promise once transaction mined

---
`modCampaign(idCampaign,dataUrl,startDate,endDate,txOptions)`
*modifies an existing campaign only if not started*
- idCampaign (bytes32) : campaign hash identifier
- dataUrl (string) : off blockchain campaign description url
- startDate (int) : campaign start date (seconds unix timestamp)
- endDate  (int) : campaign end date (seconds unix timestamp)
- txOptions (JSON) : transaction params 

returns campaign object in a promise once transaction mined

---
`fundCampaign(idCampaign, amount, txOptions)`
*funds campaign with SaTT token*

- idCampaign (bytes32) : campaign hash identifier
- amount (big) : SaTT amount in base units
- txOptions (JSON) : transaction params 

---
  `priceRatioCampaign(idCampaign,typeSN,likeRatio, shareRatio,viewRatio,txOptions)`

set ratios according to a social network
- idCampaign (bytes32) : campaign hash identifier
- typeSN (int): social network identifier (1:facebook,2:youtube,3:instagram,4:twitter)
- likeRatio (big): base unit amount of a like in ERC20 token
- shareRatio (big): base unit amount of a share in ERC20 token (facebook,Twitter only)
- viewRatio (big): base unit amount of a view in ERC20 token  (youtube only)
- txOptions (JSON) : transaction params 

---
`applyCampaign(idCampaign, typeSN, idPost, idUser, txOptions)`
*applies to a campaign for an editor*
- idCampaign (bytes32) : campaign hash identifier
- typeSN (int): social network identifier (1:facebook,2:youtube,3:instagram,4:twitter)
- idPost (string): post identifier
- idUser (string): social network user identifier (empty for youtube)
- txOptions (JSON) : transaction params 

return an editor identifier (idProm) in a promise once transaction mined

---
`validateProm(idProm, txOptions)`
*validates editor application for an advertiser*
- idProm (bytes32) : editor identifier
- txOptions (JSON) : transaction params 

---
`startCampaign(idCampaign, txOptions)`
starts camapign before start date
- idCampaign (bytes32) : campaign hash identifier
- txOptions (JSON) : transaction params 

---
`updateCampaignStats(idCampaign, txOptions)`
call oracle for validated campaign editors
- idCampaign (bytes32) : campaign hash identifier
- txOptions (JSON) : transaction params 

---
`endCampaign(idCampaign, txOptions)`
ends camapign before end date
- idCampaign (bytes32) : campaign hash identifier
- txOptions (JSON) : transaction params

---
`getGains(idProm, txOptions)`
withdraw editor earnings to his wallet
- idProm (bytes32) : editor identifier
- txOptions (JSON) : transaction params 

---
`getRemainingFunds(idCampaign, txOptions)`
withdraw advertiser remaining funds to his wallet
- idCampaign (bytes32) : campaign hash identifier
- txOptions (JSON) : transaction params 

---
`on(type,filter,callback)`
subscribe on campaigns events 
types : "created","applied","spent" available
filter : topics array
callback : function fired with event object param

---
`getCampaign(idCampaign)`
returns Campaign object identified by hash
- idCampaign (bytes32) : campaign hash identifier

---
`getProm(idProm)`
returns Prom object identified by hash
- idProm (bytes32)  : editor identifier

---
`getResult(idResult)`
returns Result object identified by hash
- idResult (bytes32) : result identifier

---
`getBalance(address )`
get address SaTT balance 

---
`getApproval(address )`
get address SaTT approval for camapign smart contract 

---
`setApproval(txOptions )`
set address SaTT approval for camapign smart contract with maximum amount
- txOptions (JSON) : transaction params 

## Campaign

`getId()`
returns campaign id hash (bytes32 )

---
`getRatios()`
returns campaign ratios (Ratio[])
 
 ---
`getProms()`
returns array of associated proms (Proms[])

---
`toJSON()`
display human readable campaign datas (Object)

## Prom

`getId()`
returns prom id hash  (bytes32 )

---
`getResults()`
returns array of associated results (Result[])

---
`toJSON()`
display human readable prom datas (Object)

## Result

`getId()`
returns result id hash  (bytes32 )

---
`toJSON()`
display human readable result datas (Object)

## params types
big
amounts in integer,string or BigNumber ex : `10`,  `"10"` or `new BN("10")`

---
bytes32
32 bytes hash in 64 hex digits prefixed by 0x ex : `"0xe4b6280d14933d1be40dddd5af669285c25b8d2c563eca4cd331f6b66e865bd1"`

---
Ratio  JSON object
- typeSN (int): social network identifier (1:facebook,2:youtube,3:instagram,4:twitter)
- likeRatio (big): base unit amount of a like in ERC20 token
- shareRatio (big): base unit amount of a share in ERC20 token (facebook,Twitter only)
- viewRatio (big): base unit amount of a view in ERC20 token  (youtube only)

---
txOptions JSON object of optionals transaction settings
- from : sender address
- gas : gas limit
- gasPrice : gas price