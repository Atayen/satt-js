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
	self._campaignContract = new self._web3.eth.Contract(Constants.campaign.abi,Constants.campaign.address.mainnet);
	self._started = true;
}

CampaignManager.prototype.createCampaign = async (dataUrl,startDate,endDate,opts) => {
	const self = this;
		
	return new Promise(async (resolve, reject) => {
		if(!self._started) 
			reject({error:"provider engine not started"});
		if(!(gasPrice in opts)) {
			opts.gasPrice =await self._web3.eth.getGasPrice();
		}
		if(!(gas in opts)) {
			opts.gas = await self._campaignContract.methods.createCampaign(dataUrl,parseInt(startDate),parseInt(endDate)).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("createCampaign error:",error);
				reject(error);
			});
		}
			
		self._campaignContract.methods.createCampaign(dataUrl,startDate,endDate)
		.send(opts)
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


CampaignManager.prototype.createCampaignYt = async function (dataUrl,startDate,endDate,likeRatio,viewRatio,token,amount,opts) {
	const self = this;
	return new Promise(async (resolve, reject) => {
		if(!self._started) 
			reject({error:"provider engine not started"});
		
		if(!(gasPrice in opts)) {
			opts.gasPrice =await self._web3.eth.getGasPrice();
		}
		if(!(gas in opts)) {
			opts.gas = await self._campaignContract.methods.CreatePriceFundYt(dataUrl,parseInt(startDate),parseInt(endDate),likeRatio,viewRatio,token,amount).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("createCampaignYt error:",error);
				reject(error);
			});
		}
			
		self._campaignContract.methods.CreatePriceFundYt(dataUrl,startDate,endDate,likeRatio,viewRatio,token,amount)
		.send(opts)
		.on('error', function(error){ console.log("createCampaignYt error",error);
				reject(error);
		   })
		.on('transactionHash', function(transactionHash){console.log("createCampaignYt transactionHash",transactionHash) })
		.on('receipt', function(receipt){
			resolve(receipt.events.CampaignCreated.returnValues.id);
			console.log(receipt.transactionHash,"confirmed campaign created",receipt.events.CampaignCreated.returnValues.id);
		})
		.on('confirmation', function(confirmationNumber, receipt){ 
			//console.log("confirmation "+confirmationNumber) ;
		});
	})
}
	
CampaignManager.prototype.modCampaign = async function (idCampaign,dataUrl,startDate,endDate,opts) {
	const self = this;
	return new Promise(async (resolve, reject) => {
		if(!self._started) 
			reject({error:"provider engine not started"});
		if(!(gasPrice in opts)) {
			opts.gasPrice =await self._web3.eth.getGasPrice();
		}
		if(!(gas in opts)) {
			opts.gas = await self._campaignContract.methods.modCampaign(idCampaign,dataUrl,startDate,endDate).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("modCampaign error:",error);
				reject(error);
			});
		}
				
		self._campaignContract.methods.modCampaign(idCampaign,dataUrl,startDate,endDate)
		.send(opts)
		   .on('error', function(error){ console.log("modCampaign error",error);
				reject(error);
			})
		.on('transactionHash', function(transactionHash){console.log("modCampaign transactionHash",transactionHash) })
		.on('receipt', function(receipt){
			resolve(receipt.events.CampaignCreated.returnValues.id);
			console.log(receipt.transactionHash,"confirmed campaign modified",receipt.events.CampaignCreated.returnValues.id);
		})
		.on('confirmation', function(confirmationNumber, receipt){ 
			//console.log("confirmation "+confirmationNumber) ;
		})
	})
	
}
	
CampaignManager.prototype.fundCampaign = async function (idCampaign,token,amount,opts) {
	const self = this;
	return new Promise(async (resolve, reject) => {
		if(!self._started) 
			reject({error:"provider engine not started"});
		if(!(gasPrice in opts)) {
			opts.gasPrice =await self._web3.eth.getGasPrice();
		}
		if(!(gas in opts)) {
			opts.gas = await self._campaignContract.methods.fundCampaign(idCampaign,token,amount).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("fundCampaign error:",error);
				reject(error);
			});
		}
				
		self._campaignContract.methods.fundCampaign(idCampaign,token,amount)
		.send(opts)
		   .on('error', function(error){ console.log("fundCampaign error",error);
			reject(error);
			})
		.on('transactionHash', function(transactionHash){console.log("fundCampaign transactionHash",transactionHash) })
		.on('receipt', function(receipt){
			resolve({transactionHash:receipt.transactionHash,idCampaign:idCampaign,token:token,amount:amount});
			console.log(receipt.transactionHash,"confirmed",idCampaign,"funded");
		})
		.on('confirmation', function(confirmationNumber, receipt){ 
			//console.log("confirmation "+confirmationNumber) ;
		})
	})
	
}
	
