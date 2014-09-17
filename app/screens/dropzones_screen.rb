class DropzonesScreen < PM::TableScreen
  searchable
  title "Dropzones"
  tab_bar_item title: "Dropzones", item: "airplane"

  def on_load
    GeoJSON.sharedData
  end

  def will_appear
  end

  def table_data
    table_format(GeoJSON.sharedData.by_region)
  end

  def table_format(data)
    data.keys.map do |k|
      section = {
        title: k,
        cells: []
      }
      data[k].each do |dz|
        section[:cells] << {
          title: dz['properties']['name']
        }
      end
      section
    end
  end

end
