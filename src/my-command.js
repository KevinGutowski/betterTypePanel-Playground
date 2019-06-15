import sketch from 'sketch'
// Documentation:
// https://developer.sketchapp.com/reference/api/
// https://developer.apple.com/fonts/TrueType-Reference-Manual/RM09/AppendixF.html

COScript.currentCOScript().setShouldKeepAround_(true)

let threadIdentifier = "com.betterTypePanel"
let panelID = "com.betterTypePanel.panel"
let verticalPositionPopupButtonID = "com.betterTypePanel.popupButton.verticalPosition"
let radioButtonProportionalID = "com.betterTypePanel.radioButton.proportional"
let radioButtonMonospacedOrTabularID = "com.betterTypePanel.radioButton.monospaced"
let pushOnOffButtonLowerCaseID = "com.betterTypePanel.button.lowerCase"
let pushOnOffButtonUpperCaseID = "com.betterTypePanel.button.upperCase"
let radioButtonLiningFiguresID = "com.betterTypePanel.radioButton.liningFigures"
let radioButtonOldStyleFiguresID = "com.betterTypePanel.radioButton.oldStyle"
let sfSymbolSizePopupButtonID = "com.betterTypePanel.popupButton.sfSymbolSize"
let sfSymbolSizeRow = "com.betterTypePanel.row.sfSymbolSize"
let main

export default function() {
    runPanel()

    setupFramework()
    framework("CoreText");
    // const document = sketch.getSelectedDocument();
    // const textLayer = document.selectedLayers.layers[0]
    // const font = textLayer.sketchObject.font()
    // const coreTextFont = CTFontCreateWithName(font.fontName(), font.pointSize(), nil);
    // const features = CTFontCopyFeatures(coreTextFont)
    // const settings = CTFontCopyFeatureSettings(coreTextFont)

    main = HSMain.alloc().init()
    // var featuresArray = main.bridgeArray(features)
    // var settingsArray = main.bridgeArray(settings)
    main.beginObservingTextViewSelectionChanges()
    main.setCallbackForTextViewSelectionChange(() => {
        updateUI()
    })

    //determineProps(featuresArray);

    updateUI()
}

export function shutdown() {
    main.stopObservingTextViewSelectionChanges()
}

export function selectionChanged(context) {
    framework("CoreText");
    let threadDictionary = NSThread.mainThread().threadDictionary()
    // check if the panel is open, if open update UI, else just do nothing
    if (threadDictionary[threadIdentifier]) {
        updateUI()
    } else {
        return
    }
}

export function textChanged() {
    framework("CoreText");
    let threadDictionary = NSThread.mainThread().threadDictionary()
    // check if the panel is open, if open update UI, else just do nothing
    if (threadDictionary[threadIdentifier]) {
        let useFullSelection = true
        updateUI(useFullSelection)
    } else {
        return
    }
}

function setupFramework() {
    // var HelloSketch_FrameworkPath = HelloSketch_FrameworkPath || COScript.currentCOScript().env().scriptURL.path().stringByDeletingLastPathComponent();
    var scriptPath = COScript.currentCOScript().env().scriptURL.path()
    var HelloSketch_FrameworkPath = scriptPath
        .stringByDeletingLastPathComponent()
        .stringByDeletingLastPathComponent()
        .stringByDeletingLastPathComponent()
        .stringByDeletingLastPathComponent()
        + "/src";
    var HelloSketch_Log = HelloSketch_Log || log;
    (function() {
        var mocha = Mocha.sharedRuntime();
        var frameworkName = "HelloSketch";
        var directory = HelloSketch_FrameworkPath;
        if (mocha.valueForKey(frameworkName)) {
            // HelloSketch_Log("😎 loadFramework: `" + frameworkName + "` already loaded.");
            return true;
        } else if (mocha.loadFrameworkWithName_inDirectory(frameworkName, directory)) {
            // HelloSketch_Log("✅ loadFramework: `" + frameworkName + "` success!");
            mocha.setValue_forKey_(true, frameworkName);
            return true;
        } else {
            // HelloSketch_Log("❌ loadFramework: `" + frameworkName + "` failed!: " + directory + ". Please define HelloSketch_FrameworkPath if you're trying to @import in a custom plugin");
            return false;
        }
    })();
}

function determineProps(featuresArray) {

}

function runPanel() {
    // console.log("Setting Up Panel")
    let threadDictionary = NSThread.mainThread().threadDictionary()

    // If there is already a panel, prevent the plugin from running again
    if (threadDictionary[threadIdentifier]) {
        closePanel(threadDictionary[threadIdentifier], threadDictionary, threadIdentifier)
    } else {
        threadDictionary.panelOpen = true
        setupPanel(threadDictionary, threadIdentifier)
    }

}