CampaignManager.prototype.priceRatioCampaign = async function (idCampaign,typeSN,likeRatio,shareRatio,viewRatio,opts) {
	const self = this;
	return new Promise(async (resolve, reject) => {
		if(!self._started) 
			reject({error:"provider engine not started"});
		if(!(gas in opts)) {
			opts.gas = await self._campaignContract.methods.priceRatioCampaign(idCampaign,typeSN,likeRatio,shareRatio,viewRatio).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("priceRatioCampaign error:",error);
				reject(error);
			});
		}
		if(!(gasPrice in opts)) {
			opts.gasPrice =await self._web3.eth.getGasPrice();
		}
		self._campaignContract.methods.priceRatioCampaign(idCampaign,typeSN,likeRatio,shareRatio,viewRatio)
		.send(opts)
		   .on('error', function(error){ console.log("priceRatioCampaign error",error);
			reject(error);
		   })
		.on('transactionHash', function(transactionHash){console.log("priceRatioCampaign transactionHash",transactionHash) })
		.on('receipt', function(receipt){
			resolve({transactionHash:receipt.transactionHash,typeSN:typeSN,likeRatio:likeRatio,shareRatio:shareRatio,viewRatio:viewRatio});
			console.log(receipt.transactionHash,"confirmed",idCampaign,"priced");
		})
		.on('confirmation', function(confirmationNumber, receipt){ 
			//console.log("confirmation "+confirmationNumber) ;
		})
	})
	
}

	
CampaignManager.prototype.applyCampaign = async function (idCampaign,typeSN,idPost,idUser,opts) {
	const self = this;
	return new Promise(async (resolve, reject) => {
		if(!self._started) 
			reject({error:"provider engine not started"});
		if(!(gas in opts)) {
			opts.gas = await self._campaignContract.methods.applyCampaign(idCampaign,typeSN,idPost,idUser).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("applyCampaign error:",error);
				reject(error);
			});
		}
		if(!(gasPrice in opts)) {
			opts.gasPrice =await self._web3.eth.getGasPrice();
		}
		self._campaignContract.methods.applyCampaign(idCampaign,typeSN,idPost,idUser)
		.send(opts)
		   .on('error', function(error){ console.log("applyCampaign error",error);
		   reject(error);
		   })
		.on('transactionHash', function(transactionHash){console.log("applyCampaign transactionHash",transactionHash) })
		.on('receipt', function(receipt){
			var prom = receipt.events.CampaignApplied.returnValues.prom;
			resolve({transactionHash:receipt.transactionHash,idCampaign:idCampaign,typeSN:typeSN,idPost:idPost,idUser:idUser,idProm:prom});
			//callback({"result":"OK"});
			console.log(receipt.transactionHash,"confirmed",idCampaign," prom ",prom);
			//console.log(receipt.events);
		})
		.on('confirmation', function(confirmationNumber, receipt){ 
			//console.log("confirmation "+confirmationNumber) ;
		})
	})
	
}
	
CampaignManager.prototype.validateProm = async function (idProm,opts) {
	const self = this;
	return new Promise(async (resolve, reject) => {
		if(!self._started) 
			reject({error:"provider engine not started"});
		if(!(gas in opts)) {
			opts.gas = await self._campaignContract.methods.validateProm(idProm).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("validateProm error:",error);
				reject(error);
			});
		}
		if(!(gasPrice in opts)) {
			opts.gasPrice =await self._web3.eth.getGasPrice();
		}
		self._campaignContract.methods.validateProm(idProm)
		.send(opts)
		   .on('error', function(error){ console.log("validateProm error",error);
		   reject(error);
		   })
		.on('transactionHash', function(transactionHash){console.log("validateProm transactionHash",transactionHash) })
		.on('receipt', function(receipt){
			resolve({transactionHash:receipt.transactionHash,idProm:idProm});
			console.log(receipt.transactionHash,"confirmed validated prom ",idProm);
		})
		.on('confirmation', function(confirmationNumber, receipt){ 
			//console.log("confirmation "+confirmationNumber) ;
		})
	})
	
}
	
CampaignManager.prototype.startCampaign = async function (idCampaign,opts) {
	const self = this;
	return new Promise(async (resolve, reject) => {
		if(!self._started) 
			reject({error:"provider engine not started"});
		if(!(gas in opts)) {
			opts.gas = await self._campaignContract.methods.startCampaign(idCampaign).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("startCampaign error:",error);
				reject(error);
			});
		}
		if(!(gasPrice in opts)) {
			opts.gasPrice =await self._web3.eth.getGasPrice();
		}
		self._campaignContract.methods.startCampaign(idCampaign)
		.send(opts)
		   .on('error', function(error){ console.log("startCampaign error",error);
		   reject(error);
		   })
		.on('transactionHash', function(transactionHash){console.log("startCampaign transactionHash",transactionHash) })
		.on('receipt', function(receipt){
			resolve({transactionHash:receipt.transactionHash,idCampaign:idCampaign});
			console.log(receipt.transactionHash,"confirmed",idCampaign,"started ");
		})
		.on('confirmation', function(confirmationNumber, receipt){ 
			//console.log("confirmation "+confirmationNumber) ;
		})
	})
	
}
	
