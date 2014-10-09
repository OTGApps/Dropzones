class DropzonesScreen < PM::TableScreen
  # searchable
  title 'Find Dropzones'
  tab_bar_item title: 'Dropzones', item: 'airplane'

  def on_load
  end

  def table_data
  [{
    title: nil,
    cells: [{
      title: 'Near Me',
      subtitle: 'Find the DZs closest to you right now!',
      action: :show_near_me,
      accessory_type: :disclosure_indicator,
      image: 'location-pin'
    }, {
      title: 'By State',
      subtitle: 'All the DZs nicely organized by state.',
      action: :show_by_state,
      accessory_type: :disclosure_indicator,
      image: 'usa'
    }, {
      title: 'By Region',
      subtitle: 'All the DZs listed by USPA region.',
      action: :show_by_region,
      accessory_type: :disclosure_indicator,
      image: 'signpost'
    }, {
      title: 'Aircraft Type',
      subtitle: 'Looking to jump a specific aircraft?',
      action: :show_by_aircraft,
      accessory_type: :disclosure_indicator,
      image: 'airplane'
    }, {
      title: 'Training Capabilities',
      subtitle: 'Too cool for AFF & want to try static line?',
      action: :show_by_training,
      accessory_type: :disclosure_indicator,
      image: 'megaphone'
    },{
      title: 'Services Offered',
      subtitle: 'Wait... some dropzones have a POOL?!',
      action: :show_by_services,
      accessory_type: :disclosure_indicator,
      image: 'bathtub'
    }]
  }]
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
end