function setupPanel(threadDictionary, identifier) {
    var panelWidth = 312
    var panelHeight = 210
    let panel = NSPanel.alloc().init()
    panel.setFrame_display(NSMakeRect(0, 0, panelWidth, panelHeight), true)
    panel.setStyleMask(NSTexturedBackgroundWindowMask | NSTitledWindowMask | NSClosableWindowMask)
    panel.title = "BetterTypePanel"

    panel.center()
    panel.makeKeyAndOrderFront(null)
    panel.setLevel(NSFloatingWindowLevel)

    panel.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true)
    panel.standardWindowButton(NSWindowZoomButton).setHidden(true)

    threadDictionary[panelID] = panel

    const column1width = 109
    const column2width = 171
    const columnSpacing = 4
    const rowSpacing = 8
    const mainViewWidth = column1width + column2width + columnSpacing

    // MARK: SETUP ROW 1
    var verticalPositionLabel = createTextField({
        text: "Number Position:",
        frame: NSMakeRect(0,0,column1width,17),
        alignment: NSTextAlignmentRight
    })

    verticalPositionLabel.addConstraint(NSLayoutConstraint.constraintWithItem_attribute_relatedBy_toItem_attribute_multiplier_constant(
        verticalPositionLabel,
        NSLayoutAttributeWidth,
        NSLayoutRelationEqual,
        nil,
        NSLayoutAttributeNotAnAttribute,
        1.0,
        column1width
    ))

    var verticalPositionPopupButton = NSPopUpButton.alloc().initWithFrame(NSMakeRect(0,0,150,25))
    verticalPositionPopupButton.addItemsWithTitles([
        'Default Position',
        'Superscript',
        'Subscript',
        'Ordinals',
        'Scientific Notation',
        'Multiple'
    ])

    threadDictionary[verticalPositionPopupButtonID] = verticalPositionPopupButton
    verticalPositionPopupButton.itemWithTitle('Multiple').setHidden(true)

    let verticalPositionTargetFunction = (sender) => {
        // console.log(sender.title() + ' dropdown button was selected')
        // Vertical Position
        // ID: kVerticalPositionType
        //
        // Selectors
        //
        // kNormalPositionSelector
        // This is the default. It means to display the text with no vertical displacement.
        //
        // kSuperiorsSelector
        // Changes any characters having superior forms in the font into those forms.
        //
        // kInferiorsSelector
        // Changes any characters having inferior forms in the font into those forms.
        //
        // kOrdinalsSelector
        // Contextually changes certain letters into their superior forms, like in Spanish changing from 1a to 1ª.
        //
        // kScientificInferiorsSelector
        // Changes any characters having them into inferior forms designed for a technical context (as in H2O).
        //
        if (sender.title() == 'Superscript') {
            let settingsAttribute = getSettingsAttributeForKey_Value(kVerticalPositionType, kSuperiorsSelector)
            updateFontFeatureSettingsAttribute(settingsAttribute)
        } else if (sender.title() == 'Subscript') {
            let settingsAttribute = getSettingsAttributeForKey_Value(kVerticalPositionType, kInferiorsSelector)
            updateFontFeatureSettingsAttribute(settingsAttribute)
        } else if (sender.title() == 'Ordinals') {
            let settingsAttribute = getSettingsAttributeForKey_Value(kVerticalPositionType, kOrdinalsSelector)
            updateFontFeatureSettingsAttribute(settingsAttribute)
        } else if (sender.title() == 'Scientific Notation') {
            let settingsAttribute = getSettingsAttributeForKey_Value(kVerticalPositionType, kScientificInferiorsSelector)
            updateFontFeatureSettingsAttribute(settingsAttribute)
        } else {
            let settingsAttribute = getSettingsAttributeForKey_Value(kVerticalPositionType, kNormalPositionSelector)
            updateFontFeatureSettingsAttribute(settingsAttribute)
        }
    }

    verticalPositionPopupButton.setCOSJSTargetFunction(sender => verticalPositionTargetFunction(sender))

    var row1 = NSStackView.alloc().initWithFrame(NSMakeRect(0,0,mainViewWidth,25))
    row1.setOrientation(NSUserInterfaceLayoutOrientationHorizontal)
    row1.setAlignment(NSLayoutAttributeFirstBaseline)
    row1.setSpacing(columnSpacing)
    row1.setViews_inGravity([verticalPositionLabel,verticalPositionPopupButton],NSStackViewGravityLeading)

    // MARK: Setup Row 2
    var numberSpacingLabel = createTextField({
        text: "Number Spacing:",
        frame: NSMakeRect(0,0,column1width,17),
        alignment: NSTextAlignmentRight
    })

    numberSpacingLabel.addConstraint(NSLayoutConstraint.constraintWithItem_attribute_relatedBy_toItem_attribute_multiplier_constant(
        numberSpacingLabel,
        NSLayoutAttributeWidth,
        NSLayoutRelationEqual,
        nil,
        NSLayoutAttributeNotAnAttribute,
        1.0,
        column1width
    ))

    let radioButtonProportional = NSButton.alloc().initWithFrame(NSMakeRect(0,0,97,18))
    radioButtonProportional.setButtonType(NSRadioButton)
    radioButtonProportional.setTitle('Proportional')
    radioButtonProportional.setState(NSOnState)

    threadDictionary[radioButtonProportionalID] = radioButtonProportional

    let radioButtonMonospacedOrTabular = NSButton.alloc().initWithFrame(NSMakeRect(0,0,150,18))
    radioButtonMonospacedOrTabular.setButtonType(NSRadioButton)
    radioButtonMonospacedOrTabular.setTitle('Monospaced/Tabular')
    radioButtonMonospacedOrTabular.setState(NSOffState)

    threadDictionary[radioButtonMonospacedOrTabularID] = radioButtonMonospacedOrTabular

    let numberSpacingTargetFunction = (sender) => {
        // console.log(sender.title() + ' radio button was clicked')

        if (sender.title() == 'Proportional') {
            let settingsAttribute = getSettingsAttributeForKey_Value(kNumberSpacingType, kProportionalNumbersSelector)
            updateFontFeatureSettingsAttribute(settingsAttribute)
        } else {
            let settingsAttribute = getSettingsAttributeForKey_Value(kNumberSpacingType, kMonospacedNumbersSelector)
            updateFontFeatureSettingsAttribute(settingsAttribute)
        }
    }

    radioButtonProportional.setCOSJSTargetFunction(sender => numberSpacingTargetFunction(sender))
    radioButtonMonospacedOrTabular.setCOSJSTargetFunction(sender => numberSpacingTargetFunction(sender))

    var numberSpacingRadioGroupStackView = NSStackView.stackViewWithViews([radioButtonProportional, radioButtonMonospacedOrTabular])
    numberSpacingRadioGroupStackView.setOrientation(NSUserInterfaceLayoutOrientationVertical)
    numberSpacingRadioGroupStackView.setAlignment(NSLayoutAttributeLeading)
    numberSpacingRadioGroupStackView.setSpacing(4)
    numberSpacingRadioGroupStackView.setTranslatesAutoresizingMaskIntoConstraints(false)

    var row2 = NSStackView.alloc().initWithFrame(NSMakeRect(0,0,mainViewWidth,36))
    row2.setOrientation(NSUserInterfaceLayoutOrientationHorizontal)
    row2.setAlignment(NSLayoutAttributeFirstBaseline)
    row2.setSpacing(columnSpacing)
    row2.setViews_inGravity([numberSpacingLabel, numberSpacingRadioGroupStackView], NSStackViewGravityLeading)

    // MARK: Setup Row 3
    var numberCaseLabel = createTextField({
        text: "Number Case:",
        frame: NSMakeRect(0,0,column1width,17),
        alignment: NSTextAlignmentRight
    })

    numberCaseLabel.addConstraint(NSLayoutConstraint.constraintWithItem_attribute_relatedBy_toItem_attribute_multiplier_constant(
        numberCaseLabel,
        NSLayoutAttributeWidth,
        NSLayoutRelationEqual,
        nil,
        NSLayoutAttributeNotAnAttribute,
        1.0,
        column1width
    ))

    var radioButtonLiningFigures = NSButton.alloc().initWithFrame(NSMakeRect(0,0,104,17))
    radioButtonLiningFigures.setButtonType(NSRadioButton)
    radioButtonLiningFigures.setTitle('Lining figures')
    radioButtonLiningFigures.setState(NSOnState)

    threadDictionary[radioButtonLiningFiguresID] = radioButtonLiningFigures

    var radioButtonOldStyleFigures = NSButton.alloc().initWithFrame(NSMakeRect(0,0,124,18))
    radioButtonOldStyleFigures.setButtonType(NSRadioButton)
    radioButtonOldStyleFigures.setTitle('Old-style figures')
    radioButtonOldStyleFigures.setState(NSOffState)

    threadDictionary[radioButtonOldStyleFiguresID] = radioButtonOldStyleFigures

    let numberCaseTargetFunction = (sender) => {
        // console.log(sender.title() + ' radio button was clicked')

        if (sender.title() == "Old-style figures") {
            let settingsAttribute = getSettingsAttributeForKey_Value(kNumberCaseType, kLowerCaseNumbersSelector)
            updateFontFeatureSettingsAttribute(settingsAttribute)
        } else {
            let settingsAttribute = getSettingsAttributeForKey_Value(kNumberCaseType, kUpperCaseNumbersSelector)
            updateFontFeatureSettingsAttribute(settingsAttribute)
        }
    }

    radioButtonLiningFigures.setCOSJSTargetFunction(sender => numberCaseTargetFunction(sender))
    radioButtonOldStyleFigures.setCOSJSTargetFunction(sender => numberCaseTargetFunction(sender))

    var numberCaseRadioGroupStackView = NSStackView.stackViewWithViews([radioButtonLiningFigures,radioButtonOldStyleFigures])
    numberCaseRadioGroupStackView.setOrientation(NSUserInterfaceLayoutOrientationVertical)
    numberCaseRadioGroupStackView.setAlignment(NSLayoutAttributeLeading)
    numberCaseRadioGroupStackView.setSpacing(4)
    numberCaseRadioGroupStackView.setTranslatesAutoresizingMaskIntoConstraints(false)

    var row3 = NSStackView.alloc().initWithFrame(NSMakeRect(0,0,mainViewWidth,36))
    row3.setOrientation(NSUserInterfaceLayoutOrientationHorizontal)
    row3.setAlignment(NSLayoutAttributeFirstBaseline)
    row3.setSpacing(columnSpacing)
    row3.setViews_inGravity([numberCaseLabel, numberCaseRadioGroupStackView], NSStackViewGravityLeading)

    // MARK: Setup Row 4
    var smallCapsLabel = createTextField({
        text: "Small Caps:",
        frame: NSMakeRect(0,0,column1width,17),
        alignment: NSTextAlignmentRight
    })

    smallCapsLabel.addConstraint(NSLayoutConstraint.constraintWithItem_attribute_relatedBy_toItem_attribute_multiplier_constant(
        smallCapsLabel,
        NSLayoutAttributeWidth,
        NSLayoutRelationEqual,
        nil,
        NSLayoutAttributeNotAnAttribute,
        1.0,
        column1width
    ))

    var smallCapsExampleLabel = createTextField({
        text: "Tt →",
        frame: NSMakeRect(0,0,32,17),
        alignment: NSTextAlignmentLeft,
    })

    var pushOnOffButtonLowerCase = NSButton.alloc().initWithFrame(NSMakeRect(0,0,72,32))
    pushOnOffButtonLowerCase.setButtonType(NSButtonTypeOnOff)
    pushOnOffButtonLowerCase.setBezelStyle(NSRoundedBezelStyle)

    let lowerCaseAttributedString = NSMutableAttributedString.new().initWithString("Tt")
    let lowerCaseRange = NSMakeRange(1,1)
    let lowerCaseFont = getFontForKey_Value(37,1)
    lowerCaseAttributedString.setAlignment_range(NSTextAlignmentCenter, NSMakeRange(0,2))
    lowerCaseAttributedString.addAttribute_value_range(NSFontAttributeName,lowerCaseFont,lowerCaseRange)
    pushOnOffButtonLowerCase.setAttributedTitle(lowerCaseAttributedString)
    pushOnOffButtonLowerCase.setState(NSOffState)

    pushOnOffButtonLowerCase.addConstraint(NSLayoutConstraint.constraintWithItem_attribute_relatedBy_toItem_attribute_multiplier_constant(
        pushOnOffButtonLowerCase,
        NSLayoutAttributeWidth,
        NSLayoutRelationEqual,
        nil,
        NSLayoutAttributeNotAnAttribute,
        1.0,
        60
    ))

    threadDictionary[pushOnOffButtonLowerCaseID] = pushOnOffButtonLowerCase

    let smallCapsLowerCaseTargetFunction = (sender) => {
        // console.log(sender.title() + ' toggle was clicked')
        // Small Caps Lower Case
        // ID: kLowerCaseType
        //
        // SELECTORS
        // kDefaultLowerCaseSelector = 0
        // Use standard lower-case glyphs
        //
        // kLowerCaseSmallCapsSelector = 1
        // Display lower-case glyphs as small caps. (This is the most common way of displaying small caps.)
        //
        // kLowerCasePetiteCapsSelector = 2
        // Display lower-case glyphs as petite caps
        //
        if (sender.state() == 0) {
            let settingsAttribute = getSettingsAttributeForKey_Value(kLowerCaseType, kDefaultLowerCaseSelector)
            updateFontFeatureSettingsAttribute(settingsAttribute)
        } else {
            let settingsAttribute = getSettingsAttributeForKey_Value(kLowerCaseType, kLowerCaseSmallCapsSelector)
            updateFontFeatureSettingsAttribute(settingsAttribute)
        }
    }
    pushOnOffButtonLowerCase.setCOSJSTargetFunction(sender => smallCapsLowerCaseTargetFunction(sender))

    var lowerCaseLabel = createTextField({
        text: "Lower Case",
        frame: NSMakeRect(0,0,65,14),
        alignment: NSTextAlignmentCenter,
        fontSize: 11
    })

    var lowerCaseStackView = NSStackView.stackViewWithViews([pushOnOffButtonLowerCase,lowerCaseLabel])
    lowerCaseStackView.setOrientation(NSUserInterfaceLayoutOrientationVertical)
    lowerCaseStackView.setAlignment(NSLayoutAttributeCenterX)
    lowerCaseStackView.setSpacing(4)
    lowerCaseStackView.setTranslatesAutoresizingMaskIntoConstraints(false)

    var pushOnOffButtonUpperCase = NSButton.alloc().initWithFrame(NSMakeRect(0,0,72,32))
    pushOnOffButtonUpperCase.setButtonType(NSButtonTypeOnOff)
    pushOnOffButtonUpperCase.setBezelStyle(NSRoundedBezelStyle)

    let upperCaseAttributedString = NSMutableAttributedString.new().initWithString("Tt")
    let upperCaseRange = NSMakeRange(0,1)
    let upperCaseFont = getFontForKey_Value(38,1)
    upperCaseAttributedString.setAlignment_range(NSTextAlignmentCenter, NSMakeRange(0,2))
    let centerAlignUpperCase = NSMutableParagraphStyle.new().init().setAlignment(NSTextAlignmentCenter)
    upperCaseAttributedString.addAttribute_value_range(NSFontAttributeName, upperCaseFont, upperCaseRange)
    pushOnOffButtonUpperCase.setAttributedTitle(upperCaseAttributedString)
    pushOnOffButtonUpperCase.setState(NSOffState)

    pushOnOffButtonUpperCase.addConstraint(NSLayoutConstraint.constraintWithItem_attribute_relatedBy_toItem_attribute_multiplier_constant(
        pushOnOffButtonUpperCase,
        NSLayoutAttributeWidth,
        NSLayoutRelationEqual,
        nil,
        NSLayoutAttributeNotAnAttribute,
        1.0,
        60
    ))

    threadDictionary[pushOnOffButtonUpperCaseID] = pushOnOffButtonUpperCase

    let smallCapsUpperCaseTargetFunction = (sender) => {
        // console.log(sender.title() + ' toggle was clicked')
        //Small Caps Upper Case
        // ID: kUpperCaseType
        //
        // SELECTORS
        //
        // kDefaultUpperCaseSelector = 0
        // Use standard upper-case glyphs
        //
        // kUpperCaseSmallCapsSelector = 1
        // Display upper-case glyphs as small caps (used commonly with acronyms).
        //
        // kUpperCasePetiteCapsSelector = 2
        // Display upper-case glyphs as petite caps
        //
        if (sender.state() == 0) {
            //Need to set to default setting
            let settingsAttribute = getSettingsAttributeForKey_Value(kUpperCaseType, kDefaultUpperCaseSelector)
            updateFontFeatureSettingsAttribute(settingsAttribute)
        } else {
            let settingsAttribute = getSettingsAttributeForKey_Value(kUpperCaseType, kUpperCaseSmallCapsSelector)
            updateFontFeatureSettingsAttribute(settingsAttribute)
        }
    }
    pushOnOffButtonUpperCase.setCOSJSTargetFunction(sender => smallCapsUpperCaseTargetFunction(sender))

    var upperCaseLabel = createTextField({
        text: "Upper Case",
        frame: NSMakeRect(0,0,66,14),
        alignment: NSTextAlignmentCenter,
        fontSize: 11
    })

    var upperCaseStackView = NSStackView.stackViewWithViews([pushOnOffButtonUpperCase,upperCaseLabel])
    upperCaseStackView.setOrientation(NSUserInterfaceLayoutOrientationVertical)
    upperCaseStackView.setSpacing(4)
    upperCaseStackView.setTranslatesAutoresizingMaskIntoConstraints(false)

    var smallCapsButtonGroupStackView = NSStackView.stackViewWithViews([smallCapsExampleLabel,lowerCaseStackView,upperCaseStackView])
    smallCapsButtonGroupStackView.setOrientation(NSUserInterfaceLayoutOrientationHorizontal)
    smallCapsButtonGroupStackView.setAlignment(NSLayoutAttributeFirstBaseline)
    smallCapsButtonGroupStackView.setSpacing(4)
    smallCapsButtonGroupStackView.setTranslatesAutoresizingMaskIntoConstraints(false)

    var row4 = NSStackView.alloc().initWithFrame(NSMakeRect(0,0,mainViewWidth,36))
    row4.setOrientation(NSUserInterfaceLayoutOrientationHorizontal)
    row4.setAlignment(NSLayoutAttributeFirstBaseline)
    row4.setSpacing(columnSpacing)
    row4.setViews_inGravity([smallCapsLabel, smallCapsButtonGroupStackView], NSStackViewGravityLeading)

    // MARK: SETUP ROW 5
    var sfSymbolSizeLabel = createTextField({
        text: "SF Symbol Size:",
        frame: NSMakeRect(0,0,column1width,17),
        alignment: NSTextAlignmentRight
    })

    sfSymbolSizeLabel.addConstraint(NSLayoutConstraint.constraintWithItem_attribute_relatedBy_toItem_attribute_multiplier_constant(
        sfSymbolSizeLabel,
        NSLayoutAttributeWidth,
        NSLayoutRelationEqual,
        nil,
        NSLayoutAttributeNotAnAttribute,
        1.0,
        column1width
    ))

    var sfSymbolSizePopupButton = NSPopUpButton.alloc().initWithFrame(NSMakeRect(0,0,150,25))
    sfSymbolSizePopupButton.addItemsWithTitles([
        'Small',
        'Medium',
        'Large',
        'Multiple'
    ])
    threadDictionary[sfSymbolSizePopupButtonID] = sfSymbolSizePopupButton
    sfSymbolSizePopupButton.itemWithTitle('Multiple').setHidden(true)

    let sfSymbolSizeTargetFunction = (sender) => {
        //console.log(sender.title() + ' dropdown button was selected')
        // sfSymbolSizeLabel
        // ID: kStylisticAlternativesType 35
        //
        // Selectors are very brittle. Need to figure out how to read StylisticAlts
        // from font so I'm not guessing what number the selectors are (they could change).
        // I should get their selectors progrmatically.
        //
        // kStylisticAltFifteenOnSelector
        // This is referring to Small Symbols or Glyphs for the SF Pro Text Font
        //
        // kStylisticAltSixteenOnSelector
        // This is referring to Large Symbols or Glyphs for the SF Pro Text Font
        //
        // Note:
        // There is no Medium Symbols checkbox for SF Pro Text
        if (sender.title() == 'Small') {
            let settingsAttributeSFSmall = getSettingsAttributeForKey_Value(kStylisticAlternativesType, kStylisticAltFifteenOnSelector)
            let settingsAttributeSFLarge = getSettingsAttributeForKey_Value(kStylisticAlternativesType, kStylisticAltSixteenOffSelector)
            let settingsAttributes = [settingsAttributeSFSmall,settingsAttributeSFLarge]
            settingsAttributes.forEach(settingsAttribute => {
                //console.log(settingsAttribute)
                updateFontFeatureSettingsAttribute(settingsAttribute)
            })
        } else if (sender.title() == 'Medium') {
            let settingsAttributeSFSmall = getSettingsAttributeForKey_Value(kStylisticAlternativesType, kStylisticAltFifteenOffSelector)
            let settingsAttributeSFLarge = getSettingsAttributeForKey_Value(kStylisticAlternativesType, kStylisticAltSixteenOffSelector)
            let settingsAttributes = [settingsAttributeSFSmall,settingsAttributeSFLarge]
            settingsAttributes.forEach(settingsAttribute => {
                //console.log(settingsAttribute)
                updateFontFeatureSettingsAttribute(settingsAttribute)
            })
        } else if (sender.title() == 'Large') {
            let settingsAttributeSFSmall = getSettingsAttributeForKey_Value(kStylisticAlternativesType, kStylisticAltFifteenOffSelector)
            let settingsAttributeSFLarge = getSettingsAttributeForKey_Value(kStylisticAlternativesType, kStylisticAltSixteenOnSelector)
            let settingsAttributes = [settingsAttributeSFSmall,settingsAttributeSFLarge]
            settingsAttributes.forEach(settingsAttribute => {
                //console.log(settingsAttribute)
                updateFontFeatureSettingsAttribute(settingsAttribute)
            })
        } else {
            logWarning("Out of sfSymbolSizeDropdown bounds")
        }
    }

    sfSymbolSizePopupButton.setCOSJSTargetFunction(sender => sfSymbolSizeTargetFunction(sender))

    var row5 = NSStackView.alloc().initWithFrame(NSMakeRect(0,0,mainViewWidth,25))
    row5.setOrientation(NSUserInterfaceLayoutOrientationHorizontal)
    row5.setAlignment(NSLayoutAttributeFirstBaseline)
    row5.setSpacing(columnSpacing)
    row5.setViews_inGravity([sfSymbolSizeLabel,sfSymbolSizePopupButton],NSStackViewGravityLeading)

    threadDictionary[sfSymbolSizeRow] = row5
    row5.setHidden(true)

    // MARK: Combine rows together
    var mainContentView = NSStackView.stackViewWithViews([row1,row2,row3, row4, row5])
    mainContentView.setOrientation(NSUserInterfaceLayoutOrientationVertical)
    mainContentView.setAlignment(NSLayoutAttributeLeading)
    mainContentView.setSpacing(8)
    mainContentView.setTranslatesAutoresizingMaskIntoConstraints(false)

    panel.contentView().addSubview(mainContentView)
    panel.contentView().setFlipped(true)
    fitSubviewToView(mainContentView,panel.contentView(),[16.0,16.0,8.0,16.0])
    //addVibrancyView(panel.contentView())

    threadDictionary[identifier] = panel;

    var closeButton = panel.standardWindowButton(NSWindowCloseButton)
    closeButton.setCOSJSTargetFunction(function(sender) {
        closePanel(panel, threadDictionary, identifier)
    })
}

