@isTest
public class ProgressNoteReminderControllerTest {

   

    @isTest
    static void testCreateReminder() {
        // Setup necessary records
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        Test.startTest();
        Id taskId = ProgressNoteReminderController.createReminder(
            'Test Subject',
            Date.today().addDays(1),
            testAccount.Id,  // or customEncounter.Id if used
            'Call',
            'Test comments',
            'Reminder',
            'High',
            null,
            null  // or the customEncounter.Id if used
        );
        Test.stopTest();

        // Verify the Task record was created
        Task createdTask = [SELECT Id, Subject, ActivityDate, WhatId, Type, Description, Encounter__c FROM Task WHERE Id = :taskId LIMIT 1];
        
        System.assertNotEquals(null, createdTask, 'The Task record should have been created.');
        System.assertEquals('Test Subject', createdTask.Subject, 'The Subject should match the input.');
        System.assertEquals(Date.today().addDays(1), createdTask.ActivityDate, 'The Due Date should match the input.');
        System.assertEquals(testAccount.Id, createdTask.WhatId, 'The WhatId should match the input.');
        System.assertEquals('Call', createdTask.Type, 'The Type should match the input.');
        System.assertEquals('Test comments', createdTask.Description, 'The Description should match the input.');
        // System.assertEquals(customEncounter.Id, createdTask.Encounter__c, 'The Encounter__c should match the input.');  // Uncomment if custom object is used
    }

   
      @isTest
    static void testGetReminderPicklistValues() {
        // Call the getReminderPicklistValues method
        Test.startTest();
        Map<String, List<Map<String, String>>> picklistValues = ProgressNoteReminderController.getReminderPicklistValues();
        Test.stopTest();

        // Verify the returned map is not null
        System.assertNotEquals(null, picklistValues, 'The picklist values map should not be null.');

       
        List<Map<String, String>> priorityOptions = picklistValues.get('priority');
        System.assertNotEquals(null, priorityOptions, 'The priority picklist values should not be null.');
       Assert.isTrue(priorityOptions.size() > 0, 'The priority picklist values should not be empty.');

        for (Map<String, String> option : priorityOptions) {
            System.assertNotEquals(null, option.get('value'), 'The value of the priority picklist option should not be null.');
            System.assertNotEquals(null, option.get('label'), 'The label of the priority picklist option should not be null.');
        }
    }}