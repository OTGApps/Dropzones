class AppDelegate < PM::Delegate
  tint_color "#062D5A".to_color

  def on_load(app, options)
    set_appearance
    set_concierge
    # 3rd Party integrations
    BW.debug = true unless App.info_plist['AppStoreRelease'] == true

    App::Persistence[:flagged] ||= {}

    unless Device.simulator?
      # Crittercism
      crittercism_app_id = "54c05ae83cf56b9e0457d5f5"
      Crittercism.enableWithAppID(crittercism_app_id)

      # Flurry
      NSSetUncaughtExceptionHandler("uncaughtExceptionHandler")
      Flurry.startSession("Y33SK5D8R48YDGTDZZG3")

      # Appirater
      app_id = App.info_plist['APP_STORE_ID']
      Appirater.setAppId(app_id)
      Appirater.setDaysUntilPrompt(5)
      Appirater.setUsesUntilPrompt(10)
      Appirater.setSignificantEventsUntilPrompt(5)
      Appirater.setTimeBeforeReminding(2)
      Appirater.appLaunched true
    end

    open_tab_bar MainScreen.new(nav_bar:true), MapScreen.new(nav_bar: true)
  end

  def on_activate
    Appirater.appEnteredForeground(true)
    MotionConcierge.fetch
  end

  def set_appearance
    blue = "#062D5A".to_color
    white = UIColor.whiteColor

    UINavigationBar.appearance.tap do |ap|
      ap.setBarTintColor(blue)
      ap.setTintColor(white)
      ap.setTitleTextAttributes({
        NSForegroundColorAttributeName => white
      })
    end

    UIApplication.sharedApplication.tap do |ap|
      ap.setStatusBarStyle(UIStatusBarStyleLightContent)
      ap.setStatusBarHidden(false, withAnimation:UIStatusBarAnimationSlide)
    end
  end

  def set_concierge
    MotionConcierge.remote_file_url = 'https://raw.githubusercontent.com/OTGApps/USPADropzones/master/dropzones.geojson'
    MotionConcierge.fetch_interval = 86400 # Once a day
    MotionConcierge.debug = BW.debug?
    MotionConcierge.debug_fetch_interval = 30 # Every 30 seconds
  end

  # Flurry exception handler
  def uncaughtExceptionHandler(exception)
    Flurry.logError("Uncaught", message:"Crash!", exception:exception)
  end

end