function addVibrancyView(superview) {
    var vibrancy = NSVisualEffectView.alloc().initWithFrame(NSMakeRect(0, 0, panelWidth, panelHeight))
    // TODO: Control Light/Dark Appearance
    vibrancy.setAppearance(NSAppearance.appearanceNamed(NSAppearanceNameVibrantLight))
    vibrancy.setBlendingMode(NSVisualEffectBlendingModeBehindWindow)
    superview.addSubview(vibrancy)
    fitSubviewToView(vibrancy,superview, [0.0,0.0,0.0,0.0])
}

function fitSubviewToView(subview, view, constants) {
    subview.setTranslatesAutoresizingMaskIntoConstraints(false)

    addEdgeConstraint(NSLayoutAttributeTop, subview, view, constants[0])
    addEdgeConstraint(NSLayoutAttributeTrailing, subview, view, constants[1])
    addEdgeConstraint(NSLayoutAttributeBottom, subview, view, constants[2])
    addEdgeConstraint(NSLayoutAttributeLeading, subview, view, constants[3])
}

function addEdgeConstraint(layoutAttribute, subview, view, constant) {
    view.addConstraint(
        NSLayoutConstraint.constraintWithItem_attribute_relatedBy_toItem_attribute_multiplier_constant(
                subview,
                layoutAttribute,
                NSLayoutRelationEqual,
                view,
                layoutAttribute,
                1.0,
                constant
            )
        )
}

