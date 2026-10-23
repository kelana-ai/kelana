Feature: Downloading a trip
  As a traveller
  I want a copy of my plan that I can keep offline
  So that I can read it without the app

  Scenario: The download button saves the itinerary as a text file
    Given my itinerary is open
    When I press the download button
    Then a text file is saved
    And it lists every day with the dates I picked
