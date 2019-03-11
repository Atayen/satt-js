const ProviderEngine = require('web3-provider-engine');
const Constants = require('/const/const');


function Campaign(id,url,start,end) {
	const self = this;
	self._id = id;
	self._url = url;
	self._start = start;
	self._end = end;
}

function CampaignManager() {
	const self = this;
	self._started = false;
	self._web3 = false;
	self._campaignContract = false;
	self._provider = new ProviderEngine();
}
	
	
CampaignManager.prototype.addProvider =  (provider) => {
	const self = this;
	self._provider.addProvider(provider);
}

CampaignManager.prototype.init = () => {
	const self = this;
	self._provider.start();
	self._web3 = new Web3(self._provider);
	self._campaignContract = new self._web3.eth.Contract(Constants.campaign.abi);
	self._started = true;
}

camapignManager.prototype.createCampaign = async (dataUrl,startDate,endDate,address) => {
	const self = this;
		
	return new Promise(async (resolve, reject) => {
		if(!self._started) 
			reject({error:"provider engine not started"});
		var gasPrice = await self._web3.eth.getGasPrice();
		var gas = await self._campaignContract.methods.createCampaign(dataUrl,parseInt(startDate),parseInt(endDate)).estimateGas({from:address,value:0}).catch(function(error) {
			console.log("createCampaign error:",error);
			reject(error);
		});
			
		self._campaignContract.methods.createCampaign(dataUrl,startDate,endDate)
		.send({
		   from:address,
		   gas:gas,
		   gasPrice: gasPrice
		   })
		   .on('error', function(error){ console.log("createCampaign error",error);
				reject(error);
		   })
		.on('transactionHash', function(transactionHash){console.log("createCampaign transactionHash",transactionHash) })
		.on('receipt', function(receipt){
			var returnValues = receipt.events.CampaignCreated.returnValues;
			resolve( new Campaign (returnValues.id,returnValues.dataUrl,returnValues.startDate,returnValues.endDate)) ;
			console.log(receipt.transactionHash,"confirmed campaign created",receipt.events.CampaignCreated.returnValues.id);
		})
		.on('confirmation', function(confirmationNumber, receipt){ 
			//console.log("confirmation "+confirmationNumber) ;
		});
	})
}




module.exports = CampaignManager;