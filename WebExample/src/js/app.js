App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,
  contractsCount: 0,
  contractAdress: "0x8e86b59c30c32a5406855742f801d38d67ed658f",
  data: "",

  init: function() {
    return App.initWeb3();
  },
  statusDict: [
    "ACTIVE",
    "FAILED: not enough views",
    "SUCCSES"
  ],
  status: 0,
  
  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    web3.eth.defaultAccount = web3.eth.accounts[0];
    // personal.unlockAccount(web3.eth.defaultAccount)
    var version = web3.version.api;
    console.log("WEB3 VERSION:", version); // "0.2.0"
    return App.initContract();
  },

  initContract: function() {

    var adcontractsContract = web3.eth.contract([{"constant":false,"inputs":[{"name":"_adId","type":"int256"}],"name":"getAd","outputs":[{"name":"ad","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_webUrl","type":"string"},{"name":"_price","type":"uint256"},{"name":"_time","type":"uint256"},{"name":"_views","type":"uint256"}],"name":"insertAd","outputs":[{"name":"adId","type":"int256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"purchasesCount","outputs":[{"name":"","type":"int256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"int256"}],"name":"ads","outputs":[{"name":"id","type":"int256"},{"name":"websiteOwner","type":"address"},{"name":"webUrl","type":"string"},{"name":"price","type":"uint256"},{"name":"time","type":"uint256"},{"name":"views","type":"uint256"},{"name":"purchased","type":"bool"},{"name":"ad","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"adCount","outputs":[{"name":"","type":"int256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_adId","type":"int256"},{"name":"_ad","type":"string"}],"name":"purchase","outputs":[{"name":"adId","type":"int256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"int256"}],"name":"purchases","outputs":[{"name":"id","type":"int256"},{"name":"webUrl","type":"string"},{"name":"adBuyer","type":"address"},{"name":"views","type":"uint256"},{"name":"status","type":"int256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_adId","type":"int256"}],"name":"purchaseStatus","outputs":[{"name":"status","type":"int256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_adId","type":"int256"}],"name":"purchaseEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_adId","type":"int256"}],"name":"insertEvent","type":"event"}]);

    App.contracts.AdContracts = adcontractsContract.at(App.contractAdress);

    console.log("GOT CONTRACT!:", App.contracts.AdContracts);

    App.listenForEvents();

    return App.render();
  },

  hex2a: function (hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        var v = parseInt(hex.substr(i, 2), 16);
        if (v) str += String.fromCharCode(v);
    }
    return str;
  },

  listenForEvents: function() {
      const filter = web3.eth.filter({
        fromBlock: 0,
        toBlock: 'latest',
        address: App.contractAdress,
      });
      filter.watch((error, result) => {
        // var dec = web3.hexToUtf8(result.data);
        var data2 = App.hex2a(result.data);
        data2 = data2.substring(data2.indexOf('h'));
        
        var ad_img = $("#block-chain-ad");
        ad_img.empty();
        adTemplate = 
        `<img style="max-width: 400px; height: auto;" src="`+data2+`" class="rounded float-right" alt="..."></img>`
        ad_img.append(adTemplate);
        App.data = data2;
        $('<img src="'+ data2 +'">').load(function() {
          $(this).width('300px').height('auto').appendTo('#block-chain-ad');
        });
        $('#ad').prop('src', data2).width('400px').height('auto');
        ad_img = $("#block-chain-ad");
        console.log("event triggered",result, data2, ad_img);
     });

  },

  render: function() {
    console.log("render:");
    var ad_id = 1;
    
    var check = App.contracts.AdContracts.getAd(ad_id, 
      function(err, res){
        console.log("GET AD RESULT!:", res.toString());
        // console.log(err.toString());
      });
      console.log("render:", check);
}
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});