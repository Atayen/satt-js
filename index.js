const Web3 = require('web3');
const Constants = require('./const/const');
const debug = require('debug')('satt-js')
const BN = require('bn.js');

//big number inputs


function CampaignManager(web3) {
	const self = this;
	
	self._web3 = web3;
	self._web3.transactionPollingTimeout = 600;
	self._web3.transactionConfirmationBlocks = 1;
	self._campaignContract = new self._web3.eth.Contract(Constants.campaign.abi,Constants.campaign.address.mainnet);
	self._tokenContract = new self._web3.eth.Contract(Constants.token.abi,Constants.token.address.mainnet);
	self._campaignContract.inspect = () => {return ""};
	
	self.tokenAddress = Constants.token.address.mainnet;
	
	
	self.createCampaign = async (dataUrl,startDate,endDate,opts) => {
		
		return new Promise(async (resolve, reject) => {
			
			if (startDate < Date.now()/1000)
			{
				reject(new Error("past start date campaign"));
			}
			if (endDate < Date.now()/1000)
			{
				reject(new Error("past end date"));
			}
			if (endDate < startDate)
			{
				reject(new Error("end before date start date"));
			}
			
			if(!('gasPrice' in opts)) {
				opts.gasPrice =await self._web3.eth.getGasPrice();
			}
			if(!('gas' in opts)) {
				opts.gas = await self._campaignContract.methods.createCampaign(dataUrl,parseInt(startDate),parseInt(endDate)).estimateGas({from:opts.from,value:0}).catch(function(error) {
					debug("createCampaign error:",error);
					reject(error);
				});
			}
			
			var receipt = await self._campaignContract.methods.createCampaign(dataUrl,parseInt(startDate),parseInt(endDate))
			.send(opts)
			   .on('error', function(error){ debug("createCampaign error",error);
					reject(error);
			   })
			.once('transactionHash', function(transactionHash){debug("createCampaign transactionHash",transactionHash) })
			var id = receipt.logs[0].topics[1];
			var c = await self.getCampaign(id);
			resolve(c) ;
			
			
		})
	}


	self.createCampaignYt = async (dataUrl,startDate,endDate,likeRatio,viewRatio,amount,opts) => {
		
		
		
		return new Promise(async (resolve, reject) => {
			
			if (startDate < Date.now()/1000)
			{
				reject(new Error("past start date campaign"));
			}
			if (endDate < Date.now()/1000)
			{
				reject(new Error("past end date"));
			}
			if (endDate < startDate)
			{
				reject(new Error("end before date start date"));
			}
			
			var allow = await self.getApproval (opts.from);
			if((new BN(allow.amount)).lt(new BN(amount)) ){
				reject(new Error("not enough token allowance for campaign contract"));
			}
			
			var bal = await self.getBalance(opts.from);
			if((new BN(bal)).lt(new BN(amount)) ){
				reject(new Error("not enough token balance for campaign contract"));
			}
			
			if(!('gasPrice' in opts)) {
				opts.gasPrice =await self._web3.eth.getGasPrice();
			}
			if(!('gas' in opts)) {
				opts.gas = await self._campaignContract.methods.createPriceFundYt(dataUrl,parseInt(startDate),parseInt(endDate),likeRatio,viewRatio,Constants.token.address.mainnet,amount).estimateGas({from:opts.from,value:0}).catch(function(error) {
					debug("createCampaignYt error:",error);
					reject(error);
				});
			}
				
			self._campaignContract.methods.createPriceFundYt(dataUrl,parseInt(startDate),parseInt(endDate),likeRatio,viewRatio,Constants.token.address.mainnet,amount)
			.send(opts)
			.on('error', function(error){ debug("createCampaignYt error",error);
					reject(error);
			   })
			.on('transactionHash', function(transactionHash){debug("createCampaignYt transactionHash",transactionHash) })
			.on('receipt', async (receipt) => {
				var id = receipt.logs[0].topics[1];
				var c = await self.getCampaign(id);
				resolve(c);
				debug(receipt.transactionHash,"confirmed campaign created",id);
			})
			.on('confirmation', function(confirmationNumber, receipt){ 
				//debug("confirmation "+confirmationNumber) ;
			});
		})
	}
		
	self.modCampaign = async  (idCampaign,dataUrl,startDate,endDate,opts) => {
		return new Promise(async (resolve, reject) => {
			
			if (startDate < Date.now()/1000)
			{
				reject(new Error("past start date campaign"));
			}
			if (endDate < Date.now()/1000)
			{
				reject(new Error("past end date"));
			}
			if (endDate < startDate)
			{
				reject(new Error("end before date start date"));
			}
			
			var cmp = await self.getCampaign(idCampaign);
			if (cmp._start.toNumber() < Date.now()/1000)
			{
				reject(new Error("cannot modify started campaign"));
			}
			
			if(!('gasPrice' in opts)) {
				opts.gasPrice =await self._web3.eth.getGasPrice();
			}
			if(!('gas' in opts)) {
				opts.gas = await self._campaignContract.methods.modCampaign(idCampaign,dataUrl,parseInt(startDate),parseInt(endDate)).estimateGas({from:opts.from,value:0}).catch(function(error) {
					debug("modCampaign error:",error);
					reject(error);
				});
			}
					
			self._campaignContract.methods.modCampaign(idCampaign,dataUrl,parseInt(startDate),parseInt(endDate))
			.send(opts)
			   .on('error', function(error){ debug("modCampaign error",error);
					reject(error);
				})
			.on('transactionHash', function(transactionHash){debug("modCampaign transactionHash",transactionHash) })
			.on('receipt', function(receipt){
				var id = receipt.logs[0].topics[1];
				resolve(id);
				debug(receipt.transactionHash,"confirmed campaign modified",id);
			})
			.on('confirmation', function(confirmationNumber, receipt){ 
				//debug("confirmation "+confirmationNumber) ;
			})
		})
		
	}
		
	self.fundCampaign = async  (idCampaign,amount,opts) => {
		return new Promise(async (resolve, reject) => {
			
			
			
			var cmp = await self.getCampaign(idCampaign);
			
			if (cmp._end.toNumber() < Date.now()/1000)
			{
				reject(new Error("cannot fund ended campaign"));
			}
			
			var allow = await self.getApproval (opts.from);
			
			if((new BN(allow.amount)).lt(new BN(amount)) ){
				reject(new Error("not enough token allowance for campaign contract"));
			}
			var bal = await self.getBalance(opts.from);
			if((new BN(bal)).lt(new BN(amount)) ){
				reject(new Error("not enough token balance for campaign contract"));
			}
			
			if(!('gasPrice' in opts)) {
				opts.gasPrice =await self._web3.eth.getGasPrice();
			}
			if(!('gas' in opts)) {
				opts.gas = await self._campaignContract.methods.fundCampaign(idCampaign,Constants.token.address.mainnet,amount).estimateGas({from:opts.from,value:0}).catch(function(error) {
					debug("fundCampaign error:",error);
					reject(error);
				});
			}		
			self._campaignContract.methods.fundCampaign(idCampaign,Constants.token.address.mainnet,amount)
			.send(opts)
			   .on('error', function(error){ debug("fundCampaign error",error);
				reject(error);
				})
			.on('transactionHash', function(transactionHash){debug("fundCampaign transactionHash",transactionHash) })
			.on('receipt', function(receipt){
				resolve({transactionHash:receipt.transactionHash,idCampaign:idCampaign,amount:amount});
				debug(receipt.transactionHash,"confirmed",idCampaign,"funded");
			})
			.on('confirmation', function(confirmationNumber, receipt){ 
				//debug("confirmation "+confirmationNumber) ;
			})
		})
		
	}
		
	self.priceRatioCampaign = async  (idCampaign,typeSN,likeRatio,shareRatio,viewRatio,opts) => {
		return new Promise(async (resolve, reject) => {
			var cmp = await self.getCampaign(idCampaign);
			if (cmp._start.toNumber() < Date.now()/1000)
			{
				reject(new Error("cannot modify ratio on started campaign"));
			}
			if(!('gas' in opts)) {
				opts.gas = await self._campaignContract.methods.priceRatioCampaign(idCampaign,typeSN,likeRatio,shareRatio,viewRatio).estimateGas({from:opts.from,value:0}).catch(function(error) {
					debug("priceRatioCampaign error:",error);
					reject(error);
				});
			}
			if(!('gasPrice' in opts)) {
				opts.gasPrice =await self._web3.eth.getGasPrice();
			}
			self._campaignContract.methods.priceRatioCampaign(idCampaign,typeSN,likeRatio,shareRatio,viewRatio)
			.send(opts)
			   .on('error', function(error){ debug("priceRatioCampaign error",error);
				reject(error);
			   })
			.on('transactionHash', function(transactionHash){debug("priceRatioCampaign transactionHash",transactionHash) })
			.on('receipt', function(receipt){
				resolve({transactionHash:receipt.transactionHash,typeSN:typeSN,likeRatio:likeRatio,shareRatio:shareRatio,viewRatio:viewRatio});
				debug(receipt.transactionHash,"confirmed",idCampaign,"priced");
			})
			.on('confirmation', function(confirmationNumber, receipt){ 
				//debug("confirmation "+confirmationNumber) ;
			})
		})
		
	}

		
	self.applyCampaign = async  (idCampaign,typeSN,idPost,idUser,opts) => {
		
		
		return new Promise(async (resolve, reject) => {
			
			var cmp = await self.getCampaign(idCampaign);
			
			if (cmp._end.toNumber() < Date.now()/1000)
			{
				reject(new Error("cannot apply ended campaign"));
			}
			
			if(!('gas' in opts)) {
				opts.gas = await self._campaignContract.methods.applyCampaign(idCampaign,typeSN,idPost,idUser).estimateGas({from:opts.from,value:0}).catch(function(error) {
					debug("applyCampaign error:",error);
					reject(error);
				});
			}
			if(!('gasPrice' in opts)) {
				opts.gasPrice =await self._web3.eth.getGasPrice();
			}
			self._campaignContract.methods.applyCampaign(idCampaign,typeSN,idPost,idUser)
			.send(opts)
			   .on('error', function(error){ debug("applyCampaign error",error);
			   reject(error);
			   })
			.on('transactionHash', function(transactionHash){debug("applyCampaign transactionHash",transactionHash) })
			.on('receipt', async (receipt) => {
				var id = receipt.logs[0].topics[2];
				var prom = await self.getProm(id);
				resolve(prom);
				
				debug(receipt.transactionHash,"confirmed",idCampaign," prom ",prom);
				
			})
			.on('confirmation', function(confirmationNumber, receipt){ 
				//debug("confirmation "+confirmationNumber) ;
			})
		})
		
	}
		
	self.validateProm = async  (idProm,opts) => {
		
		
		return new Promise(async (resolve, reject) => {
			
			var prom = await self.getProm(idProm);
			var cmp = await self.getCampaign(prom._idCampaign);
			
			if (cmp._end.toNumber() < Date.now()/1000)
			{
				reject(new Error("cannot validate ended campaign"));
			}
			if (cmp._advertiser != opts.from)
			{
				reject(new Error("only campaign owner can validate"));
			}
			
			if(!('gas' in opts)) {
				opts.gas = await self._campaignContract.methods.validateProm(idProm).estimateGas({from:opts.from,value:0}).catch(function(error) {
					debug("validateProm error:",error);
					reject(error);
				});
			}
			if(!('gasPrice' in opts)) {
				opts.gasPrice =await self._web3.eth.getGasPrice();
			}
			self._campaignContract.methods.validateProm(idProm)
			.send(opts)
			   .on('error', function(error){ debug("validateProm error",error);
			   reject(error);
			   })
			.on('transactionHash', function(transactionHash){debug("validateProm transactionHash",transactionHash) })
			.on('receipt', function(receipt){
				resolve({transactionHash:receipt.transactionHash,idProm:idProm});
				debug(receipt.transactionHash,"confirmed validated prom ",idProm);
			})
			.on('confirmation', function(confirmationNumber, receipt){ 
				//debug("confirmation "+confirmationNumber) ;
			})
		})
		
	}
		
	self.startCampaign = async  (idCampaign,opts) => {
		
		
		return new Promise(async (resolve, reject) => {
			
			var cmp = await self.getCampaign(idCampaign);
			if (cmp._start.toNumber() < Date.now()/1000)
			{
				reject(new Error("campaign already started"));
			}
			if (cmp._advertiser != opts.from)
			{
				reject(new Error("only campaign owner can start"));
			}
			
			if(!('gas' in opts)) {
				opts.gas = await self._campaignContract.methods.startCampaign(idCampaign).estimateGas({from:opts.from,value:0}).catch(function(error) {
					debug("startCampaign error:",error);
					reject(error);
				});
			}
			if(!('gasPrice' in opts)) {
				opts.gasPrice =await self._web3.eth.getGasPrice();
			}
			self._campaignContract.methods.startCampaign(idCampaign)
			.send(opts)
			   .on('error', function(error){ debug("startCampaign error",error);
			   reject(error);
			   })
			.on('transactionHash', function(transactionHash){debug("startCampaign transactionHash",transactionHash) })
			.on('receipt', function(receipt){
				resolve({transactionHash:receipt.transactionHash,idCampaign:idCampaign});
				debug(receipt.transactionHash,"confirmed",idCampaign,"started ");
			})
			.on('confirmation', function(confirmationNumber, receipt){ 
				//debug("confirmation "+confirmationNumber) ;
			})
		})
		
	}
		
	self.updateCampaignStats = async  (idCampaign,opts) => {
		
		
		return new Promise(async (resolve, reject) => {
			
			var cmp = await self.getCampaign(idCampaign);
			if (cmp._start.toNumber() > Date.now()/1000)
			{
				reject(new Error("campaign not started"));
			}
			if (cmp._end.toNumber() < Date.now()/1000)
			{
				reject(new Error("campaign ended"));
			}
		
			if(!('gas' in opts)) {
				opts.gas = await self._campaignContract.methods.updateCampaignStats(idCampaign).estimateGas({from:opts.from,value:0}).catch(function(error) {
					debug("updateCampaignStats error:",error);
					reject(error);
				});
			}
			if(!('gasPrice' in opts)) {
				opts.gasPrice =await self._web3.eth.getGasPrice();
			}
			self._campaignContract.methods.updateCampaignStats(idCampaign)
			.send(opts)
			   .on('error', function(error){ debug("updateCampaignStats error",error);
			   reject(error);
			   })
			.on('transactionHash', function(transactionHash){debug("updateCampaignStats transactionHash",transactionHash) })
			.on('receipt', function(receipt){
				resolve({transactionHash:receipt.transactionHash,idCampaign:idCampaign});
				debug(receipt.transactionHash,"confirmed",idCampaign,"stats updated ");
			})
			.on('confirmation', function(confirmationNumber, receipt){ 
				//debug("confirmation "+confirmationNumber) ;
			})
		})
		
	}
		
	self.endCampaign = async  (idCampaign,opts) => {
		
		
		
		return new Promise(async (resolve, reject) => {
			
			var cmp = await self.getCampaign(idCampaign);
			if (cmp._start.toNumber() > Date.now()/1000)
			{
				reject(new Error("campaign not started"));
			}
			if (cmp._end.toNumber() < Date.now()/1000)
			{
				reject(new Error("campaign already ended"));
			}
			if (cmp._advertiser != opts.from)
			{
				reject(new Error("only campaign owner can end"));
			}
		
			if(!('gas' in opts)) {
				opts.gas = await self._campaignContract.methods.endCampaign(idCampaign).estimateGas({from:opts.from,value:0}).catch(function(error) {
					debug("endCampaign error:",error);
					reject(error);
				});
			}
			if(!('gasPrice' in opts)) {
				opts.gasPrice =await self._web3.eth.getGasPrice();
			}
			self._campaignContract.methods.endCampaign(idCampaign)
			.send(opts)
			   .on('error', function(error){ debug("endCampaign error",error);
			   reject(error);
			   })
			.on('transactionHash', function(transactionHash){debug("endCampaign transactionHash",transactionHash) })
			.on('receipt', function(receipt){
				resolve({transactionHash:receipt.transactionHash,idCampaign:idCampaign});
				debug(receipt.transactionHash,"confirmed",idCampaign,"ended ");
			})
			.on('confirmation', function(confirmationNumber, receipt){ 
				//debug("confirmation "+confirmationNumber) ;
			})
		})
		
	}
		
	self.getGains = async  (idProm,opts) => {
		
		
		
		return new Promise(async (resolve, reject) => {
			
			var prom = await self.getProm(idProm);
			if (prom._influencer != opts.from)
			{
				reject(new Error("only prom owner can withdraw"));
			}
			
			if(!('gas' in opts)) {
				opts.gas = await self._campaignContract.methods.getGains(idProm).estimateGas({from:opts.from,value:0}).catch(function(error) {
					debug("getGains error:",error);
					reject(error);
				});
			}
			if(!('gasPrice' in opts)) {
				opts.gasPrice = await self._web3.eth.getGasPrice();
			}
			self._campaignContract.methods.getGains(idProm)
			.send(opts)
			   .on('error', function(error){ debug("getGains error",error);
			   reject(error);
			   })
				.on('transactionHash', function(transactionHash){debug("getGains transactionHash",transactionHash) })
				.on('receipt', function(receipt){
					resolve({transactionHash:receipt.transactionHash,idProm:idProm});
					debug(receipt.transactionHash,"confirmed gains transfered for",idProm);
				})
				.on('confirmation', function(confirmationNumber, receipt){ 
					//debug("confirmation "+confirmationNumber) ;
				})
		})
		
	}
		
	self.getRemainingFunds = async  (idCampaign,opts) => {
		
		//check ended owner
		
		return new Promise(async (resolve, reject) => {
			
			var cmp = await self.getCampaign(idCampaign);
			if (cmp._advertiser != opts.from)
			{
				reject(new Error("only campaign owner can withdraw"));
			}
			if (cmp._end.toNumber() > Date.now()/1000)
			{
				reject(new Error("campaign not ended"));
			}
			
			if(!('gas' in opts)) {
				opts.gas = await self._campaignContract.methods.getRemainingFunds(idCampaign).estimateGas({from:opts.from,value:0}).catch(function(error) {
					debug("getRemainingFunds error:",error);
					reject(error);
				});
			}
			if(!('gasPrice' in opts)) {
				opts.gasPrice = await self._web3.eth.getGasPrice();
			}
			self._campaignContract.methods.getRemainingFunds(idCampaign)
			.send(opts)
			   .on('error', function(error){ debug("getRemainingFunds error",error);
			   reject(error);
			   })
			.on('transactionHash', function(transactionHash){debug("getRemainingFunds transactionHash",transactionHash) })
			.on('receipt', function(receipt){
				resolve({transactionHash:receipt.transactionHash,idCampaign:idCampaign});
				debug(receipt.transactionHash,"confirmed gains remaining for",idCampaign);
			})
			.on('confirmation', function(confirmationNumber, receipt){ 
				//debug("confirmation "+confirmationNumber) ;
			})
		})
		
	}

	self.on = async (type,filter,callback) => {
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


	self.getCampaign = async (id) => {
		var res = await self._campaignContract.methods.campaigns(id).call();
		var c = new Campaign(id,res.dataUrl,res.startDate,res.endDate);
		c._advertiser = res.advertiser;
		c._nbProms = res.nbProms;
		c._nbValidProms = res.nbValidProms;
		c._funds = res.funds;
		c._campaignContract = self._campaignContract;
		return c;	
	}

	self.getProm = async (id) => {
		var res = await self._campaignContract.methods.proms(id).call();
		var prom = new Prom(res[i],promres.typeSN,promres.idPost,promres.idUser);
		prom._idCampaign = res.idCampaign;
		prom._influencer = promres.influencer;
		prom._isAccepted = promres.isAccepted;
		prom._funds = promres.funds;
		prom._nbResults = promres.nbResult;
		prom._lastResult = promres.lastResult;
		prom._campaignContract = self._campaignContract;
		return prom;	
	}

	self.getResult = async (id) => {
		var resres = await self._campaignContract.methods.results(id).call();
		var result = new Result(res[i],resres.likes,resres.shares,resres.views);
		result._campaignContract = self._campaignContract;
		return result;	
	}
	
	self.getBalance = async (addr) => {
		return new Promise(async (resolve, reject) => {
			var amount = await self._tokenContract.methods.balance(addr).call();
			resolve(amount);
			
		});
	}
	
	self.getApproval = async (addr) => {
		return new Promise(async (resolve, reject) => {
			var amount = await self._tokenContract.methods.allowance(addr,Constants.campaign.address.mainnet).call();
			resolve({amount:amount.toString()});
			
		});
	}

	self.setApproval = async (opts) => {
		var spender = Constants.campaign.address.mainnet;
		return new Promise(async (resolve, reject) => {
			if(!('gasPrice' in opts)) {
				opts.gasPrice = await self._web3.eth.getGasPrice();
			}
			var amount = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
			if(!('gas' in opts)) {
				opts.gas = await self._tokenContract.methods.approve(spender,amount).estimateGas();
			}
				
			self._tokenContract.methods.approve(spender,amount)
			.send(opts)
			   .on('error', function(error){ debug("approve error",error) })
			.on('transactionHash', function(transactionHash){
				debug("approve transactionHash",transactionHash) 
			})
			.on('receipt', function(receipt){
				resolve({transactionHash:receipt.transactionHash,address:opts.from,spender:spender});
				debug(receipt.transactionHash,"confirmed approval from",opts.from,"to",spender); 
			})
			.on('confirmation', function(confirmationNumber, receipt){ 
				//debug("confirmation "+confirmationNumber) ;
			})
		});
	}
	
	
}

function Campaign(id,url,start,end) {
	const self = this;
	self._id = id;
	self._url = url;
	self._start = start;
	self._end = end;
	self.getId = () => {
		return this._id;
	}
	
	self.getRatios = async () => {
	
		var ratios = await self._campaignContract.methods.getRatios(self._id).call();
		var types = ratios[0];
		var likes = ratios[1];
		var shares = ratios[2];
		var views = ratios[3];
		var res = [{typeSN:types[0],likeRatio:likes[0].toNumber(),shareRatio:shares[0].toNumber(),viewRatio:views[0].toNumber()},{typeSN:types[1],likeRatio:likes[1].toNumber(),shareRatio:shares[1].toNumber(),viewRatio:views[1].toNumber()},{typeSN:types[2],likeRatio:likes[2].toNumber(),shareRatio:shares[2].toNumber(),viewRatio:views[2].toNumber()},{typeSN:types[3],likeRatio:likes[3].toNumber(),shareRatio:shares[3].toNumber(),viewRatio:views[3].toNumber()}];
		return res;
	}

	self.getProms = async () => {
		
		var res = await self._campaignContract.methods.getProms(self._id).call();
		var finalRes = [];
		for (var i=0;i<res.length;i++) {
			var promres = await self._campaignContract.methods.proms(res[i]).call();
			var prom = new Prom(res[i],promres.typeSN,promres.idPost,promres.idUser);
			prom._idCampaign = promres.idCampaign;
			prom._influencer = promres.influencer;
			prom._isAccepted = promres.isAccepted;
			prom._funds = promres.funds;
			prom._nbResults = promres.nbResults;
			prom._lastResult = promres.prevResult;
			prom._campaignContract = self._campaignContract;
			finalRes.push(prom)
		}
		return finalRes;
	}

	self.toJSON = async () => {
		
		var res = {
			id:self._id,
			url:self._url,
			start:self._start.toNumber(),
			end:self._end.toNumber(),
			advertiser:self._advertiser,
			nbProms:self._nbProms.toNumber(),
			nbValidProms:self._nbValidProms.toNumber(),
			funds:{tokenAddress:self._funds[0],amount:self._funds[1].toString()},
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
}

function Prom(id,type,post,user) {
	const self = this;
	self._id = id;
	self._type = type;
	self._post = post;
	self._user = user;
	self.getId = () => {
		return this._id;
	}
	self.toJSON = async () => {
	
		var res = {
			id:self._id,
			type:self._type,
			post:self._post,
			user:self._user,	
			influencer:self._influencer,
			idCampaign:self._idCampaign,
			nbResults:self._nbResults.toNumber(),
			isAccepted:self._isAccepted,
			lastResult:self._lastResult,
			funds:{tokenAddress:self._funds[0],amount:self._funds[1].toString()}
		}
		
		var results = await self.getResults();
		
		res.results = [];
		for(var i=0;i<results.length;i++)
		{
			res.results.push(await results[i].toJSON());
		}
		return res;
	}
	self.getResults = async () => {
	
		var res = await self._campaignContract.methods.getResults(self._id).call();
		var finalRes = [];
		for (var i=0;i<res.length;i++) {
			var resres = await self._campaignContract.methods.results(res[i]).call();
			var result = new Result(res[i],resres.likes,resres.shares,resres.views);
			finalRes.push(result)
		}
		return finalRes;
	}
}

function Result(id,likes,shares,views) {
	const self = this;
	self._id = id;
	self._likes = likes;
	self._shares = shares;
	self._views = views;
	self.getId = () => {
		return this._id;
	}
	self.toJSON = () => {
		var res = {
			id:self._id,
			likes:self._likes.toNumber(),
			shares:self._shares.toNumber(),
			views:self._views.toNumber()
		}
		return res;
		
	}
}
	
module.exports = CampaignManager;