function createTextField({text, frame, alignment, fontSize = 13}) {
    const label = NSTextField.alloc().initWithFrame(frame)
    label.setStringValue(text)
    label.setAlignment(alignment)
    label.setFont(NSFont.systemFontOfSize(fontSize))
    label.setBezeled(false)
    label.setDrawsBackground(false)
    label.setEditable(false)
    label.setSelectable(false)
    return label
}

function updateFontFeatureSettingsAttribute(settingsAttribute) {
    var document = sketch.getSelectedDocument();
    var selectedLayers = document.selectedLayers.layers
    var textLayers = selectedLayers.filter(layer => layer.type == "Text")

    textLayers.forEach(textLayer => {
        let font = textLayer.sketchObject.font()
        let fontSize = font.pointSize()
        let fontFeatureSettings = font
            .fontDescriptor()
            .fontAttributes()[NSFontFeatureSettingsAttribute]
        let descriptor = font.fontDescriptor().fontDescriptorByAddingAttributes(settingsAttribute)
        let newFont = NSFont.fontWithDescriptor_size(descriptor,fontSize)
        textLayer.sketchObject.setFont(newFont)

        if (textLayer.sketchObject.isEditingText() == 1) {
            let textView = textLayer.sketchObject.editingDelegate().textView()
            let textStorage = textView.textStorage()
            let fonts = getFontsFromTextLayer(textLayer)
            fonts.forEach(fontForRange => {
                let font = fontForRange.font
                let range = fontForRange.range
                let fontSize = font.pointSize()

                let descriptor = font
                    .fontDescriptor()
                    .fontDescriptorByAddingAttributes(settingsAttribute)

                let newFont = NSFont.fontWithDescriptor_size(descriptor,fontSize)
                let attrsDict = NSDictionary.dictionaryWithObject_forKey(newFont,NSFontAttributeName)
                textStorage.addAttributes_range(attrsDict,range)
            })
            textView.didChangeText()
        }
    })
    document.sketchObject.inspectorController().reload()
    // updateUI()
}

