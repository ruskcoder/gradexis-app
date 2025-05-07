//
//  AppUITests.swift
//  AppUITests
//
//  Created by Sankalp Prashanth on 5/6/25.
//

import XCTest

final class AppUITests: XCTestCase {

    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.

        // In UI tests it is usually best to stop immediately when a failure occurs.
        continueAfterFailure = false

        // In UI tests it’s important to set the initial state - such as interface orientation - required for your tests before they run. The setUp method is a good place to do this.
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    @MainActor
    func testExample() throws {
        // UI tests must launch the application that they test.
        let app = XCUIApplication()
          setupSnapshot(app)
          app.launch()
          sleep(10)
        let usernameField = app.textFields["Username"]
                XCTAssertTrue(usernameField.waitForExistence(timeout: 10))
                usernameField.tap()
                usernameField.typeText("testusr")  // Replace with your test username

                let passwordField = app.secureTextFields["Password"]
                XCTAssertTrue(passwordField.waitForExistence(timeout: 10))
                passwordField.tap()
                passwordField.typeText("p@$$w0rd")  // Replace with your test password

                let loginText = app.webViews.staticTexts["Login"]
                XCTAssertTrue(loginText.waitForExistence(timeout: 10))

                let coordinate = loginText.coordinate(withNormalizedOffset: CGVector(dx: 5, dy: 0.5))
                coordinate.tap()
                coordinate.tap()
                coordinate.tap()
                sleep(15)
                let overviewText = app.webViews.staticTexts["Overview"]  // Optional: use a marker if available
                XCTAssertTrue(overviewText.waitForExistence(timeout: 15))
                snapshot("1_Overview")

                let buttonLabels = [
                    "GoToAttendance",
                    "GoToSchedule",
                    "GoToTeachers",
                    "GoToProgressReport",
                    "GoToReportCard",
                    "GoToTranscript"
                ]

                for (index, label) in buttonLabels.enumerated() {
                    let button = app.buttons[label]
                    XCTAssertTrue(button.waitForExistence(timeout: 10))
                    button.tap()

                    sleep(15)
                    snapshot("2_Section_\(index)_\(label)")

                    let back = app.navigationBars.buttons.element(boundBy: 0)
                    if back.exists {
                        back.tap()
                    } else {
                        XCTFail("Back button not found")
                    }
                }

                let gradesTab = app.buttons["view-grades"]
                XCTAssertTrue(gradesTab.waitForExistence(timeout: 10))
                gradesTab.tap()

                snapshot("3_GradesTab")

                let coordinate3 = app.coordinate(withNormalizedOffset: CGVector(dx: 0, dy: 0))
                    .withOffset(CGVector(dx: 100, dy: 200))
                coordinate3.tap()

                sleep(2)
                snapshot("4_GradesDetails")

                let whatIfButton = app.buttons["GetWhatIf"]
                XCTAssertTrue(whatIfButton.waitForExistence(timeout: 10))
                whatIfButton.tap()

                snapshot("5_WhatIfPage")
        // Use XCTAssert and related functions to verify your tests produce the correct results.
    }

    @MainActor
    func testLaunchPerformance() throws {
        // This measures how long it takes to launch your application.
        measure(metrics: [XCTApplicationLaunchMetric()]) {
            XCUIApplication().launch()
        }
    }
}
