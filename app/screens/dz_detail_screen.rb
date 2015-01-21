class DZDetailScreen < PM::WebScreen
  status_bar :light
  attr_accessor :anchor

  def on_load
    set_nav_bar_button :right, {
      title: "Open In Maps",
      image: UIImage.imageNamed("compass"),
      tint_color: UIColor.whiteColor,
      action: :open_in_maps
    }
  end

  def will_appear
    mp dz
    self.title = raw_name
    set_attributes web, {
      background_color: UIColor.whiteColor
    }
  end

  def content
    c = ""
    c << css
    c << name
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
    "<p>#{dz['properties']['description']}</p>" if dz['properties']['description']
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

    BW::UIAlertView.new({
      title: "Open In Maps",
      message: "This will leave #{App.name} and open Apple Maps. Are you sure you want to continue?",
      buttons: ["Yes", "Don't Show this again", "No"],
      cancel_button_index: 2
    }) do |alert|
      if alert.clicked_button.cancel?
      elsif alert.clicked_button.title == "Yes"
        open_it
      else
        App::Persistence['no_maps_confirmation'] = true
        open_it
      end
    end.show
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
