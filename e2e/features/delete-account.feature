Feature: Deleting my account
  As a traveller
  I want to remove my account and everything in it
  So that nothing of mine is kept

  Scenario: Deleting the account signs out and removes the user
    Given I am signed in
    When I open the account settings and confirm that I want to delete my account
    Then I am signed out
    And I am on the home page

  Scenario: The deleted user can no longer sign in
    Given I deleted my account
    When I try to sign in with the same email address and password
    Then I am told that the credentials are not valid