function getFontForKey_Value(key, value) {
    let defaultButtonFont = NSFont.boldSystemFontOfSize(13)
    let settingsAttribute = getSettingsAttributeForKey_Value(key, value)
    var fontFeatureSettings = defaultButtonFont.fontDescriptor().fontAttributes()[NSFontFeatureSettingsAttribute]
    const descriptor = defaultButtonFont.fontDescriptor().fontDescriptorByAddingAttributes(settingsAttribute)
    const newFont = NSFont.fontWithDescriptor_size(descriptor,13)
    return newFont
}

function getSettingsAttributeForKey_Value(key, value) {
    let settingsAttribute = {
        [NSFontFeatureSettingsAttribute]: [{
            [NSFontFeatureTypeIdentifierKey]: key,
            [NSFontFeatureSelectorIdentifierKey]: value
        }]
    }

    return settingsAttribute
}

function updateUI(useFullSelection = false) {
    var document = sketch.getSelectedDocument()
    var selectedLayers = document.selectedLayers.layers
    let threadDictionary = NSThread.mainThread().threadDictionary()

    if (selectedLayers == null) {
        disableUI(threadDictionary)
        return
    }

    var textLayers = selectedLayers.filter(layer => layer.type == "Text")
    if (textLayers.length == 0) {
        disableUI(threadDictionary)
        return
    }

    var textLayersFeatureSettings = []
    textLayers.forEach(textLayer => {
        if (textLayer.sketchObject.isEditingText() == 1) {
            let fonts = getFontsFromTextLayer(textLayer, useFullSelection)

            fonts.forEach(fontForRange => {
                let font = fontForRange.font
                checkToShowSFSymbolOption(font)
                let fontFeatureSettings = font.fontDescriptor().fontAttributes()[NSFontFeatureSettingsAttribute]
                textLayersFeatureSettings.push(fontFeatureSettings)
            })
        } else {
            let fonts = getFontsFromTextLayer(textLayer)

            fonts.forEach(fontForRange => {
                let font = fontForRange.font
                checkToShowSFSymbolOption(font)
                 let fontFeatureSettings = font.fontDescriptor().fontAttributes()[NSFontFeatureSettingsAttribute]
                textLayersFeatureSettings.push(fontFeatureSettings)
            })
        }
    })

    // Update uiSettings array
    // need to do this because fontFeatureSettings only has
    // settings for applied options (doesn't contain state for all options)
    var updatedUISettings

    // Check to see if the textLayersFeatureSettings is full of null entries
    var isFeatureSettingsArrayAllNull = true
    for (let i = 0; i < textLayersFeatureSettings.length; i++) {
        if (textLayersFeatureSettings[i] != null) {
            isFeatureSettingsArrayAllNull = false
            break
        }
    }
    if (isFeatureSettingsArrayAllNull) {
        // Bc the array is all null then just set the default UI settings
        updatedUISettings = {
            'verticalPosition': ['default'], // 'default', 'superscript', 'subscript', 'ordinals', 'scientific inferiors'
            'numberSpacing': ['proportional'], // 'proportional', 'monospaced'
            'numberCase': ['lining'], // 'lining', 'oldStyle'
            'smallCapsLowerCase': [false], // bool
            'smallCapsUpperCase': [false], // bool
            'sfSymbolSize': ['medium'] // 'small', 'medium', 'large'
        }
    } else {
        // Get an updated list of settings from textLayerFeatureSettings array
        updatedUISettings = modifyUISettings(textLayersFeatureSettings, getDefaultUISettings)
    }

    //Update UI Panel with only one update (to prevent flickering)
    for (var uiSetting in updatedUISettings) {
        if (uiSetting == 'verticalPosition') {

            let verticalPositionPopupButton = threadDictionary[verticalPositionPopupButtonID]
            verticalPositionPopupButton.setEnabled(true)

            //Clear mixed state items before setting them
            clearVerticalPositionPopupButtonState()

            if (updatedUISettings[uiSetting].length > 1) {
                verticalPositionPopupButton.selectItemWithTitle('Multiple')

                updatedUISettings[uiSetting].forEach(verticalPositionSetting => {
                    if (verticalPositionSetting == 'default') {
                        verticalPositionPopupButton.itemWithTitle('Default Position').setState(NSControlStateValueMixed)
                    } else if (verticalPositionSetting == 'superscript') {
                        verticalPositionPopupButton.itemWithTitle('Superscript').setState(NSControlStateValueMixed)
                    } else if (verticalPositionSetting == 'subscript') {
                        verticalPositionPopupButton.itemWithTitle('Subscript').setState(NSControlStateValueMixed)
                    } else if (verticalPositionSetting == 'ordinals') {
                        verticalPositionPopupButton.itemWithTitle('Ordinals').setState(NSControlStateValueMixed)
                    } else if (verticalPositionSetting == 'scientific inferiors') {
                        verticalPositionPopupButton.itemWithTitle('Scientific Notation').setState(NSControlStateValueMixed)
                    }
                })
            } else {
                if (updatedUISettings[uiSetting][0] == 'default') {
                    // console.log('Setting UI: Vertical Position = Default Position')
                    verticalPositionPopupButton.selectItemWithTitle('Default Position')
                    verticalPositionPopupButton.itemWithTitle('Default Position').setState(NSControlStateValueOn)
                } else if (updatedUISettings[uiSetting][0] == 'superscript') {
                    // console.log('Setting UI: Vertical Position = Superscript')
                    verticalPositionPopupButton.selectItemWithTitle('Superscript')
                    verticalPositionPopupButton.itemWithTitle('Superscript').setState(NSControlStateValueOn)
                } else if (updatedUISettings[uiSetting][0] == 'subscript') {
                    // console.log('Setting UI: Vertical Position = Subscript')
                    verticalPositionPopupButton.selectItemWithTitle('Subscript')
                    verticalPositionPopupButton.itemWithTitle('Subscript').setState(NSControlStateValueOn)
                } else if (updatedUISettings[uiSetting][0] == 'ordinals') {
                    // console.log('Setting UI: Vertical Position = Ordinals')
                    verticalPositionPopupButton.selectItemWithTitle('Ordinals')
                    verticalPositionPopupButton.itemWithTitle('Ordinals').setState(NSControlStateValueOn)
                } else if (updatedUISettings[uiSetting][0] == 'scientific inferiors') {
                    // console.log('Setting UI: Vertical Position = Scientific Notation')
                    verticalPositionPopupButton.selectItemWithTitle('Scientific Notation')
                    verticalPositionPopupButton.itemWithTitle('Scientific Notation').setState(NSControlStateValueOn)
                } else {
                    logWarning('BetterTypeTool: ERROR Attempting update panel state - Out of scope of verticalPosition options')
                }
            }

        } else if (uiSetting == 'numberSpacing') {
            let radioButtonProportional = threadDictionary[radioButtonProportionalID]
            let radioButtonMonospacedOrTabular = threadDictionary[radioButtonMonospacedOrTabularID]
            radioButtonProportional.setEnabled(true)
            radioButtonMonospacedOrTabular.setEnabled(true)

            if (updatedUISettings[uiSetting].length > 1) {
                radioButtonProportional.setState(NSOffState)
                radioButtonMonospacedOrTabular.setState(NSOffState)
            } else {
                if (updatedUISettings[uiSetting][0] == 'proportional') {
                    // console.log('Setting UI: Number Spacing = Proportional')
                    radioButtonProportional.setState(NSOnState)
                    radioButtonMonospacedOrTabular.setState(NSOffState)
                } else if (updatedUISettings[uiSetting][0] == 'monospaced') {
                    // console.log('Setting UI: Number Spacing == Monospaced/Tabular')
                    radioButtonProportional.setState(NSOffState)
                    radioButtonMonospacedOrTabular.setState(NSOnState)
                } else {
                    // console.log('Error: Attempting update panel state - Out of scope of numberSpacing options')
                }
            }

        } else if (uiSetting == 'numberCase') {
            let radioButtonLiningFigures = threadDictionary[radioButtonLiningFiguresID]
            let radioButtonOldStyleFigures = threadDictionary[radioButtonOldStyleFiguresID]
            radioButtonLiningFigures.setEnabled(true)
            radioButtonOldStyleFigures.setEnabled(true)

            if (updatedUISettings[uiSetting].length > 1) {
                radioButtonLiningFigures.setState(NSOffState)
                radioButtonOldStyleFigures.setState(NSOffState)
            } else {
                if (updatedUISettings[uiSetting][0] == 'lining') {
                    // console.log('Setting UI: Number Case = Lining figures')
                    radioButtonLiningFigures.setState(NSOnState)
                    radioButtonOldStyleFigures.setState(NSOffState)
                } else if (updatedUISettings[uiSetting][0] == 'oldStyle') {
                    // console.log('Setting UI: Number Case = Old-style figures')
                    radioButtonLiningFigures.setState(NSOffState)
                    radioButtonOldStyleFigures.setState(NSOnState)
                } else {
                    // console.log('Error: Attempting to update panel state - Out of scope of numberCase options')
                }
            }

        } else if (uiSetting == 'smallCapsUpperCase') {
            let pushOnOffButtonUpperCase = threadDictionary[pushOnOffButtonUpperCaseID]
            pushOnOffButtonUpperCase.setEnabled(true)

            if (updatedUISettings[uiSetting].length > 1) {
                pushOnOffButtonUpperCase.setState(NSOffState)
            } else {
                if (updatedUISettings[uiSetting][0] == false) {
                    // console.log('Setting UI: Small Caps Upper Case = Off')
                    pushOnOffButtonUpperCase.setState(NSOffState)
                } else if (updatedUISettings[uiSetting][0] == true) {
                    // console.log('Setting UI: Small Caps Upper Case = On')
                    pushOnOffButtonUpperCase.setState(NSOnState)
                }
            }

        } else if (uiSetting == 'smallCapsLowerCase') {
            let pushOnOffButtonLowerCase = threadDictionary[pushOnOffButtonLowerCaseID]
            pushOnOffButtonLowerCase.setEnabled(true)

            if (updatedUISettings[uiSetting].length > 1) {
                pushOnOffButtonLowerCase.setState(NSOffState)
            } else {
                if (updatedUISettings[uiSetting][0] == false) {
                    // console.log('Setting UI: Small Caps Lower Case = Off')
                    pushOnOffButtonLowerCase.setState(NSOffState)
                } else if (updatedUISettings[uiSetting][0] == true) {
                    // console.log('Setting UI: Small Caps Lower Case = On')
                    pushOnOffButtonLowerCase.setState(NSOnState)
                }
            }

        } else if (uiSetting == 'sfSymbolSize') {
            let sfSymbolSizePopupButton = threadDictionary[sfSymbolSizePopupButtonID]
            sfSymbolSizePopupButton.setEnabled(true)

            clearSFSymbolSizePopupButton()

            if (updatedUISettings[uiSetting].length > 1) {
                sfSymbolSizePopupButton.selectItemWithTitle('Multiple')

                updatedUISettings[uiSetting].forEach(sfSymbolSizeSetting => {
                    if (sfSymbolSizeSetting == 'small') {
                        sfSymbolSizePopupButton.itemWithTitle('Small').setState(NSControlStateValueMixed)
                    } else if (sfSymbolSizeSetting == 'medium') {
                        sfSymbolSizePopupButton.itemWithTitle('Medium').setState(NSControlStateValueMixed)
                    } else if (sfSymbolSizeSetting == 'large') {
                        verticalPositionPopupButton.itemWithTitle('Large').setState(NSControlStateValueMixed)
                    }
                })
            } else {
                if (updatedUISettings[uiSetting][0] == 'small') {
                    sfSymbolSizePopupButton.selectItemWithTitle('Small')
                    sfSymbolSizePopupButton.itemWithTitle('Small').setState(NSControlStateValueOn)
                } else if (updatedUISettings[uiSetting][0] == 'medium') {
                    sfSymbolSizePopupButton.selectItemWithTitle('Medium')
                    sfSymbolSizePopupButton.itemWithTitle('Medium').setState(NSControlStateValueOn)
                } else if (updatedUISettings[uiSetting][0] == 'large'){
                    sfSymbolSizePopupButton.selectItemWithTitle('Large')
                    sfSymbolSizePopupButton.itemWithTitle('Large').setState(NSControlStateValueOn)
                } else {
                    logWarning('BetterTypeTool: ERROR Attempting update panel state - Out of scope of sfSymbolSize options')
                }
            }
        } else {
            logWarning('Error: Unhandled uiSetting Property')
            logWarning(updatedUISettings[uiSetting])
        }
    }

    let fontCollection = []
    textLayers.forEach(textLayer => {
        let useFullSelection = true
        if (textLayer.sketchObject.isEditingText() == 1) {
            let fonts = getFontsFromTextLayer(textLayer)

            fonts.forEach(font => {
                fontCollection.push(font.font)
            })
        } else {
            let fonts = getFontsFromTextLayer(textLayer, useFullSelection)
            fonts.forEach(font => {
                fontCollection.push(font.font)
            })
        }
    })

    // Disable UI options depending on fonts found
    console.log("fontCollection", fontCollection)
    checkFontsForProps(fontCollection)
}

