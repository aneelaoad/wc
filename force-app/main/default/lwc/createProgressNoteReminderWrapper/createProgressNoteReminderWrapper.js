import { LightningElement, api, track, wire } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions'; 
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { getRecord } from "lightning/uiRecordApi";
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

import PROGRESS_NOTE_OBJECT from '@salesforce/schema/Progress_Note__c';
const CASE_FIELDS = ['Case.Id', 'Case.CaseNumber', 'Case.Member_Details__c','Case.ContactId', 'Case.RecordTypeId', 'Case.RecordType.Name'];

export default class createProgressNoteReminderWrapper extends LightningElement {

    selectedRecordTypeName;
    showPNForm = false;
    showLoader = true;
    showReminderForm = false
    showPNReminderPopUp=true
    createdPNId;
    encounterDetails;
    pnSelectedRecordTypeInfo;
    pnRecordTypeInfo;
    _recordId;

    @api set recordId(value) {this._recordId = value; }
    get recordId() { return this._recordId; }

    @wire(getObjectInfo, { objectApiName: PROGRESS_NOTE_OBJECT })
    objectInfoHandler({ error, data }) {
        if (data) {
            this.pnRecordTypeInfo = data.recordTypeInfos;
            // console.log('recordTypeInfo ', recordTypeInfo);
        } else if (error) {
            
        }
    }
    
    @wire(getRecord, { recordId: "$recordId", fields: CASE_FIELDS })
    encounterDetails(result) {
        if (typeof result.data !== "undefined") {
            const objectRecords = result.data.fields;
            console.log('Encounter Records: '+JSON.stringify(objectRecords));

            this.encounterDetails = objectRecords;
            this.selectedRecordTypeName = objectRecords.RecordType.value.fields.Name.value;
            console.log('selectedRecordTypeName ', this.selectedRecordTypeName);

            if(this.pnRecordTypeInfo != null){
                console.log('this.pnRecordTypeInfo ', this.pnRecordTypeInfo);
                if(this.selectedRecordTypeName == 'Admin Encounter'){
                    this.pnSelectedRecordTypeInfo = Object.keys(this.pnRecordTypeInfo).find(rtId => this.pnRecordTypeInfo[rtId].name === 'Admin Progress Note');
                }
                else {
                    this.pnSelectedRecordTypeInfo = Object.keys(this.pnRecordTypeInfo).find(rtId => this.pnRecordTypeInfo[rtId].name === 'Medical Progress Note');
                }
                console.log('this.pnSelectedRecordTypeInfo ', this.pnSelectedRecordTypeInfo);
            }

            this.showPNForm = true;
            this.showLoader = false;
            
        }
    }

    handlePNCreated(event) {
       this.createdPNId = event.detail;

        console.log('createdPNId : ',this.createdPNId);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Progress Note created',
                    variant: 'success'
                })
            );
         this.showPNForm = false;
        this.showReminderForm = true;
    }

    handleClose() {
        this.showPNForm = false;
         this.showReminderForm = false;
        this.showPNReminderPopUp = false
        this.dispatchEvent(new CloseActionScreenEvent());


    }
    
}