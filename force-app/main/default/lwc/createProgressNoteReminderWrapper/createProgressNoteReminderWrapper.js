import { LightningElement, api, track, wire } from 'lwc';
import getCaseRecordType from '@salesforce/apex/ProgressNoteReminderController.getCaseRecordType';
import { CloseActionScreenEvent } from 'lightning/actions'; 
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class createProgressNoteReminderWrapper extends LightningElement {

    selectedRecordTypeName;
    showPNForm = false;
    showLoader = true;
    showReminderForm = false
    showPNReminderPopUp=true
    createdPNId;
    _recordId


    @api set recordId(value) {
        this._recordId = value;
        console.log("api _recordId: " + this._recordId);
    }

    get recordId() {
        return this._recordId;
    }


    @wire(getCaseRecordType, { caseId: '$recordId' })
    wiredCaseRecordType({ error, data }) {
        this.showLoader = false;
        if (data) {
            this.selectedRecordTypeName = data;
            this.showPNForm = data === 'Admin Encounter' || data === 'Medical Encounter' || 'High Privacy Encounter';
        } else if (error) {
            console.error('Error fetching case record type:', error);
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