function modifyUISettings(textLayersFeatureSettings, getDefaultUISettings) {

    let settingsCollection = {
        "verticalPosition": [],
        "numberSpacing": [],
        "numberCase": [],
        "smallCapsLowerCase": [],
        "smallCapsUpperCase": [],
        "sfSymbolSize": []
    }

    for (var i = 0; i < textLayersFeatureSettings.length; i++) {
        let currentLayerSettings = getDefaultUISettings()

        // Guard against text layers without any font features set
        if (textLayersFeatureSettings[i] != null) {
            textLayersFeatureSettings[i].forEach(function(featureSetting) {

                const featureTypeIdentifierKey = featureSetting[NSFontFeatureTypeIdentifierKey]
                const featureSelectorIdentifierKey = featureSetting[NSFontFeatureSelectorIdentifierKey]

                if (featureTypeIdentifierKey == 10) {
                    // kVerticalPosition
                    if (featureSelectorIdentifierKey == 0) {
                        // kNormalPositionSelector
                        currentLayerSettings.verticalPosition = 'default'
                    } else if (featureSelectorIdentifierKey == 1) {
                        // kSuperiorsSelector
                        currentLayerSettings.verticalPosition = 'superscript'
                    } else if (featureSelectorIdentifierKey == 2) {
                        // kInferiorsSelector
                        currentLayerSettings.verticalPosition = 'subscript'
                    } else if (featureSelectorIdentifierKey == 3) {
                        // kOrdinalsSelector
                        currentLayerSettings.verticalPosition = 'ordinals'
                    } else if (featureSelectorIdentifierKey == 4) {
                        // kScientificInferiorsSelector
                        currentLayerSettings.verticalPosition = 'scientific inferiors'
                    } else {
                        logWarning("BetterTypeTool: Unknown Feature for Vertical Position")
                    }
                }

                if (featureTypeIdentifierKey == 6) {
                    //kNumberSpacing
                    if (featureSelectorIdentifierKey == 0) {
                        // kMonospacedNumbersSelector
                        currentLayerSettings.numberSpacing = 'monospaced'
                    } else if (featureSelectorIdentifierKey == 1) {
                        // kProportionalNumbersSelector
                        currentLayerSettings.numberSpacing = 'proportional'
                    } else if (featureSelectorIdentifierKey == 2) {
                        // kThirdWidthNumbersSelector
                         logWarning("BetterTypeTool: Unsupported Number Spacing Feature - Third-width Numerals (Thin numerals)")
                    } else if (featureSelectorIdentifierKey == 3) {
                        // kQuarterWidthNumbersSelector
                        logWarning("BetterTypeTool: Unsupported Number Spacing Feature - Quarter-width Numerals (Very Yhin Numerals")
                    } else {
                        logWarning("BetterTypeTool: Unknown feature for Number Spacing")
                    }
                }

                if (featureTypeIdentifierKey == 21) {
                    // kNumberCaseType
                    if (featureSelectorIdentifierKey == 0) {
                        // kLowerCaseNumbersSelector
                        currentLayerSettings.numberCase = 'oldStyle'
                    } else if (featureSelectorIdentifierKey == 1) {
                        // kUpperCaseNumbersSelector
                        currentLayerSettings.numberCase = 'lining'
                    } else {
                        logWarning("BetterTypeTool: Unknown feature for Number Case")
                    }
                }

                if (featureTypeIdentifierKey == 37) {
                    // kLowerCase
                    if (featureSelectorIdentifierKey == 0) {
                        // kDefaultLowerCaseSelector (aka OFF)
                        currentLayerSettings.smallCapsLowerCase = false
                    } else if (featureSelectorIdentifierKey == 1) {
                        // kLowerCaseSmallCapsSelector
                        currentLayerSettings.smallCapsLowerCase = true
                    } else if (featureSelectorIdentifierKey == 2) {
                        // kLowerCasePetiteCapsSelector
                        logWarning("Unsupported Lower Case Small Caps Feature - Lower Case Petite Caps")
                    }
                }

                if (featureTypeIdentifierKey == 38) {
                    // kUpperCase
                    if (featureSelectorIdentifierKey == 0) {
                        // kDefaultUpperCaseSelector (aka OFF)
                        currentLayerSettings.smallCapsUpperCase = false
                    } else if (featureSelectorIdentifierKey == 1) {
                        // kUpperCaseSmallCapsSelector
                        currentLayerSettings.smallCapsUpperCase = true
                    } else if (featureSelectorIdentifierKey == 2) {
                        // kUpperCasePetiteCapsSelector
                        logWarning("Unsupported Upper Case Small Caps Feature - Upper Case Petite Caps")
                    }
                }

                if (featureTypeIdentifierKey == 35) {
                    // kStylisticAlternatives
                    if (featureSelectorIdentifierKey == 30) {
                        // kStylisticAltFifteenOnSelector
                        currentLayerSettings.sfSymbolSize = 'small'
                    } else if (featureSelectorIdentifierKey == 31) {
                        // kStylisticAltFifteenOffSelector
                        logWarning("WARNING: Unhandled Attempt to Set 15th Stylistic Alternative off")
                    } else if (featureSelectorIdentifierKey == 32) {
                        // kStylisticAltSixteenOnSelector
                        currentLayerSettings.sfSymbolSize = 'large'
                    } else if (featureSelectorIdentifierKey == 32) {
                        // kStylisticAltSixteenOffSelector
                        logWarning("WARNING: Unhandled Attempt to Set 16th Stylistic Alternative off")
                    }
                }
            })
        }

        // Push current layer properties onto settingsCollection
        for (var key in currentLayerSettings) {
            settingsCollection[key].push(currentLayerSettings[key])
        }

    }

    // Deduplicate settingsCollection to only have unique entries
    for (var property in settingsCollection) {
        settingsCollection[property] = settingsCollection[property].filter(onlyUnique)
    }

    function onlyUnique(value,index,self) {
        return self.indexOf(value) === index
    }

    return settingsCollection
}

