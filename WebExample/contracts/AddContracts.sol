pragma solidity ^0.5.0;


contract AddContracts {
    // Model a Candidate

    struct Add {
        int id;
        address payable websiteOwner; 
        string webUrl;
        uint price;
        uint time;
        uint views;
        bool purchased;
        string add;
    }
    struct Purchase {
        int id;
        string webUrl;
        address payable addBuyer;
        uint views;
        address[] viewers;
        int status;
    }

    string default_add = "HEELO";

    mapping(int => Add) public adds;
    int public addCount;

    mapping(int => Purchase) public purchases;
    int public purchasesCount;

    // voted event
    event purchaseEvent (
        int indexed _addId
    );

    event insertEvent (
        int indexed _addId
    );

    constructor() public {}

    function insertAdd (string memory _webUrl, uint _price, uint _time, uint _views) public returns (int addId) {
        addCount ++;
        adds[addCount] = Add(addCount, msg.sender, _webUrl, _price, _time, _views, false, default_add);

        emit insertEvent(addCount);
        return addCount;
    }

    function purchase (int _addId, string memory _add) public payable {
        require(_addId > 0 && _addId <= addCount);
        require(msg.value >= adds[_addId].price);

        purchasesCount++;
        purchases[purchasesCount] = Purchase(_addId, adds[_addId].webUrl, msg.sender, 0, new address[](0), 0);

        adds[_addId].purchased = true;
        adds[_addId].add = _add;
        adds[_addId].time = now + adds[_addId].time*60;
        

        emit purchaseEvent(_addId);
    }

    function getAdd (int _addId) public returns (string memory add) {
        require(_addId > 0 && _addId <= addCount);

        if (now > adds[_addId].time){
            if(purchases[_addId].status == 0){
                purchaseStatus(_addId);
            }
            return default_add;
        }

        for (uint i=0; i<purchases[_addId].views; i++) {
            if(purchases[_addId].viewers[i] == msg.sender){
                return adds[_addId].add;
            }
        }
        purchases[_addId].viewers.push(msg.sender);
        purchases[_addId].views = purchases[_addId].views + 1;

        return adds[_addId].add;
    }

    function purchaseStatus (int _addId) public returns (int status) {
        require(_addId > 0 && _addId <= addCount);

        uint fixPrice = adds[_addId].price * 1000000000000000000;

        if(purchases[_addId].status != 0){
            return purchases[_addId].status;
        }

        if(now < adds[_addId].time){
            return 0;
        }
        if(adds[_addId].views > purchases[_addId].views){
            purchases[_addId].status = 1;
            purchases[_addId].addBuyer.transfer(fixPrice);
            return 1;
        }
        purchases[_addId].status = 2;
        status = 2;
        adds[_addId].websiteOwner.transfer(fixPrice);
        return 2;
    }


}