CampaignManager.prototype.updateCampaignStats = async function (idCampaign,opts) {
	const self = this;
	return new Promise(async (resolve, reject) => {
		if(!self._started) 
			reject({error:"provider engine not started"});
		if(!(gas in opts)) {
			opts.gas = await self._campaignContract.methods.updateCampaignStats(idCampaign).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("updateCampaignStats error:",error);
				reject(error);
			});
		}
		if(!(gasPrice in opts)) {
			opts.gasPrice =await self._web3.eth.getGasPrice();
		}
		self._campaignContract.methods.updateCampaignStats(idCampaign)
		.send(opts)
		   .on('error', function(error){ console.log("updateCampaignStats error",error);
		   reject(error);
		   })
		.on('transactionHash', function(transactionHash){console.log("updateCampaignStats transactionHash",transactionHash) })
		.on('receipt', function(receipt){
			resolve({transactionHash:receipt.transactionHash,idCampaign:idCampaign});
			console.log(receipt.transactionHash,"confirmed",idCampaign,"stats updated ");
		})
		.on('confirmation', function(confirmationNumber, receipt){ 
			//console.log("confirmation "+confirmationNumber) ;
		})
	})
	
}
	
CampaignManager.prototype.endCampaign = async function (idCampaign,opts) {
const self = this;
	return new Promise(async (resolve, reject) => {
		if(!self._started) 
			reject({error:"provider engine not started"});
		if(!(gas in opts)) {
			opts.gas = await self._campaignContract.methods.endCampaign(idCampaign).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("endCampaign error:",error);
				reject(error);
			});
		}
		if(!(gasPrice in opts)) {
			opts.gasPrice =await self._web3.eth.getGasPrice();
		}
		self._campaignContract.methods.endCampaign(idCampaign)
		.send(opts)
		   .on('error', function(error){ console.log("endCampaign error",error);
		   reject(error);
		   })
		.on('transactionHash', function(transactionHash){console.log("endCampaign transactionHash",transactionHash) })
		.on('receipt', function(receipt){
			resolve({transactionHash:receipt.transactionHash,idCampaign:idCampaign});
			console.log(receipt.transactionHash,"confirmed",idCampaign,"ended ");
		})
		.on('confirmation', function(confirmationNumber, receipt){ 
			//console.log("confirmation "+confirmationNumber) ;
		})
	})
	
}
	
CampaignManager.prototype.getGains = async function (idProm,opts) {
	const self = this;
	return new Promise(async (resolve, reject) => {
		if(!self._started) 
			reject({error:"provider engine not started"});
		if(!(gas in opts)) {
			opts.gas = await self._campaignContract.methods.getGains(idProm).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("getGains error:",error);
				reject(error);
			});
		}
		if(!(gasPrice in opts)) {
			opts.gasPrice = await self._web3.eth.getGasPrice();
		}
		self._campaignContract.methods.getGains(idProm)
		.send(opts)
		   .on('error', function(error){ console.log("getGains error",error);
		   reject(error);
		   })
			.on('transactionHash', function(transactionHash){console.log("getGains transactionHash",transactionHash) })
			.on('receipt', function(receipt){
				resolve({transactionHash:receipt.transactionHash,idProm:idProm});
				console.log(receipt.transactionHash,"confirmed gains transfered for",idProm);
			})
			.on('confirmation', function(confirmationNumber, receipt){ 
				//console.log("confirmation "+confirmationNumber) ;
			})
	})
	
}
	
CampaignManager.prototype.getRemainingFunds = async function (idCampaign,opts) {
	const self = this;
	return new Promise(async (resolve, reject) => {
		if(!self._started) 
			reject({error:"provider engine not started"});
		if(!(gas in opts)) {
			opts.gas = await self._campaignContract.methods.getRemainingFunds(idCampaign).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("getRemainingFunds error:",error);
				reject(error);
			});
		}
		if(!(gasPrice in opts)) {
			opts.gasPrice = await self._web3.eth.getGasPrice();
		}
		self._campaignContract.methods.getRemainingFunds(idCampaign)
		.send(opts)
		   .on('error', function(error){ console.log("getRemainingFunds error",error);
		   reject(error);
		   })
		.on('transactionHash', function(transactionHash){console.log("getRemainingFunds transactionHash",transactionHash) })
		.on('receipt', function(receipt){
			resolve({transactionHash:receipt.transactionHash,idCampaign:idCampaign});
			console.log(receipt.transactionHash,"confirmed gains remaining for",idCampaign);
		})
		.on('confirmation', function(confirmationNumber, receipt){ 
			//console.log("confirmation "+confirmationNumber) ;
		})
	})
	
}


module.exports = CampaignManager;