function disableUI(threadDictionary, optionsToDisableArray = ['all']) {
    // optionsToDisable is an array that can include "all", "verticalPosition", "numberSpacing", "numberCase", "smallCapsUppercase", "smallCapsLowerCase", "sfSymbolSize"
    //TODO: Maybe reset the state to the deault params when UI is disabled

    if (optionsToDisableArray.includes('all') || optionsToDisableArray.includes('verticalPosition')) {
        let verticalPositionPopupButton = threadDictionary[verticalPositionPopupButtonID]
        verticalPositionPopupButton.setEnabled(false)
    }

    if (optionsToDisableArray.includes('all') || optionsToDisableArray.includes('numberSpacing')) {
        let radioButtonProportional = threadDictionary[radioButtonProportionalID]
        let radioButtonMonospacedOrTabular = threadDictionary[radioButtonMonospacedOrTabularID]
        radioButtonProportional.setEnabled(false)
        radioButtonMonospacedOrTabular.setEnabled(false)
    }

    if (optionsToDisableArray.includes('all') || optionsToDisableArray.includes('numberCase')) {
        let radioButtonLiningFigures = threadDictionary[radioButtonLiningFiguresID]
        let radioButtonOldStyleFigures = threadDictionary[radioButtonOldStyleFiguresID]
        radioButtonLiningFigures.setEnabled(false)
        radioButtonOldStyleFigures.setEnabled(false)
    }

    if (optionsToDisableArray.includes('all') || optionsToDisableArray.includes('smallCapsUpperCase')) {
        let pushOnOffButtonUpperCase = threadDictionary[pushOnOffButtonUpperCaseID]
        pushOnOffButtonUpperCase.setEnabled(false)
    }

    if (optionsToDisableArray.includes('all') || optionsToDisableArray.includes('smallCapsLowerCase')) {
        let pushOnOffButtonLowerCase = threadDictionary[pushOnOffButtonLowerCaseID]
        pushOnOffButtonLowerCase.setEnabled(false)
    }

    if (optionsToDisableArray.includes('all') || optionsToDisableArray.includes('sfSymbolSize')) {
        let sfSymbolSizePopupButton = threadDictionary[sfSymbolSizePopupButtonID]
        sfSymbolSizePopupButton.setEnabled(false)
    }
}

function closePanel(panel, threadDictionary, threadIdentifier) {
        panel.close()

        // Stop text selection listening
        main.stopObservingTextViewSelectionChanges()

        // Remove the reference to the panel
        threadDictionary.removeObjectForKey(threadIdentifier)
        threadDictionary.panelOpen = false

        // Stop this script
        COScript.currentCOScript().setShouldKeepAround_(false)
}

    //Start with Default Settings
function getDefaultUISettings() {
    return {
        'verticalPosition': 'default', // 'default', 'superscript', 'subscript', 'ordinals', 'scientific inferiors'
        'numberSpacing': 'proportional', // 'proportional', 'monospaced'
        'numberCase': 'lining', // 'lining', 'oldStyle'
        'smallCapsLowerCase': false, // bool
        'smallCapsUpperCase': false, // bool
        'sfSymbolSize': 'medium'
        // If updating this list remember to update the default updatedUISettings
        // TODO: Refactor so that the Default UI settings is in one place.
    }
}

