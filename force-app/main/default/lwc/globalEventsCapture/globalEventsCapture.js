import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';
import USER_ID from "@salesforce/user/Id";

export default class GlobalEventsCapture extends NavigationMixin(LightningElement) {

    _recordId;
    _objectApiName;
    apiName;

    userId = USER_ID;
    
    subscription = {};
    @track message;
    @api channelName = '/event/Internal_Event__e';

    @api set recordId(value) { this._recordId = value; }
    get recordId() { return this._recordId; }

    @api set objectApiName(value) { this._objectApiName = value; }
    get objectApiName() { return this._objectApiName; }

    get pagereference() {
        return {
            "type": "standard__quickAction",
            "attributes": {
                "apiName": this.apiName
            },
            "state": {
                "objectApiName": this.objectApiName,
                "context": "RECORD_DETAIL",
                "recordId": this.recordId,
                "backgroundContext": "/lightning/r/"+ this.objectApiName + "/" + this.recordId + "/view"
            }
        }
    }

    connectedCallback(){
        console.log('recordId ', this.recordId);
        console.log('objectApiName ', this.objectApiName);

        this.registerErrorListener();
        this.handleSubscribe();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    handleSubscribe() {
        // Callback invoked whenever a new event message is received
        const self = this;
        const messageCallback = function (response) {
            console.log('New message received: ', JSON.stringify(response));
            self.handleMessageCallback(response, self);
        };
 
        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelName, -1, messageCallback).then(response => {
            // Response contains the subscription information on subscribe call
            console.log('Subscription request sent to: ', JSON.stringify(response.channel));
            this.subscription = response;
        });
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription, response => {
            console.log('unsubscribe() response: ' + JSON.stringify(response));
        });
    }

    registerErrorListener() {
        onError(error => {
            console.log('Received error from server: ', JSON.stringify(error));
        });
    }

    handleMessageCallback(response, self) {
        console.log('New message received: ', response);

        var obj = JSON.parse(JSON.stringify(response));
        let objData = obj.data.payload;

        console.log('payload: ', objData);
        
        if (objData.Event__c == 'TriggerQuickAction' && 
            objData.Publishing_User_Id__c == self.userId && 
            objData.Param_1__c == self.recordId) {
               
                self.apiName = objData.Param_2__c;
                self[NavigationMixin.Navigate](self.pagereference, true);

        } else {
            console.log('payload invalid for record.')
        }
        
        
    }

}