class FilterDetailScreen < MasterTableScreen
  attr_accessor :attribute_name

  def on_load
  end

  def will_appear
    self.title = @attribute_name
  end

  def table_data
    [{cells:dz_cells}]
  end

  def dz_cells
    GeoJSON.sharedData.by_aircraft(@attribute_name).map do |dz|
      {
        title: dz['properties']['name'],
        action: :show_dz,
        accessory_type: :disclosure_indicator,
        arguments: {
          anchor: dz['properties']['anchor']
        }
      }
    end
  end
end
