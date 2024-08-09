public class ProgressNoteReminderController {
  

 @AuraEnabled
public static Id createReminder(String subject, Date dueDate, Id whatId, String type, String comments, Id encounterId, String priority, String status, Id assignTo) {
    Task newTask = new Task(
        Subject = subject,
        ActivityDate = dueDate,
        WhatId = whatId,
        Type = type, 
        Description =comments, 
        Encounter__c = encounterId, 
        OwnerId = assignTo,
        Status=status,
        Priority=priority
    );
    System.debug('reminder created!'+newTask);
    insert newTask;
    return newTask.Id;
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
    
    return picklistOptions;
}

  
    
}