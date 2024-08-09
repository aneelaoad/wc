import { LightningElement, api, wire, track } from 'lwc';

import medicalProgressNotesTemplate from './createMedicalProgressNote.html';
import adminProgressNotesTemplate from './createAdminProgressNote.html';

// import getProgressNoteRecordTypeIds from '@salesforce/apex/ProgressNoteReminderController.getProgressNoteRecordTypeIds';
// import getContactIdForCase from '@salesforce/apex/ProgressNoteReminderController.getContactIdForCase';

const CASE_FIELDS = ['Case.Id', 'Case.CaseNumber', 'Case.Member_Details__c','Case.ContactId'];

export default class CreateProgressNoteForm extends LightningElement {
    
    @api encounterId;
    @api encounterType;
    @api encounterDetails;

    @track recordTypeId;
    @track showLoader = true;

    _recordId;
    _progressNoteRecordTypeId;

    @api set recordId(value) {this._recordId = value; }
    get recordId() { return this._recordId; }

    @api set progressNoteRecordTypeId(value) {this._progressNoteRecordTypeId = value; }
    get progressNoteRecordTypeId() { return this._progressNoteRecordTypeId; }
    
    render(){
        this.showLoader = false;
        console.log('recordId: ', this.encounterId);
        console.log('selectedRecordTypeName: ', this.encounterType);
        console.log('progressNoteRecordTypeId: ', this.progressNoteRecordTypeId);
        return (this.encounterType == 'Admin Encounter' ? adminProgressNotesTemplate : medicalProgressNotesTemplate);
    }

    handleSubmit(event) {
        event.preventDefault(); 
        this.showLoader = true; 
        const fields = event.detail.fields;
        // fields.RecordTypeId = this.recordTypeId;
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    handleSuccess(event) {
        const evt = new CustomEvent('pncreated', {
            detail: event.detail.id
        });
        this.dispatchEvent(evt);
    }

   handleCancel() {
        const evt = new CustomEvent('close');
        this.dispatchEvent(evt);
    }

}