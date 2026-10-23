Feature: Refining a trip
  As a traveller
  I want to ask for a change to my plan in my own words
  So that I do not have to start again

  Scenario: Refining returns to the itinerary with the same number of days
    Given my itinerary is open
    When I describe a change under Refine with AI and submit it
    Then I return to my itinerary
    And it has the same number of days
    And the changed day reflects my request
