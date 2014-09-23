class AppDelegate < PM::Delegate
  tint_color "#7B4289".to_color

  def on_load(app, options)
    set_appearance

    # 3rd Party integrations
    BW.debug = true unless App.info_plist['AppStoreRelease'] == true

    unless Device.simulator?
      app_id = App.info_plist['APP_STORE_ID']

      # Flurry
      # NSSetUncaughtExceptionHandler("uncaughtExceptionHandler")
      # Flurry.startSession((App.info_plist['AppStoreRelease'] == true ? "IRHW8V9LE2M38WJLSM6T" : "3W88Z2Q6MR87NHGDSMVV"))

      # Appirater
      Appirater.setAppId app_id
      Appirater.setDaysUntilPrompt 5
      Appirater.setUsesUntilPrompt 10
      Appirater.setTimeBeforeReminding 5
      Appirater.appLaunched true
    end

    open_tab_bar DropzonesScreen.new(nav_bar:true),MapScreen.new(nav_bar: true)
  end

  def set_appearance
    # purple = "#7B4289".to_color

    # UISwitch.appearance.setOnTintColor(purple)
    # UIBarButtonItem.appearance.setTintColor(purple)
  end

  #Flurry exception handler
  def uncaughtExceptionHandler(exception)
    Flurry.logError("Uncaught", message:"Crash!", exception:exception)
  end

end
