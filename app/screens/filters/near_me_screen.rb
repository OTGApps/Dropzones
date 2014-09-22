class NearMeScreen < MasterTableScreen
  title "Dropzones Near Me"
  refreshable

  def on_refresh ; refresh ; end
  def on_appear ; refresh ; end

  def on_load
    @dzs = GeoJSON.sharedData.json
  end

  def refresh
    mp "Refreshing"
    BW::Location.get_once(
      purpose: 'We need to use your GPS because...',
      authorization_type: :when_in_use) do |location|
        mp location
        if location.is_a?(CLLocation)
          mp "got location."
          find_dzs(location)
        else
          mp "didn't get a location"
          find_dzs
        end
    end
  end

  def found_dzs(dz)
    if dz.is_a?(NSError)
      # App.alert("Error retrieving stations", {
      #   message: "There was an error retrieving the list of weather stations.\n\nPlease try again in a minute."
      # })
    else
      map_and_show_dzs(dz)
    end
  end

  def find_dzs(location = nil)
    p "Finding dzs"

    if location.nil?
      end_refreshing
      found_dzs(GeoJSON.sharedData.json)
    else
      GeoJSON.sharedData.sorted_by_distance_from(location) do |s|
        end_refreshing
        found_dzs(s)
      end
    end
  end

  def map_and_show_dzs(data)
    @dzs = data.map do |dz|
      {
        title: dz['properties']['name'],
        subtitle: subtitle(dz),
        action: :show_dz,
        arguments: {
          anchor: dz['properties']['anchor']
        },
        accessory_type: :disclosure_indicator,
      }
    end
    update_table_data
  end

  def subtitle(dz)
    return "" unless dz[:current_distance]

    if App::Persistence['metric'] == true
      distance = dz[:current_distance].kilometers.round
      distance_word = 'km'
    else
      distance = dz[:current_distance].miles.round
      distance_word = ' miles'
    end

    "About #{distance}#{distance_word} away."
  end

  def table_data
    [{
      title: nil,
      cells: @dzs
    }]
  end
end
