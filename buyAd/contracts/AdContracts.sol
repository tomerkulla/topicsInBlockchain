pragma solidity ^0.5.0;


contract AdContracts {

    struct Ad {
        int id;
        address payable websiteOwner; 
        string webUrl;
        uint price;
        uint time;
        uint views;
        bool purchased;
        string ad;
    }
    struct Purchase {
        int id;
        string webUrl;
        address payable adBuyer;
        uint views;
        address[] viewers;
        int status;
    }

    string default_ad = "https://i.ibb.co/RH7cP5S/default-add.png";

    mapping(int => Ad) public ads;
    int public adCount;

    mapping(int => Purchase) public purchases;
    int public purchasesCount;

    // voted event
    event purchaseEvent (
        int indexed _adId
    );

    event insertEvent (
        int indexed _adId
    );

    event getAdEvent (
        string ad
    );

    constructor() public {}

    function insertAd (string memory _webUrl, uint _price, uint _time, uint _views) public returns (int adId) {
        adCount ++;
        ads[adCount] = Ad(adCount, msg.sender, _webUrl, _price, _time, _views, false, default_ad);

        // emit insertEvent(adCount);
        return adCount;
    }

    function purchase (int _adId, string memory _ad) public payable returns (int adId){
        require(_adId > 0 && _adId <= adCount);
        require(msg.value >= ads[_adId].price);

        purchasesCount++;
        purchases[purchasesCount] = Purchase(_adId, ads[_adId].webUrl, msg.sender, 0, new address[](0), 0);

        ads[_adId].purchased = true;
        ads[_adId].ad = _ad;
        ads[_adId].time = now + ads[_adId].time*60;
        

        // emit purchaseEvent(_adId);
        return purchasesCount;
    }

    function getAd (int _adId) public returns (string memory ad) {
        require(_adId > 0 && _adId <= adCount);

        if (now > ads[_adId].time){

            emit getAdEvent(default_ad);
            return default_ad;
        }

        for (uint i=0; i<purchases[_adId].views; i++) {
            if(purchases[_adId].viewers[i] == msg.sender){
                emit getAdEvent(ads[_adId].ad);
                return ads[_adId].ad;
            }
        }
        purchases[_adId].viewers.push(msg.sender);
        purchases[_adId].views = purchases[_adId].views + 1;
        
        emit getAdEvent(ads[_adId].ad);
        return ads[_adId].ad;
    }

    function purchaseStatus (int _adId) public returns (int status) {
        require(_adId > 0 && _adId <= adCount);

        uint fixPrice = ads[_adId].price * 1000000000000000000;

        if(purchases[_adId].status != 0){
            return purchases[_adId].status;
        }

        if(now < ads[_adId].time){
            return 0;
        }
        if(ads[_adId].views > purchases[_adId].views){
            purchases[_adId].status = 1;
            purchases[_adId].adBuyer.transfer(fixPrice);
            return 1;
        }
        purchases[_adId].status = 2;
        status = 2;
        ads[_adId].websiteOwner.transfer(fixPrice);
        return 2;
    }


}