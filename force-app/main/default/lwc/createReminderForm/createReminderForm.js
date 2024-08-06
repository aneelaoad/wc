import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createReminder from '@salesforce/apex/ProgressNoteReminderController.createReminder';
import getReminderPicklistValues from '@salesforce/apex/ProgressNoteReminderController.getReminderPicklistValues';
import { CloseActionScreenEvent } from 'lightning/actions'; 
import getCaseContactName from '@salesforce/apex/ProgressNoteReminderController.getCaseContactName';
// import getRelatedEncounter from '@salesforce/apex/ProgressNoteReminderController.getRelatedEncounter';
import getCurrentUserContactId from '@salesforce/apex/ProgressNoteReminderController.getCurrentUserContactId';
const CASE_FIELDS = ['Case.Id', 'Case.CaseNumber', 'Case.Member_Details__c','Case.ContactId'];
const PN_FIELDS = ['Progress_Note__c.Encounter__c','Progress_Note__c.Encounter__r.CaseNumber', 'Progress_Note__c.Encounter__r.Member_Details__c', 'Progress_Note__c.Encounter__r.ContactId'];
import { getRecord } from "lightning/uiRecordApi";

export default class CreateReminderForm extends LightningElement {
    @api encounterId;
    subject = '';
    dueDate = '';
    type = '';
    comments = '';
    assignTo = '';
    status = 'Active';
    priority= 'High'
    showLoader = false;
    relatedEncounter;
   type = "Reminder"
   priorityOptions = [];
   statusOptions = []
    @api createdPnId;
   contactName;

   _recordId
   _checkRecordId;


   @api set recordId(value) {
       this._recordId = value;
       console.log("api _recordId: " + this._recordId);
    //    this.setCheckRecordId();
         this.getObjectName(this._recordId);

   }

   get recordId() {
       return this._recordId;
   }

   @api
    set checkRecordId(value) {
        this._checkRecordId = value;
    }

    get checkRecordId() {
        return this._checkRecordId;
    }

    setCheckRecordId() {
        this.checkRecordId = this.encounterId || this.recordId;
    }

    handleSubjectChange(event) {
        this.subject = event.target.value;
    }

    handleDueDateChange(event) {
        this.dueDate = event.target.value;
    }

    handleTypeChange(event) {
        this.type = event.detail.value;
    }

    handleCommentsChange(event) {
        this.comments = event.target.value;
    }
    handlePriorityChange(event){
        this.priority = event.target.value;
    }
    handleStatusChange(event){
        this.status = event.target.value;
    }
    handleAssignToChange(event){
        this.assignTo = event.target.value;
    }
    
    handleSave() {
        this.showLoader = true;
        // const checkRecordId = this.encounterId || this.recordId;
        console.log('checkRecordId: '+checkRecordId);
        createReminder({
            subject: this.subject,
            dueDate: this.dueDate,
            whatId: this.encounterId,
            comments: this.comments,
            encounterId: this.checkRecordId,
            type: this.type,
            priority: this.priority,
            assignTo: this.assignTo,
            status: this.status
        })
        .then(taskId => {
            this.showLoader = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Task created',
                    variant: 'success'
                })
            );
            this.handleClose();
        })
        .catch(error => {
            this.showLoader = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating task',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
        this.dispatchEvent(new CloseActionScreenEvent());

    }

    @wire(getReminderPicklistValues)
    reminderPickListValues({ error, data }) {
        if (data) {
            console.log('data: ', data);
            this.priorityOptions = data.priority.map(option => ({
                label: option.label,
                value: option.value
            }));
            this.statusOptions = data.status.map(option => ({
                label: option.label,
                value: option.value
            }));
            this.assignToOptions = data.owner.map(option => ({
                label: option.label,
                value: option.value
            }));
        } else if (error) {
            console.error('Error fetching picklist values:', error);
        }
    }
  
    
    
   



    @wire(getRecord, { recordId: "$checkRecordId", fields: CASE_FIELDS })
    encounterDetails(result) {
        console.log('encounterDetails result '+JSON.stringify(result));
        if (typeof result.data !== "undefined") {
            const objectRecords = result.data.fields;
            console.log('this.objectRecords '+JSON.stringify(objectRecords));
            this.contactName = objectRecords.Member_Details__c.value;
            this.relatedEncounter = objectRecords.CaseNumber.value;
      
        }
    }

    @wire(getRecord, { recordId: "$createdPnId", fields: PN_FIELDS })
    progressNoteDetails(result) {
        console.log('progressNoteDetails result '+JSON.stringify(result));
        if (typeof result.data !== "undefined") {
            const objectRecords = result.data.fields;
            console.log('this.objectRecords '+JSON.stringify(objectRecords));
            this.contactName = objectRecords.Encounter__r.value.fields.Member_Details__c.value;
            this.relatedEncounter = objectRecords.Encounter__r.value.fields.CaseNumber.value;
       
        }
    }

    getObjectName(recordIdd) {
        getSObjectType({ recordId : recordIdd })
            .then((result) => {
                if(result == 'Case'){
                    // this.checkRecordId =
                //   this.encounterId = recordIdd;
                //   this.taskencounterId = recordIdd;
                }else{
                 this.createdpnId = recordIdd;
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }
}