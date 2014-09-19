class MapScreen < PM::MapScreen
  title "All Dropzones"
  tab_bar_item title: "Map", item: "map"

  def on_load
    set_nav_bar_button :right, image: UIImage.imageNamed('location-arrow'), action: :show_user
    @initial_zoom = false
  end

  def on_appear
    zoom_to_fit_annotations unless @initial_zoom
    @initial_zoom = true
    show_user_location
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

  def show_dz
    dzdata = GeoJSON.sharedData.find_dz(selected_annotations.first.params[:anchor])
    open DZ.new(data: dzdata)
  end

  def show_user
    if user_location.nil?
      # Alert the user that they're not allowing us to track their location
    else
      zoom_to_user(3.0)
    end
  end

end
