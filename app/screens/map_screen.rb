class MapScreen < PM::MapScreen
  include OpenDZScreen
  title "All Dropzones"
  tab_bar_item title: "Map", item: "map"
  status_bar :light

  def on_load
    set_nav_bar_button :back, title: '', style: :plain, action: :back
    set_nav_bar_button :right, image: UIImage.imageNamed('location-target'), action: :show_user
    @initial_zoom = false

    # Create the toolbar
    @toolbar = BFNavigationBarDrawer.alloc.init.tap do |d|
      d.tintColor = UIColor.whiteColor
      d.barTintColor = UIColor.colorWithRed(0.024, green:0.176, blue:0.353, alpha:1) #062d5a
      d.items = segmented_control
    end
  end

  def on_appear
    Flurry.logEvent("VIEW_MAP") unless Device.simulator?
    segment_value_changed(nil)
    zoom_to_fit_annotations unless @initial_zoom
    @initial_zoom = true
    show_user_location
  end

  def will_appear
    @toolbar.showFromNavigationBar(self.navigationController.navigationBar, animated:true) if @toolbar
  end

  def annotation_data
    @annotations ||= begin
      GeoJSON.sharedData.json.map do |dz|
        {
          longitude: dz['geometry']['coordinates'].first,
          latitude: dz['geometry']['coordinates'].last,
          title: dz['properties']['name'],
          subtitle: dz['properties']['location'].last,
          action: :show_dz,
          anchor: dz['properties']['anchor']
        }
      end
    end
  end

  def segment_value_changed(sender)
    App::Persistence['map_type'] = sender.selectedSegmentIndex if sender

    case App::Persistence['map_type']
    when 0
      self.type = MKMapTypeStandard
    when 1
      self.type = MKMapTypeHybrid
    when 2
      self.type = MKMapTypeSatellite
    end
  end

  def segmented_control
    control = UISegmentedControl.alloc.initWithItems(["Map", "Hybrid", "Satellite"]).tap do |sc|
      sc.frame = [sc.frame.origin,[sc.frame.size.width + 100, sc.frame.size.height]] # Make it widerer
      sc.segmentedControlStyle = UISegmentedControlStyleBar
      sc.selectedSegmentIndex = App::Persistence['map_type'] || 0
    end
    rmq(control).on(:value_changed) do |sender|
      segment_value_changed(sender)
    end
    item = UIBarButtonItem.alloc.initWithCustomView(control)
    fs = UIBarButtonItem.alloc.initWithBarButtonSystemItem(UIBarButtonSystemItemFlexibleSpace, target:nil, action:nil)
    [fs, item, fs]
  end

  def on_user_location(location)
    # Nothing to see here... please move along
  end

  def show_dz
    @toolbar.hideAnimated(true) if @toolbar
    open_dz_screen({anchor: selected_annotations.first.params[:anchor]})
  end

  def show_user
    if user_location.nil?
      # Alert the user that they're not allowing us to track their location
    else
      zoom_to_user(3.0)
    end
  end

end
