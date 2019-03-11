const ProviderEngine = require('web3-provider-engine');
const Constants = require('/const/const');


function Campaign(id,url,start,end) {
	const self = this;
	self._id = id;
	self._url = url;
	self._start = start;
	self._end = end;
}

function Prom(id,type,post,user) {
	const self = this;
	self._id = id;
	self._type = type;
	self._post = post;
	self._user = user;
}

function Result(id,likes,shares,views) {
	const self = this;
	self._id = id;
	self._likes = likes;
	self._shares = shares;
	self._views = views;
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
	self._tokenContract = new self._web3.eth.Contract(Constants.token.abi,Constants.token.address.mainnet);
	self._started = true;
}

CampaignManager.prototype.createCampaign = async (dataUrl,startDate,endDate,opts) => {
	const self = this;
		
	return new Promise(async (resolve, reject) => {
		if(!self._started) 
			reject({error:"provider engine not started"});
		if(!('gasPrice' in opts)) {
			opts.gasPrice =await self._web3.eth.getGasPrice();
		}
		if(!('gas' in opts)) {
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
		
		if(!('gasPrice' in opts)) {
			opts.gasPrice =await self._web3.eth.getGasPrice();
		}
		if(!('gas' in opts)) {
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
		if(!('gasPrice' in opts)) {
			opts.gasPrice =await self._web3.eth.getGasPrice();
		}
		if(!('gas' in opts)) {
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
		if(!('gasPrice' in opts)) {
			opts.gasPrice =await self._web3.eth.getGasPrice();
		}
		if(!('gas' in opts)) {
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
		if(!('gas' in opts)) {
			opts.gas = await self._campaignContract.methods.priceRatioCampaign(idCampaign,typeSN,likeRatio,shareRatio,viewRatio).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("priceRatioCampaign error:",error);
				reject(error);
			});
		}
		if(!('gasPrice' in opts)) {
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
		if(!('gas' in opts)) {
			opts.gas = await self._campaignContract.methods.applyCampaign(idCampaign,typeSN,idPost,idUser).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("applyCampaign error:",error);
				reject(error);
			});
		}
		if(!('gasPrice' in opts)) {
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
		if(!('gas' in opts)) {
			opts.gas = await self._campaignContract.methods.validateProm(idProm).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("validateProm error:",error);
				reject(error);
			});
		}
		if(!('gasPrice' in opts)) {
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
		if(!('gas' in opts)) {
			opts.gas = await self._campaignContract.methods.startCampaign(idCampaign).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("startCampaign error:",error);
				reject(error);
			});
		}
		if(!('gasPrice' in opts)) {
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
		if(!('gas' in opts)) {
			opts.gas = await self._campaignContract.methods.updateCampaignStats(idCampaign).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("updateCampaignStats error:",error);
				reject(error);
			});
		}
		if(!('gasPrice' in opts)) {
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
		if(!('gas' in opts)) {
			opts.gas = await self._campaignContract.methods.endCampaign(idCampaign).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("endCampaign error:",error);
				reject(error);
			});
		}
		if(!('gasPrice' in opts)) {
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
		if(!('gas' in opts)) {
			opts.gas = await self._campaignContract.methods.getGains(idProm).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("getGains error:",error);
				reject(error);
			});
		}
		if(!('gasPrice' in opts)) {
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
		if(!('gas' in opts)) {
			opts.gas = await self._campaignContract.methods.getRemainingFunds(idCampaign).estimateGas({from:opts.from,value:0}).catch(function(error) {
				console.log("getRemainingFunds error:",error);
				reject(error);
			});
		}
		if(!('gasPrice' in opts)) {
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

CampaignManager.prototype.on = async (type,filter,callback) => {
	const self = this;
	switch (type) {
		case "created" : 
			self._campaignContract.events.CampaignCreated (filter,callback);
		break;
		case "applied" : 
			self._campaignContract.events.CampaignApplied (filter,callback);
		break;
		case "spent" : 
			self._campaignContract.events.CampaignFundsSpent (filter,callback);
		break;
		default : 
		break;
	}
} 


CampaignManager.prototype.getCampaign = async (id) => {
	const self = this;
	var res = await self._campaignContract.methods.campaigns(id).call();
	var c = new Campaign(id,res.dataUrl,res.startDate,res.endDate);
	c._advertiser = res.advertiser;
	c._nbProms = res.nbProms;
	c._nbValidProms = res.nbValidProms;
	c._funds = res.funds;
	c._campaignContract = self._campaignContract;
	return c;	
}

Campaign.prototype.getRatios = async () => {
	const self = this;
	var ratios = await self._campaignContract.methods.getRatios(self._id).call();
	var types = results[0];
	var likes = results[1];
	var shares = results[2];
	var views = results[3];
	var res = [{typeSN:types[0],likeRatio:likes[0],shareRatio:shares[0],viewRatio:views[0]},{typeSN:types[1],likeRatio:likes[1],shareRatio:shares[1],viewRatio:views[1]},{typeSN:types[2],likeRatio:likes[2],shareRatio:shares[2],viewRatio:views[2]},{typeSN:types[3],likeRatio:likes[3],shareRatio:shares[3],viewRatio:views[3]}];
	return res;
}

Campaign.prototype.getProms = async () => {
	const self = this;
	var res = await self._campaignContract.methods.getProms(self._id).call();
	var finalRes = [];
	for (var i=0;i<res.length;i++) {
		var promres = await self._campaignContract.methods.proms(res[i]).call();
		var prom = new Prom(res[i],promres.typeSN,promres.idPost,promres.idUser);
		prom._influencer = promres.influencer;
		prom._isAccepted = promres.isAccepted;
		prom._funds = promres.funds;
		prom._nbResults = promres.nbResults;
		prom._lastResult = promres.lastResult;
		prom._campaignContract = self._campaignContract;
		finalRes.push(prom)
	}
	return finalRes;
}

Prom.prototype.getResults = async () => {
	const self = this;
	var res = await self._campaignContract.methods.getResults(self._id).call();
	var finalRes = [];
	for (var i=0;i<res.length;i++) {
		var resres = await self._campaignContract.methods.results(res[i]).call();
		var result = new Result(res[i],resres.likes,resres.shares,resres.views);
		finalRes.push(res)
	}
	return finalRes;
}

Campaign.prototype.toJSON = async () => {
	const self = this;
	var res = {
		id:self._id,
		url:self._url,
		start:self._start,
		end:self._end,
		advertiser:self._advertiser,
		nbProms:self._nbProms,
		nbValidProms:self._nbValidProms,
		funds:{tokenAddress:self._funds[0],amount:self._funds[1]},
	}
	res.ratios = await self.getRatios();
	var proms = await self.getProms();
	res.proms = [];
	for(var i=0;i<proms.length;i++)
	{
		res.proms.push(await proms[i].toJSON());
	}
	return res;
}

Prom.prototype.toJSON = async () => {
	const self = this;
	var res = {
		id:self._id,
		type:self._type,
		post:self._post,
		user:self._user,	
		influencer:self._influencer,
		nbResults:self._nbProms,
		isAccepted:self._nbValidProms,
		lastResult:self._lastResult,
		funds:{tokenAddress:self._funds[0],amount:self._funds[1]}
	}
	var results = await self.getResults();
	res.results = [];
	for(var i=0;i<results.length;i++)
	{
		res.results.push(await results[i].toJSON());
	}
	
	return res;
}

Result.prototype.toJSON = async () => {
	const self = this;
	var res = {
		id:self._id,
		likes:self._likes,
		shares:self._shares,
		views:self._views
	}
	return res;
	
}

CampaignManager.prototype.getApproval = async (addr) => {
	const self = this;
	return new Promise(async (resolve, reject) => {
		var amount = await self._tokenContract.methods.allowance(addr,Constants.token.address.mainnet).call();
		resolve({amount:amount});
		
	});
}

CampaignManager.prototype.setApproval = async (opts) => {
	const self = this;
	var spender = Constants.token.address.mainnet;
	return new Promise(async (resolve, reject) => {
		if(!('gasPrice' in opts)) {
			opts.gasPrice = await self._web3.eth.getGasPrice();
		}
		var amount = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
		if(!('gas' in opts)) {
			opts.gas = await self._tokenContract.methods.approve(opts.from,amount).estimateGas();
		}
			
		tokenManager.contract.methods.approve(opts.from,amount)
		.send(opts)
		   .on('error', function(error){ console.log("approve error",error) })
		.on('transactionHash', function(transactionHash){
			console.log("approve transactionHash",transactionHash) 
			//callback(transactionHash);
		})
		.on('receipt', function(receipt){
			resolve({transactionHash:receipt.transactionHash,address:opts.from,spender:spender});
			console.log(receipt.transactionHash,"confirmed approval from",opts.from,"to",spender); 
		})
		.on('confirmation', function(confirmationNumber, receipt){ 
			//console.log("confirmation "+confirmationNumber) ;
		})
	});
}



module.exports = CampaignManager;