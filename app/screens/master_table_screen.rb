class MasterTableScreen < PM::TableScreen
  include OpenDZScreen

  def on_load
    BW::Location.get_once(
      purpose: 'Determines how far away you are from dropzones.',
      authorization_type: :when_in_use
    ) do |location|
        GeoJSON.sharedData.location = location
        update_table_data
    end
  end

  def will_appear
    navigationController.navigationBar.topItem.title = ''
  end

  def build_cells(data)
    data.map do |dz|
      {
        title: dz['properties']['name'],
        subtitle: distance_away(dz),
        action: :open_dz_screen,
        arguments: {
          anchor: dz['properties']['anchor']
        },
        accessory_type: :disclosure_indicator,
      }
    end
  end

  def map_and_show_dzs(data = nil, update = true)
    data = GeoJSON.sharedData.json if data.nil?
    @dzs = build_cells(data)

    update_table_data
    end_refreshing
  end

  def table_format(data)
    data.keys.sort.map do |k|
      {
        title: k,
        cells: build_cells(data[k])
      }
    end
  end

  def distance_away(dz)
    return '' unless dz[:current_distance]

    if App::Persistence['metric'] == true
      distance = dz[:current_distance].kilometers.round
      distance_word = 'km'
    else
      distance = dz[:current_distance].miles.round
      distance_word = distance == 1 ? ' mile' : ' miles'
    end

    "#{distance}#{distance_word} away."
  end
end
