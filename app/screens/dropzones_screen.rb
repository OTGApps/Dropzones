class DropzonesScreen < PM::TableScreen
  searchable
  title "Dropzones"
  tab_bar_item title: "Dropzones", item: "airplane"

  def on_load
    # GeoJSON.sharedData
  end

  def will_appear
  end

  def table_data
    table_format(GeoJSON.sharedData.by_region)
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
          arguments: { anchor: dz['properties']['anchor'] },
          accessory_type: :disclosure_indicator
        }
      end
      section
    end
  end

  def show_dz(args = {})
    open DZ.new(anchor: args[:anchor])
  end

end
