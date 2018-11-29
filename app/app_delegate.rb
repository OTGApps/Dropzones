class AppDelegate < PM::Delegate
  tint_color "#062D5A".to_color

  def on_load(app, options)
    set_appearance

    # 3rd Party integrations
    BW.debug = true unless App.info_plist['AppStoreRelease'] == true

    App::Persistence[:flagged] ||= {}

    open_tab_bar MainScreen.new(nav_bar:true), MapScreen.new(nav_bar: true)
    # open_tab_bar AircraftScreen.new(nav_bar:true), MapScreen.new(nav_bar: true)
  end

  def on_activate
    # Appirater.appEnteredForeground(true)
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
  end

  # Flurry exception handler
  # def uncaughtExceptionHandler(exception)
  #   Flurry.logError("Uncaught", message:"Crash!", exception:exception)
  # end

end
