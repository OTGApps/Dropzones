class MainScreen < PM::TableScreen
  title 'Find Dropzones'
  tab_bar_item title: 'Dropzones', item: 'airplane'

  def on_load
    set_nav_bar_button :back, title: '', style: :plain, action: :back
    set_nav_bar_button :right, {
      title: "Info",
      image: UIImage.imageNamed("info"),
      action: :open_info
    }
  end

  def will_appear
    update_table_data
  end

  def on_appear
    BW::Location.get_once(
      purpose: 'Determines how far away you are from dropzones.',
      authorization_type: :when_in_use
    ) do |location|
      GeoJSON.sharedData.location = location
    end

    # Notify them about flags
    flag_alert
  end

  def flag_alert
    if (App::Persistence[:flagged] || []).count > 0
      if App::Persistence['shown_flag_alert'].nil?
        app.alert(
          title: "We're Sorry",
          message: "Looks like you had some dropzones flagged. Due to a change in the USPA's website, all flags have been removed. You can re-flag the dropzones at any time.",
          actions: [ "Got it!" ]
        )
      end
    end
    App::Persistence['shown_flag_alert'] = true
  end

  def table_data
  [{
    title: nil,
    cells: [{
      title: 'Near Me',
      subtitle: 'Find the DZs closest to you right now!',
      action: :show_near_me,
      accessory_type: :disclosure_indicator,
      image: 'location-pin',
      height: cell_height
    }, {
      title: 'By State',
      subtitle: 'All the DZs nicely organized by state.',
      action: :show_by_state,
      accessory_type: :disclosure_indicator,
      image: 'usa',
      height: cell_height
    }, {
      title: 'Aircraft Type',
      subtitle: 'Looking to jump a specific aircraft?',
      action: :show_by_aircraft,
      accessory_type: :disclosure_indicator,
      image: 'airplane',
      height: cell_height
    }, {
      title: 'Services Offered',
      subtitle: 'Wait... some dropzones have a POOL?!',
      action: :show_by_services,
      accessory_type: :disclosure_indicator,
      image: 'bathtub',
      height: cell_height
    }, {
      title: 'Training Capabilities',
      subtitle: 'Too cool for AFF? Want to try static line?',
      action: :show_by_training,
      accessory_type: :disclosure_indicator,
      image: 'megaphone',
      height: cell_height
    }, {
      title: 'Flagged',
      subtitle: flagged_subtitle,
      action: :show_by_flagged,
      accessory_type: :disclosure_indicator,
      image: 'flag_black',
      height: cell_height
    }]
  }]
  end

  def flagged_subtitle
    favs = GeoJSON.sharedData.favorites
    case favs.count
    when 0
      'Your flagged DZs.'
    when 1
      "You have #{favs.count} flagged DZ."
    else
      "You have #{favs.count} flagged DZs."
    end
  end

  def cell_height
    80
  end

  def show_near_me
    open NearMeScreen
  end

  def show_by_state
    open StatesScreen
  end

  def show_by_aircraft
    open AircraftScreen
  end

  def show_by_training
    open TrainingScreen
  end

  def show_by_services
    open ServicesScreen
  end

  def show_by_region
    open RegionsScreen
  end

  def show_by_flagged
    open FlaggedScreen
  end

  def open_info
    open_modal InfoScreen.new(nav_bar: true)
  end
end
