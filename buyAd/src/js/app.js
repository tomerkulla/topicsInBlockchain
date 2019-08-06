App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,
  contractsCount: 0,

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



    console.log("WEB3: 0x832327c3c31e4e22c5243c2dcb8c57cc14c21b83", web3, App.contracts.AdContracts);
    return App.initContract();

  },

  initContract: function() {
    $.getJSON("AdContracts.json", function(contract) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.AdContracts = TruffleContract(contract);
      // Connect provider to interact with contract
      App.contracts.AdContracts.setProvider(App.web3Provider);

      // App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.AdContracts.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.purchaseEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
      });
      instance.insertEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
      });
    });
  },

  render: function() {
    var adContractsInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
        $("#offersB").hide();
        $("#purchasesB").hide();
        $("#insertOffer").hide();
        $("#home").show();
      }
    });

    // Load contract data
    App.contracts.AdContracts.deployed().then(function(instance) {
      adContractsInstance = instance;
      return adContractsInstance.adCount();
    }).then(function(adCount) {
      var offers = $("#offers");
      offers.empty();
      console.log("RENDER:");

      for (var i = 1; i <= adCount; i++) {
        adContractsInstance.ads(i).then(function(ad) {
          var id = ad[0];
          var url = ad[2];
          var price = ad[3];
          var time = ad[4];
          var views = ad[5];
          var purchased = ad[6];

          console.log("NEW OFFER!:", ad, i, adCount);

          // Render candidate Result
          var offerTemplate = "<tr><th>" + id + 
          ` </td><td><a href="`+url+`">`+url+`</a>` +  
          "</td><td>" + price + "</td>" 
          + "</td><td>" + time + "</td>" + "</td><td>" + views + 
          `
          </td><td>
          <button type="button" class="btn btn-link" data-toggle="modal" data-target="#purchaseModal">
            Purchase
          </button>
          <div class="modal fade" id="purchaseModal" tabindex="-1" role="dialog" aria-labelledby="purchaseModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="purchaseModalLabel">Purchase Ad</h5>
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <form onSubmit="App.purchase(`+ id +`); return false;">
                  <div class="form-group">
                    <input class="form-control form-control-sm" type="text" id="image" placeholder="Image-URL">
                  </div>
                  <button type="submit" onClick="App.purchase(`+ id +`); return false;" data-dismiss="modal" class="btn btn-primary">Submit</button>
                <hr/>
              </form>
              </div>
            </div>
          </div>
          </td></tr>
          `;
          if(purchased == false)
            offers.append(offerTemplate);
      
        });
      }
      return adContractsInstance.purchasesCount();
    }).then(function(purchasesCount) {

      var purchases = $("#purchases");
      purchases.empty();

      for (var i = 1; i <= purchasesCount; i++) {
        adContractsInstance.purchases(i).then(function(purchase) {
          var id = purchase[0];
          var url = purchase[1];
          var views = purchase[3];


          console.log("NEW purchase!:", purchase, i);

          // Render candidate Result
          var purchaseTemplate = 
          "<tr><th>" + id + "</th>" + 
          `<td><a href="`+url+`">`+url+`</a></td><td>` + 
          views + "</td><td>" +
          `
          </td><td>
          <button type="button" class="btn btn-link" data-toggle="modal" data-target="#statusModal" onClick="App.status(`+ id +`); return false;">
            Status
          </button>
          <div class="modal fade" id="statusModal" tabindex="-1" role="dialog" aria-labelledby="statusModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="status-content" id="statusModalLabel">Status: </h5>
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          </td></tr>
          `;
          purchases.append(purchaseTemplate);
      
        });
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  status: function(id){
    console.log("status:", id);
    App.contracts.AdContracts.deployed().then(function(instance) {
      instance.purchaseStatus(id).then(function(result) {
        instance.purchases(id).then(function(purchase) {
          var status = purchase[4];
          console.log("status2:", status);
          $('#status-content').empty();
          $('#status-content').append("Status: " + App.statusDict[status]);
          
        });

      })
    }).catch(function(err) {
      console.error(err);
    });
  },

  purchase: function(adNum) {
    var ad = $('#image').val();
    App.contracts.AdContracts.deployed().then(function(instance) {
      console.log("PURCHASEEEEEE:", adNum);
      instance.ads(adNum).then(function(ad2) {
          console.log("PURCHASEEEEEE:", adNum, ad2[3]);
          return instance.purchase(adNum, ad, { 'from': App.account, 'value':  ad2[3] * 1000000000000000000});
      }).then(function(res){
        location.reload();
      });
    }).catch(function(err) {
      console.error(err);
    });
  },
  home: function(){
    $("#offersB").hide();
    $("#purchasesB").hide();
    $("#insertOffer").hide();
    $("#home").show();
  },
  offers: function(){
    $("#offersB").show();
    $("#purchasesB").hide();
    $("#insertOffer").show();
    $("#home").hide();
  },
  purchases: function(){
    $("#offersB").hide();
    $("#purchasesB").show();
    $("#insertOffer").hide();
    $("#home").hide();
  },

  insertAd: function() {
    var url = $('#url').val();
    var price = $('#price').val();
    var time = $('#time').val();
    var views = $('#views').val();
    console.log("insertAd:", url,price, time, views);
    App.contracts.AdContracts.deployed().then(function(instance) {
      return instance.insertAd(url, parseInt(price), parseInt(time), parseInt(views), { from: App.account });
    }).then(function(res){
      location.reload();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});