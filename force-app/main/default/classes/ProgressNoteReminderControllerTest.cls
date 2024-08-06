@isTest
public class ProgressNoteReminderControllerTest {

    @isTest
    static void testGetCaseRecordType() {
        // Fetch an existing Case RecordType
        RecordType caseRecordType = [SELECT Id, Name FROM RecordType WHERE SObjectType = 'Case' LIMIT 1];
	
        // Create a Case with the fetched RecordType
        Case testCase = new Case(
            RecordTypeId = caseRecordType.Id,
            Subject = 'Test Case'
        
        );
        insert testCase;

        // Test the getCaseRecordType method
        Test.startTest();
        String recordTypeName = ProgressNoteReminderController.getCaseRecordType(testCase.Id);
        Test.stopTest();

        // Verify the result
        System.assertEquals(caseRecordType.Name, recordTypeName, 'The Record Type Name should match the test data.');
    }

    @isTest
    static void testGetProgressNoteRecordTypeIds() {
        // Fetch existing Progress Note RecordTypes
        List<RecordType> progressNoteRTs = [SELECT Id, Name FROM RecordType WHERE SObjectType = 'Progress_Note__c' AND Name IN ('Medical Progress Note', 'Admin Progress Note')];

        // Ensure there are exactly two record types returned
        System.assertEquals(2, progressNoteRTs.size(), 'There should be exactly 2 Progress Note RecordTypes.');

        // Test the getProgressNoteRecordTypeIds method
        Test.startTest();
        Map<String, Id> recordTypeMap = ProgressNoteReminderController.getProgressNoteRecordTypeIds();
        Test.stopTest();

        // Verify the results
        System.assertNotEquals(null, recordTypeMap, 'The record type map should not be null.');
        System.assertEquals(2, recordTypeMap.size(), 'The record type map should contain exactly 2 entries.');

        // Validate record types in the map
        for (RecordType rt : progressNoteRTs) {
            System.assertEquals(rt.Id, recordTypeMap.get(rt.Name), 'The ID for ' + rt.Name + ' should match the test data.');
        }
    }

    @isTest
    static void testCreateReminder() {
        // Setup necessary records
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        // If you need to link to a custom object, create it here
        // Encounter__c customEncounter = new Encounter__c(Name = 'Test Encounter');
        // insert customEncounter;

        // Call createReminder method
        Test.startTest();
        Id taskId = ProgressNoteReminderController.createReminder(
            'Test Subject',
            Date.today().addDays(1),
            testAccount.Id,  // or customEncounter.Id if used
            'Call',
            'Test comments',
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
    static void testGetContactIdForCase() {
        // Setup necessary records
        Contact testContact = new Contact(FirstName = 'John', LastName = 'Doe');
        insert testContact;
	
        Case testCase = new Case(
            ContactId = testContact.Id,
            Subject = 'Test Case'
     
        );
        insert testCase;

        // Call getContactIdForCase method
        Test.startTest();
        String contactName = ProgressNoteReminderController.getContactIdForCase(testCase.Id);
        Test.stopTest();

        // Verify the result
        System.assertEquals('John Doe', contactName, 'The Contact Name should match the test data.');
    }
      @isTest
    static void testGetReminderPicklistValues() {
        // Call the getReminderPicklistValues method
        Test.startTest();
        Map<String, List<Map<String, String>>> picklistValues = ProgressNoteReminderController.getReminderPicklistValues();
        Test.stopTest();

        // Verify the returned map is not null
        System.assertNotEquals(null, picklistValues, 'The picklist values map should not be null.');

        // Verify the 'type' key exists and contains values
        // List<Map<String, String>> typeOptions = picklistValues.get('type');
        // System.assertNotEquals(null, typeOptions, 'The type picklist values should not be null.');
        // Assert.isTrue(typeOptions.size() > 0, 'The type picklist values should not be empty.');

        // Verify the 'priority' key exists and contains values
        List<Map<String, String>> priorityOptions = picklistValues.get('priority');
        System.assertNotEquals(null, priorityOptions, 'The priority picklist values should not be null.');
       Assert.isTrue(priorityOptions.size() > 0, 'The priority picklist values should not be empty.');

        // Additional checks to verify the content of the picklist values
        // for (Map<String, String> option : typeOptions) {
        //     System.assertNotEquals(null, option.get('value'), 'The value of the type picklist option should not be null.');
        //     System.assertNotEquals(null, option.get('label'), 'The label of the type picklist option should not be null.');
        // }

        for (Map<String, String> option : priorityOptions) {
            System.assertNotEquals(null, option.get('value'), 'The value of the priority picklist option should not be null.');
            System.assertNotEquals(null, option.get('label'), 'The label of the priority picklist option should not be null.');
        }
    }}