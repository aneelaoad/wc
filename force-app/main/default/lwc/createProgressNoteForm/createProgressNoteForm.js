import { LightningElement, api, wire, track } from 'lwc';
import getProgressNoteRecordTypeIds from '@salesforce/apex/ProgressNoteReminderController.getProgressNoteRecordTypeIds';
import getContactIdForCase from '@salesforce/apex/ProgressNoteReminderController.getContactIdForCase';

export default class CreateProgressNoteForm extends LightningElement {
    @api recordId
    @api encounterId;
    @api encounterType;
    @track recordTypeId;
    @track showLoader = true;
    contactName;
    @wire(getProgressNoteRecordTypeIds)
    wiredRecordTypeIds({ error, data }) {
        if (data) {
            console.log('data:', data);
            this.showLoader = false;
            if (this.encounterType === 'Medical Encounter' || this.encounterType === 'High Privacy Encounter') {
                this.recordTypeId = data['Medical Progress Note'];
            console.log('encounterType:', this.encounterType);
            console.log('PN:', data['Medical Progress Note']);

            } else if (this.encounterType === 'Admin Encounter') {
                this.recordTypeId = data['Admin Progress Note'];
            }
            // console.log('recordTypeId:', this.recordTypeId);
            console.log('encounterType:', this.encounterType);
        } else if (error) {
            this.showLoader = false;
            console.error('Error fetching record type IDs:', error);
        }
    }

    handleSubmit(event) {
        event.preventDefault(); 
           this.showLoader = true; 
        const fields = event.detail.fields;
        fields.RecordTypeId = this.recordTypeId;
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

       @wire(getContactIdForCase, { caseId: '$encounterId' })
        wiredContactId({ error, data }) {
        if (data) {
            this.contactName = data;
            console.log('OUTPUT : ',this.contactName);
        } else if (error) {
            console.error('Error fetching contact ID:', error);
        }
    }
}