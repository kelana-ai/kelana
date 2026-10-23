Feature: Signing up
  As a traveller
  I want an account
  So that my trips are saved and only I can see them

  Scenario: Signing up lands on the dashboard
    Given I am not signed in
    When I sign up with a new email address and a password
    Then I land on my dashboard
    And I am welcomed back

  Scenario: The header shows the signed-in menu after a full reload
    Given I have just signed up
    When I reload the page
    Then the header shows my account menu

  Scenario: Signing out returns home and protects the pages again
    Given I am signed in
    When I sign out from my account page
    Then I am on the home page
    And opening my dashboard sends me to the login page

  Scenario: The same credentials sign back in
    Given I have signed out
    When I sign in with the same email address and password
    Then I land on my dashboard
