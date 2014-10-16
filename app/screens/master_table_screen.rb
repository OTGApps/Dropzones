class MasterTableScreen < PM::TableScreen

  def on_load
    BW::Location.get_once(
      purpose: 'We need to use your GPS because...',
      authorization_type: :when_in_use) do |location|
        GeoJSON.sharedData.location = location
    end
  end

  def map_and_show_dzs(data = nil)
    data = GeoJSON.sharedData.json if data.nil?
    @dzs = data.map do |dz|
      {
        title: dz['properties']['name'],
        subtitle: distance_away(dz),
        action: :show_dz,
        arguments: {
          anchor: dz['properties']['anchor']
        },
        accessory_type: :disclosure_indicator,
      }
    end
    update_table_data
    end_refreshing
  end

  def table_format(data)
    data.keys.sort.map do |k|
      section = {
        title: k,
        cells: []
      }
      data[k].sort_by{|dz| dz['properties']['name'] }.each do |dz|
        section[:cells] << {
          title: dz['properties']['name'],
          action: :show_dz,
          arguments: {
            anchor: dz['properties']['anchor']
          },
          accessory_type: :disclosure_indicator,
          search_text: dz['properties']['name'] + " " + k
        }
      end
      section
    end
  end

  def distance_away(dz)
    return "" unless dz[:current_distance]

    if App::Persistence['metric'] == true
      distance = dz[:current_distance].kilometers.round
      distance_word = 'km'
    else
      distance = dz[:current_distance].miles.round
      distance_word = ' miles'
    end

    "#{distance}#{distance_word} away."
  end

  def show_dz(args = {})
    open DZ.new(anchor: args[:anchor])
  end
end
