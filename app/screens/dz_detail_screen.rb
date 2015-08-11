class DZDetailScreen < PM::WebScreen
  status_bar :light
  attr_accessor :anchor

  def on_load
    init_nav_bar_buttons
  end

  def init_nav_bar_buttons
    set_nav_bar_buttons :right, [driving_button, (dz_flagged? ? flagged_button : unflagged_button)]
  end

  def driving_button
    {
      title: "Open In Maps",
      image: UIImage.imageNamed("car"),
      tint_color: UIColor.whiteColor,
      action: :open_in_maps
    }
  end

  def flagged_button
    {
      title: "Flagged",
      image: UIImage.imageNamed("flag_full"),
      tint_color: UIColor.whiteColor,
      action: :toggle_flag
    }
  end

  def unflagged_button
    {
      title: "Flag",
      image: UIImage.imageNamed("flag"),
      tint_color: UIColor.whiteColor,
      action: :toggle_flag
    }
  end

  def toggle_flag
    flags = App::Persistence[:flagged].mutableCopy
    flags[anchor] = !dz_flagged?
    App::Persistence[:flagged] = flags
    init_nav_bar_buttons
  end

  def dz_flagged?
    App::Persistence[:flagged].fetch(anchor, false)
  end

  def will_appear
    set_title
    set_attributes web, {
      background_color: UIColor.whiteColor
    }
  end

  def set_title
    self.title = raw_name
  end

  def on_appear
    Flurry.logEvent("VIEW_DZ_DETAIL", withParameters:{name: raw_name}) unless Device.simulator?
    if App::Persistence['shown_warning'].nil?
      app.alert(
        title: "Disclaimer",
        message: "While every reasonable effort it made to ensure that the dropzone data displayed in this app is accurate, we can not be held liable for incorrect information reported by the USPA.\n\nPlease verify all information with the dropzone directly.\n\nIf you are a DZO please update your information directly with the USPA.",
        actions: [ "Got it!" ]
      )
      App::Persistence['shown_warning'] = true
    end
  end

  def content
    c = ""
    c << css
    c << name
    c << website
    c << description
    c << location
    c << contact
    c << aircraft
    c << training
    c << services
  end

  def css
    "<style>" << File.read(File.join(App.resources_path, "style.css")) << "</style>"
  end

  def raw_name
    dz['properties']['name']
  end

  def name
    "<h1>" + raw_name + "</h1>"
  end

  def website
    paragraph_with_breaks dz['properties']['website']
  end

  def location
    paragraph_with_breaks dz['properties']['location'], "Location:"
  end

  def contact
    h = "<h2>Contact Information:</h2>"
    s = "<p>"
    s << "<strong>Phone:</strong> " + dz['properties']['phone'] + "<br />" if dz['properties']['phone']
    s << "<strong>Phone 2:</strong> " + dz['properties']['phone 2'] + "<br />" if dz['properties']['phone 2']
    s << "<strong>Fax:</strong> " + dz['properties']['fax'] + "<br />" if dz['properties']['fax']
    s << "<strong>Email:</strong> " + dz['properties']['email'] + "<br />" if dz['properties']['email']
    s << "<strong>Distance to nearest hotel/motel:</strong> " + dz['properties']['distance'] + "<br />" if dz['properties']['distance']
    s << "</p>"
    h + s
  end

  def description
    paragraph_with_breaks dz['properties']['description']
  end

  def aircraft
    paragraph_with_breaks dz['properties']['aircraft'], "Aircraft:"
  end

  def training
    paragraph_with_breaks dz['properties']['training'], "Training:"
  end

  def services
    paragraph_with_breaks dz['properties']['services'], "On-site Services:"
  end

  def paragraph_with_breaks(data, title = nil)
    d = ""
    if data
      d << "<h2>#{title}</h2>" if title
      d << "<p>#{Array(data).join("<br />")}</p>"
    end
    d
  end

  def dz
    @_dz ||= GeoJSON.sharedData.find_dz(anchor)
  end

  def open_in_maps
    mp 'opening in maps'

    if App::Persistence['no_maps_confirmation'] == true
      open_it
      return
    end

    app.alert(
      title: "Open In Maps",
      message: "This will leave #{App.name} and open Apple Maps. Are you sure you want to continue?",
      actions: [ :yes, "Don't show this again", :no]) do |button_tag|
        case button_tag
        when :yes
          open_it
        when :no
        else
          App::Persistence['no_maps_confirmation'] = true
          open_it
        end
      end
  end

  def open_it
    # Create an MKMapItem to pass to the Maps app
    pm = MKPlacemark.alloc.initWithCoordinate(cllocation2d, addressDictionary:nil)
    mi = MKMapItem.alloc.initWithPlacemark(pm)
    mi.setName(raw_name)

    # Set the directions mode to "Driving"
    launchOptions = {
      MKLaunchOptionsDirectionsModeKey => MKLaunchOptionsDirectionsModeDriving
    }

    # Get the "Current User Location" MKMapItem
    current_location_map_item = MKMapItem.mapItemForCurrentLocation

    # Pass the current location and destination map items to the Maps app
    # Set the direction mode in the launchOptions dictionary
    MKMapItem.openMapsWithItems([current_location_map_item, mi], launchOptions:launchOptions)
  end

  def cllocation2d
    CLLocationCoordinate2DMake(dz['geometry']['coordinates'][1], dz['geometry']['coordinates'][0])
  end
end
