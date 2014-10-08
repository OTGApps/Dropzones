class AppDelegate < PM::Delegate
  tint_color "#062D5A".to_color

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
    blue = "#062D5A".to_color

    UINavigationBar.appearance.setBarTintColor(blue)
    # shadow = NSShadow.alloc.init
    # shadow.shadowColor = UIColor.colorWithRed(0.0, green:0.0, blue:0.0, alpha:0.8)
    # shadow.shadowOffset = CGSizeMake(0, 1)
    # [[UINavigationBar appearance] setTitleTextAttributes: [NSDictionary dictionaryWithObjectsAndKeys: [UIColor colorWithRed:245.0/255.0 green:245.0/255.0 blue:245.0/255.0 alpha:1.0], NSForegroundColorAttributeName, shadow, NSShadowAttributeName, [UIFont fontWithName:@"Helvetica Neue" size:21.0], NSFontAttributeName, nil]];
    UINavigationBar.appearance.setTintColor(blue)

    UIApplication.sharedApplication.setStatusBarStyle(UIStatusBarStyleLightContent)
    UIApplication.sharedApplication.setStatusBarHidden(false, withAnimation:UIStatusBarAnimationSlide)
    UINavigationBar.appearance.setTitleTextAttributes({NSForegroundColorAttributeName => UIColor.whiteColor})
  end

  #Flurry exception handler
  def uncaughtExceptionHandler(exception)
    Flurry.logError("Uncaught", message:"Crash!", exception:exception)
  end

end
