Feature: Creating a trip
  As a traveller
  I want to describe a trip and get a plan for it
  So that I can see where to go, what it costs and what it emits

  Scenario: The wizard asks for a destination before moving on
    Given I am on the new trip page
    When I name the trip, leave the destination empty and continue
    Then I am asked to search for a destination

  Scenario: A destination in the URL is looked up and selected
    Given I open the new trip page from a link that names a destination
    Then the destination is looked up
    And it is shown as selected

  Scenario: The calendar picks the exact days that were clicked
    Given I am on the new trip page
    When I open the calendar and click a first and a last day
    Then the dates button shows exactly those two days

  Scenario: The wizard walks through every step and submits
    Given I filled in the trip details
    When I go through the remaining steps and press Generate Itinerary
    Then I see that my itinerary is being created

  Scenario: Generation finishes and opens the itinerary
    Given my itinerary is being created
    When the model has answered
    Then my itinerary opens

  Scenario: The itinerary shows the picked dates, a tab per day, map markers and cards
    Given my itinerary is open
    Then it shows the dates I picked
    And it has one tab for each day
    And it shows markers on the map
    And it shows a card for each activity

  Scenario: The budget and carbon figures are labelled as estimates
    Given my itinerary is open
    Then the budget and carbon figures say that they are estimates

  Scenario: Day 1 is the picked start date and was not shifted
    Given my itinerary is open
    Then the first tab shows the first day I picked

  Scenario: A map marker opens a popup
    Given my itinerary is open
    When I click a marker on the map
    Then a popup with the place opens

  Scenario: Popup text from the model is shown as text, not as HTML
    Given the model described a place with markup in its text
    When I open the popup of that place
    Then I read the markup as plain text

  Scenario: A model failure shows the recovery screen and saves nothing
    Given the model fails while my itinerary is being created
    Then I see that the itinerary could not be generated
    And I can try again or go back to the form
    And my trip list does not contain the trip
