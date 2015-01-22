class MainScreen < PM::TableScreen
  title 'Find Dropzones'
  tab_bar_item title: 'Dropzones', item: 'airplane'
  status_bar :light

  def on_load
    set_nav_bar_button :back, title: '', style: :plain, action: :back
    set_nav_bar_button :right, {
      title: "Info",
      image: UIImage.imageNamed("info"),
      action: :open_info
    }
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
      title: 'By Region',
      subtitle: 'All the DZs listed by USPA region.',
      action: :show_by_region,
      accessory_type: :disclosure_indicator,
      image: 'signpost',
      height: cell_height
    }, {
      title: 'Aircraft Type',
      subtitle: 'Looking to jump a specific aircraft?',
      action: :show_by_aircraft,
      accessory_type: :disclosure_indicator,
      image: 'airplane',
      height: cell_height
    },{
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
    }]
  }]
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

  def open_info
    open_modal InfoScreen.new(nav_bar: true)
  end
end
