public class ProgressNoteReminderController {
    @AuraEnabled(cacheable=true)

   public static String getCaseRecordType(Id caseId) {
        Case caseRecord = [SELECT RecordType.Name FROM Case WHERE Id = :caseId LIMIT 1];
        return caseRecord.RecordType.Name;
    }


    @AuraEnabled(cacheable=true)
    public static Map<String, Id> getProgressNoteRecordTypeIds() {
        Map<String, Id> recordTypeMap = new Map<String, Id>();
        for (RecordType rt : [SELECT Id, Name FROM RecordType WHERE SObjectType = 'Progress_Note__c' AND Name IN ('Medical Progress Note', 'Admin Progress Note')]) {
            recordTypeMap.put(rt.Name, rt.Id);
        }
        return recordTypeMap;
    }

 @AuraEnabled
public static Id createReminder(String subject, Date dueDate, Id whatId, String type, String comments, Id encounterId) {
    Task newTask = new Task(
        Subject = subject,
        ActivityDate = dueDate,
        WhatId = whatId,
        Type = type, 
        Description =comments, 
        Encounter__c = encounterId 
    );
    System.debug('reminder created!'+newTask);
    insert newTask;
    return newTask.Id;
}

  @AuraEnabled(cacheable=true)
    public static String getContactIdForCase(Id caseId) {
          Case caseRecord = [SELECT Contact.FirstName, Contact.LastName FROM Case WHERE Id = :caseId LIMIT 1];
        if (caseRecord.Contact != null) {
            return caseRecord.Contact.FirstName + ' ' + caseRecord.Contact.LastName;
        } else {       return null;
        }
    }

    @AuraEnabled(cacheable=true)
public static Map<String, List<Map<String, String>>> getReminderPicklistValues() {
    Map<String, List<Map<String, String>>> picklistOptions = new Map<String, List<Map<String, String>>>();
    
    // Get Priority picklist values
    List<Map<String, String>> priorityOptions = new List<Map<String, String>>();
    Schema.DescribeFieldResult priorityField = Task.Priority.getDescribe();
    List<Schema.PicklistEntry> priorityPicklistEntries = priorityField.getPicklistValues();
    for (Schema.PicklistEntry entry : priorityPicklistEntries) {
        priorityOptions.add(new Map<String, String>{
            'value' => entry.getValue(),
            'label' => entry.getLabel()
        });
    }
    picklistOptions.put('priority', priorityOptions);
    
    // Get Status picklist values
    List<Map<String, String>> statusOptions = new List<Map<String, String>>();
    Schema.DescribeFieldResult statusField = Task.Status.getDescribe();
    List<Schema.PicklistEntry> statusPicklistEntries = statusField.getPicklistValues();
    for (Schema.PicklistEntry entry : statusPicklistEntries) {
        statusOptions.add(new Map<String, String>{
            'value' => entry.getValue(),
            'label' => entry.getLabel()
        });
    }
    picklistOptions.put('status', statusOptions);
    

     // Get Users for OwnerId field
     List<Map<String, String>> ownerOptions = new List<Map<String, String>>();
     List<User> users = [SELECT Id, Name FROM User WHERE IsActive = true ORDER BY Name];
     for (User user : users) {
         ownerOptions.add(new Map<String, String>{
             'value' => user.Id,
             'label' => user.Name
         });
     }
     picklistOptions.put('owner', ownerOptions);
    return picklistOptions;
}

    @AuraEnabled(cacheable=true)
    public static String getCaseContactName(Id caseId) {
        Case caseRecord = [SELECT Contact.Name FROM Case WHERE Id = :caseId LIMIT 1];
        if (caseRecord.Contact != null) {
            return caseRecord.Contact.Name;
        } else {
            return null; 
        }
    }
    @AuraEnabled(cacheable=true)
    public static String getRelatedEncounter(Id caseId) {
        Case caseRecord = [SELECT CaseNumber FROM Case WHERE Id = :caseId LIMIT 1];
        if (caseRecord != null) {
            return caseRecord.CaseNumber;
        } else {
            return null; 
        }
    }


    @AuraEnabled(cacheable=true)
    public static String getCurrentUserContactId() {
        String contactId;
        User currentUser = [SELECT Name FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        if(currentUser != null) {
            contactId = currentUser.Name;
        }
        System.debug('contactId'+ contactId);
        return contactId;
    }
}