class MasterTableScreen < PM::TableScreen
  include OpenDZScreen

  def on_load
    set_nav_bar_button :back, title: '', style: :plain, action: :back

    BW::Location.get_once(
      purpose: 'Determines how far away you are from dropzones.',
      authorization_type: :when_in_use
    ) do |location|
        GeoJSON.sharedData.location = location
        update_table_data
    end
  end

  def will_appear
    update_table_data
  end

  def loading_table_data
    [{
      title:nil,
      cells: [{
        title: "Loading..."
      }]
    }]
  end

  def build_cells(data)
    data.map{|dz| dz_cell(dz) }
  end

  def dz_cell(dz)
    {
      title: dz['properties']['name'],
      subtitle: distance_away(dz),
      action: :open_dz_screen,
      arguments: {
        anchor: dz['properties']['anchor']
      },
      accessory_type: :disclosure_indicator,
      image: (App::Persistence[:flagged].fetch(dz['properties']['anchor'], false) ? flagged_image : unflagged_image),
    }
  end

  def flagged_image
    @_flagged_image ||= UIImage.imageNamed("flag_full").imageWithRenderingMode(UIImageRenderingModeAlwaysTemplate)
  end

  def unflagged_image
    @_unflagged_image ||= UIImage.imageNamed("flag").imageWithRenderingMode(UIImageRenderingModeAlwaysTemplate)
  end

  def map_and_show_dzs(data = nil, update = true)
    data = GeoJSON.sharedData.json if data.nil?
    @dzs = build_cells(data)

    update_table_data if update
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