// TODO: Make more generic to support both popupbuttons
function clearVerticalPositionPopupButtonState() {
    let threadDictionary = NSThread.mainThread().threadDictionary()
    let verticalPositionPopupButton = threadDictionary[verticalPositionPopupButtonID]
    verticalPositionPopupButton.itemWithTitle('Default Position').setState(NSControlStateValueOff)
    verticalPositionPopupButton.itemWithTitle('Superscript').setState(NSControlStateValueOff)
    verticalPositionPopupButton.itemWithTitle('Subscript').setState(NSControlStateValueOff)
    verticalPositionPopupButton.itemWithTitle('Ordinals').setState(NSControlStateValueOff)
    verticalPositionPopupButton.itemWithTitle('Scientific Notation').setState(NSControlStateValueOff)
}

function clearSFSymbolSizePopupButton() {
    let threadDictionary = NSThread.mainThread().threadDictionary()
    let sfSymbolSizePopupButton = threadDictionary[sfSymbolSizePopupButtonID]
    sfSymbolSizePopupButton.itemWithTitle('Small').setState(NSControlStateValueOff)
    sfSymbolSizePopupButton.itemWithTitle('Medium').setState(NSControlStateValueOff)
    sfSymbolSizePopupButton.itemWithTitle('Large').setState(NSControlStateValueOff)
}

function logWarning(warning) {
    //console.log(warning)
}

function getFontsFromTextLayer(textLayer, useFullSelection = false) {
    let msTextLayer = textLayer.sketchObject
    let effectiveRange = MOPointer.alloc().init()

    // if editing text then need to use the textStorage rather than the attrString
    let mutableAttrString
    let selectedRange
    let textView

    // infer editing by checking if textView exists
    let textViewExists = true
    try {
        textView = msTextLayer.editingDelegate().textView()
    } catch {
        textViewExists = false
    }

    if (textViewExists) {
        let textStorage = textView.textStorage()
        selectedRange = textView.selectedRange()
        mutableAttrString = textStorage

        // need this because selected range is 0 when going from editing state to selected frame state
        if (useFullSelection) {
            selectedRange = NSMakeRange(0,textLayer.text.length)
        }
    } else {
        let attributedString = msTextLayer.attributedStringValue()
        selectedRange = NSMakeRange(0,textLayer.text.length)
        mutableAttrString = attributedString
    }

    let fonts = []

    if (selectedRange.length == 0) {
        let font = mutableAttrString.attribute_atIndex_longestEffectiveRange_inRange(
            NSFontAttributeName,
            selectedRange.location,
            effectiveRange,
            selectedRange
        )
        fonts.push({"font": font, "range": effectiveRange.value()})
    }

    while (selectedRange.length > 0) {
        let font = mutableAttrString.attribute_atIndex_longestEffectiveRange_inRange(
            NSFontAttributeName,
            selectedRange.location,
            effectiveRange,
            selectedRange
        )
        selectedRange = NSMakeRange(
            NSMaxRange(effectiveRange.value()),
            NSMaxRange(selectedRange) - NSMaxRange(effectiveRange.value())
        )

        fonts.push({"font": font, "range": effectiveRange.value()})
    }
    return fonts
}

function checkToShowSFSymbolOption(font) {
    let familyName = font.familyName()
    let showSFSymbolOption = false

    let supportedFontFamilies = [
        "SF Pro Text",
        "SF Pro Rounded",
        "SF Pro Display",
        "SF Compact Text",
        "SF Compact Rounded",
        "SF Compact Display"
    ]

    let threadDictionary = NSThread.mainThread().threadDictionary()
    let row5 = threadDictionary[sfSymbolSizeRow]
    let panel = threadDictionary[panelID]
    let panelX = panel.frame().origin.x
    let panelY = panel.frame().origin.y
    let panelWidth = panel.frame().size.height
    let panelHeight = panel.frame().size.height
    supportedFontFamilies.forEach(fontFamily => {
        if (familyName == fontFamily) {
            showSFSymbolOption = true
            // TODO Don't hard code these values
            if (panelHeight != 235) {
                panel.setFrame_display_animate(NSMakeRect(panelX, panelY - 25, 312, 210 + 25), true, true)
                row5.setHidden(false)
            }
            return;
        }
    })

    if (!showSFSymbolOption) {
        // hide UI
        if (panelHeight != 210) {
            row5.setHidden(true)
            panel.setFrame_display_animate(NSMakeRect(panelX, panelY + 25, 312, 210), true, true)
        }
    }
}

function checkFontsForProps(fonts) {
    let threadDictionary = NSThread.mainThread().threadDictionary()
    let optionsToDisableFromFonts = getOptionsToDisableFromFonts(fonts)

    // In order for an option to be disabled, every font in the selection must not have that feature
    // If at least one of the fonts has the supported font feature then we don't disable the corresponding UI component
    // This is under the assumption that applying font features to fonts that don't support them don't do anything
    // This wont be true when supporting stylistic sets :(
    //
    // look at the first set of font options and see if each of them exist in the other fonts
    let settingsToDisable = []

    if (optionsToDisableFromFonts.length == 1) {
        settingsToDisable = optionsToDisableFromFonts[0]
    } else {
        optionsToDisableFromFonts[0].forEach(fontOption => {
            let shouldDisableFontOption = true
            for (let i = 1; i < optionsToDisableFromFonts.length; i++) {
                if (!optionsToDisableFromFonts[i].includes(fontOption)) {
                    shouldDisableFontOption = false
                    return
                }
            }

            if (shouldDisableFontOption) {
                settingsToDisable.push(fontOption)
            }
        })
    }

    console.log("settingsToDisable", settingsToDisable)
    if (settingsToDisable.length > 0) {
        disableUI(threadDictionary, settingsToDisable)
    }
}

function getOptionsToDisableFromFonts(fonts) {
    framework('CoreText')
    let main = HSMain.alloc().init()
    let optionsToDisableForEachFont = []

    fonts.forEach(font => {
        const coreTextFont = CTFontCreateWithName(font.fontName(), font.pointSize(), null)
        const features = CTFontCopyFeatures(coreTextFont)

        let featuresArray = main.bridgeArray(features)
        console.log("featuresArray", featuresArray)

        let optionsToDisableForFont = getOptionsToDisableFromFeaturesArray(featuresArray)

        optionsToDisableForEachFont.push(optionsToDisableForFont)
    })

    console.log("optionsToDisableForEachFont", optionsToDisableForEachFont)

    return optionsToDisableForEachFont
}

function getOptionsToDisableFromFeaturesArray(featuresArray) {
    let optionsToDisableForFont = []

    if(!featuresArray) {
        optionsToDisableForFont.push('verticalPosition','numberSpacing','numberCase', 'smallCapsLowerCase', 'smallCapsUpperCase')
    } else {
        let featureIDs = []
        featuresArray.forEach(feature => {
            featureIDs.push(Number(feature["CTFeatureTypeIdentifier"]))
        })
        console.log("featureIDs", featureIDs)

        if (!featureIDs.includes(10)) {
            // Vertical Position
            optionsToDisableForFont.push('verticalPosition')
        }
        if (!featureIDs.includes(6)) {
            // Number Spacing
            optionsToDisableForFont.push('numberSpacing')
        }
        if (!featureIDs.includes(21)) {
            // Number Case
            optionsToDisableForFont.push('numberCase')
        }
        if (!featureIDs.includes(37)) {
            // Small Caps Lower Case
            optionsToDisableForFont.push('smallCapsLowerCase')
        }
        if (!featureIDs.includes(38)) {
            // Small Caps Upper Case
            optionsToDisableForFont.push('smallCapsUpperCase')
        }
    }

    console.log("optionsToDisableForFont", optionsToDisableForFont)
    return optionsToDisableForFont
}
